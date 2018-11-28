import React, {Component} from 'react'
import { Dropdown } from 'semantic-ui-react'
import {SemanticColors as knownTagColors} from './SemanticColorPicker'

export class TagSelector extends Component {

    renderTag(lbl) {
        let tag = this.props.globalTags[lbl.value];
        if (knownTagColors.indexOf(tag.color) >= 0)
            return {
                key: lbl.value,
                color: tag.color,
                style: { marginLeft: "15px" },//Fix tag width
                tag: true,
                content: (<div style={{ display: "inline-block", marginTop: "4px", marginBottom: "3px" }/*Fix tag height*/}>
                    &ensp;{lbl.text}</div>)
            }
        else
            return {
                key: tag._id,
                style: { "backgroundColor": tag.color, "borderColor": tag.color, marginLeft: "15px" },//support custom colors and fix tag width
                tag: true,
                content: (<div style={{ display: "inline-block", marginTop: "4px", marginBottom: "3px" }/*Fix tag height*/}>
                    &ensp;{lbl.text}</div>)
            }
    }

    render() {
        return (<Dropdown 
            disabled={this.props.readonly}
            multiple search selection fluid placeholder="Enter tags" 
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
                if(data.value.every(tag=>!!this.props.globalTags[tag]))
                    this.props.onChange(data.value)
                }}
            value={this.props.localTags}
        />)
    }

}