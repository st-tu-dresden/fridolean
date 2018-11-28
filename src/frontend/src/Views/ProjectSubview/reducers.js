import { Actions } from './actions';

export const initStateProjectView = {
    projectId: null,
    project: null,
    timeline: null,
    error: null,
}

export function projectReducer(state=initStateProjectView, action) {
    switch(action.type) {
        case Actions.LOAD_PROJECT.type:
            return {
                ...state,
                project: action.project,
                timeline: action.timeline,
                projectId: action.project.id,
            };
        case Actions.CREATE_CANVAS.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    canvases: [
                        ...state.project.canvases,
                        {
                            id: action.canvasId,
                            title: action.title,
                            type: action.canvasType,
                            timestamp: action.timestamp, // TODO: Replace with real Date
                        }
                    ]
                }
            }
        case Actions.INVITE_COLLABORATOR.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    collaborators: [
                        ...state.project.collaborators,
                        {
                            name: action.email, // Replace with username if usernames are supported
                            email: action.email,
                            rights: action.rights,
                            accepted: true, // Replace with "false" if invitations are supported
                        }
                    ]
                }
            }
        case Actions.CLONE_TAG.type:
            return state;
        case Actions.CREATE_TAG.type:
            return {
                ...state,
                timeline: [
                    ...state.timeline,
                    // {
                    //     id: null,
                    //     title: null,
                    //     timestamp: null,
                    //     current: false,
                    //     isLoaded: false,
                    // }
                    {
                        ...action.tag,
                        current: false,  // Necessary state information - not needed in DB, not stored in DB
                        isLoaded: false, // Necessary state information - not needed in DB, not stored in DB
                    },
                ].sort((a, b) => {
                    // Sorts current workspace always to last element
                    if (a.current) {
                        return 1;
                    } else if (b.current) {
                        return -1;
                    } else {
                        return a.timestamp - b.timestamp;
                    }
                }).map(t => t.current ? {...t, timestamp: new Date().valueOf()} : t),
            }
        case Actions.DELETE_PROJECT.type:
            return initStateProjectView; // Whole loaded project deleted
        case Actions.DELETE_CANVAS.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    canvases: state.project.canvases.filter(c => c.id !== action.canvasId),
                }
            }
        case Actions.DELETE_COLLABORATOR.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    collaborators: state.project.collaborators.filter(c => c.email !== action.email),
                }
            }
        case Actions.DELETE_TAG.type:
            return {
                ...state,
                timeline: state.timeline.filter(t => t.id !== action.tagId),
            }
        case Actions.UPDATE_PROJECT.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    title: action.title,
                    description: action.description,
                    isPublic: action.isPublic,
                }
            }
        case Actions.UPDATE_COLLABORATOR.type:
            return {
                ...state,
                project: {
                    ...state.project,
                    collaborators: state.project.collaborators.map(c =>
                        c.email === action.email
                        ? { ...c, rights: action.rights }
                        : c),
                }
            }
        // Generic projectsubview management
        case Actions.SHOW_PROJECT_ERROR.type:
            return {
                ...state,
                error: {
                    title: action.title,
                    message: action.message,
                },
            }
        case Actions.CLEAR_PROJECT_ERROR.type:
            return {
                ...state,
                error: null,
            }
        case Actions.CLEAR_PROJECT.type:
            return initStateProjectView;
        default:
            return state;
    }
}