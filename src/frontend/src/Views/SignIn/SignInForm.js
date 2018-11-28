import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Segment, Container, Header, Form, Button, Divider, Message } from 'semantic-ui-react';

const SignInForm = ({
    onSubmit,
    onChange,
    errors,
    success,
    user,
    loading
}) => (
<Segment
    style={{ minHeight: 600, padding: '9em 0em' }}
    vertical
>
    <Container text>
        <Header 
            as="h1"
            style={{ fontSize: '3.2em', fontWeight: 'normal', marginBottom: '0.3em', marginTop: '0.3em' }}
        >
            Sign in
        </Header>

        <Form 
            size="large" 
            onSubmit={onSubmit} 
            error={errors.summary ? true : false}
            loading={loading}
            //success={success.message ? true: false}
        >

            <Message
                error
                header="Error"
                content={errors.summary}
            />

            {/* <Message
                success
                header="Success"
                content={success.message}
            />  */}

            <Form.Input
                name="email" 
                fluid
                icon="user"
                iconPosition="left"
                label={errors.email ? errors.email : "E-mail address"} 
                placeholder={"E-mail address"}
                type="email"
                onChange={onChange}
                error={errors.email ? true : false}      
                value={user.email}
            />

            <Form.Input
                name="password"
                fluid
                icon="lock"
                iconPosition="left"
                label={errors.password ? errors.password : "Password"} 
                placeholder="Password"
                type="password"
                onChange={onChange}
                error={errors.password ? true : false}  
                value={user.password}                              
            />

            <Button 
                type='submit'>
                Sign in
            </Button>

            <Divider />
            <p>
                Don't have an account? <Link to="/sign-up">Sign up.</Link>
            </p>
        </Form>
    </Container>
</Segment>
);

SignInForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

export default SignInForm;
