import React from 'react';
import {Segment, Container, Header } from 'semantic-ui-react';

const UserProfileForm = ({ user, errors, loading }) => (
    <Segment
    style={{ minHeight: 600, padding: '9em 0em' }}
    vertical
    >
        <Container text>
            <Header 
                as="h1"
                style={{ fontSize: '3.2em', fontWeight: 'normal', marginBottom: '0.3em', marginTop: '0.3em' }}
            >
                User Profile
            </Header>
            {loading && 
                <Header
                    as="h2">
                    Loading...
                </Header>
            }
            {errors.message === "" && 
                <Header
                    as="h2">
                    E-mail address: {user.email}
                </Header>
            }
            {errors.message !== "" && 
                <Header
                    as="h2">
                    Something went wrong...
                </Header>

            }
        </Container>
    </Segment>
);

export default UserProfileForm;