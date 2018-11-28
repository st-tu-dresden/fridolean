/**
 * @file Contains wrappers for API-Calls to manage the data needed in ProjectSubview
 * @author Nikolai Klüver
 */

import uuidv1 from 'uuid/v1';

/**
 * @todo Replace with some global variant
 */
export let canvasTypes = [
    { view: "Business Model",    data: "BUSINESS_MODEL"},
    { view: "Lean",              data: "LEAN"},
    { view: "Value Proposition", data: "VALUE_PROPOSITION"},
    { view: "Customer Journey",  data: "CUSTOMER_JOURNEY"},
];


export let errors = {
    NO_PROJECT: "The project you're trying to access doesn't exist",
    NO_TAG:     "The timeline tag you're trying to access doesn't exist",
    UNAUTHORIZED: "You're not properly logged in. Please try to log in again.",
    NOT_ALLOWED: "Your account isn't allowed to do that",
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
 * 
 * @todo Implementation
 */
export function getProject(projectId, tag) {
    /*
    ----------------
    Possible errors:
    ----------------
    - User isn't logged in
    - User can't view project
    - Project dosn't exist
    - Tag doesn't exist
    */
    // TODO

    /*if (tag) {
        // TODO: Fetch from timeline state
    } else {
        // TODO: Fetch regular project
        return fetch('/api/v1/projects/' + projectId, {
            method: "GET",
        })
    }*/

    let collaborators = [
        { name: "Max Mustermann",        email: "max@muster.net",            rights: "READ", accepted: true  },
        { name: "John Doe",              email: "doe.john@doe.com",          rights: "EDIT", accepted: true  },
        { name: "Angela Merkel",         email: "angie_m@deutschland.de",    rights: "READ", accepted: true  },
        { name: "James Smith",           email: "js1987@google.com",         rights: "READ", accepted: false },
        { name: "Jakob Schmidt",         email: "js1987_2@google.com",       rights: "EDIT", accepted: false },
        { name: "Anonymous Spambot #00", email: "robert.meier+assfs@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #01", email: "robert.meier+iadsf@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #02", email: "robert.meier+ojsgm@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #03", email: "robert.meier+lasnm@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #04", email: "robert.meier+lonvw@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #05", email: "robert.meier+opjoa@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #06", email: "robert.meier+öaefc@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #07", email: "robert.meier+oaenr@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #08", email: "robert.meier+nefss@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #09", email: "robert.meier+qkwer@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #10", email: "robert.meier+dmlfs@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #11", email: "robert.meier+zacca@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #12", email: "robert.meier+ojseg@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #13", email: "robert.meier+awerf@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #14", email: "robert.meier+0kkes@web.de", rights: "READ", accepted: true  },
        { name: "Anonymous Spambot #15", email: "robert.meier+12324@web.de", rights: "READ", accepted: true  },
    ];

    let canvases = [
        { id: "exampleID-0", title: "Example Canvas 1", type: canvasTypes[0], timestamp: Date.parse("2017-11-20") },
        { id: "exampleID-1", title: "Example Canvas 2", type: canvasTypes[1], timestamp: Date.parse("2017-11-18") },
        { id: "exampleID-2", title: "Example Canvas 3", type: canvasTypes[2], timestamp: Date.parse("2017-11-19") },
        { id: "exampleID-3", title: "Example Canvas 4", type: canvasTypes[3], timestamp: Date.parse("2017-11-20") },
    ];

    if (tag) {
        let id = tag.split('').filter(c => '0123456789'.indexOf(c) >= 0)[0];
        canvases = canvases.filter((_, i) => i <= id);
    }
    
    let project = {
        id: projectId,
        tag: tag,
        title: "Example Project",
        description: "A simple static project that serves as example data while building the UI",
        isPublic: true,
        timestamp: new Date().valueOf(),

        collaborators,
        canvases,
    };

    return Promise.resolve(project);
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
 * 
 * @todo Implementation
 */
export function getTimeline(projectId, tag) {
    // TODO

    let tags = [
        { id: "example-Tag-ID_0", title: "v 0.1",             timestamp: Date.parse("2017-11-21") },
        { id: "example-Tag-ID_1", title: "Some improvements", timestamp: Date.parse("2017-11-22") },
        { id: "example-Tag-ID_2", title: "Final version",     timestamp: Date.parse("2017-11-23") },
        { id: "example-Tag-ID_3", title: "Final version v2",  timestamp: Date.parse("2017-11-24") },
    ];

    let timeline = [
        ...tags.map(t => ({
            ...t,
            current: false,
            isLoaded: tag === t.id,
        })),
        {
            id: "",
            title: "Workspace",
            timestamp: new Date().valueOf(),
            current: true,
            isLoaded: tags.filter(t => tag === t.id).length === 0,
        },
    ];

    return Promise.resolve(timeline);
}

/**
 * Deletes canvas with given ID
 * 
 * @param {String} canvasId - Canvas which should be deleted
 * @returns {Promise}
 * 
 * @todo Implementation
 */
export function deleteCanvas(canvasId) { /* TODO */ return Promise.resolve(); }

/**
 * Deletes project with given ID
 * 
 * @param {String} projectId - Project which should be deleted 
 * @returns {Promise}
 * 
 * @todo Implementation
 */
export function deleteProject(projectId) { /* TODO */ return Promise.resolve(); }

/**
 * Creates canvas, and returns ID of new canvas
 * 
 * @param {String} title - Title of the new canvas
 * @param {String} canvasType - Type of the new canvas
 * @returns {Promise<String>}
 * 
 * @todo Implementation
 * @todo Verify title
 * @todo Verify canvasType
 */
export function createCanvas(title, canvasType) {
    // TODO

    return Promise.resolve(uuidv1());
}

/**
 * Sends invitation to user with given e-mail address
 * 
 * @param {String} email - E-Mail adress of user that will be invited
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo (Simple) e-mail verification
 */
export function inviteCollaborator(email, rights) {
    /* TODO */
    return Promise.resolve({
        name: email,
        email,
        rights,
        accepted: true,
    });
}

/**
 * Removes user with given e-mail address from collaborators
 * 
 * @param {String} email - E-Mail adress of user that will be removed
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo (Simple) e-mail verification
 */
export function deleteCollaborator(email) { /* TODO */ return Promise.resolve(); }

/**
 * Updates rights of given collaborator
 * 
 * @param {String} email - E-Mail adress of user that will be changed
 * @param {String} rights - New rights of collaborator
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo (Simple) e-mail verification
 * @todo Verify rights
 */
export function updateCollaborator(email, rights) { /* TODO */ return Promise.resolve(); }

/**
 * Updates properties of given project
 * 
 * @param {String} projectId - ID of the project to update
 * @param {String} title - New title of the project, or null to use the old title
 * @param {String} description - New description of the project, or null to use the old description
 * @param {Boolean} isPublic - New visibility of the project, or null to use old visibility
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo Verify title
 * @todo Verify description
 * @todo Verify visibility
 */
export function updateProject(projectId, title, description, isPublic) { /* TODO */ return Promise.resolve(); }

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
 * @todo Verify description
 */
export function cloneTag(tagId, title, description) {
    /* TODO */
    return Promise.resolve(uuidv1());
}

/**
 * Creates new tag in timeline, returns created tag
 * 
 * @param {String} title - Title of the new tag
 * @returns {Promise}
 * 
 * @todo Implementation
 * @todo Verify title
 */
export function createTag(title) {
    /* TODO */
    return Promise.resolve({
        id: uuidv1(),
        title: title,
        timestamp: new Date().valueOf(),
        current: false,
        isLoaded: false,
    });
}

/**
 * Deletes tag with given ID from timeline
 * 
 * @param {String} tagId - ID of tag that will be deleted
 */
export function deleteTag(tagId) { /* TODO */ return Promise.resolve(); }
