import {
    REQUEST_USER_PROFILE_START,
    REQUEST_USER_PROFILE_SUCCESS,
    REQUEST_USER_PROFILE_ERROR
} from './constants';

const initialState = {
    user: {},
    errors: {
        message: ""
    },
    loading: false
}

function userProfileReducer(state=initialState, action) {
    switch (action.type) {
        case REQUEST_USER_PROFILE_START:
            return {
                ...state,
                loading: true
            };
        case REQUEST_USER_PROFILE_SUCCESS:
            return {
                ...state,
                loading: false,
                user: {
                    email: action.payload.email
                }
            };
        case REQUEST_USER_PROFILE_ERROR:
            return {
                ...state,
                errors: action.payload
            };
        default:
            return state;
    }
}

export default userProfileReducer;