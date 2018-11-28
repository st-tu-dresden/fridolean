import * as api from './api'

import fetchMock from 'fetch-mock'

import {apiLocation} from '../../api';

// https://stackoverflow.com/a/9035732
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function rejectDefault(error) {
    assert.fail(error);
    done();
}

describe('get project data async call', () => {
    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    })

    let projectId = "example_project_id";
    let tagId = "example_tag_id";
    
    let responseProjectData = {
        _id: projectId,
        title: "Example Title",
        visibility: "PRIVATE",
        description: "AASDLAJSSFLA asdfsadf",
        lastEdited: randomDate(new Date(0), new Date()).valueOf(),
        members: [
            { userID: "013245", email: "user245@web013.de", rights: "READ" },
            { userID: "013246", email: "user246@web013.de", rights: "READ" },
            { userID: "013247", email: "user247@web013.de", rights: "READ" },
        ],
        persistent: {
            canvases: [
                { _id: "2135345", title: "Canvas Title 2135345", canvasType: "BUSINESS_MODEL", lastEdited: randomDate(new Date(0), new Date()).valueOf() },
                { _id: "2135346", title: "Canvas Title 2135346", canvasType: "CUSTOMER_JOURNEY", lastEdited: randomDate(new Date(0), new Date()).valueOf() },
                { _id: "2135347", title: "Canvas Title 2135347", canvasType: "VALUE_PROPOSITION", lastEdited: randomDate(new Date(0), new Date()).valueOf() },
                { _id: "2135348", title: "Canvas Title 2135348", canvasType: "VALUE_PROPOSITION", lastEdited: randomDate(new Date(0), new Date()).valueOf() },
                { _id: "2135349", title: "Canvas Title 2135349", canvasType: "LEAN", lastEdited: randomDate(new Date(0), new Date()).valueOf() },
            ],
        },
    };

    let responseTaggedProjectData = {};
    let responseTimelineData = {};

    let resultData = {
        id: projectId,
        title: responseProjectData.title,
        description: responseProjectData.description,
        isPublic: responseProjectData.visibility.toLowerCase() === "public",
        timestamp: responseProjectData.lastEdited,

        canvases: responseProjectData.persistent.canvases
            .map(c => ({
                id: c._id,
                title: c.title,
                type: api.canvasTypes.filter(t => t.data === c.canvasType)[0].view,
                timestamp: c.lastEdited,
            })),
        collaborators: responseProjectData.members
            .map(m => ({
                name: m.email,
                email: m.email,
                id: m.userID,
                rights: m.rights,
                accepted: true, // Not implemented in backend
            })),
        
        tag: undefined,
    }
    
    it('should return project data when it requests the current project state & receives a valid response', (done) => {
        fetchMock.getOnce(`${apiLocation}/projects/${projectId}`, responseProjectData);

        api.getProject(projectId).then(res => {
            expect(res).toEqual(resultData);
            done();
        }, rejectDefault);
    })

    it('should return complete project data when it requests a specific tag', (done) => {
        fetchMock
            .getOnce(`${apiLocation}/projects/${projectId}/timeline/${tagId}`, {
                stateInformation: {
                    timestamp: 1234,
                },
                content: {
                    canvases: responseProjectData.persistent.canvases.filter((_, i) => i !== 0),
                }
            })
            .getOnce(`${apiLocation}/projects/${projectId}`, responseProjectData);
        
        api.getProject(projectId, tagId).then(res => {
            expect(res).toEqual({
                ...resultData,
                timestamp: 1234,
                canvases: resultData.canvases.filter((_, i) => i !== 0),
                tag: tagId,
            });
            done();
        }, rejectDefault);
    });
});