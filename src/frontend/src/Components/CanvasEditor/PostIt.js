import React, { Component } from 'react';
import { TextArea } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import './style.css';
const ReactMarkdown = require('react-markdown');

/**
 * @class PostId : react.component - the plain default PostIt wich holds only text
 */
class PostIt extends Component {

    constructor(...args) {
        super(...args);
        this.textArea = null;
        this.boundPrintListener = this.printListener.bind(this)
    }

    printListener(evt) {
        this.setState({ ...this.state || {}, interactive: !evt.matches })
    }

    UNSAFE_componentWillMount() {
        this.setState({ interactive: true, hover: false, tagbarHeight: null, focus: false })
        window.matchMedia("print").addListener(this.boundPrintListener)
    }

    componentWillUnmount() {
        window.matchMedia("print").removeListener(this.boundPrintListener)
    }

    isEditable() {
        return this.state.interactive && (this.props.editable !== false);
    }

    renderEditor() {

        return (<TextArea
            disabled={!this.isEditable()}
            autoHeight
            rows="1"
            className="textarea"
            value={this.props.model.content.text}
            onChange={this.onChange.bind(this)}
            onKeyDown={this.onKeyDown.bind(this)}
            onFocus={this.onFocus.bind(this)}
            onBlur={this.onBlur.bind(this)}
            ref={(area) => {
                this.textArea = area;
                if ((!area)||(!area.ref)) return;
                if (this.state.tagbarHeight !== area.ref.clientHeight)
                    this.setState({ ...this.state, tagbarHeight: area.ref.clientHeight })
            }}>
        </TextArea>);
    }

    renderViewer() {
        return (<div ref={(viewer) => {
            let clientHeight = (viewer || {}).clientHeight;
            if (clientHeight === undefined) return;//using ```if (!viewer) return``` seems to not catch every "undefined" for some reason (race condition?)
            if (this.state.tagbarHeight !== clientHeight) {
                this.setState({ ...this.state, tagbarHeight: clientHeight })
            }
        }}
            onClick={this.onFocus.bind(this)}>
            <ReactMarkdown //Stateless function component, cannot be used directly with ref (according to react :shrug:)
                autoHeight
                className="markdownnote"
                source={this.props.model.content.text ? this.props.model.content.text : "***"}>
            </ReactMarkdown>
        </div>);
    }

    /**
     * 
     * @param {*} event - the provided event
     * @param {*} data  - the provided event data
     */
    onChange(event, data) {
        let e = this.props.model;
        e.content.text = data.value;
        this.props.callback(e);
    }

    /**
     * 
     * @param {*} event - the provided event 
     */
    onKeyDown(event) {
        if (!this.state.interactive) return;
        this.props.onKeyDown(event, this.props.model);
    }

    onMouseEnter(event) {
        if (!this.state.interactive) return;
        this.setState({ ...this.state || {}, hover: true })
    }

    onMouseLeave(event) {
        this.setState({ ...this.state || {}, hover: false })
    }

    onBlur() {
        this.setState({ ...this.state || {}, focus: false })
    }

    onFocus() {
        if (!this.state.interactive) return;
        this.setState({ ...this.state || {}, focus: true })
    }

    openEntrySettings(evt=null){
        if(evt) evt.stopPropagation()
        this.props.openSettings({ canvas: this.props.canvasID, block: this.props.blockID, entry: this.props.entyID })
    }

    openTags(tagID,evt=null) {
        if(evt) evt.stopPropagation()
        this.props.openSettings({tag:tagID})
    }

    createDragData() {
        let result = {
            source: {
                canvas: this.props.canvasID,
                block: this.props.blockID,
                entry: this.props.entyID
            }
        }
        if (this.textArea) {
            let ref = this.textArea.ref;
            if (ref) {
                let { selectionStart, selectionEnd } = ref;
                if (selectionStart !== selectionEnd)
                    result.textMarkers = { start: selectionStart, end: selectionEnd };
            }
        }
        return result;
    }

    dragStart(event) {
        event.dataTransfer.setData("json", JSON.stringify(this.createDragData()))
        event.dataTransfer.effectAllowed = "all"
    }

    /**
     * from REACT.Component
     * renders the component
     * - first checks if component is enabled and editable
     */
    render() {
        let center = (!this.props.enableMarkdown) || this.state.hover || this.state.focus ? this.renderEditor() : this.renderViewer();
        let tagbarheight = 20;
        if (this.state.tagbarHeight)
            tagbarheight = this.state.tagbarHeight
        let tags = this.props.model.content.tags || [];
        tags = tags.map((tag) => this.props.globalTags[tag])
        return (<span
            onMouseEnter={this.onMouseEnter.bind(this)}
            onMouseLeave={this.onMouseLeave.bind(this)}
            onDragOver={this.props.onDragOver}
            onDrop={this.props.onDrop}
            draggable="true"
            title={this.props.model.content.title}
            onDragStart={this.dragStart.bind(this)}
        >
            <span className="tagbar">
                <svg width="8" height={tagbarheight} preserveAspectRatio="xMinYMin" onClick={this.state.interactive && this.openEntrySettings.bind(this)} cursor={this.state.interactive && "pointer"}>
                    {tags.length?tags.map((tag, i) => (
                        <rect
                            height={tagbarheight / tags.length}
                            y={(tagbarheight / tags.length) * i}
                            width="8"
                            key={tag._id}
                            onClick={this.state.interactive && ((evt)=>evt.shiftKey?this.openTags(tag._id,evt):this.openEntrySettings(evt))}
                            fill={tag.color} />)):undefined
                        }
                </svg>
            </span>
            {center}
        </span>);
    }

}

export default PostIt;
