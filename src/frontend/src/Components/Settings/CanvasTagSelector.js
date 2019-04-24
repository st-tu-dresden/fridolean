import React, {Component} from 'react'
import { Dropdown, Label, Icon } from 'semantic-ui-react'
import {SemanticColors as knownTagColors} from './SemanticColorPicker'

export class CanvasTagSelector extends Component {

    // TODO delete is not working
    renderTag(lbl) {
        let tag = this.props.globalTags[lbl.value];
        console.log(this);
        if (knownTagColors.indexOf(tag.color) >= 0) {
            console.log(tag.color);
            return (
                <Label
                    key={lbl.value}
                    color={tag.color}
                    style={{marginLeft: "15px" }}
                    draggable="true"
                    onDragStart={this.dragStart.bind(this)}
                    onRemove={this.handleLabelRemove}
                    tag
                >
                    <div
                        style={{ display: "inline-block", marginTop: "4px", marginBottom: "3px" }/*Fix tag height*/}
                    >
                        &ensp;{lbl.text}
                    </div>
                    <Icon name='delete'
                        onClick={(event) => {event.stopPropagation(); this.props.onChange(this.value.filter(tag=>tag!==lbl.value));}}
                        tagId={tag._id}
                    />
                </Label>);
        } else {
            return (
                <Label
                    key={tag._id}
                    style= {{ "backgroundColor": tag.color, "borderColor": tag.color, marginLeft: "15px" }} //support custom colors and fix tag width
                    tag
                    onDragStart = {(event) => this.dragStart(event, tag)}
                    draggable="true"
                >
                    <div
                        style={{ display: "inline-block", marginTop: "4px", marginBottom: "3px" }/*Fix tag height*/}
                    >
                        &ensp;{lbl.text}
                    </div>
                    <Icon name='delete'
                        onClick={(event) => {event.stopPropagation(); this.props.onChange(this.value.filter(tag=>tag!==lbl.value));}}
                        tagId={tag._id}
                    />
                </Label>);
        }
    }

    dragStart(event, tag) {
        this.props.onTagDrag(tag._id);
    }

    tagRemove(event, data) {
        event.stopPropagation()
        console.log(data);
        console.log(this);
        // this.props.onChange(tag._id);
                console.log("ASD");
                if(data.value.every(tag=>!!this.props.globalTags[tag]))
                    this.props.onChange(data.value)
    }

    render() {
        return (<Dropdown 
            disabled={this.props.readonly}
            multiple search selection placeholder="Enter tags" 
            renderLabel={this.renderTag.bind(this)} 
            options={Object.values(this.props.globalTags).map((tag) => ({
                key: tag._id,
                text: tag.title,
                value: tag._id
            }))}
            allowAdditions
            onAddItem={(evt,data)=>{evt.stopPropagation();this.props.onCreateTag(data.value)}}
            onLabelClick={(evt,data)=>{evt.stopPropagation();this.props.onOpenTag(data.value)}}
            onChange={(evt,data)=>{
                evt.stopPropagation()
                console.log("ASD");
                if(data.value.every(tag=>!!this.props.globalTags[tag]))
                    this.props.onChange(data.value)
                }}
            value={this.props.localTags}
        />)
    }

}
