import React, { Component, createElement } from 'react';
import PropTypes from 'prop-types';
//import { findDOMNode } from 'react-dom';
//import { DragSource, DropTarget } from 'react-dnd';
//import { WIDGET } from './ItemTypes';
//import { sortWidget } from '../util';
import DefaultFrame from './DefaultFrame';

//import Entry from '../../../../Components/CanvasEditor/EntryRep';

 const propTypes = {
    //Childrens of the widget frame.
   children: PropTypes.element,
    //Layout of the dahsboard.
   layout: PropTypes.object,
    //Index of the column these widgets should be placed.
   columnIndex: PropTypes.number,
    //Index of the row these widgets should be placed.
   rowIndex: PropTypes.number,
    //Index of the widget.
   widgetIndex: PropTypes.number,
    //Indicates weatehr dashboard is in ediable mode or not.
   editable: PropTypes.bool,
    //User provided widget frame that should be used instead of the default one.
   frameComponent: PropTypes.func,
    //Name of the widget.
   widgetName: PropTypes.string,
    //Title of the widget.
   title: PropTypes.string,
    //Weather the component is being dragged.
   isDragging: PropTypes.bool,
    // ReactDnd's connectDragSource().
   connectDragSource: PropTypes.func,
    //ReactDnd's connectDropTarget().
   connectDropTarget: PropTypes.func,
    //Function that should be called when a widget is about to be removed.
   onRemove: PropTypes.func,
   //custom
   dragable: PropTypes.bool,
   //custom
   borderColor: PropTypes.string
 };

class WidgetFrame extends Component {
  render() {
    const {
      frameComponent,
      children,
      editable,
      title,
      isDragging,
      dragable
    } = this.props;

    let selected = null;

    if (frameComponent) {
      // if user provided a custom frame,  use it
      selected = createElement(frameComponent, {	children,	editable, title, onRemove: this.remove }); // eslint-disable-line max-len
    } else {
      // else use the default frame
      selected = (
        <DefaultFrame
          title={title}
          editable={editable}
          children={children}
          onRemove={this.remove}
          borderColor={this.borderColor}
        />
      );
    }

    //dragable custom hinzugefügt!
    const opacity = isDragging&&dragable ? 0 : 1;
    const widgetFrame = (
        <div style={{ opacity }}>
            {selected}
        </div>
    );

    //dragable custom hinzugefügt
    return  widgetFrame;//editable&&dragable ? connectDragSource(connectDropTarget(widgetFrame)) : widgetFrame;
  }

  remove = () => {
    const { widgetIndex } = this.props;
    //const newLayout = removeWidget(layout, rowIndex, columnIndex, widgetIndex);
    //console.log('remove call');
    //console.log(widgetIndex);
    let e = {index: widgetIndex};
    this.props.onRemove(e);
  }
}

WidgetFrame.propTypes = propTypes;

//const DragSourceDecorator = DragSource(WIDGET, boxSource, collectDrag)
//const DragTargetDecorator = DropTarget(WIDGET, cardTarget, collectDrop)

export default WidgetFrame;//DragSourceDecorator(DragTargetDecorator(WidgetFrame))
