import React from 'react'
import { Input, Segment, Divider, Container, Dropdown, Card } from 'semantic-ui-react'
import { createTag } from '../../Containers/CanvasEditor/actions'
import CanvasPreviewCard from '../../Components/Settings/CanvasPreviewCard'
import BaseSettings from './BaseSettings'
import TagPreviewLabel from '../../Components/Settings/TagPreviewLabel'
import RandomColor from 'randomcolor';

class ProjectSettings extends BaseSettings {

    createTag(evt, data) {
        evt.stopPropagation();
        let createTagAction = createTag(data.value, RandomColor())
        this.props.dispatch(createTagAction)
        this.openTag(createTagAction.tag._id);
    }

    openTag(tag_id) {
        window.setTimeout(this.props.openSettings, undefined, { tag: tag_id })//Miniscule delay so that Dropdown has time to call its own setState() before unmounting
    }

    openCanvas(canv_id) {
        this.props.openSettings({ canvas: canv_id })
    }

    changeTag(evt, data) {
        evt.stopPropagation();
        if (this.getTag(data.value))
            this.openTag(data.value);
    }

    renderTags(tags) {
        return <Dropdown search selection fluid placeholder="Browse tags" selectOnBlur={false} selectOnNavigation={false} button
            options={tags.map((tag) => ({
                key: tag._id,
                value: tag._id,
                text: tag.title,
                content: <TagPreviewLabel tag={tag} />
            }))}
            allowAdditions={!this.props.readonly}
            onAddItem={this.props.readonly?undefined:this.createTag.bind(this)}
            onChange={this.changeTag.bind(this)} />
    }

    render() {
        let { title, description, persistent } = this.props.store;
        let { tags, canvases } = persistent;

        return <Segment>
            <Input defaultValue={title} label="Title" fluid disabled />
            <Divider horizontal/>
            <Container text fluid>
                {description}
            </Container>
            <Divider horizontal/>
            {this.renderTags(Object.values(tags))}
            <Divider horizontal/>
            <Card.Group itemsPerRow={3} stackable style={{ marginTop: "0" }}>
                {Object.values(canvases).map(canv => <CanvasPreviewCard key={canv._id} canvas={canv} globalTags={tags} onClick={() => this.openCanvas(canv._id)} />)}
            </Card.Group>
        </Segment>
    }

}

export default ProjectSettings