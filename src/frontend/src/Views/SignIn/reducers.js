import { 
    CHANGE_SIGNIN_INPUT, 
    SIGNIN_START,
    SIGNIN_SUCCESS, 
    SIGNIN_ERROR 
} from './constants';

const initialState ={
    errors: {},
    loading: false,    
    user: {
        email: '',
        password: ''
    }
}

function signinReducer(state=initialState, action) {
    switch (action.type) {    
        case CHANGE_SIGNIN_INPUT:
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
        case SIGNIN_START:
            return {
                ...state,
                loading: true
            }
            
        case SIGNIN_ERROR:
            return {
                ...state,
                errors: action.errors,
                loading: false
            }
            
        case SIGNIN_SUCCESS:
            return {
                ...state,
                errors: {},
                loading: false                
            }
            
        default:
            return state;
    }
}

export default signinReducer;