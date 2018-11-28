import { connect } from 'react-redux';

import SignInForm from './SignInForm';

import { changeInput, processForm } from './actions';


const mapStateToProps = state => {
    return {
        errors: state.signin.errors,
        loading: state.signin.loading,
        user: state.signin.user
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: (event, data) => {
            dispatch(changeInput(event, data));
        },
        onSubmit: (event) => {
            dispatch(processForm(event));
        }
    }
}

const SignIn = connect(
    mapStateToProps,
    mapDispatchToProps
)(SignInForm);



export default SignIn;
