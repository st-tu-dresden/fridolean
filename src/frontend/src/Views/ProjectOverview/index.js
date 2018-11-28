import React, {Component} from 'react';
import { connect} from 'react-redux';
import { Grid, Segment, Card, Container, Dimmer, Loader } from 'semantic-ui-react';

import ProjectTile from '../../Components/ProjectTile';
import CreateProjectTile from '../../Components/CreateProjectTile';

import { getActionCreators } from './actions';

class ProjectOverview extends Component {
    componentDidMount() {
        this.props.actions.loadProjects();
        this.props.toggleAuthenticationStatus();
    }
    render() {
        if (!this.props.projects) {
            return (
                <Dimmer active page>
                    <Loader/>
                </Dimmer>
            );
        }

        return (
            <div>
                <Segment style={{ minHeight: 600, padding: '9em 0em' }}>
                    <Grid columns="2" stackable stretched>
                        <Grid.Column stretched width="16">
                            {/* Canvas list */}
                            <Container>
                            <Card.Group itemsPerRow="4" stackable>
                                
                                {/* New Canvas */}
                                <CreateProjectTile
                                    createProject={this.props.actions.createProject}
                                />

                                {/* Existing Canvases */}
                                {
                                    this.props.projects.map((p, i) => (
                                        <ProjectTile key={i} {...p}/>
                                    ))
                                }
                                
                            </Card.Group>
                            </Container>
                        </Grid.Column>
                    </Grid>
                </Segment>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    ...state.projectoverview,
});

const mapDispatchToProps = dispatch => ({
    actions: getActionCreators(dispatch),
});

const ReduxProjectOverview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(ProjectOverview);

export default ReduxProjectOverview;
