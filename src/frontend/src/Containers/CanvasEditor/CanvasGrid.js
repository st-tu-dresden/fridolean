import React, { Component } from 'react';

import PropTypes from 'prop-types';

import { Grid, Segment, Icon, Checkbox } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './style.css';

import BuildBlock from "./BuildBlock";

import windowSize from 'react-window-size';
// import {enable, disable} from "../../features/bgColor/index";
import {featureList} from "../../features/index.js";
import {getCanvasGrid} from "../../features/helper";
import {FeatureSetting} from "../../Views/ProjectSubview/components/FeatureSetting.js";
import $ from 'jquery';

import { CanvasTagSelector /*knownTagColors*/ } from '../../Components/Settings/CanvasTagSelector';
import { changeCanvasTags, createTag } from './actions'
import RandomColor from 'randomcolor';

/**
 * CanvasGrid
 * @class CanvasGrid : react.component - the shown canvas
 */

class CanvasGrid extends Component {
  /**
   * required props and tehir types
   */
  static propTypes = {
    onAddEntry: PropTypes.func.isRequired,
    onRemoveEntry: PropTypes.func.isRequired,
    onChangeEntry: PropTypes.func.isRequired,
    editable: PropTypes.bool.isRequired
  };

  /**
   * default props which must be defined
   */
  static defaultProps = {
    type: "default",
    buildingBlocks: {},
    onReferenceCall: function () { console.log('reference call dumped'); }
  };

  /**
   * constructor
   * @param {*} props - the passed props from its parent
   */
  constructor(props) {
    super(props);
    this.state = {
      actions: {},
      draggedTagId: {},
      helperState: true,
    };

    this.state.actions.addEntryCanvas = this.props.addEntryCanvas;
    this.state.actions.onAddEntry = this.props.onAddEntry;
    this.state.actions.onRemoveEntry = this.props.onRemoveEntry;
    this.state.actions.onChangeEntry = this.props.onChangeEntry;
    this.state.actions.onReferenceCall = this.props.onReferenceCall;

    this.featureManager = this.featureManager.bind(this);
  }


  featureManager() {
    let config = $.parseXML(this.props.canvases[this.props.canvasid].configuration);
    console.log("config:", config);
    if (config != null) {
      $(config).find("feature").each((i, attr) => {
        let feature = $(attr);
        if(feature.attr("manual") !== "undefined") {
          console.log(feature.attr("name"));
        }
      });
    }
  }

  componentDidMount() {
    window.matchMedia("print").addListener(this.printListener);
    getCanvasGrid(this);
  }

  componentWillUnmount() {
    window.matchMedia("print").removeListener(this.printListener);
  }

  handleDescriptionChange(event) {
    this.props.onChangeDescription(event.target.value);
  }

  onTagsChange(tags) {
                console.log("ASD123");
    // let canvas = this.getCanvas();
    let newTags = tags.filter(tag => this.props.canvasTag.indexOf(tag) < 0);
    let delTags = this.props.canvasTag.filter(tag => tags.indexOf(tag) < 0);
    this.props.dispatch(changeCanvasTags(this.props.canvasid, newTags, delTags));
  }

  createTag(title) {
    this.props.dispatch(createTag(title, RandomColor(), undefined, [this.props.canvasid]));
  }

  onOpenTag(tag) {
    this.props.openSettings({ tag });
  }

  onTagDrag(newTag){
    this.setState({draggedTagId: newTag});
  }

  loadFeatures() {
    var featureKeys = Object.keys(featureList);
    var html = [];
    featureKeys.forEach((key) => {
      let featureName = key;
      let label = featureList[key].name;
      var feature = require("../../features/" + featureName + "/index");
      if ("onMoveEntry" in feature) {
        featureList[key].onMoveEntry = feature.onMoveEntry;
      }
      if ("onAddEntryBefore" in feature) {
        featureList[key].onAddEntryAfter = feature.onAddEntryAfter;
      }
      html.push(
        <div key={featureName}>
          <Checkbox
          label={label}
          toggle
          defaultChecked={featureList[key].enabled}
          onChange={feature.toggle}
          />
        </div>
      );
    });
    return html;
  }

