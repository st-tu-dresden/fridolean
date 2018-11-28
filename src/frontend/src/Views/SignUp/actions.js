import { push } from 'react-router-redux';

import { 
    CHANGE_INPUT, 
    SIGNUP_START,
    SIGNUP_ERROR,
    SIGNUP_SUCCESS 
} from './constants';
import {fetchAPI} from '../../api';

/**
 * action creators
 */

// when the input changes
export function changeInput(event, data) {
    let field = data.name;
    let value = data.type === "checkbox" ? data.checked : data.value;
    return {
        type: CHANGE_INPUT,
        payload: {
            field,
            value
        }
    };
}

// when the form is submitted
export function processForm(event) {
    // prevent default action of submitting the form
    event.preventDefault();
    
    return (dispatch, getState) => {
        const {user} = getState().signup;
        dispatch({
            type: SIGNUP_START
        });
    

        const email = user.email;
        const password = user.password;
        const passwordRepeat = user.passwordRepeat;
        const termsAndConditions = user.termsAndConditions;

        return fetchAPI("POST", "/auth/signup", {
                body: {
                    email,
                    password,
                    passwordRepeat,
                    termsAndConditions
                }
            })
            .then((response) => {
            // console.log(response);
            if (response.status === 200) {
                // success
                dispatch({
                    type: SIGNUP_SUCCESS
                })

                // set a message
                response.json().then( (responseJson) => {
                    // localStorage.setItem("successMessage", responseJson.message);
                    // switch to sign-in page  
                    dispatch(push("/sign-in"));                 
                })

                // console.log("Form is valid");
            } else {
                // failure
                response.json().then( (responseJson) =>{
                    // console.log("Errors: ", responseJson.errors);
                    const errors = responseJson.errors ? responseJson.errors : {};
                    errors.summary = responseJson.message;
                    
                    dispatch({
                        type: SIGNUP_ERROR,
                        errors: errors
                    })
                })
            }
        })
        .catch((error) => {
            try{
                let responseJson=JSON.parse(error.text);
                // console.log("Errors: ", responseJson.errors);
                const errors = responseJson.errors ? responseJson.errors : {};
                errors.summary = responseJson.message;    
                dispatch({
                    type: SIGNUP_ERROR,
                    errors: errors
                })
            }catch(e){
                console.error("Could not dispatch error",e);
            }
            console.log("Fetch Error: ", error);
        })
    }
}
