import React from 'react';
import { Popup, List, Modal, Header, Form, Label, Message, Button, Dropdown } from 'semantic-ui-react';

import ConfirmationModal from './confirmation';

import store from '../../../store';

export default class CollaboratorItem extends React.Component {
    getIcon(c) {
        if (!c.accepted) {
            switch(c.rights.toUpperCase()) {
                case "EDIT":
                    return (
                        <Popup trigger={
                            <List.Icon className="open envelope"/>
                        } content="Invitation pending (Editing)"/>
                    );
                case "READ":
                    return (
                        <Popup trigger={
                            <List.Icon className="open envelope outline"/>
                        } content="Invitation pending (Reading)"/>
                    );
                default:
                    return undefined;
            }
        }
        else {
            switch(c.rights.toUpperCase()) {
                case "EDIT":
                    return (
                        <Popup trigger={
                            <List.Icon name="write"/>
                        } content="Allowed to edit"/>
                    );
                case "READ":
                    return (
                        <List.Icon name={undefined}/>
                    );
                default:
                    return undefined;
            }
        }
    }
    render() {
        const c = this.props.collaborator;
        const icon = this.getIcon(c);

        const rights_options = [
            { text: "Read", value: "READ" },
            { text: "Edit", value: "EDIT" },
        ]

        const alt_view_icon = (
            <Popup trigger={
                <List.Icon name="unhide"/>
            } content="Allowed to read"/>
        );

        let isCurrentUser = c.email === store.getState().user.email;

        return (
            <Modal size="small" trigger={
                <List.Item as="a" className="fluid" active={isCurrentUser}>
                    { icon }
                    <List.Content>
                        {/* c.name */ c.email}
                    </List.Content>
                </List.Item>
            }>
                <Header
                    icon={(icon.props.content) ? icon : alt_view_icon}
                    // content={c.name}
                    content={c.email}
                />
                <Label as="a" href={"mailto:" + c.email}
                    attached="top right"
                    size="large"
                    color="blue"
                >
                    <List.Icon name="mail"/>
                    {c.email}
                </Label>
                <Modal.Content>
                    <Form>
                        {
                            c.accepted ? undefined:
                            <Message info
                                icon="info"
                                header="Invitation pending"
                                content={`
                                    The user hasn't answered their invitation yet and
                                    therefore has no access to the project right now.`
                                }
                            />
                        }
                        <Form.Field>
                            <label>Collaborator rights:</label>
                            <Dropdown
                                disabled={isCurrentUser || this.props.project.tag || !this.props.canEdit}
                                selection
                                options={rights_options}
                                defaultValue={c.rights}
                                ref={(x) => this.newrights = x}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    { (isCurrentUser || this.props.project.tag || !this.props.canEdit) ? undefined :
                        <React.Fragment>
                            <ConfirmationModal
                                trigger={
                                    <Button
                                        basic
                                        negative
                                        content="Remove Collaborator"
                                    />
                                }
                                icon="remove circle"
                                content="Do you really want to remove the collaborator?"
                                onConfirm={() => this.props.actions.deleteCollaborator(c.email)}
                            />
                            <Button
                                primary
                                onClick={() => this.props.actions.updateCollaborator(c.email, this.newrights.state.value)}
                                content="Save"
                            />
                        </React.Fragment>
                    }
                </Modal.Actions>
            </Modal>
        );
    }
}