import * as SubviewAPI from './api';

import { GENERIC_ASSIGNMENT_ERROR } from '../../common/assignment';

const prefix = "//ProjectSubview/"

export const Actions = {
    
    // Requests: Actions indicating the start of some API-Call
    REQUEST_PROJECT:             { type: prefix + "REQ_PROJECT" },
    REQUEST_ADD_COLLABORATOR:    { type: prefix + "REQ_ADD_COLLAB" },
    REQUEST_CREATE_CANVAS:       { type: prefix + "REQ_CREATE_CANVAS" },
    REQUEST_DELETE_CANVAS:       { type: prefix + "REQ_DELETE_CANVAS" },
    REQUEST_DELETE_PROJECT:      { type: prefix + "REQ_DELETE_PROJECT" },
    REQUEST_DELETE_COLLABORATOR: { type: prefix + "REQ_DELETE_COLLAB" },
    REQUEST_UPDATE_PROJECT:      { type: prefix + "REQ_UPDATE_PROJECT" },
    REQUEST_UPDATE_COLLABORATOR: { type: prefix + "REQ_UPDATE_COLLAB" },
    REQUEST_CREATE_TAG:          { type: prefix + "REQ_CREATE_TAG" },
    REQUEST_CLONE_TAG:           { type: prefix + "REQ_CLONE_TAG" },
    REQUEST_DELETE_TAG:          { type: prefix + "REQ_DELETE_TAG" },
    REQUEST_RESTORE_TAG:         { type: prefix + "REQ_RESTORE_TAG" },
    REQUEST_LOAD_PDF:            { type: prefix + "REQ_LOAD_PDF" },

    // Generic error handling
    API_ERROR:           { type: prefix + "API_ERROR" },
    SHOW_PROJECT_ERROR:  { type: prefix + "PROJECT_ERROR_MSG" },
    CLEAR_PROJECT_ERROR: { type: prefix + "PROJECT_ERROR_CLR" },
    CLEAR_PROJECT:       { type: prefix + "PROJECT_CLEAR_ALL" },

    // Responses: Actions to update the store
    LOAD_PROJECT:        { type: prefix + "LOAD_PROJECT" },
    INVITE_COLLABORATOR: { type: prefix + "INVITE_COLLAB" },
    CREATE_CANVAS:       { type: prefix + "ADD_CANVAS" },
    DELETE_CANVAS:       { type: prefix + "DEL_CANVAS" },
    DELETE_PROJECT:      { type: prefix + "DEL_PROJECT" },
    DELETE_COLLABORATOR: { type: prefix + "DEL_COLLAB" },
    UPDATE_PROJECT:      { type: prefix + "UPDATE_PROJECT" },
    UPDATE_COLLABORATOR: { type: prefix + "UPDATE_COLLAB" },
    CREATE_TAG:          { type: prefix + "CREATE_TAG" },
    CLONE_TAG:           { type: prefix + "CLONE_TAG" },
    DELETE_TAG:          { type: prefix + "DEL_TAG" },
    RESTORE_TAG:         { type: prefix + "RESTORE_TAG" },
    LOAD_PDF:            { type: prefix + "LOAD_PDF" },
}

const simpleAPICallCreator = (dispatch, props) => (...args) => {
    dispatch(props.request);

    props.api(...args)
        .then(response => {
            dispatch(props.then(...args, response));
        })
        .catch(reason => {
            // TODO
            console.log(reason);
            if (props.error &&
                props.error[reason.response.status]) {
                
                let { error, code, handler } = props.error[reason.response.status](reason);
                dispatch({ ...Actions.API_ERROR, error, code, handler, args });
            } else {
                dispatch({ ...Actions.API_ERROR, error: reason, code: reason.response.status });
            }
        });
}

function showProjectError(dispatch, title, message) {
    dispatch({
        ...Actions.SHOW_PROJECT_ERROR,
        title,
        message,
    });
}

const genericAssignmentErrorHandler = (dispatch) => ({
    [GENERIC_ASSIGNMENT_ERROR]: (error) => ({
        error,
        code: 200,
        handler: () => showProjectError(dispatch,
            "Generic assignment error",
            `Please wait a few seconds and then try again.`),
    })
})

