/**
 * @file Contains wrappers for API-Calls to manage the data needed in ProjectSubview
 * @author Nikolai Klüver
 */

 import {fetchAPI, setCurrentUser} from "../../api"
 import {getCanvasTypes, getCanvasInfo} from "../../common/model/canvas"
 
function verifyTitle(title) {
    return title.trim().length > 0;
}

export { setCurrentUser };

/**
 * @todo Replace with some global variant
 */
export let canvasTypes = getCanvasTypes().map(getCanvasInfo).map((info)=>({view: info.view, data: info.canvastype}));

export let projectRights = [
    'READ',
    'EDIT',
];


export let errors = {
    NO_PROJECT: "The project you're trying to access doesn't exist",
    NO_TAG:     "The timeline tag you're trying to access doesn't exist",
    UNAUTHORIZED: "You're not properly logged in. Please try to log in again.",
    NOT_ALLOWED: "Your account isn't allowed to do that",
}

// Stores last project that was successfully loaded using getProject().
// Maybe it binds the api calls too close to the project, but at least I don't need to call the store
let currentProjectId;

// Allows API calls with a specific projectId by temporarily setting it.
// This means that all API calls have to save their projectId at the beginning of the call
// This will probably never be needed, but I included it anyway,
// if someone ever gets the idea of allowing other files to use these API calls & needs to use
// different projectId's
export function withProjectId(projectId, handler) {
    let oldProjectId = currentProjectId;
    currentProjectId = projectId;

    let result = handler();

    currentProjectId = oldProjectId;
    return result;
}

/**
 * Returns Information about Project:
 * - ID
 * - Currently viewed Tag
 * - Title
 * - Description
 * - Public visibility
 * - Timestamp (last edited)
 * - Collaborators (all - also only invited ones)
 *   - Name
 *   - E-Mail
 *   - Rights
 *   - Accepted
 * - Canvases
 *   - ID
 *   - Title
 *   - Type
 *   - Timestamp (last edited)
 * 
 * @param {String} projectId - Information about this project will be returned
 * @returns {Promise}
 */
export function getProject(projectId, tag) {
    tag = tag || undefined;

    if (tag) {
        return fetchAPI('GET', `projects/${projectId}/timeline/${tag}`)
            .then(response => response.json())
            .then(async (jsonresp) => {
                let project = await getProject(projectId);
                project = {
                    ...project,
                    timestamp: jsonresp.stateInformation.timestamp,

                    canvases: jsonresp.content.canvases
                        .map(c => ({
                            id: c._id,
                            title: c.title,
                            type: canvasTypes.filter(t => t.data === c.canvasType)[0].view,
                            timestamp: c.lastEdited,
                        })),
                    
                    tag: tag,
                };
                return project;
            });
    }

    return fetchAPI("GET", `projects/${projectId}`)
        .then(response => response.json())
        .then(jproject => {
            console.log(">> GET Project: ", jproject);
            // Map to frontend structure
            let project = {
                id: projectId,
                title: jproject.title,
                description: jproject.description,
                isPublic: jproject.visibility.toLowerCase() === "public",
                timestamp: jproject.lastEdited,

                canvases: jproject.persistent.canvases
                    .map(c => ({
                        id: c._id,
                        title: c.title,
                        type: canvasTypes.filter(t => t.data === c.canvasType)[0].view,
                        timestamp: c.lastEdited,
                    })),
                collaborators: jproject.members
                    .map(m => ({
                        name: m.email,
                        email: m.email,
                        id: m.userID,
                        rights: m.rights,
                        accepted: true, // Not implemented in backend
                    })),
                
                tag: undefined,
            }
            currentProjectId = projectId;
            return project;
        });
}

/**
 * Returns Timeline-Overview as an Array of Tags.
 * Each Tag consists of:
 * - ID
 * - Title
 * - Timestamp (created)
 * - Is current State
 * - Is currently viewed State
 * 
 * @param {String} projectId - Timeline will be returned for this project
 * @returns {Promise}
 */
export function getTimeline(projectId, tag) {
    return fetchAPI('GET', `projects/${projectId}/timeline`)
        .then(response => response.json())
        .then(jsonresp => {
            // Map to frontend structure
            let timeline = [
                ...jsonresp.states.map(s => ({
                    id: s.id,
                    title: s.tag,
                    timestamp: s.timestamp,
                    current: false,
                    isLoaded: s.id === tag,
                })),
                {
                    id: "",
                    title: "Workspace",
                    timestamp: new Date().valueOf(),
                    current: true,
                    isLoaded: jsonresp.states.filter(s => s.id === tag).length === 0,
                },
            ];
            return timeline;
        });
}

/**
 * Deletes canvas with given ID
 * 
 * @param {String} canvasId - Canvas which should be deleted
 * @returns {Promise}
 */
export function deleteCanvas(canvasId) {
    let projectId = currentProjectId;
    return fetchAPI("DELETE", `projects/${projectId}/canvas/${canvasId}`);
}

/**
 * Deletes project with given ID
 * 
 * @param {String} projectId - Project which should be deleted 
 * @returns {Promise}
 */
export function deleteProject(projectId) {
    return fetchAPI("DELETE", `projects/${projectId}`);
}

