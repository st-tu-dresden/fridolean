import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Segment, Card, Container, Dimmer, Loader, Input, Header } from 'semantic-ui-react';
import * as globalStore from '../../store';
import { withRouter } from 'react-router-dom'
import { Provider } from 'react-redux';

import ProjectTile from '../../Components/ProjectTile';

import { getActionCreators } from './actions';

class PublicProjectsComponent extends Component {
    componentDidMount() {
        if(this.props.toggleAuthenticationStatus) this.props.toggleAuthenticationStatus();
        this.props.actions.loadProjects();
    }
    render() {
        if (!this.props.projects) {
            return (
                <Dimmer active page>
                    <Loader />
                </Dimmer>
            );
        }

        return (
            <Container>
                <Grid stretched stackable style={{ marginTop: 64 }}>
                    <Grid.Row>
                        <Grid.Column>
                            <Header size="large">Public Projects</Header>
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column>
                            <Input
                                type="text"
                                name="search"
                                placeholder="Search..."
                                icon="search"
                                onChange={(e) => {
                                    this.props.actions.loadProjects(e.target.value);
                                }}
                                fluid
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row columns={1}>
                        <Grid.Column>
                            <Segment style={{ minHeight: 600, padding: '2em 0em' }} basic>

                                {/* Canvas list */}

                                <Card.Group itemsPerRow="4" stackable>
                                    {/* Existing Canvases */}
                                    {
                                        this.props.projects.map((p, i) => (
                                            <ProjectTile key={i} {...p} />
                                        ))
                                    }

                                </Card.Group>
                            </Segment>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
            </Container>
        );
    }
}

const mapStateToProps = state => ({
    ...state.publicprojects,
});

const mapDispatchToProps = dispatch => ({
    actions: getActionCreators(dispatch),
});

export const ReduxPublicProjectsComponent = connect(
    mapStateToProps,
    mapDispatchToProps,
)(PublicProjectsComponent);

export class PublicProjectsView extends Component {
    render() {
        return (<Provider store={globalStore.default}>
            <ReduxPublicProjectsComponent>
            </ReduxPublicProjectsComponent>
        </Provider>);
    }
}

export default withRouter(PublicProjectsView);
