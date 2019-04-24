/* eslint-disable */
import React, { Component } from 'react';

import CanvasGrid from "./CanvasGrid";
import NotFound from '../../Views/NotFound/index';
import Auth from '../../modules/Auth';
import {fetchAPI,socketIoLocation,setCurrentUser} from '../../api';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {runCallBacks} from "../../features/index.js";
import {getParams} from "../../features/markdown";
import {getCanvasEditor} from "../../Views/ProjectSubview/components/FeatureSetting";

import {EVENT_INIT, EVENT_LOCKINFO} from '../../common/event';
import {Segment} from 'semantic-ui-react';
import Settings from '../Settings/SettingsModal'
import {inflateCanvases, inflateTags} from '../../common/model/inflation'

import{addEntry, removeEntry, changeEntry, changeToVP, initAction, addEntryCanvas, delAdd, changeAdd, changeCanvasDescription} from './actions/index'; //todo
import {createTextEntry} from '../../common/model/entry'
import {bindClient} from '../../Socket/socket'
import {pathAssign} from '../../common/assignment'

import { withRouter } from 'react-router-dom'
import io from 'socket.io-client';

/**
 * @class CanvasEditor : react.component - the one and only editor container
 *
 * CanvasEditor is the root container for the displayed canvas
 * it holds all state within its volatile state and the editor specific redux store
 * it is the root of all canvas callbacks and fulfills their actions
 * it manages the rights of the user.
 *
 * there are three different modes (in state.values.mode)
 * READ : the user can read the canvas with websocket synchronisation
 * EDIT : the user can edit the canvas with websocket synchronisation
 * HISTORY : the user can only view the canvas state - no websocket connection required
 */
class CanvasEditor extends Component{

  /**
   * required default props
   */
  static defaultProps = {

  }

  /**
   * constructor
   * @param {*} props - all props passed by its parent
   */
  constructor(props){

    super(props);
    let tag = new URLSearchParams(props.location.search).get('tag');

    /*
      default mode is EDIT
      if a tag is defined, the editor must show the state in HISTORY mode
    */
    let mode = "EDIT";
    if(tag !== undefined && tag !== null){
          mode = "HISTORY"
    }

    this.state = {values: {
      mode: mode,                                                       //editor mode
      projectID: props.match.params.projectId,                          //the project id from url
      canvasID: new URLSearchParams(props.location.search).get('id'),   //the canvas id from url
      userID: props.userID,                                             //the provided uiser id
      editable: true,                                                   //if canvas should be editable
      lockings: [],                                                     //locked BuildBlock information
      hasConnection: false,                                             //if there is connection to websocket
      waitForConnection: true,                                          //if ebsocket connection is not apllied yet
      renderCall: 0,                                                    //how often is component has been rendered
      tagID: tag                                                        //the if of the displayed tag (if HISTORY)
    },
    tagState: {},
    tagCanvases: {}};                                                      //the canvas state if HISTORY mode

    this.connect = this.connect.bind(this);
    this.findStateById = this.findStateById.bind(this);
    this.getTaggedCanvas = this.getTaggedCanvas.bind(this);
    this.socket = null;

  }

  /**
   * if the editor is beeing closed
   * remove socket connection
   */
  componentWillUnmount(){
    if(this.socket!==undefined){
      if(this.socket!==null){
        this.socket.disconnect();
        this.socket=null;
      }
    }
  }

  /**
  * Connects to the socket-server and loads its store
  * @param {number} userID The id of the user
  * @param {number} projectID the id of the project
  */
  connect(){
    let error = false;
    if(this.socket !== null) this.socket.disconnect();
    this.socket=io(socketIoLocation);
    this.socket.emit(EVENT_INIT, {userID: this.state.values.userID, id: this.state.values.projectID, token: Auth.getToken()}, (innerError, state, accessLevel) => {//TODO:FIX
      //console.log("Error-State: ",innerError);
      if(innerError&&(innerError.status!==200)){
        error = innerError;
      }
      if(!error){
        if((state.persistent.canvases.length===0)||(Object.values(state.persistent.canvases).length===0)){
          error = true;
        }else{
          if(state.volatile===undefined) state.volatile={locks:{}};
          state.volatile.pending=[];

          this.state.values.mode = accessLevel;
          this.props.dispatch({type:EVENT_INIT,state:state});
          this.hasContent=true;
          bindClient(this.socket,this.props.dispatch,()=>this.props.getState().store,this.props.subscribe);
          this.socket.on(EVENT_LOCKINFO, (data) => {
            this.onChangeLocking(data);
          });
        }
      }
      if(!error){
        this.state.values.hasConnection = true;
      }else{
        //console.error("An error occured!");
        if(this.socket){
          this.socket.disconnect();
          this.socket=null;
          this.state.values.hasContent=false;
        }
      }
      this.state.values.waitForConnection = false;
      this.forceUpdate();
    });
  }

