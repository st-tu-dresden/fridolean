import React from 'react';
import Auth from '../modules/Auth';


import { 
    DELETE_CURRENT_USER_INFORMATION 
} from '../modules/user/constants'

import store from '../store';

class LogoutFunction extends React.Component {

    componentDidMount() {
        // deauthenticate user
        Auth.deauthenticateUser();
        console.log("logging out");

        // remove user info from redux store
        store.dispatch({
            type: DELETE_CURRENT_USER_INFORMATION
        })

        // change url to / after logout
        this.props.history.push("/");

        window.kc.logout();
    }

    render() {
        return(
            <div>
                <h3 style={{paddingTop: "200px"}}>Logging out...</h3>
            </div>
        )
    }
}

export default LogoutFunction;
