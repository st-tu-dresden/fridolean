import store from '../store';
import Auth from '../modules/Auth';
import {signInSuccess, signInError} from '../Views/SignIn/actions';
import {fetchAPI} from '../api';

const signIn = function() {
    const kc = window.kc;
    const token= kc.token;
    const token2 = kc.token;

    const dispatch = store.dispatch;

    if (Auth.isUserAuthenticated()) {
        return;
    }
    fetchAPI("POST","/auth/kc_signin", {
        headers: {
            "Authorization":undefined,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token,
            token2 
        })
    }).then((response) => {signInSuccess(response, dispatch)})
        .catch((error) => {signInError(error, dispatch)});
}

const callbacks = {
    "signIn": signIn,
    "logout": Auth.deauthenticateUser,
    "isLoggedIn": Auth.isUserAuthenticated,
};

export default callbacks;