  /**
   * onAddEntry
   * @param {*} e - entry that should be added
   * @param {*} bb_uid  - parent BuildBlock of e
   * the callback root -> pushes to redux store
   */
  onAddEntry(e, bb_uid, cb){
    runCallBacks("onAddEntryBefore", this, e, bb_uid, cb);

    let buildingBlock=this.props.store.persistent.canvases[this.state.values.canvasID].buildingBlocks[bb_uid];
    this.props.addEntry(e,bb_uid,this.state.values.canvasID);
    if(cb)
      window.setTimeout(cb,10,e._id)

    runCallBacks("onAddEntryAfter", this, e, bb_uid, cb);
  }

  findBlockByID(blockID,state=this.findStateById()){
    return (state.buildingBlocks||{})[blockID];
  }

  findEntryByIDs(entryID,blockID,canvasID=undefined){
    const state=this.findStateById(canvasID);
    let sourceBlock = this.findBlockByID(blockID,state);
    if(!sourceBlock) return null;
    return sourceBlock.entries[entryID];
  }

  moveEntry(sourceBlockID,entryID,targetBlockID, targetPosition=-1){
    runCallBacks("onMoveEntry", this, sourceBlockID,entryID,targetBlockID, targetPosition=-1);
  }

  /**
   * onChangeLocking
   * @param {*} data - locking information
   * is invoked by websocket connection if other users are blocking BuildBlocks by their actions
   */
  onChangeLocking(data){
    let self = data.self;
    this.state.values.lockings = [];
    Object.keys(data.locks).forEach((key) => {
      if(key !== undefined && data.locks[key] !== self){
        let array = key.split('.');
        this.state.values.lockings.push(array[3]);
      }
    });
    this.forceUpdate();
  }

  /**
   * onRemoveEntry
   * @param {*} e - entry that shoul be removed
   * @param {*} bb_uid  - parent BuildBlock of e
   * the callback root -> pushes to redux store
   */
  onRemoveEntry(e, bb_uid){
    this.props.removeEntry(e, bb_uid, this.state.values.canvasID);
  }

  /**
   * onChangeEntry
   * @param {*} e - the entry which content has changed
   * the callback root -> pushes to redux store
   */
  onChangeEntry(e){
    let block_uuid;
    //search for parent block of e
    Object.values(this.props.store.persistent.canvases[this.state.values.canvasID].buildingBlocks).forEach((block) => {
      if(block.entries[e._id] !== undefined){
        block_uuid = block._id;
      }
    });
    this.props.changeEntry(e, block_uuid, this.state.values.canvasID);
  }

  /**
   * onReferenceCall
   * @param {*} e - the clicked link entry
   * @deprecated
   */
  onReferenceCall(e){
  }


  onChangeDescription(description) {
    this.props.dispatch(changeCanvasDescription(this.state.values.canvasID, description));
  }



  /**
   * extracts the current canvasstate from provided project state
   */
  findStateById(id=this.state.values.canvasID){
    return this.props.store.persistent.canvases[id]||{};
  }

  /**
   * called directly bevor render()
   */
  componentDidMount(){
   // console.log("componentDidMount:", this.state);
   getParams(this);
   getCanvasEditor(this);
  }

  /**
   * called if react will rebuild DOM
   */
  componentWillMount(){
    if(Auth.isUserAuthenticated()) setCurrentUser(Auth.getToken());
    //if not HISTORY mode, connect with websocket
    if(this.state.values.mode !== "HISTORY"){
      this.connect();
    }else{
      //get canvasstate from rest api
      this.getTaggedCanvas();
    }
   //console.log("componentWillMount:", this.state);
  }

