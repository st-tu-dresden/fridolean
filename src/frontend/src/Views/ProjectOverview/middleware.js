import { Actions } from './actions';
import { history } from '../../store';

export const projectOverviewNavigator = store => next => action => {
    if (!action.type) {
        return next(action);
    }

    switch (action.type) {
        case Actions.CREATE_PROJECT.type:
            history.push("/projects/" + action.projectId);
            break;
        default:
            break;
    }

    return next(action);
}

export const overviewErrorAlert = store => next => action => {
    if (action && action.type && action.type === Actions.API_ERROR.type) {
        console.error(action.err);
        //alert("API Error:\n" + action.err);
    }

    return next(action);
}
