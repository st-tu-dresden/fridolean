import React from 'react'
import { Segment, Input, Divider, TextArea, Accordion, Card } from 'semantic-ui-react'
import BaseSettings from './BaseSettings'
import { SemanticColorPicker } from '../../Components/Settings/SemanticColorPicker'
import TagPreviewLabel from '../../Components/Settings/TagPreviewLabel'
import CanvasPreviewCard from '../../Components/Settings/CanvasPreviewCard'
import EntryPreviewCard from '../../Components/Settings/EntryPreviewCard'
import { changeTag } from '../../Containers/CanvasEditor/actions/index'

class TagSettings extends BaseSettings {


    renderCanvas(canvasID) {
        let canvas = this.getCanvas(canvasID);
        let globalTags = this.getGlobalTags();
        return <CanvasPreviewCard globalTags={globalTags} canvas={canvas}
            onClick={() => this.props.openSettings({ canvas: canvas._id })}
            fluid key={canvas._id} noTags />
    }
    
    renderEntry(entryLocation) {
        let canvas = this.getCanvas(entryLocation.canvas);
        let block = canvas.buildingBlocks[entryLocation.block];
        let entry = block.entries[entryLocation.entry];
        let globalTags = this.getGlobalTags();
        return <EntryPreviewCard globalTags={globalTags} entry={entry}
                        onClick={() => this.props.openSettings({ canvas: entryLocation.canvas, block:entryLocation.block, entry:entryLocation.entry})}
                        fluid key={entry._id} noTags meta={`${canvas.title}/${block.title}`} />
    }

    render() {
        let tag = this.getTag();
        return <Segment>
            <Input disabled={this.props.readonly} value={tag.title} label="Title" fluid onChange={(evt, data) => {
                evt.stopPropagation();
                this.props.dispatch(changeTag(this.props.tagID, data.value))
            }} />
            <Divider horizontal />
            <SemanticColorPicker readonly={this.props.readonly} color={tag.color} onChange={(color) =>
                this.props.dispatch(changeTag(this.props.tagID, undefined, color))
            } example={(color) => <TagPreviewLabel tag={{ _id: 0, title: "Example", color }} />} />
            <Divider horizontal />
            <TextArea disabled={this.props.readonly} style={{ width: "100%" }} autoHeight value={tag.description} onChange={(_, area) =>
                this.props.dispatch(changeTag(this.props.tagID, undefined, undefined, area.value))
            }
            />
            <Accordion styled exclusive={false} fluid panels={[
                {
                    title: "Canvases", key: "Canvases", content: {
                        key: "CanvasesContent", content:
                        <Card.Group key="CanvasCards" itemsPerRow={3} stackable style={{ marginTop: "0" }}>
                            {tag.canvases.map(this.renderCanvas.bind(this))}
                        </Card.Group>
                    }
                },{
                    title: "Entries", key: "Entries", content: {
                        key: "EntriesContent", content:
                        <Card.Group key="EntryCards" itemsPerRow={3} stackable style={{ marginTop: "0" }}>
                            {Object.values(tag.entries).map(this.renderEntry.bind(this))}
                        </Card.Group>
                    }
                }].filter((obj)=>obj.content.content.props.children.length)//Filter for empty Accordions
            } />
        </Segment>
    }

}

export default TagSettings