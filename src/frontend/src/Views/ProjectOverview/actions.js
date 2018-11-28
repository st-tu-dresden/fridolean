import * as OverviewAPI from './api';

const prefix = "//ProjectOverview/";

export const Actions = {
    // Requests: Actions indicating the start of some API-Call
    REQUEST_LOAD_PROJECTS:  { type: prefix + "REQUEST_LOAD_PROJECTS" },
    REQUEST_CREATE_PROJECT: { type: prefix + "REQUEST_CREATE_PROJECT" },

    // Generic error response
    API_ERROR: { type: prefix + "API_ERROR" },
    
    // Responses: Actions to update the store
    LOAD_PROJECTS:          { type: prefix + "RESPONSE_LOAD_PROJECTS" },
    CREATE_PROJECT:         { type: prefix + "RESPONSE_CREATE_PROJECT" },
}

// TODO: Find some representation that avoids repetition, but doesn't look this dumb
const simpleAsyncAPIDispatch = (dispatch, requestAction, apiCall, mapArgsToResponseAction) => (
    (...args) => {
        dispatch(requestAction);

        apiCall(...args)
            .catch(reason => {
                // TODO
                dispatch({ ...Actions.API_ERROR, err: reason });
                throw new Error();
            })
            .then((...response) => {
                console.log("response: ",response);
                dispatch(mapArgsToResponseAction(
                    ...args,
                    ...response
                ));
            });
    }
)

export const getActionCreators = (dispatch) => ({
    loadProjects: simpleAsyncAPIDispatch(dispatch,
        Actions.REQUEST_LOAD_PROJECTS,
        OverviewAPI.getProjects,
        (/*Response:*/ projects) => ({
            ...Actions.LOAD_PROJECTS,
            projects,
        })
    ),
    createProject: simpleAsyncAPIDispatch(dispatch,
        Actions.REQUEST_CREATE_PROJECT,
        OverviewAPI.createProject,
        (title, /*Response:*/ createdId) => ({
            ...Actions.CREATE_PROJECT,
            title: title,
            projectId: createdId,
        })
    ),
});