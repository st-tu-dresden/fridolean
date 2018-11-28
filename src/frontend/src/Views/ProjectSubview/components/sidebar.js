import React, {Component} from 'react';
import { Segment, List, Popup, Header, Input, Button, Divider, Modal, Icon, Form, TextArea, Checkbox } from 'semantic-ui-react';
import * as Markdown from 'react-markdown';

import Timeline from './timeline';
import ConfirmationModal from './confirmation';
import CollaboratorItem from './collaborator';

import { verifyTitle } from '../../../modules/ClientInput';

class ProjectSettings extends React.Component{
    constructor(props) { super(props); this.state = {open: false, titleError: false}; }
    saveChanges() {
        let title = verifyTitle(this.projectTitle.inputRef.value);

        if (!title) {
            return this.setState({titleError: true});
        }

        this.props.actions.updateProject(
            this.props.project.id,
            title,
            this.projectDesc.ref.value,
            this.projectPublic.state.checked
        );
        this.setState({open: false});
    }
    render() {
        return (
            <Modal trigger={
                <Button basic onClick={() => this.setState({open: true})}>Settings</Button>
            }
            open={this.state.open}
            onOpen={() => this.setState({open: true})}
            onClose={() => this.setState({open: false})}
            >
                <Modal.Header>
                    <Button secondary circular onClick={() => this.setState({open: false})} icon="arrow left"/>
                    &ensp;
                    Settings
                </Modal.Header>
                <Modal.Content>
                    <Form>
                        <Form.Field error={this.state.titleError}>
                            Title:
                            <Input
                                type="text"
                                defaultValue={this.props.project.title}
                                ref={(x) => this.projectTitle = x}
                                onChange={() => this.setState({titleError: false})}
                            />
                        </Form.Field>
                        <Form.Field>
                            Description:
                            <TextArea
                                autoHeight
                                defaultValue={this.props.project.description}
                                ref={(x) => this.projectDesc = x}
                            />
                        </Form.Field>
                        <Form.Field>
                            <Checkbox
                                toggle
                                label="Publicly Visible"
                                defaultChecked={this.props.project.isPublic}
                                ref={(x) => this.projectPublic = x}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button
                        primary
                        content="Save"
                        onClick={() => this.saveChanges()}/>
                </Modal.Actions>
            </Modal>
        )
    }
}

class ProjectSidebar extends Component {
    constructor(props) { super(props); this.state = {collabs: "", newcollab: ""}; }
    render() {
        let collaborators = this.props.collaborators
            .filter((c) => c.email.toLowerCase().indexOf(this.state.collabs) >= 0)
            .map((c, i) =>
                <CollaboratorItem
                    key={c.email}
                    collaborator={c}
                    actions={this.props.actions}
                    canEdit={this.props.canEdit}
                    project={this.props.project}
                />
            );

        return (
            <Segment
                style={{ height: "100%" }}
                padded
            >
                {/* Project Overview */}
                <Header size="large">
                    {   this.props.project.isPublic ?
                        <Popup trigger={
                            <Icon name="world"/>
                        } content="Public Project"/>
                        : undefined
                    }
                    <Header.Content>
                        {this.props.project.title}
                    </Header.Content>
                </Header>
                <Markdown source={this.props.project.description}/>
                <Divider/>

                {/* Collaborators */}
                <Header size="medium" content="Collaborators:"/>
                <Input icon="search" type="text" fluid onChange={
                    (_, text) => this.setState({collabs: text.value.toLowerCase()})
                }/>
                <List relaxed="very" style={{maxHeight: "40vh", overflow: "auto"}}>
                    {collaborators}
                </List>
                { (this.props.project.tag || !this.props.canEdit) ? undefined :
                    <Input
                        action
                        fluid
                        placeholder="Collaborator-Email"
                        type="email"
                        ref={(x) => this.newcollab = x}
                    >
                        <input/>
                        <Button onClick={
                                () => this.props.actions.addCollaborator(
                                    this.newcollab.inputRef.value,
                                    "READ"
                                )
                            }
                        >
                            Add
                        </Button>
                    </Input>
                }

                {/* Timeline */}
                <Segment basic secondary>
                    <Timeline
                        tags={this.props.tags}
                        project={this.props.project}
                        actions={this.props.actions}
                        canEdit={this.props.canEdit}
                    />
                </Segment>

                {/* Settings */}
                {
                    (this.props.project.tag || !this.props.canEdit) ? undefined :
                    <React.Fragment>
                        <ProjectSettings project={this.props.project} actions={this.props.actions}/>
                        <ConfirmationModal
                            trigger={
                                <Button basic floated="right">Delete Project</Button>
                            } content={
                                <p>Do you <strong>really</strong> want to delete the project?</p>
                            }
                            icon="delete calendar" header="Deletion Confirmation"
                            onConfirm={() => this.props.actions.deleteProject(this.props.project.id)}
                        />
                    </React.Fragment>
                }
            </Segment>
        );
    }
}

export default ProjectSidebar;