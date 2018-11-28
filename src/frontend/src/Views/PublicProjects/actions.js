import * as PublicProjectsViewAPI from './api';

const prefix = "//PublicProjectsView/";

export const Actions = {
    // Requests: Actions indicating the start of some API-Call
    REQUEST_LOAD_PROJECTS:  { type: prefix + "REQUEST_LOAD_PROJECTS" },

    // Generic error response
    API_ERROR: { type: prefix + "API_ERROR" },
    
    // Responses: Actions to update the store
    LOAD_PROJECTS:          { type: prefix + "RESPONSE_LOAD_PROJECTS" },
}

const simpleAsyncAPIDispatch = (dispatch, requestAction, apiCall, mapArgsToResponseAction, argMapper=(args)=>args) => (
    (...args) => {
        dispatch(requestAction);
        args=argMapper(args);
        apiCall(...args)
            .catch(reason => {
                // TODO
                dispatch({ ...Actions.API_ERROR, err: reason });
                throw new Error("Unhandled API-Error: "+JSON.stringify(reason));
            })
            .then((...response) => {
                dispatch(mapArgsToResponseAction(
                    ...response
                ));
            });
    }
)

export const getActionCreators = (dispatch) => ({
    loadProjects: simpleAsyncAPIDispatch(dispatch,
        Actions.REQUEST_LOAD_PROJECTS,
        PublicProjectsViewAPI.getProjects,
        (/*Response:*/ projects) => ({
            ...Actions.LOAD_PROJECTS,
            projects,
        })
    )
});