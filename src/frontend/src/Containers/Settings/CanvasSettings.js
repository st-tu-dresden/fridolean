import React from 'react'
import BaseSettings from './BaseSettings'
import { TagSelector, /*knownTagColors*/ } from '../../Components/Settings/TagSelector'
import EntryPreviewCard from '../../Components/Settings/EntryPreviewCard'
import { changeCanvasTags, changeCanvasTitle, changeCanvasOptions, createTag } from '../CanvasEditor/actions'
import RandomColor from 'randomcolor';
import { Segment, Divider, Input, Checkbox, Card, Accordion } from 'semantic-ui-react'

class CanvasSettings extends BaseSettings {

    onTagsChange(tags) {
        let canvas = this.getCanvas();
        let newTags = tags.filter(tag => canvas.tags.indexOf(tag) < 0)
        let delTags = canvas.tags.filter(tag => tags.indexOf(tag) < 0)
        this.props.dispatch(changeCanvasTags(this.props.canvasID, newTags, delTags))
    }

    onOpenTag(tag) {
        this.props.openSettings({ tag })
    }

    createTag(title) {
        this.props.dispatch(createTag(title, RandomColor(), undefined, [this.props.canvasID]))
    }

    renderBuildingBlock(block) {
        let globalTags = this.getGlobalTags();
        return {
            key: block._id,
            title: block.title,
            content: {key:block._id,content:<Card.Group itemsPerRow={3} stackable style={{marginTop:"0"}}>
                {Object.values(block.entries).map((entry) =>
                    <EntryPreviewCard globalTags={globalTags} entry={entry}
                        onClick={() => this.props.openSettings({ canvas: this.props.canvasID, block: block._id, entry: entry._id })}
                        onTagClick={(tag) => this.props.openSettings({ tag })}
                        fluid key={entry._id} />
                )}
            </Card.Group>
            }

        }
    }

    render() {
        let canvas = this.getCanvas();
        let globalTags = this.getGlobalTags();
        return (<Segment>
            <Input disabled={this.props.readonly} defaultValue={canvas.title} label="Title" fluid onChange={(_, input) =>
                this.props.dispatch(changeCanvasTitle(this.props.canvasID, input.value))
            } />
            <Divider horizontal />
            <TagSelector readonly={this.props.readonly} globalTags={globalTags} localTags={canvas.tags}
                onChange={this.onTagsChange.bind(this)}
                onOpenTag={this.onOpenTag.bind(this)}
                onCreateTag={this.createTag.bind(this)} />
            <Divider horizontal />
            <Accordion styled exclusive={false} fluid
                panels={
                    Object.values(canvas.buildingBlocks).filter(block => Object.values(block.entries).length).map(this.renderBuildingBlock.bind(this))
                }>
            </Accordion>
            <Divider horizontal />
            <Checkbox disabled={this.props.readonly} label="Enable Markdown" toggle
                onChange={(_, data) => this.props.dispatch(changeCanvasOptions(this.props.canvasID, { ...canvas.options, enableMarkdown: data.checked }))}
                checked={canvas.options.enableMarkdown} />
        </Segment>)
    }

}

export default CanvasSettings
