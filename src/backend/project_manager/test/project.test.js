import {DBManager} from '../database';
import {projectModel} from '../models';
import sinon, { expectation } from 'sinon';
import mongoose, { Error } from 'mongoose'


const user1 = {
    "userID": "5a3176bec799f5177642048d",
    "email": "user1@mail.com",
    "rights": "EDIT"
};
const user2 = {
    "userID": "5a344e2785be7d0d2e21382f",
    "email": "user2@mail.com",
    "rights": "READ"
};
const user3 = {
    "userID": "5a344e3785be7d0d2e213830",
    "email": "user3@mail.com",
    "rights": "EDIT"
}

const project1 = {
    "lastEdited": 1513377183124,
    "title": "MyProject",
    "visibility": "PRIVATE",
    "description": "loremIpsumDolor",
    "persistent": {
        "canvases": []
    },
    "_id": "5a344d9f85be7d0d2e21382e",
    "timeline": [],
    "members": [user1,user2],
};

const project2 = {
    "lastEdited": 1513377183124,
    "title": "MyProject",
    "visibility": "PRIVATE",
    "description": "loremIpsumDolor",
    "persistent": {
        "canvases": []
    },
    "_id": "5a344d9f85be7d0d2e21382e",
    "timeline": [],
    "members": [user1,user2],
    "save": (callback) => {
        callback(undefined, project1); // Todo!
    }
}

const dataWrongVisibility = {title:'myProject', description: '...', visibility: 'RandomVisType...'};

sinon.stub(projectModel, 'findById');

describe('readProject', () => {
    it('should return an 404 when no project with the project id was found', () => {
        projectModel.findById.yields(undefined, null);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.readProject(project1._id, (statusObject, project) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return an 200 and the correct project model when a project with (_id == projectID) was found', () => {
        projectModel.findById.yields(undefined, project1);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.readProject(project1._id, (statusObject, project) => {
            expect(statusObject.status).toEqual(200);
            expect(project).toEqual(project1);
        })
    })
})

describe('createProject', () => {
    it('should return an 400 when the visibility-type is invalid', () => {
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createProject(user1.userID, user2.email, dataWrongVisibility, (statusObject, project) => {
            expect(statusObject.status).toEqual(400);
        })
    } )
})

describe('updateProject', () => {
    it('should return an 400 when the visibility-type is invalid', () => {
        projectModel.findById.yields(undefined, project2);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.updateProject(project1._id, dataWrongVisibility, (statusObject, project) => {
            expect(statusObject.status).toEqual(400);
        })
    } )
})