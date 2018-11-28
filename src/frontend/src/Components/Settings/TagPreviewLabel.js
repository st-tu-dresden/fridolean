import React, { Component } from 'react'
import { Label } from 'semantic-ui-react'
import { SemanticColors } from './SemanticColorPicker'


class TagPreviewLabel extends Component {
    render() {
        let tag = this.props.tag;
        let maxLabelLength = this.props.maxLabelLength || Number.MAX_SAFE_INTEGER;
        if (SemanticColors.indexOf(tag.color) < 0)
            return <Label tag onClick={this.props.onClick && ((evt) => { evt.stopPropagation(); this.props.onClick(tag._id) })}
                style={{ "backgroundColor": tag.color, "borderColor": tag.color }}>
                {tag.title.substr(0, maxLabelLength - 3) + (tag.title.length > maxLabelLength - 3 ? "..." : "")}
            </Label>
        else
            return <Label tag onClick={this.props.onClick && ((evt) => { evt.stopPropagation(); this.props.onClick(tag._id) })}
                color={tag.color}>
                {tag.title.substr(0, maxLabelLength - 3) + (tag.title.length > maxLabelLength - 3 ? "..." : "")}
            </Label>
    }
}

export default TagPreviewLabel