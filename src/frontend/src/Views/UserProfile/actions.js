import Auth from '../../modules/Auth';
import {
    REQUEST_USER_PROFILE_START,
    REQUEST_USER_PROFILE_SUCCESS,
    REQUEST_USER_PROFILE_ERROR
} from './constants';
import {fetchAPI, setCurrentUser} from '../../api';

function requestUserStart() {
    return {
        type: REQUEST_USER_PROFILE_START
    }
}


function receiveUser(userData) {
    return {
        type: REQUEST_USER_PROFILE_SUCCESS,
        payload: userData
    }
}

function receiveUserError(errors) {
    return {
        type: REQUEST_USER_PROFILE_ERROR,
        payload: errors,
        loading: false
    }
}


export function fetchUser() {
    return (dispatch, getState) => {
        dispatch(requestUserStart());
        setCurrentUser(Auth.getToken());

        // get our user id from redux user state
        return fetchAPI('GET', 'users/' + getState().user.id)
          .then(response => {
              if (response.status === 200) {
                response.json().then(responseJson => {
                    dispatch(receiveUser(responseJson));                    
                })
              } else {
                  dispatch(receiveUserError({message: "something went wrong"}));
              }
            })
          .catch( (error) => {
              console.log(error);
          });
    }
}