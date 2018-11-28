import React from 'react';
import { Input, Button, Form, Icon, Modal, Item, Popup } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

import ConfirmationModal from './confirmation';

import { verifyTitle } from '../../../modules/ClientInput';

class Tag extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            openClone: false,
            newtitle: "",
            newdescription: "",
            titleError: false,
        }
    }
    clone() {
        this.setState({
            openClone: true,
            newtitle: "",
            newdescription: "",
        })
    }
    doClone() {
        let title = verifyTitle(this.state.newtitle);
        
        if (!title) {
            return this.setState({titleError: true});
        }

        this.finishClone();
        this.props.closeParent();
        this.props.actions.cloneTag(
            this.props.tag.id,
            this.state.newtitle,
            this.state.newdescription
        );
    }
    finishClone() {
        this.setState({
            openClone: false,
        })
    }
    render() {
        const props = this.props;

        return (
            <Item>
                <Item.Content>
                    <Item.Header>
                        {
                            props.tag.current ?
                                <Popup trigger={
                                    <Icon name="write"/>
                                } content="Current state"/>
                            : undefined
                        }
                        {props.tag.title}&ensp;
                        {
                            props.tag.isLoaded ?
                                <Popup trigger={
                                    <Icon disabled name="unhide"/>
                                } content="Currently viewing"/>
                            : undefined
                        }
                    </Item.Header>
                        <Button.Group basic floated="right">
                            <Popup trigger={
                                <Link
                                    to={{
                                        pathname: "/projects/" + props.project.id,
                                        search: props.tag.id === "" ? undefined : "?tag=" + props.tag.id,
                                    }}
                                >
                                    <Button icon="unhide" content="Show"/>
                                </Link>
                            } content="Show Milestone"/>
                            {   props.tag.current ? 
                                <Popup trigger={
                                    <Button icon="clone" disabled/>
                                } content="Clone Project"/> :
                                <Popup trigger={
                                    <Button icon="clone" onClick={() => this.clone()}/>
                                } content="Clone Project"/>
                            }
                            {
                                !props.canEdit ? undefined : (
                                    // props.tag.isLoaded || props.tag.current ?
                                    // <Popup trigger={
                                    //     <Button icon="remove" disabled/>
                                    // } content="You can't delete this tag"/> :
                                    // <ConfirmationModal trigger={
                                    //     <Button icon="remove"/>
                                    // } onConfirm={() => props.actions.deleteTag(props.tag.id)}/>
                                    props.tag.current ?
                                    <Popup trigger={
                                        <Button icon="repeat" disabled/>
                                    } content="You can't restore this tag"/> :
                                    <ConfirmationModal trigger={
                                        <Button icon="repeat"/>
                                    } onConfirm={() => {
                                        props.closeParent();
                                        props.actions.restoreTag(props.tag.id);
                                    }}
                                    title="Restore state"
                                    content={
                                        <React.Fragment>
                                            This will reset all canvases to the selected old state of the project.
                                            <br/>
                                            Do you want to proceed?
                                        </React.Fragment>
                                    }/>
                                )
                            }
                        </Button.Group>
                    <Item.Meta>
                        {new Date(props.tag.timestamp).toLocaleString()}
                    </Item.Meta>
                </Item.Content>
                <Modal open={this.state.openClone}>
                    <Modal.Header>
                        <Button secondary circular onClick={() => this.finishClone()} icon="arrow left"/>
                        &ensp;
                        Clone tag
                    </Modal.Header>
                    <Modal.Content>
                        Create new Project from Tag
                    </Modal.Content>
                    <Modal.Content>
                        <Form>
                            <Form.Input
                                error={this.state.titleError}
                                type="text"
                                placeholder={"New Project - " + props.tag.title}
                                label="Title"
                                onChange={(_, d) => this.setState({newtitle: d.value, titleError: false})}
                                />
                            <Form.TextArea
                                label="Description"
                                placeholder="Insert your description here..."
                                onChange={(_, d) => this.setState({newdescription: d.value})}
                            />
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button primary content="Create" onClick={() => this.doClone()}/>
                    </Modal.Actions>
                </Modal>
            </Item>
        );
    }
}

const TimelineTrigger = (props) => (
    <div style={{width: "100%"}}>
        <Button primary floated="right" icon={{name: "history" }} content="Timeline" size="large" onClick={props.onClick}/>
        <p>
            <strong>You're viewing: </strong><br/>
            { props.tag ?
                props.tag.title
                + " ("
                + (props.tag.current ? "Current state" : new Date(props.tag.timestamp).toLocaleString())
                + ")" :
                "Undefined"}
        </p>
    </div>
);

export default class Timeline extends React.Component {
    constructor(props) { super(props); this.state = ({open: false}); }
    render() {
        return (
            <Modal
                open={this.state.open}
                onOpen={() => this.setState({open: true})}
                onClose={() => this.setState({open: false})}
                trigger={
                    <TimelineTrigger tag={
                            this.props.tags.filter(t => t.isLoaded)[0]
                        }
                        onClick={() => this.setState({open: true})}
                    />
                }
            >
                <Modal.Header>
                    <Button secondary circular onClick={() => this.setState({open: false})} icon="arrow left"/>
                    &ensp;
                    Timeline
                </Modal.Header>
                <Modal.Content scrolling>
                    <Item.Group relaxed>
                        {
                            this.props.tags.map((t, i) => (
                                <Tag
                                    tag={t}
                                    key={t.id}
                                    project={this.props.project}
                                    actions={this.props.actions}
                                    canEdit={this.props.canEdit}
                                    closeParent={() => this.setState({open: false})}
                                />
                            ))
                        }
                    </Item.Group>
                </Modal.Content>
                <Modal.Content>
                    { (!this.props.canEdit) ? undefined :
                        <Input fluid action type="text" placeholder="Milestone name..." ref={(x) => this.newTag = x}>
                            <input/>
                            <Button
                                primary
                                icon="save"
                                content="Save state"
                                onClick={() => this.props.actions.createTag(this.newTag.inputRef.value)}
                            />
                        </Input>
                    }
                </Modal.Content>
            </Modal>
        );
    }
}