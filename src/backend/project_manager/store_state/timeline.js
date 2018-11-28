import {createReducerType, createReducerTypeMapping, ReducerError} from '../../common/reducers'

export const Actions = {
    RESTORE_STATE: 'RESTORE_STATE_FROM_TIMELINE_ENTRY',
    ADD_ENTRY: 'ADD_NEW_TIMELINE_ENTRY'
}

export function timelineReducer(state={}, action) {
    switch (action.type) {
        case Actions.ADD_ENTRY:
            return {timeline:
                [
                    ...state.timeline,
                    action.entry
                ]
            };
        case Actions.RESTORE_STATE:
            return action.state;
        default:
            return state;
    }
}

export const typedTimelineReducer = createReducerTypeMapping(
    timelineReducer,
    "",
    createReducerType(Actions.RESTORE_STATE, ""),
    createReducerType(Actions.ADD_ENTRY, "timeline")
);

export function timelineActions(dispatch) {
    return {
        restoreState: (state) => dispatch({
            type: Actions.RESTORE_STATE,
            state: state,
            changed: ""
        }),
        addEntry: (entry)=> dispatch({
            type: Actions.ADD_ENTRY,
            entry: entry
        })
    };
}