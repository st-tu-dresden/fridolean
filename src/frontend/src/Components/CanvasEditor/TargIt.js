import React from 'react';
import PostIt from './PostIt';
import 'semantic-ui-css/semantic.min.css';
import './style.css'

/**
 * @class LinkIt : react component - kind of PostIt wich holds a link an a reference
 */
class TargIt extends PostIt {

  /**
   * from REACT.Component
   * renders the component
   * - first checks if component is enabled and editable
   */
  render() {
    return (
      <div className="x-postit" style={{'borderColor': this.props.color}}>
        {super.render()}
      </div>
    );
  }

}

export default TargIt;
