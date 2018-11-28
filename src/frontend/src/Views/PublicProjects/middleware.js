import { Actions } from './actions';

export const publicProjectsErrorAlert = store => next => action => {
    if (action && action.type && action.type === Actions.API_ERROR.type) {
        console.error("API Error:\n" + action.err);
        //alert("API Error:\n" + action.err);
    }

    return next(action);
}