/**
 * Creates canvas, and returns ID of new canvas
 * 
 * @param {String} title - Title of the new canvas
 * @param {String} canvasType - Type of the new canvas
 * @returns {Promise<String>}
 */
export function createCanvas(title, canvasType) {
    title = title.trim();
    let projectId = currentProjectId;

    if (!verifyTitle(title)) {
        return Promise.reject('Title not accepted.');
    }

    if (canvasTypes.filter(t => t.data === canvasType.toUpperCase()).length === 0) {
        return Promise.reject('Specified canvasType does not exist');
    }

    return fetchAPI("POST", `projects/${projectId}/canvas`, {
            body: {
                "title": title,
                "type": canvasType.toUpperCase(), // Full caps, without "CANVAS", no spaces - only "_"
            },
        })
        .then(response => response.json())
        .then(jsonresp => ({
            id: jsonresp._id,
            timestamp: jsonresp.lastEdited
        }));
}

/**
 * Sends invitation to user with given e-mail address
 * 
 * @param {String} email - E-Mail adress of user that will be invited
 * @returns {Promise}
 * 
 * @todo (Simple) e-mail verification
 */
export function inviteCollaborator(email, rights) {
    let projectId = currentProjectId;

    return fetchAPI("POST", `projects/${projectId}/collaborators`, {
            body: {
                "email": email,
                "rights": rights,
            }
        })
        .then((res) => {
            console.log('INVITING COLLABORATOR! HAHAHAHAHA');
            if (!res.ok) {
                throw new Error(res.statusText);
            }

            return {
                id: undefined, // TODO
                name: email,
                email,
                rights,
                accepted: true,
            }
        });
}

/**
 * Removes user with given e-mail address from collaborators
 * 
 * @param {String} email - E-Mail adress of user that will be removed
 * @returns {Promise}
 * 
 * @todo (Simple) e-mail verification
 */
export function deleteCollaborator(email) {
    let projectId = currentProjectId;

    return fetchAPI("DELETE", `projects/${projectId}/collaborators`,{body: JSON.stringify({email})});
}

/**
 * Updates rights of given collaborator
 * 
 * @param {String} email - E-Mail adress of user that will be changed
 * @param {String} rights - New rights of collaborator
 * @returns {Promise}
 * 
 * @todo (Simple) e-mail verification
 */
export function updateCollaborator(email, rights) {
    let projectId = currentProjectId;

    if (projectRights.indexOf(rights.toUpperCase()) < 0) {
        return Promise.reject('Specified rights are not defined');
    }

    return fetchAPI("PUT", `projects/${projectId}/collaborators`, {
            body: {
                "email": email,
                "rights": rights,
            },
        });
}

/**
 * Updates properties of given project
 * 
 * @param {String} projectId - ID of the project to update
 * @param {String} title - New title of the project, or null to use the old title
 * @param {String} description - New description of the project, or null to use the old description
 * @param {Boolean} isPublic - New visibility of the project, or null to use old visibility
 * @returns {Promise}
 * 
 * @todo Verify title
 */
export function updateProject(projectId, title, description, isPublic) {
    return fetchAPI("PUT", `projects/${projectId}`, {
            body: {
                "title": title,
                "description": description,
                "visibility": isPublic ? "PUBLIC" : "PRIVATE",
            }
        });
}

/**
 * Clones project state from given tag into a new private project with the user as the only collaborator
 * 
 * @param {String} tagId - ID of tag that will be cloned
 * @param {String} title - Title of new project that will be created
 * @param {String} description - Description of the new project that will be created
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo Verify title
 */
export function cloneTag(tagId, title, description) {
    let projectId = currentProjectId;

    return fetchAPI('POST', `projects/${projectId}/timeline/${tagId}/copy`, {
            body: {
                "title": title,
                "description": description,
                "visibility": "PRIVATE",
            }
        })
        .then(response => response.json())
        .then(jsonresp => jsonresp._id);
}

/**
 * Creates new tag in timeline, returns created tag
 * 
 * @param {String} title - Title of the new tag
 * @returns {Promise}
 */
export function createTag(title) {
    let projectId = currentProjectId;

    return fetchAPI('POST', `projects/${projectId}/timeline`, {
            body: {
                "tag": title.trim()
            },
        })
        .then(response => response.json())
        .then(jsonresp => {
            let newTag = {
                id: jsonresp._id,
                title: jsonresp.tag,
                timestamp: jsonresp.timestamp,
                current: false,
                isLoaded: false,
            };
            return newTag;
        });
}

/**
 * Restores current state from tag / Loads contents from tag into current state
 * 
 * @param {String} tagId - ID of tag to which current state will be restored
 */
export function restoreTag(tagId) {
    let projectId = currentProjectId;

    return fetchAPI('PUT', `projects/${projectId}/timeline/${tagId}/restore`);
}

/**
 * Deletes tag with given ID from timeline
 * 
 * @param {String} tagId - ID of tag that will be deleted
 * 
 * @todo Implementation
 */
export function deleteTag(tagId) {
    /* TODO */
    return Promise.reject({ status: 500, message: "Not implemented yet."});
}

export function loadPDF(canvasId,tag) {
    let projectId = currentProjectId;
    let search=`projects/${projectId}/canvas/${canvasId}/pdf`;
    if(tag)
        search+="?tag="+tag;
    return fetchAPI('GET', search)
        .then(response => response.json());
}
