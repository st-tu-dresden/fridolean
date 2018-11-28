import React, {Component} from 'react';
import { Input, Button, Divider, Card, Form } from 'semantic-ui-react';

import { verifyTitle } from '../../modules/ClientInput';

class CreateProjectTile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            inputError: false,
        }
    }
    onCreateProject() {
        let title = verifyTitle(this.titleText.inputRef.value);

        if (!title) {
            return this.setState({ inputError: true });
        }
        this.props.createProject(title);
    }
    render() {
        return (
            <Card fluid>
                <Card.Content>
                    <Card.Header>
                        + New Project
                    </Card.Header>
                    <Card.Description>
                        <Divider/>
                        <Form>
                            <Form.Field error={this.state.inputError}>
                                <Input label={{
                                    content: "Title",
                                    color: this.state.inputError ? "red" : undefined,
                                }} fluid ref={(x) => this.titleText = x}
                                onChange={(_, d) => this.setState({inputError: false})}/>
                            </Form.Field>
                            <Form.Field>
                                <Button
                                    floated="right"
                                    primary
                                    onClick={
                                        () => this.onCreateProject()
                                    }
                                >
                                    Add
                                </Button>
                            </Form.Field>
                        </Form>
                    </Card.Description>
                </Card.Content>
            </Card>
        );
    }
}

export default CreateProjectTile;