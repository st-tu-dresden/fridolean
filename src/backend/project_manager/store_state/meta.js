import {createReducerType, createReducerTypeMapping, ReducerError} from '../../common/reducers'

export const Actions = {
    ADD_MEMBER: 'ADD_PROJECT_MEMBER',
    UPDATE_MEMBER: 'UPDATE_PROJECT_MEMBER',
    DELETE_MEMBER: 'DELETE_PROJECT_MEMBER',
}

export function memberReducer(state={}, action) {
    switch (action.type) {
        case Actions.ADD_MEMBER:
        case Actions.UPDATE_MEMBER:
            return {
                ...state,
                [action.member._id]: {
                    userID: action.member._id,
                    email: action.member.email,
                    rights: action.rights,
                },
            };
        case Actions.DELETE_MEMBER:
            return {
                ...state,
                [action.member._id]: undefined,
            };
        default:
            return state;
    }
}

export const typedMemberReducer = createReducerTypeMapping(
    memberReducer,
    "persistent.members",
    createReducerType(Actions.ADD_MEMBER, (action)=>action.member._id),
    createReducerType(Actions.UPDATE_MEMBER, (action)=>action.member._id),
    createReducerType(Actions.DELETE_MEMBER, (action)=>action.member._id)
);

export function memberActions(dispatch) {
    return {
        addMember: (user, rights) => dispatch({
            type: Actions.ADD_MEMBER,
            member: user,
            rights: rights,
            changed: "members."+user._id
        }),
        updateMember: (user, rights) => dispatch({
            type: Actions.UPDATE_MEMBER,
            member: user,
            rights: rights,
            changed: "members."+user._id
        }),
        deleteMember: (user) => dispatch({
            type: Actions.DELETE_MEMBER,
            member: user,
            changed: "members."+user._id
        }),
    };
}