  buildTitle(parent = "") {
    return (
      <Segment className="canvas-title-segment">
        <h1>
          <Icon name="setting" link onClick={()=>this.props.openSettings({canvas:this.props.canvasid})}/>
          <a href={"/projects/" + this.props.project_id + (this.props.tagID ? "?tag=" + this.props.tagID : "")}>
            <Icon name="home" />
          </a>
          &ensp;
          {parent ?
            <a href={"/projects/" + this.props.project_id + "/editor/" + parent}>
              <Icon name="external square" />
            </a> : ""}
          {this.props.title}
          &emsp;
          {/*this.featureManager()*/}
          <FeatureSetting parentObj={this} access="post"/>
          &emsp;
          <span>
            <font size = "4">
              Description:
            <input
              style={{borderWidth: 1}}
              disabled={this.props.readonly}
              defaultValue={this.props.description}
              value={this.state.description}
              onChange={this.handleDescriptionChange.bind(this)} />
            </font>
          </span>
        </h1>
        <div className="canvas-title-tagSelector">
          <CanvasTagSelector globalTags={this.props.globalTags}
                     localTags={this.props.canvasTag}
                     onChange={this.onTagsChange.bind(this)}
                     onCreateTag={this.createTag.bind(this)}
                     onOpenTag={this.onOpenTag.bind(this)}
                     onTagDrag={this.onTagDrag.bind(this)}
                     draggedTagId = {this.state.draggedTagId}
          />
        </div>
      </Segment>)
  }

  buildBlock(name, className, style = {minHeight:"150px"}) {
    return (<BuildBlock
      help={(this.state.helperState) ? `canvas/${this.props.type}/${name}` : ""}
      block={this.findBuildingBlock(name, this.props.buildingBlocks)}
      className={className}
      type={this.props.type}
      style={style}
      draggedTagId = {this.state.draggedTagId}
      lockings={this.props.lockings}
      editable={this.props.editable}
      project_id={this.props.project_id}
      canvasid={this.props.canvasid}
      moveEntry={this.props.moveEntry}
      actions={this.state.actions}
      findEntryByIDs={this.props.findEntryByIDs}
      onChangeAdd={this.props.onChangeAdd}
      openSettings={this.props.openSettings}
      globalTags={this.props.globalTags}
      enableMarkdown={this.props.canvases[this.props.canvasid].options.enableMarkdown}
      dispatch={this.props.dispatch}>
    </BuildBlock>)
  }

  buildLinkBlock(name, linkName, className, style={}){
    return(
      <BuildBlock
      help={(this.state.helperState) ? `canvas/${this.props.type}/${name}` : ""}
      block={this.findBuildingBlock(name, this.props.buildingBlocks)}
      refblock={this.findBuildingBlock(linkName, this.props.buildingBlocks)}
      className={className}
      type={this.props.type}
      style={style}
      lockings={this.props.lockings}
      mode={this.props.mode}
      tagID={this.props.tagID}
      editable={this.props.editable}
      project_id={this.props.project_id}
      canvasid={this.props.canvasid}
      moveEntry={this.props.moveEntry}
      actions={this.state.actions}
      findEntryByIDs={this.props.findEntryByIDs}
      onChangeAdd={this.props.onChangeAdd}
      openSettings={this.props.openSettings}
      globalTags={this.props.globalTags}
      enableMarkdown={this.props.canvases[this.props.canvasid].options.enableMarkdown}>
    </BuildBlock>
    )
  }

  /**
   * generate a BusinessModelCanvasLayout
   */
  buildBusinessModelCanvas() {
    return (
      <div>

      <Grid stackable style={{'paddingTop': 50, 'paddingBottom': 20 }} columns={5}>
        <Grid.Row stretched>
          {this.buildTitle()}
        </Grid.Row>
        <Grid.Row stretched>
        <Grid.Column>
            {this.buildBlock("Key Partners", "double-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Key Activities", "small-segment")}
            {this.buildBlock("Key Resources", "small-segment")}
          </Grid.Column>
          <Grid.Column>
            {
              this.buildBlock("Value Propositions", "double-segment")
              /*
            <BuildBlock
              block={this.findBuildingBlock("Value Propositions", this.props.buildingBlocks)}
              refblock={this.findBuildingBlock("Customer Segments", this.props.buildingBlocks)}
              className="double-segment"
              lockings={this.props.lockings}
              mode={this.props.mode}
              tagID={this.props.tagID}
              editable={this.props.editable}
              project_id={this.props.project_id}
              actions={this.state.actions}>
            </BuildBlock>*/
            }
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Customer Relationships", "small-segment")}
            {this.buildBlock("Channels", "small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Customer Segments", "double-segment")}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            {this.buildBlock("Cost Structure", "small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Revenue Streams", "small-segment")}
          </Grid.Column>
          </Grid.Row>
      </Grid>
      </div>
    );
  }


