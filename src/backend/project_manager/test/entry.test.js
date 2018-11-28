import {DBManager} from '../database';
import {projectModel} from '../models';
import sinon, { expectation } from 'sinon';
import mongoose, { Error } from 'mongoose'

const canvas1  = {
    "_id": "5a36f2bcdc354f210a613eed",
    "title": "MyProject",
    "lastEdited": 1513550524675,
    "canvasType": "BUSINESS_MODEL",
    "buildingBlocks": [
        {
            "title": "Key Partners",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613eee",
            "entries": []
        },
        {
            "title": "Key Activities",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613eef",
            "entries": []
        },
        {
            "title": "Key Resources",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef0",
            "entries": []
        },
        {
            "title": "Customer Relationships",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef1",
            "entries": []
        },
        {
            "title": "Channels",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef2",
            "entries": []
        },
        {
            "title": "Customer Segments",
            "buildingBlockType": "target",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef3",
            "entries": []
        },
        {
            "title": "Cost Structure",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef4",
            "entries": []
        },
        {
            "title": "Revenue Streams",
            "buildingBlockType": "data",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef5",
            "entries": []
        },
        {
            "title": "Value Propositions",
            "buildingBlockType": "link",
            "layoutEntry": {},
            "_id": "5a36f2bcdc354f210a613ef6",
            "entries": []
        }
    ]
}

const project1 = {
    "_id": "5a36f2addc354f210a613eec",
    "lastEdited": 1513550524680,
    "title": "MyProject",
    "visibility": "PUBLIC",
    "description": "loremIpsum",
    "persistent": {
        "canvases": [canvas1]
    },
    "timeline": [],
    "members": [
        {
            "userID": "5a3176bec799f5177642048d",
            "email": "peter@mail.com",
            "rights": "EDIT"
        }
    ]
}

const entry1 = {
    "_id": "5a36f342dc354f210a613ef7",
    "entryType": "plain",
    "content": {
        "title": "",
        "text": "",
        "reference": "",
        "target": ""
    }
}

sinon.stub(projectModel, 'findById');

describe('createEntry', () => {

    it('should return 404 when no project with the project id was found', () => {
        projectModel.findById.yields(undefined, null);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id, project1.persistent.canvases[0]._id, 'Key Partners', {type: 'plain'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return 404 when no canvas with the canvas id was found', () => {
        let canvasProject = Object.assign({}, project1);
        canvasProject.persistent.canvases.id = () => {
            return null
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id, 'aaaaaaaaaaaa', 'Key Partners', {type: 'plain'}, (statusObject, entry) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return 400 on invalid building block title', () => {
        let canvasProject = Object.assign({}, project1);
        canvasProject.persistent.canvases.id = () => {
            return canvas1
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id,  project1.persistent.canvases[0]._id, 'AnInvalidTitle', {type: 'plain'}, (statusObject, entry) => {
            expect(statusObject.status).toEqual(400);
        })
    })

    it('should return 400 whent title attribite (in data) is missing', () => {
        let canvasProject = Object.assign({}, project1);
        canvasProject.persistent.canvases.id = () => {
            return canvas1
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id,  project1.persistent.canvases[0]._id, 'Key Partners', {}, (statusObject, entry) => {
            expect(statusObject.status).toEqual(400);
        })
    })

    it('should return 400 on invalid type (in data)', () => {
        let canvasProject = Object.assign({}, project1);
        canvasProject.persistent.canvases.id = () => {
            return canvas1
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id,  project1.persistent.canvases[0]._id, 'Key Partners', {type: 'AnInvalidType'}, (statusObject, entry) => {
            expect(statusObject.status).toEqual(400);
        })
    })

    it('should return 200 and the correct entry when on creating a entry of type plain', () => {
        let hasBeen = {saved: false};

        let canvasProject = Object.assign({}, project1);
        canvasProject.persistent.canvases.id = () => {
            return canvas1;
        }
        canvasProject.save = () => {hasBeen.saved = true}

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createEntry(project1._id,  project1.persistent.canvases[0]._id, 'Key Partners', {type: 'plain'}, (statusObject, entry) => {
            expect(statusObject.status).toEqual(200);
            expect(hasBeen.saved).toEqual(true);
            expect(entry).toEqual(entry1);
        })
    })

    //Todo: Test on type link

})