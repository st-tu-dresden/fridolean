import React, { Component } from 'react'
import { Card, List } from 'semantic-ui-react'
import TagPreviewLabel from './TagPreviewLabel'


class EntryPreviewCard extends Component {
    render() {
        let entry = this.props.entry;
        let globalTags = this.props.globalTags;
        return <Card link onClick={(evt) => { evt.stopPropagation(); this.props.onClick() }} fluid>
            <Card.Content>
                {entry.content.title ? <Card.Header content={entry.content.title} /> : undefined}
                {this.props.meta ? <Card.Meta content={this.props.meta} /> : undefined}
                <Card.Description>
                    {entry.content.text.substr(0, (this.props.maxContentLength || 100) - 3) + (entry.content.text.length > (this.props.maxContentLength || 100) - 3 ? "..." : "")}
                </Card.Description>
            </Card.Content>
            {
                (entry.content.tags.length && !this.props.noTags ?
                    <Card.Content extra><List horizontal>{
                        entry.content.tags.slice(0, this.props.maxLabelCount || 3).map((tag_id) => {
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

export default EntryPreviewCard