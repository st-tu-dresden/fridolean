import React, {Component} from 'react';
import { Grid, Segment, Card, Container, Dimmer, Loader, Modal, Header, Button } from 'semantic-ui-react';

import { connect } from 'react-redux';

import ProjectSidebar from './components/sidebar';
import { CanvasCard, NewCanvasCard } from './components/cards';

import * as SubviewAPI from './api';

import { getActionCreators } from './actions';

import store, { history } from '../../store';
import Auth from '../../modules/Auth';

class ProjectSubview extends Component {
    componentDidMount() {
        this.fetchState(this.props);
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.location !== this.props.location ||
            nextProps.match !== this.props.match)
        this.fetchState(nextProps);
        // console.log(">>> NEW PROPS", nextProps);
    }
    fetchState(props) {
        SubviewAPI.setCurrentUser(Auth.getToken());
        props.actions.clearProject();

        const projectId = props.match.params.projectId;
        const tag = new URLSearchParams(props.location.search).get('tag') || undefined;

        props.actions.getProject(projectId, tag);
    }

    render() {
        if (!this.props.project) {
            return (
                <Dimmer active page>
                    <Loader/>
                </Dimmer>
            );
        }

        let canvastypes = SubviewAPI.canvasTypes.map(c => ({ text: c.view, value: c.data}));
        let userMail = store.getState().user.email;
        let canEdit = this.props.project.collaborators
            .filter(c => (c.rights.toUpperCase() === 'EDIT') && (c.email === userMail)).length > 0;

        return (
            <div>
                <Segment
                    style={{ minHeight: 600, padding: '6em 0em' }}
                >
                    <Grid columns="2" stackable stretched>
                        <Grid.Column style={{ minWidth: 200 }} width="4">
                            {/* Sidebar */}
                            <ProjectSidebar
                                project={this.props.project}
                                collaborators={this.props.project.collaborators}
                                tags={this.props.timeline}
                                actions={this.props.actions}
                                canEdit={canEdit}
                            />
                        </Grid.Column>
                        <Grid.Column stretched width="12">
                            {/* Canvas list */}
                            <Container>
                            <Card.Group itemsPerRow="3" stackable>

                                {/* New Canvas */}
                                { (this.props.project.tag || !canEdit) ? undefined :
                                    <NewCanvasCard canvastypes={canvastypes} actions={
                                        this.props.actions
                                    }/>
                                }

                                {/* Existing Canvases */}
                                {this.props.project.canvases.map((c, i) =>
                                    <CanvasCard
                                        key={i}
                                        canvas={c}
                                        project={this.props.project}
                                        delete={() => this.props.actions.deleteCanvas(c.id)}
                                        canEdit={canEdit}
                                        pdf={() => this.props.actions.loadPDF(c.id, c.title, new URLSearchParams(this.props.location.search).get('tag'))}
                                    />
                                )}
                            </Card.Group>
                            </Container>
                        </Grid.Column>
                    </Grid>
                </Segment>
                <Modal open={!!this.props.error} basic size="small">
                    <Header>{this.props.error && this.props.error.title}</Header>
                    <Modal.Content>
                        {this.props.error && this.props.error.message}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button
                            primary
                            content="OK"
                            onClick={() => this.props.actions.clearErrorMessage()}
                        />
                    </Modal.Actions>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.projectinfo,
});

const mapDispatchToProps = dispatch => ({
    actions: getActionCreators(dispatch, history),
});

const ReduxProjectSubview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ProjectSubview);

export default ReduxProjectSubview;
