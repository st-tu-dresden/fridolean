import React, { Component } from 'react';

import {Provider} from 'react-redux';
import {createStore} from 'redux';

import * as globalStore from '../../store';

import reducer from '../../Containers/CanvasEditor/reducers/index';
import CanvasEditor from "../../Containers/CanvasEditor/CanvasEditor";
import {defaultBMC} from '../../Containers/CanvasEditor/reducers/DefaultReducer'

import { withRouter } from 'react-router-dom'

//the redux store only used by the canvas editor to improve speed
const store = createStore(reducer,defaultBMC);

/**
 * @class EditorView : react.component - container which calls the CanvasEditor
 * EditorView is only there to init the store and be routed by other views
 */
export class EditorView extends Component{

  /**
   * render : react.component - calls the CanvasEditor
   */
  render(){
    /*
      location - data from url
      match - data from url
      userID - data from global redux Store
      dispatch, subscribe - actions from local store (passed seperately)
      getState - state provider for CanvasEditor
    */
    return(
      <Provider store={store}>
        <CanvasEditor
          userID={globalStore.default.getState().user.id}
          match={this.props.match}
          location={this.props.location}  
          dispatch={store.dispatch} 
          subscribe={store.subscribe}    
          getState={store.getState}>        
        </CanvasEditor>
      </Provider>
    )
  }
}

export default withRouter(EditorView);
