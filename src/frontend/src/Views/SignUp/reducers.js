import { 
    CHANGE_INPUT, 
    SIGNUP_START,
    SIGNUP_SUCCESS, 
    SIGNUP_ERROR 
} from './constants';

export const initialState ={
    errors: {},
    loading: false,    
    user: {
        email: '',
        password: '',
        passwordRepeat: '',
        termsAndConditions: false
    }
}

export function signupReducer(state=initialState, action) {
    switch (action.type) {    
        case CHANGE_INPUT:
            let field =  action.payload.field;
            let value = action.payload.value;
            let userChanges = {
            }
            userChanges[field] = value;
            return {
                ...state,
                user: {
                    ...state.user,
                    ...userChanges
                }
            }
        case SIGNUP_START:
            return {
                ...state,
                loading: true
            }
            
        case SIGNUP_ERROR:
            return {
                ...state,
                errors: action.errors,
                loading: false
            }
            
        case SIGNUP_SUCCESS:
            return {
                ...state,
                errors: {},
                loading: false                
            }
            
        default:
            return state;
    }
}

export default signupReducer;
