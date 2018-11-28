import React from 'react'
import BaseSettings from './BaseSettings'
import { TextArea, Segment, Input, Divider, Grid } from 'semantic-ui-react'
import { changeEntry, changeEntryTags, createTag } from '../CanvasEditor/actions'
import {TagSelector} from '../../Components/Settings/TagSelector'
import RandomColor from 'randomcolor';
const ReactMarkdown = require('react-markdown');

class EntrySettings extends BaseSettings {

    onTagsChange(tags) {
        let entry = this.getEntry();
        let newTags = tags.filter(tag => entry.content.tags.indexOf(tag) < 0)
        let delTags = entry.content.tags.filter(tag => tags.indexOf(tag) < 0)
        this.props.dispatch(changeEntryTags(this.props.entryID, this.props.blockID, this.props.canvasID, newTags, delTags))
    }

    onOpenTag(tag) {
        this.props.openSettings({ tag })
    }

    createTag(title) {
        this.props.dispatch(createTag(title, RandomColor(), [{ canvas: this.props.canvasID, block: this.props.blockID, entry: this.props.entryID }]))
    }

    render() {
        let globalTags = this.getGlobalTags();
        let entry = this.getEntry()
        let enableMarkdown = this.getCanvas().options.enableMarkdown;
        return (<Segment>
            <Input disabled={this.props.readonly} defaultValue={entry.content.title} label="Title" fluid onChange={(_, input) =>
                this.props.dispatch(changeEntry({ ...entry, content: { ...entry.content, title: input.value } }, this.props.blockID, this.props.canvasID))
            } />
            <Divider horizontal />
            <TagSelector readonly={this.props.readonly} globalTags={globalTags} localTags={entry.content.tags}
                onChange={this.onTagsChange.bind(this)}
                onOpenTag={this.onOpenTag.bind(this)}
                onCreateTag={this.createTag.bind(this)} />
            <Divider horizontal />
            {enableMarkdown?
                <Grid stackable columns={2}>
                    <Grid.Column>
                        <TextArea disabled={this.props.readonly} style={{ width: "100%" }} autoHeight value={entry.content.text} onChange={(_, area) =>
                            this.props.dispatch(changeEntry({ ...entry, content: { ...entry.content, text: area.value } }, this.props.blockID, this.props.canvasID))
                        }
                        />
                    </Grid.Column>
                    <Grid.Column>
                        <ReactMarkdown style={{ width: "100%" }} source={entry.content.text || "***"}
                            autoHeight
                            className="markdownnote" />
                    </Grid.Column>
                </Grid>:
                <TextArea disabled={this.props.readonly} style={{ width: "100%" }} autoHeight value={entry.content.text} onChange={(_, area) =>
                    this.props.dispatch(changeEntry({ ...entry, content: { ...entry.content, text: area.value } }, this.props.blockID, this.props.canvasID))
                }
                />
            }
        </Segment>)
    }

}

export default EntrySettings