import { projectReducer, initStateProjectView } from './reducers';
import { Actions } from './actions';

import { canvasTypes } from './api';

describe('project reducer', () => {
    // TODO
    let projectId = "233245anexampleID2353534";
    let tag = "example-Tag-ID_0";

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
        { id: "exampleID-0", title: "Example Canvas 1", type: canvasTypes[0].data, timestamp: Date.parse("2017-11-20").valueOf() },
        { id: "exampleID-1", title: "Example Canvas 2", type: canvasTypes[1].data, timestamp: Date.parse("2017-11-18").valueOf() },
        { id: "exampleID-2", title: "Example Canvas 3", type: canvasTypes[2].data, timestamp: Date.parse("2017-11-19").valueOf() },
        { id: "exampleID-3", title: "Example Canvas 4", type: canvasTypes[3].data, timestamp: Date.parse("2017-11-20").valueOf() },
    ];
    
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

    let tags = [
        { id: "example-Tag-ID_0", title: "v 0.1",             timestamp: Date.parse("2017-11-21").valueOf() },
        { id: "example-Tag-ID_1", title: "Some improvements", timestamp: Date.parse("2017-11-22").valueOf() },
        { id: "example-Tag-ID_2", title: "Final version",     timestamp: Date.parse("2017-11-23").valueOf() },
        { id: "example-Tag-ID_3", title: "Final version v2",  timestamp: Date.parse("2017-11-24").valueOf() },
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

    it('should return the initial state', () => {
        console.log(">> inti reducer", projectReducer(undefined, {}), initStateProjectView);
        expect(projectReducer(undefined, {})).toEqual(initStateProjectView);
    });

    it('should load the project into the state', () => {
        expect(projectReducer(initStateProjectView, {
            ...Actions.LOAD_PROJECT,
            project: project,
            timeline: timeline,
        })).toEqual({
            projectId: project.id,
            timeline: timeline,
            project: project,
            error: null,
        });
    });

    let loadedState = projectReducer(initStateProjectView, {
        ...Actions.LOAD_PROJECT,
        project: project,
        timeline: timeline,
    });

    let newCanvas = {
        id: "exampleID-123423",
        title: "Example Canvas sgfdsfg",
        type: canvasTypes[0].data,
        timestamp: Date.parse("2017-12-11").valueOf(),
    };

    it('should add a new canvas to the store', () => {
        expect(projectReducer(loadedState, {
            ...Actions.CREATE_CANVAS,
            canvasId: newCanvas.id,
            title: newCanvas.title,
            timestamp: newCanvas.timestamp,
            canvasType: newCanvas.type,
        })).toEqual({
            ...loadedState,
            project: {
                ...loadedState.project,
                canvases: [
                    ...loadedState.project.canvases,
                    newCanvas
                ]
            }
        })
    });

    let addedCanvasState = projectReducer(loadedState, {
        ...Actions.CREATE_CANVAS,
        canvasId: newCanvas.id,
        title: newCanvas.title,
        timestamp: newCanvas.timestamp,
        canvasType: newCanvas.type,
    });

    it('should delete a canvas from the store', () => {
        expect(projectReducer(addedCanvasState, {
            ...Actions.DELETE_CANVAS,
            canvasId: newCanvas.id,
        })).toEqual(loadedState);
    });

    let email = "test@mmail.de";

    it('should add a new collaborator to the project', () => {
        
        expect(projectReducer(loadedState, {
            ...Actions.INVITE_COLLABORATOR,
            email: email,
            rights: "READ",
        })).toEqual({
            ...loadedState,
            project: {
                ...loadedState.project,
                collaborators: [
                    ...loadedState.project.collaborators,
                    {
                        name: email,
                        email: email,
                        rights: "READ",
                        accepted: true,
                    }
                ]
            }
        });
    });

    let addedCollaboratorState = projectReducer(loadedState, {
        ...Actions.INVITE_COLLABORATOR,
        email: email,
        rights: "READ",
    });

    it('should change the rights of a collaborator', () => {
        expect(projectReducer(addedCollaboratorState, {
            ...Actions.UPDATE_COLLABORATOR,
            email: email,
            rights: "EDIT",
        })).toEqual({
            ...addedCollaboratorState,
            project: {
                ...addedCollaboratorState.project,
                collaborators: addedCollaboratorState.project.collaborators.map(c => ({
                    ...c,
                    rights: c.email !== email ? c.rights : "EDIT",
                })),
            },
        });
    });

    it('should remove a collaborator', () => {
        expect(projectReducer(addedCollaboratorState, {
            ...Actions.DELETE_COLLABORATOR,
            email: email,
        })).toEqual({
            ...addedCollaboratorState,
            project: {
                ...addedCollaboratorState.project,
                collaborators: addedCollaboratorState.project.collaborators.filter(c => c.email !== email),
            },
        });
    });

    it('should delete the project', () => {
        expect(projectReducer(loadedState, Actions.DELETE_PROJECT)).toEqual(initStateProjectView);
    });

    let newTag = {
        id: "234sdgfdsg252345",
        title: "Tagwejotre",
        timestamp: 8786,
    }

    // TODO: This won't simply work, because timestamp of "current state" is always reset
    // 
    // it('should add a timeline-entry/tag', () => {
    //     expect(projectReducer(loadedState, {
    //         ...Actions.CREATE_TAG,
    //         tag: newTag,
    //     })).toEqual({
    //         ...loadedState,
    //         timeline: [
    //             ...loadedState.timeline.filter(t => !t.current),
    //             {
    //                 ...newTag,
    //                 current: false,
    //                 isLoaded: false,
    //             },
    //             ...loadedState.timeline.filter(t => t.current)
    //         ]
    //     })
    // });

    it('should delete a timeline-entry', () => {
        expect(projectReducer(loadedState, {
            ...Actions.DELETE_TAG,
            tagId: loadedState.timeline[0].id,
        })).toEqual({
            ...loadedState,
            timeline: loadedState.timeline.filter(t => t.id !== loadedState.timeline[0].id),
        });
    });

    it('should change the meta-information of the project', () => {
        let newTitle = "ASOJADJASD";
        let newDesc = "weojktpwriowkrfüewjrpwq39ru329pro";
        let isPublic = true;

        expect(projectReducer(loadedState, {
            ...Actions.UPDATE_PROJECT,
            title: newTitle,
            description: newDesc,
            isPublic,
        })).toEqual({
            ...loadedState,
            project: {
                ...loadedState.project,
                title: newTitle,
                description: newDesc,
                isPublic: isPublic,
            }
        });
    })
});