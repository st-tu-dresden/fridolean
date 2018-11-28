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

sinon.stub(projectModel, 'findById');

describe('checkEditAccess', () => {
    projectModel.findById.yields(undefined, project1);
    mongoose.connection.readyState = 1;
    let dbManager = new DBManager(projectModel, mongoose.connection);

    it('should return an 403 when user is not a member of the project', () => {
        
        dbManager.checkEditAccess(project1._id, user3.userID, (statusObject => {
            expect(statusObject.status).toEqual(403);
        }))
    })

    it('should return 403 when user is a member but has only `READ` rights', () => {
        dbManager.checkEditAccess(project1._id, user2.userID, (statusObject => {
            expect(statusObject.status).toEqual(403);
        }))
    })

    it('should return 200 when user has `EDIT` rights', () => {
        dbManager.checkEditAccess(project1._id, user1.userID, (statusObject => {
            expect(statusObject.status).toEqual(200);
        }))
    })
        
})

describe('checkReadAccess', () => {
    projectModel.findById.yields(undefined, project1);
    mongoose.connection.readyState = 1;
    let dbManager = new DBManager(projectModel, mongoose.connection);

    it('should return an 403 when user is not a member of the project', () => {
        dbManager.checkReadAccess(project1._id, user3.userID, (statusObject => {
            expect(statusObject.status).toEqual(403);
        }))
    })

    it('should return an 200 when user has `READ`rights', () => {
        dbManager.checkReadAccess(project1._id, user2.userID, (statusObject => {
            expect(statusObject.status).toEqual(200);
        }))
    })
        
    it('should return an 200 when user has `EDIT`rights', () => {
        dbManager.checkReadAccess(project1._id, user1.userID, (statusObject => {
            expect(statusObject.status).toEqual(200);
        }))
    })
})