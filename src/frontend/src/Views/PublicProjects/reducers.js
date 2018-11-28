import { Actions } from './actions';

const initStatePublicProjectsView = {
    projects: [],
}

export function publicProjectReducer(state=initStatePublicProjectsView, action) {
    switch(action.type) {
        case Actions.LOAD_PROJECTS.type:
            return {
                ...state,
                projects: action.projects,
            }
        default:
            return state;
    }
}