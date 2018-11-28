// Add the current user to the store state (under store.user)
// it includes the current user id and email

import {
    ADD_CURRENT_USER_INFORMATION,
    DELETE_CURRENT_USER_INFORMATION
} from './constants';


export function addUserInformation(user) {
    return {
        type: ADD_CURRENT_USER_INFORMATION,
        payload: user
    };
}

export function deleteUserInformation() {
    return {
        type: DELETE_CURRENT_USER_INFORMATION
    };
}