  /**
   * generate a ValuePropositionCanvas layout
   */
  buildValuePropositionCanvas() {

    /*
      dynamic scalings and styles are used to display the graphical diagram structure
    */

    let width = this.props.windowWidth;
    let s_w_c = width * 0.55;
    let s_w_q = width * 0.4;

    let m = "";

    let vpc_cs_segment = {
      width: s_w_c,
      height: s_w_c
    }

    let vpc_vp_segment = {
      marginTop: s_w_q * 0.24,
      width: s_w_q,
      height: s_w_q
    }

    let double_block_c_t = {
      marginTop: s_w_c * 0.15,
      marginLeft: s_w_c * 0.15,
      width: s_w_c * 0.45 - s_w_c * 0.15,
      height: s_w_c * 0.45 - s_w_c * 0.15,
      marginBottom: s_w_c * 0.05
    }

    let double_block_c_d = {
      marginBottom: s_w_c * 0.12,
      marginLeft: s_w_c * 0.15,
      width: s_w_c * 0.45 - s_w_c * 0.15,
      height: s_w_c * 0.45 - s_w_c * 0.15,
    }

    let double_block_q = {
      width: s_w_q * 0.45,
      height: s_w_q * 0.4,
    }

    let block_q = {
      width: s_w_q * 0.45,
      height: s_w_q * 0.92
    }

    let block_cj = {
      marginTop: s_w_c * 0.18,
      marginRight: s_w_c * 0.1,
      width: s_w_c * 0.45 - s_w_c * 0.1,
      height: s_w_c * 0.6
    }

    if (this.props.windowWidth <= 768) {
      m = "_small";
      vpc_cs_segment = {};
      vpc_vp_segment = {};
      double_block_q = {};
      block_q = {};
      double_block_c_t = {};
      double_block_c_d = {};
      block_cj = {};
      s_w_c = width;
      s_w_q = width;
    }

    let bmcid = "";

    Object.values(this.props.canvases).forEach((canvas, index) => {
      if (canvas.canvasType === "BUSINESS_MODEL") {
        // console.log('businessmodel')
        let vpblock = this.findBuildingBlock("Value Propositions", canvas.buildingBlocks)
        
        Object.values(vpblock.entries).forEach((entry, index) => {
          if (entry.content.reference === this.props.canvasid) {
            bmcid = "?id=" + canvas._id;
            console.log('bmcid:' + bmcid);
            if (this.props.mode === 'HISTORY') {
              bmcid += '&tag=' + this.props.tagID;
              console.log('bmcid:' + bmcid);
            }
          }
        });
      }
    });

    //} else {
    //     heading = <h1>{this.props.title}</h1> ;
    //}

    return (
      <Grid stackable style={{ 'paddingTop': 50, 'paddingBottom': 20 }} columns='equal' className="vpc">
        <Grid.Row stretched >
          {bmcid ? 
            this.buildTitle("businessmodel" + bmcid): this.buildTitle()}
        </Grid.Row>
        <Grid.Row className={"vpc-content-row" + m} >
          <Grid.Column className={"vpc-vp-column" + m} width={7}>
            <Segment style={{ width: s_w_q }}>
              <h1>ValueProposition</h1>
            </Segment>
            <Segment className={"vpc-vp-segment" + m} style={vpc_vp_segment}>
              <Grid stackable>
                <Grid.Row columns={2}>
                  <Grid.Column>
                    {this.buildBlock("Products & Services", "vpc-cell" + m, block_q)}
                  </Grid.Column>
                  <Grid.Column>
                    {this.buildBlock("Gain Creators", "vpc-cell" + m, double_block_q)}
                    {this.buildBlock("Pain Relievers", "vpc-cell-bottom" + m, double_block_q)}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>

          <Grid.Column stretched className={"vpc-cs-column" + m} width={5}>
            <Segment style={{ width: s_w_c }}>
              <h1>CustomerSegment</h1>
            </Segment>
            <Segment className={"vpc-cs-segment" + m} style={vpc_cs_segment}>
              <Grid stackable>
                <Grid.Row columns={2}>
                  <Grid.Column>
                    {this.buildBlock("Gains", "vpc-cell" + m, double_block_c_t)}
                    {this.buildBlock("Pains", "vpc-cell" + m, double_block_c_d)}
                  </Grid.Column>
                  <Grid.Column>
                    {this.buildBlock("Customer Job(s)", "vpc-cell" + m, block_cj)}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * build a CustomerJourneyCanvas layout
   */
  buildCustomerJourneyCanvas() {
    return (
      <Grid stackable style={{ 'paddingTop': 50, 'paddingBottom': 20 }} columns='equal'>
        <Grid.Row stretched>
          {this.buildTitle()}
        </Grid.Row>
        <Grid.Row columns={3} stretched>
          <Grid.Column>
            <Segment className="headline-segment">
              <h1>Pre Service Period</h1>
            </Segment>
            {this.buildBlock("Advertisement", "quart-segment")}
            {this.buildBlock("(Pre-) Social Media", "quart-segment")}
            {this.buildBlock("(Pre-) Word-of-Mouth", "quart-segment")}
            {this.buildBlock("Past Experiences", "quart-segment")}
          </Grid.Column>
          <Grid.Column>
            <Segment className="headline-segment">
              <h1>Service Period</h1>
            </Segment>
            {this.buildBlock("Service Journey", "oneth-segment")}
          </Grid.Column>
          <Grid.Column>
            <Segment className="headline-segment">
              <h1>Post Service Period</h1>
            </Segment>
            {this.buildBlock("Relationship Management", "third-segment")}
            {this.buildBlock("(Post-) Social Media", "third-segment")}
            {this.buildBlock("(Post-) Word-of-Mouth", "third-segment")}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={3} stretched>
          <Grid.Column>
            {this.buildBlock("Expactations","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Experiences","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("(Dis)Satisfaction","small-segment")}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /*
    build a LeanCanvas layout
  */
  buildLeanCanvas() {
    return (
      <Grid stackable style={{ 'paddingTop': 50, 'paddingBottom': 20 }} columns={5}>
        <Grid.Row stretched>
          {this.buildTitle()}
        </Grid.Row>
        <Grid.Row stretched>
          <Grid.Column>
            {this.buildBlock("Problem","double-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Solution","small-segment")}
            {this.buildBlock("Key Metrics","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Unique Value Proposition","double-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Unfair Advantage","small-segment")}
            {this.buildBlock("Channels","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Customer Segment","double-segment")}
          </Grid.Column>
        </Grid.Row>
        <Grid.Row columns={2}>
          <Grid.Column>
            {this.buildBlock("Cost Structure","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Revenue Streams","small-segment")}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  buildSpinCanvas(){
    return (
      <Grid stackable style={{'paddingTop': 50, 'paddingBottom': 20 }} columns='equal'>
        <Grid.Row stretched>
          {this.buildTitle()}
        </Grid.Row>
        <Grid.Row stretched>
          <Grid.Column>
            {this.buildBlock("Situation Questions","small-segment")}
            {this.buildBlock("Problem Questions","small-segment")}
          </Grid.Column>
          <Grid.Column>
            <Grid stackable columns="equal">
              <Grid.Row>
                <Grid.Column stretched>
                  {this.buildBlock("Implication Questions","double-segment")}
                </Grid.Column>
                <Grid.Column stretched>
                  {this.buildBlock("Pain-Gain Questions","double-segment")}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
          <Grid.Column>
            <Grid stackable>
              <Grid.Row stretched columns={2}>
                <Grid.Column>
                  {this.buildBlock("Advantages","small-segment")}
                </Grid.Column>
                <Grid.Column>
                  {this.buildBlock("Features","small-segment")}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row stretched columns={1}>
                <Grid.Column>
                  {this.buildBlock("Benefits","small-segment")}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
        <Grid.Row stretched>
          <Grid.Column>
            {this.buildBlock("Implicit Needs","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Explicit Needs","small-segment")}
          </Grid.Column>
          <Grid.Column>
            {this.buildBlock("Objections","small-segment")}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }



  buildPostcardCanvas(){
    return (
      <Grid stackable style={{'paddingTop': 50, 'paddingBottom': 20}} columns='equal'>
        <Grid.Row stretched>
          {this.buildTitle()}
        </Grid.Row>
        <Grid.Row stretched>

          <Grid.Column>
            <Grid stackable>
              <Grid.Row stretched columns={1}>
                <Grid.Column>
                  {this.buildBlock("Letter to Grandma","postcard", { height:400})}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }

  /**
   * findBuildingBlock (by title)
   * @param {*} title - title of requested BuildBlock
   * @param {*} buildingBlocks - mapping by id of all BuildBlocks
   */
  findBuildingBlock(title, buildingBlocks) {
    return Object.values(buildingBlocks).find((block) => block.title === title) || { response: 'error' };
  }

  /**
   * render : from react.component - renders the view
   * display the requested view
   */
  render() {
    
    switch (this.props.type) {
      case "BUSINESS_MODEL":
        return this.buildBusinessModelCanvas();
      case "VALUE_PROPOSITION":
        return this.buildValuePropositionCanvas();
      case "CUSTOMER_JOURNEY":
        return this.buildCustomerJourneyCanvas();
      case "LEAN":
        return this.buildLeanCanvas();
      case "SPIN":
        return this.buildSpinCanvas();
      case "POSTCARD":
        return this.buildPostcardCanvas();
      default:
        return (
          <div style={{paddingTop:50,paddingBottom:20}}>Received wrong canvas type ({this.props.type})</div>
        );
    }
  }

}

export default windowSize(CanvasGrid);