export const getActionCreators = (dispatch, history) => ({
    getProject: (projectId, tag) => {
        dispatch(Actions.REQUEST_PROJECT);

        SubviewAPI.getProject(projectId, tag)
            .then(async (project) => {
                try {
                    var timeline = await SubviewAPI.getTimeline(project.id, tag);

                    console.log("Project ready");
                    console.log(project, timeline);

                    dispatch({
                        ...Actions.LOAD_PROJECT,
                        project,
                        timeline,
                    });
                } catch(reason) {
                    // TODO
                    dispatch({ ...Actions.API_ERROR, error: reason, code: reason.response.status });
                }
            })
            .catch((reason) => {
                // TODO
                let code = reason.response.status;
                if (code === 400 || code === 403) {
                    code = 404;
                }
                dispatch({ ...Actions.API_ERROR, error: reason, code: code });
                // throw new Error("Error in API call");
            });
    },
    addCollaborator: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_ADD_COLLABORATOR,
        api: (email, rights) => SubviewAPI.inviteCollaborator(email, rights),
        then: (email, rights) => ({
            ...Actions.INVITE_COLLABORATOR,
            email,
            rights,
        }),
        error: {
            404: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error adding collaborator:",
                    `User ${email} doesn't exist`),
            }),
            400: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error adding collaborator:",
                    `User ${email} doesn't exist`),
            }),
            500: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error adding collaborator:",
                    `User ${email} is already part of Project`),
            }),
        },
    }),
    createCanvas: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_CREATE_CANVAS,
        api: (title, type) => SubviewAPI.createCanvas(title, type),
        then: (title, type, canvasData) => ({
            ...Actions.CREATE_CANVAS,
            canvasId: canvasData.id,
            title,
            canvasType: SubviewAPI.canvasTypes.filter(t => t.data.toLowerCase() === type)[0].view,
            timestamp: canvasData.timestamp,
        }),
    }),
    deleteCanvas: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_DELETE_CANVAS,
        api: (canvasId) => SubviewAPI.deleteCanvas(canvasId),
        then: (canvasId) => ({
            ...Actions.DELETE_CANVAS,
            canvasId,
        }),
        error: genericAssignmentErrorHandler(dispatch),
    }),
    deleteProject: simpleAPICallCreator(dispatch, {
        request: Actions.DELETE_PROJECT,
        api: (projectId) => SubviewAPI.deleteProject(projectId),
        then: () => Actions.DELETE_PROJECT,
    }),
    deleteCollaborator: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_DELETE_COLLABORATOR,
        api: (email) => SubviewAPI.deleteCollaborator(email),
        then: (email) => ({
            ...Actions.DELETE_COLLABORATOR,
            email,
        }),
        error: {
            404: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error deleting collaborator:",
                    `User ${email} doesn't exist`),
                // TODO: The implications of this could create MANY problems
            }),
            500: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error deleting collaborator:",
                    `User ${email} is not part of Project`),
            }),
        },
    }),
    updateCollaborator: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_UPDATE_COLLABORATOR,
        api: (email, rights) => SubviewAPI.updateCollaborator(email, rights),
        then: (email, rights) => ({
            ...Actions.UPDATE_COLLABORATOR,
            email,
            rights,
        }),
        error: {
            404: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error updating collaborator:",
                    `User ${email} doesn't exist`),
            }),
            500: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Error updating collaborator:",
                    `User ${email} is not part of Project`),
            }),
        },
    }),
    updateProject: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_UPDATE_PROJECT,
        api: (projectId, title, description, isPublic) => SubviewAPI.updateProject(projectId, title, description, isPublic),
        then: (_, title, description, isPublic) => ({
            ...Actions.UPDATE_PROJECT,
            title,
            description,
            isPublic,
        }),
    }),
    createTag: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_CREATE_TAG,
        api: (title) => SubviewAPI.createTag(title),
        then: (_, tag) => ({
            ...Actions.CREATE_TAG,
            tag,
        }),
    }),
    cloneTag: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_CLONE_TAG,
        api: (tagId, title, description) => SubviewAPI.cloneTag(tagId, title, description),
        then: (tagId, title, description, projectId) => ({
            ...Actions.CLONE_TAG,
            projectId,
            tagId,
            title,
            description,
        }),
        error: {
            401: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Please register to clone a project",
                    `Or simply log into your account.`),
            }),
        },
    }),
    deleteTag: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_DELETE_TAG,
        api: (tagId) => SubviewAPI.deleteTag(tagId),
        then: (tagId) => ({
            ...Actions.DELETE_TAG,
            tagId,
        }),
    }),
    restoreTag: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_RESTORE_TAG,
        api: (tagId) => SubviewAPI.restoreTag(tagId),
        then: (tagId) => ({
            ...Actions.RESTORE_TAG,
        }),
        error: {
            423: (error) => ({
                error,
                code: 200,
                handler: (email) => showProjectError(dispatch,
                    "Project is currently being edited",
                    `please wait a bit and then try again`),
            }),
        },
    }),
    loadPDF: simpleAPICallCreator(dispatch, {
        request: Actions.REQUEST_LOAD_PDF,
        api: (canvasId, canvasTitle, tag) => SubviewAPI.loadPDF(canvasId,tag),
        then: (_, canvasTitle, tag, res) => ({
            ...Actions.LOAD_PDF,
            pdf: res.pdf,
            title: canvasTitle,
        }),
    }),
    clearProject: () => dispatch(Actions.CLEAR_PROJECT),
    clearErrorMessage: () => dispatch(Actions.CLEAR_PROJECT_ERROR),
});
