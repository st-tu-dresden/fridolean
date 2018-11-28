/* eslint-disable*/
import React from 'react';
import PostIt from './PostIt'
import {TextArea, Container, Icon} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './style.css'

import { Link } from 'react-router-dom';

/**
 * @class LinkIt : react component - kind of PostIt wich holds a link an a reference
 */
class LinkIt extends PostIt{

  /**
   * @deprecated
   */
  onReferenceCall(){
    this.props.onReferenceCall(this.props.model);
  }

  /**
   * from REACT.Component
   * renders the component
   * - first checks if component is enabled and editable
   * - provides a link wich leads to the connected canvas
   */
  render() {

    //if editor is in HISTORY mode, the link should lead to its historical reference
    let searchString = "?id=" + this.props.model.content.reference;
    if(this.props.mode === 'HISTORY'){
      searchString += '&tag=' + this.props.tagID;
    }

    return (
      <div className='x-postit' style={{'borderColor': this.props.color}}>
        {super.render()}
        {!this.state.interactive?"":
        <Container onClick={onForceReload}>
        <Link to={{
                    pathname: "/projects/" + this.props.project_id + "/editor/"
                        + "valueproposition",
                    search: searchString
                  }}
                  >
                  <Container>
                    <Icon name="window maximize"></Icon>open
                  </Container>
        </Link>
        </Container>}
       </div>
    );
  }
}

function onForceReload(){
  window.location.reload();
}

export default LinkIt
