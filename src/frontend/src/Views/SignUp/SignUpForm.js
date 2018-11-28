import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Segment, Container, Header, Form, Button, Divider, Message } from 'semantic-ui-react';

const SignUpForm = ({
    onSubmit,
    onChange,
    errors,
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
            Sign up
        </Header>

        <Form 
            size="large" 
            onSubmit={onSubmit} 
            error={errors.summary ? true : false}
            loading={loading}
        >

            <Message
                error
                header="Error"
                content={errors.summary}
            />

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

            <Form.Input
                name="passwordRepeat"
                fluid
                icon="lock"
                iconPosition="left"
                label={errors.passwordRepeat ? errors.passwordRepeat : "Repeat your password"} 
                placeholder="Password"
                type="password"
                onChange={onChange}
                error={errors.passwordRepeat ? true : false}  
                value={user.passwordRepeat}                              
            />

            <Form.Checkbox 
                name="termsAndConditions"                   
                label='I agree to the Terms and Conditions'
                type="checkbox" 
                onChange={onChange}                         
                error={errors.termsAndConditions ? true : false}
                checked={user.termsAndConditions}
            />

            <Button 
                type='submit'>
                Sign up
            </Button>

            <Divider />
            <p>
                Already have an account? <Link to="/sign-in">Sign in.</Link>
            </p>
        </Form>
    </Container>
</Segment>
);

SignUpForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired
};

export default SignUpForm;