  /**
   * render : from react.component
   */
  render(){

    //check if is allowed to EDIT canvas (also checked in backend)
    if(this.state.values.mode !== "EDIT"){
      this.state.values.editable = false;
    }

    /*
      get canvas state depending on mode
      if HISTORY, use state.tagState (initialized eralier)
      otherwise, use state provided from websocket in redux store
    */
    let canvasstate = {};
    let allcanvases;
    let globalTags = {};
    if(this.state.values.mode !== "HISTORY"){
      canvasstate = this.findStateById();
      allcanvases = this.props.store.persistent.canvases;
      globalTags = this.props.store.persistent.tags;
    }else{
      let cid = this.state.values.canvasID;
      canvasstate = this.state.tagState;//.cid;
      allcanvases = this.state.tagCanvases;
      globalTags = this.state.tagTags||{};
    }

    /*
      check if loading or 404 should be displayed
      note: 0. render is init from react,
            1. render with default data (empty)
            2. should be with valid data
    */
    let loading = this.state.values.waitForConnection;
    let hasContent=((!!canvasstate)&&(JSON.stringify(canvasstate)!='{}'));
    if(hasContent) loading=false;
      /*if(canvasstate === undefined || canvasstate === null || JSON.stringify(canvasstate) == '{}'){
        //if there is no data and it will never be
        if(this.state.values.hasConnection){
          return(
            <NotFound></NotFound>
          );
        //if there is still hope to receive data, show loading screen (can be up to 10s until fetch succes)
        }else{
          loading = true;
        }
      }*/
    if(!(loading||hasContent||this.state.values.hasConnection)){
      console.log("Canvas not found");
      return (<NotFound/>);
    }
    this.state.values.renderCall++;

    return(
      <Segment loading={loading} className={"canvasgrid canvas_" + canvasstate.canvasType}>
      <CanvasGrid class='CanvasGrid'
        type={canvasstate.canvasType}
        canvasid={canvasstate._id}
        canvases={allcanvases}
        lockings={this.state.values.lockings}
        title={canvasstate.title}
        configuration={canvasstate.configuration}
        description={canvasstate.description}
        canvasTag={canvasstate.tags}
        mode={this.state.values.mode}
        tagID={this.state.values.tagID}
        editable={this.state.values.editable}
        project_id={this.props.match.params.projectId}
        buildingBlocks={canvasstate.buildingBlocks}
        onAddEntry={this.onAddEntry.bind(this)}
        editor={this}
        moveEntry={this.moveEntry.bind(this)}
        addEntryCanvas={this.props.addEntryCanvas}
        onRemoveEntry={this.onRemoveEntry.bind(this)}
        onChangeEntry={this.onChangeEntry.bind(this)}
        onReferenceCall={this.onReferenceCall.bind(this)}
        findEntryByIDs={this.findEntryByIDs.bind(this)}
        onChangeDescription={this.onChangeDescription.bind(this)}
        onChangeAdd={this.props.changeAdd}
        openSettings={(target)=>this.setState({...this.state,settingsTarget:target})}
        globalTags={globalTags}
        dispatch={this.state.values.mode!=="EDIT"?(...args)=>{console.warn("Called dispatch in readonly-mode:",...args)}:this.props.dispatch}
        >
        
      </CanvasGrid>
      <Settings
        readonly={this.state.values.mode!=="EDIT"}
        key={this.state.settingsTarget}//Key changes cause creation of new component, resetting the state to the default value (props in this case)
        target={this.state.settingsTarget}
        store={this.props.store}
        openSettings={(target)=>this.setState({...this.state,settingsTarget:target})}
        dispatch={this.state.values.mode!=="EDIT"?(...args)=>{console.warn("Called dispatch in readonly-mode:",...args)}:this.props.dispatch}
        onClose={()=>this.setState({...this.state,settingsTarget:null})}/>
      </Segment>
    );
}

  getTaggedCanvas() {

      let stateID = this.state.values.tagID;
      let projectID = this.state.values.projectID;
      let canvasID = this.state.values.canvasID;
      function errorHandler(err){
        console.error("Tag-Error:",err);
        this.state.tagState = null;
        this.state.values.renderCall = 2;
        this.state.values.hasConnection=false;
        this.state.values.waitForConnection=false;
        this.forceUpdate();
      }
      errorHandler=errorHandler.bind(this);
      try{
        return fetchAPI(undefined, `projects/${projectID}`).then(response=>response.json()).then(this.mountHistoryStore.bind(this)).catch(errorHandler)
        }catch(err){
          errorHandler(err);
        }
      }

    mountHistoryStore(current_project){
      let timeTagID=this.state.values.tagID;
      let state={...current_project};
      let currentTimelineEntry=current_project.timeline.find((tEntry)=>tEntry._id===timeTagID);
      state.timeline=current_project.timeline.filter((tEntry)=>tEntry.timestamp<timeTagID);
      let persistent = currentTimelineEntry.value;
      let inflatedPersistent = {canvases:inflateCanvases(persistent.canvases),tags:inflateTags(persistent.tags)}
      state.persistent = inflatedPersistent;
      if(state.volatile===undefined) state.volatile={locks:{}};
      state.volatile.pending=[];
      state.volatile.readonly=true;
      this.state.values.waitForConnection=false;
      this.state.tagState = inflatedPersistent.canvases[this.state.values.canvasID]||null//retain previous "not found ==> null" behaviour
      if(this.state.tagState){
        this.state.tagCanvases = inflatedPersistent.canvases
        this.state.tagTags = inflatedPersistent.tags
      }
      this.state.values.hasConnection=false;
      this.props.dispatch({type:EVENT_INIT,state:state});
      this.forceUpdate();
    }
}

function mapStateToProps(state){
  return{
    store : state.store
  }
}

function matchDispatchToProps(dispatch){
  return bindActionCreators({
    addEntry : addEntry,
    addEntryCanvas : addEntryCanvas,
    delAdd : delAdd,
    changeAdd: changeAdd,
    removeEntry : removeEntry,
    changeEntry : changeEntry,
    changeToVP : changeToVP,
    initAction : initAction
  }, dispatch)
}

export default withRouter(connect(mapStateToProps, matchDispatchToProps)(CanvasEditor));
