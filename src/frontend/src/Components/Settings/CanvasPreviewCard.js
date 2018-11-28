import React, { Component } from 'react'
import { Card, List } from 'semantic-ui-react'
import { Helper } from '../Helper'
import TagPreviewLabel from './TagPreviewLabel'
import { getCanvasTypes, getCanvasInfo } from '../../common/model/canvas'

let canvasViewLookup = {}

getCanvasTypes().map(getCanvasInfo).forEach((info) => canvasViewLookup[info.canvastype] = info.view);

class CanvasPreviewCard extends Component {
    render() {
        let globalTags = this.props.globalTags;
        return <Card link={!!this.props.onClick} onClick={this.props.onClick && ((evt) => { evt.stopPropagation(); this.props.onClick() })} fluid>
            <Card.Content>
                <Card.Header>
                    {this.props.canvas.title}
                </Card.Header>
                <Card.Meta>
                    <strong>Canvas Type:</strong> {canvasViewLookup[this.props.canvas.canvasType]} <Helper topic={`canvastype/${canvasViewLookup[this.props.canvas.canvasType]}`} />
                </Card.Meta>
            </Card.Content>
            {(this.props.canvas.tags.length && !this.props.noTags ?
                <Card.Content extra><List horizontal>{
                    this.props.canvas.tags.slice(0, this.props.maxLabelCount || 3).map((tag_id) => {
                        let tag = globalTags[tag_id];
                        return <List.Item key={tag._id}>
                            <TagPreviewLabel tag={tag} onClick={this.props.onTagClick} maxLabelLength={this.props.maxLabelLength || 30} />
                        </List.Item>
                    })
                }</List></Card.Content> : undefined)
            }
        </Card>
    }
}

export default CanvasPreviewCard