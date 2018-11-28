import React from 'react';
import { Container, Segment, Header, Button, Icon } from 'semantic-ui-react';
import {Link} from 'react-router-dom';

const NotFound = () => (
    <div>
        <Segment
            textAlign="center"
            style={{ minHeight: 600, padding: '5em 0em' }}
            vertical
        >   
            <Container text>
                <Header
                    as="h1"
                    content="Sorry, couldn't find this page."
                    style={{ fontSize: '3.2em', fontWeight: 'normal', marginBottom: 0, marginTop: '3em' }}
                />
                <Header
                    as='h2'
                    content='404'
                    style={{ fontSize: '1.7em', fontWeight: 'normal' }}
                />
                <Link to="/">
                    <Button basic color="teal" size='huge'>
                        <Icon name='home' /> go to home
                    </Button>
                </Link>
            </Container>
        </Segment>
    </div>
);

export default NotFound;