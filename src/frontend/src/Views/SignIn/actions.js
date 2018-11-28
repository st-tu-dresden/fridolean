import { push } from 'react-router-redux';

import Auth from '../../modules/Auth';
import {fetchAPI} from '../../api';

import { 
    CHANGE_SIGNIN_INPUT, 
    SIGNIN_START,
    SIGNIN_ERROR,
    SIGNIN_SUCCESS
} from './constants';


import { 
    ADD_CURRENT_USER_INFORMATION
} from '../../modules/user/constants';


/**
 * action creators
 */

// when the input changes
export function changeInput(event, data) {
    let field = data.name;
    let value = data.value;
    return {
        type: CHANGE_SIGNIN_INPUT,
        payload: {
            field,
            value
        }
    };
}

export function signInSuccess(response, dispatch) {
    // console.log(response);
    if (response.status === 200) {
        // success
        dispatch({
            type: SIGNIN_SUCCESS
        })

        response.json().then( (responseJson) => {
            // save the token                    
            Auth.authenticateUser(responseJson.token);
            // update authenticated status for header 
            // this.props.toggleAuthenticationStatus();

            // store user info in redux store
            dispatch({
                type: ADD_CURRENT_USER_INFORMATION,
                payload: responseJson.user
            })

            // redirect signed in user to protected page
            // NOTE: That page has to call `toggleAuthenticationStatus` for correct header update
            dispatch(push("/projects"));                 
        })

    } else {
        // failure
        response.json().then( (responseJson) =>{
            const errors = responseJson.errors ? responseJson.errors : {};
            errors.summary = responseJson.message;

            dispatch({
                type: SIGNIN_ERROR,
                errors: errors
            })
        })
    }
}

export function signInError(error, dispatch) {
    try{
        let responseJson=JSON.parse(error.text);
        // console.log("Errors: ", responseJson.errors);
        const errors = responseJson.errors ? responseJson.errors : {};
        errors.summary = responseJson.message;    
        dispatch({
            type: SIGNIN_ERROR,
            errors: errors
        })
    }catch(e){
        console.error("Could not dispatch error",e);
    }
    console.log("Fetch Error: ", error);
}

// when the form is submitted
export function processForm(event) {
    // prevent default action of submitting the form
    event.preventDefault();
    
    return (dispatch, getState) => {
        const {user} = getState().signin;
        dispatch({
            type: SIGNIN_START
        });
    
        const email = user.email;
        const password = user.password;

        fetchAPI("POST","/auth/signin", {
            headers: {
                "Authorization": undefined,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        }).then((response) => {signInSuccess(response, dispatch)})
            .catch((error) => {signInError(error, dispatch)});
    }
}
