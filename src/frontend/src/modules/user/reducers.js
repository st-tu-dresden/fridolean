import {
    ADD_CURRENT_USER_INFORMATION,
    DELETE_CURRENT_USER_INFORMATION
} from './constants';

// empty initial state
const initialState = {};

export function userReducer(state=initialState, action) {
    switch (action.type) {    
        case ADD_CURRENT_USER_INFORMATION:
            return {
                ...state,
                ...action.payload
            }
        case DELETE_CURRENT_USER_INFORMATION:
            return {
                // reset current user information
                ...initialState
            }            
       default:
            return state;
    }
}

export default userReducer;