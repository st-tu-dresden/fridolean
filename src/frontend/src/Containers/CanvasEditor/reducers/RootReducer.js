import {EVENT_INIT} from '../../../common/event'
import {createReducerType,createReducerTypeMapping} from '../../../common/reducers';

/**
 * initReducer
 * @param {*} state - the complete cproject state
 * @param {*} action  - the triggered init action with its parameters
 */
export function initReducer(state,action){
    if(action.type===EVENT_INIT){
        return action.state;
    }
    return state;
}

/**
 * typedInitReducer
 * typed specification of initReducer - applies directly to the store
 */
export const typedInitReducer=createReducerTypeMapping(
    initReducer,
    "store",
    createReducerType(EVENT_INIT,""));