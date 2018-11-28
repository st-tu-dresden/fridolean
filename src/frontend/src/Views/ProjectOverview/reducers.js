import { Actions } from './actions';

const initStateProjectView = {
    projects: [],
}

export function overviewReducer(state=initStateProjectView, action) {
    switch(action.type) {
        case Actions.LOAD_PROJECTS.type:
            return {
                ...state,
                projects: action.projects,
            }
        case Actions.CREATE_PROJECT.type:
            return {
                ...state,
                projects: [
                    ...state.projects,
                    {
                        id: action.projectId,
                        title: action.title,
                        description: "",
                        timestamp: new Date(),
                    }
                ]
            }
        default:
            return state;
    }
}