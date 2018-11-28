import { connect } from 'react-redux';

import SignUpForm from './SignUpForm';
import { changeInput, processForm } from './actions';

const mapStateToProps = state => {
    return {
        errors: state.signup.errors,
        loading: state.signup.loading,
        user: state.signup.user
    }
}

// TODO: change how to pass user in onSubmit
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

const SignUp = connect(
    mapStateToProps,
    mapDispatchToProps
)(SignUpForm);


export default SignUp;