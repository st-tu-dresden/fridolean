import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
//import { DropTarget } from 'react-dnd';
//import { WIDGET } from './ItemTypes';
import AddWidget from './AddWidget';
//import { moveWidget } from '../util';


const propTypes = {
   //Children of the column
  children: PropTypes.node,
   //CSS class that should be used with the column.
  className: PropTypes.string,
   //Function that should be called when user tries to add a widget to the column.
  onAdd: PropTypes.func,
   //Layout of the dashboard.
  layout: PropTypes.object,
   //Index of the row that this column resides.
  rowIndex: PropTypes.number,
   //Index of this column.
  columnIndex: PropTypes.number,
   //Indicates weather dashboard is in editable state
  editable: PropTypes.bool,
   //Indicates weather a widget is being draged over.
  isOver: PropTypes.bool,
   //Indicated a widget can be dropped.
  canDrop: PropTypes.bool,
   //Class to be used for columns in editable mode.
  editableColumnClass: PropTypes.string,
   //CSS class to be used for columns when a widget is droppable.
  droppableColumnClass: PropTypes.string,
   //Text that should be given to the AddWidget component.
  addWidgetComponentText: PropTypes.string,
   //ReactDnd's connectDropTarget.
  connectDropTarget: PropTypes.func,
   //Customized AddWidget component.
  addWidgetComponent: PropTypes.func,
  //custom
  canAdd: PropTypes.bool,
  //custom
  borderColor: PropTypes.string
};

const defaultProps = {
  editableColumnClass: 'editable-column',
  droppableColumnClass: 'droppable-column',
};

class Column extends Component {

 // TODO this is a custom modification and should be moved outside this folder
  componentDidMount() {
    // simulate a click for postcard canvas
    // check if there are more than 0 textareas on page, if yes -> dont call click method
    if (document.getElementsByClassName("canvas_POSTCARD").length === 1
     && document.getElementsByClassName("defaultWidgetFrame").length === 0) {
       document.querySelector(".canvas_POSTCARD .add-widget-button").click();
    }
  }

  render() {
    const {
      className,
      //layout,
      //rowIndex,
      //columnIndex,
      editable,
      children,
      //connectDropTarget,
      onAdd,
      isOver,
      canDrop,
      editableColumnClass,
      droppableColumnClass,
      addWidgetComponentText,
      addWidgetComponent,
      type
    } = this.props;
    
    let classes = className;
    classes = editable ? `${className} ${editableColumnClass}` : classes;
    const isActive = isOver && canDrop;
    classes = isActive ? `${classes} ${droppableColumnClass}` : classes;
    let addWidgetComponentToUse = null;
    if(this.props.canAdd){
  
      if (addWidgetComponent) {
        // eslint max-len=off
        addWidgetComponentToUse = createElement(addWidgetComponent, {	text: addWidgetComponentText, onClick:	() => {onAdd();} }); // eslint-disable-line
      }
      else {
        if(type !=="POSTCARD")
        addWidgetComponentToUse = <AddWidget text={addWidgetComponentText} type={type} onClick={() => {onAdd();}}/>; // eslint-disable-line
      }

    }

    return (
        <div className={classes}>
          {editable && addWidgetComponentToUse}
          { children }
        </div>
      );
  }
}

Column.propTypes = propTypes;
Column.defaultProps = defaultProps;


export default Column;//DropTarget(WIDGET, columnTarget, collect)(Column);
