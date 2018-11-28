import React from 'react';
import { Segment, Container, Grid, Header, List, Divider } from 'semantic-ui-react';

const Footer = () => (
    <div>

    <Segment
        inverted
        vertical
        style={{ padding: '5em 0em' }}>
    <Container textAlign="center">
    <Grid textAlign="center" columns={1} divided inverted stackable>
        <Grid.Row>
            <Grid.Column width={3}>
                <Header as='h4' inverted>FridoLean</Header>
                <p>
                    Change the world by using FridoLean
                </p>
            </Grid.Column>
        </Grid.Row>

        <Divider inverted section/>
        <Grid.Row>
            <List inverted divided horizontal link size="small">
                <List.Item>
                    <List.Content>
                        <List.Header>
                            <a href="#Contact">
                                Contact Us
                            </a>
                        </List.Header>
                    </List.Content>
                </List.Item>
                <List.Item>
                    <List.Content>
                        <List.Header>
                            <a href="#Terms">
                                Terms and Conditions
                            </a>
                        </List.Header>
                    </List.Content>
                </List.Item>
            </List>
        </Grid.Row>
    </Grid>
    </Container>
    </Segment>
    </div>
);

export default Footer;
