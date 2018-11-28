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

const canvases = [
    [
        {title: 'Key Partners', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Key Activities', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Key Resources', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Customer Relationships', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Channels', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Customer Segments', buildingBlockType: 'target', layoutEntry:{}, entries:[]},
        {title: 'Cost Structure', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Revenue Streams', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Value Propositions', buildingBlockType: 'link', layoutEntry:{}, entries:[]}
    ],
    [
        {title: 'Products & Services', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Gain Creators', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Pain Relievers', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Gains', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Pains', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Customer Job(s)', buildingBlockType: 'data', layoutEntry:{}, entries:[]}
    ],
    [
        {title: 'Problem', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Solution', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Key Metrics', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Unique Value Proposition', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Unfair Advantage', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Channels', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Customer Segment', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Cost Structure', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Revenue Streams', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
    ],
    [
        {title: 'Advertisement', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: '(Pre-) Social Media', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: '(Pre-) Word-of-Mouth', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Past Experiences', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Expactations', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Service Journey', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Experiences', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: 'Relationship Management', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: '(Post-) Social Media', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: '(Post-) Word-of-Mouth', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
        {title: '(Dis)Satisfaction', buildingBlockType: 'data', layoutEntry:{}, entries:[]},
    ]
]

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

const projectsWithCanvas = canvases.map( (buildingBlocks) => { 
    return {
        "lastEdited": 1513377183124,
        "title": "MyProject",
        "visibility": "PRIVATE",
        "description": "loremIpsum",
        "persistent": {
            "canvases": buildingBlocks
        },
        "_id": "5a344d9f85be7d0d2e21382e",
        "timeline": [],
        "members": [user1,user2],
    }; 
})

const projectsWithoutCanvas = projectsWithCanvas.map( (project) => { 
    return {
        "lastEdited": 1513377183124,
        "title": "MyProject",
        "visibility": "PRIVATE",
        "description": "loremIpsum",
        "persistent": {
            "canvases": []
        },
        "_id": "5a344d9f85be7d0d2e21382e",
        "timeline": [],
        "members": [user1,user2],
        "save": (callback) => {
            callback(undefined, project);
        }
    }; 
})

const project2 = {
    "_id": "5a353afbb11a371c416e2a51",
    "lastEdited": 1513437973326,
    "title": "MyProject",
    "visibility": "PRIVATE",
    "description": "loremIpsum",
    "persistent": {
        "canvases": [
            {
                "_id": "5a353b15b11a371c416e2a52",
                "title": "MyProject",
                "lastEdited": 1513437973320,
                "canvasType": "BUSINESS_MODEL",
                "buildingBlocks": [
                    {
                        "title": "Key Partners",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a5b",
                        "entries": []
                    },
                    {
                        "title": "Key Activities",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a5a",
                        "entries": []
                    },
                    {
                        "title": "Key Resources",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a59",
                        "entries": []
                    },
                    {
                        "title": "Customer Relationships",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a58",
                        "entries": []
                    },
                    {
                        "title": "Channels",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a57",
                        "entries": []
                    },
                    {
                        "title": "Customer Segments",
                        "buildingBlockType": "target",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a56",
                        "entries": []
                    },
                    {
                        "title": "Cost Structure",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a55",
                        "entries": []
                    },
                    {
                        "title": "Revenue Streams",
                        "buildingBlockType": "data",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a54",
                        "entries": []
                    },
                    {
                        "title": "Value Propositions",
                        "buildingBlockType": "link",
                        "layoutEntry": {},
                        "_id": "5a353b15b11a371c416e2a53",
                        "entries": []
                    }
                ]
            }
        ]
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

sinon.stub(projectModel, 'findById');

describe('createCanvas', () => {
    it('should return 200 and the correct object when a BusinessModelCanvas is created', () => {
        projectModel.findById.yields(undefined, projectsWithoutCanvas[0]);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(projectsWithoutCanvas[0]._id, {title: 'MyCanvas', type: 'BUSINESS_MODEL'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(200);
            expect(canvas).toEqual(projectsWithoutCanvas[0].persistent.canvases[0]);
        })
    })

    it('should return 200 and the correct object when a ValuePropositionCanvas is created', () => {
        projectModel.findById.yields(undefined, projectsWithoutCanvas[1]);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(projectsWithoutCanvas[1]._id, {title: 'MyCanvas', type: 'VALUE_PROPOSITION'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(200);
            expect(canvas).toEqual(projectsWithoutCanvas[1].persistent.canvases[0]);
        })
    })

    it('should return 200 and the correct object when a LeanCanvas is created', () => {
        projectModel.findById.yields(undefined, projectsWithoutCanvas[2]);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(projectsWithoutCanvas[2]._id, {title: 'MyCanvas', type: 'LEAN'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(200);
            expect(canvas).toEqual(projectsWithoutCanvas[2].persistent.canvases[0]);
        })
    })

    it('should return 200 and the correct object when a CustomerJourney is created', () => {
        projectModel.findById.yields(undefined, projectsWithoutCanvas[3]);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(projectsWithoutCanvas[3]._id, {title: 'MyCanvas', type: 'CUSTOMER_JOURNEY'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(200);
            expect(canvas).toEqual(projectsWithoutCanvas[3].persistent.canvases[0]);
        })
    })

    it('should return an 404 when no project with the project id was found', () => {
        projectModel.findById.yields(undefined, null);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(project1._id, {title: 'MyCanvas', type: 'CUSTOMER_JOURNEY'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return an 400 when `type` is no valid canvas type', () => {
        projectModel.findById.yields(undefined, project1);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.createCanvas(project1._id, {title: 'MyCanvas', type: 'ARandomCanvasType'}, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(400);
        })
    })

})

describe('readCanvas', () => {
    it('should return an 404 when no project with the project id was found', () => {
        projectModel.findById.yields(undefined, null);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.readCanvas(project2._id, project2.persistent.canvases[0]._id, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return an 404 when no canvas with the canvas id was found', () => {
        let canvasProject = Object.assign({}, project2);
        canvasProject.persistent.canvases.id = () => {
            return null
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.readCanvas(project2._id, 'aaaaaaaaaaaa', (statusObject, canvas) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return 200 and the correct object when the project was found', () => {
        let canvasProject = Object.assign({}, project2);
        canvasProject.persistent.canvases.id = () => {
            return project2.persistent.canvases[0];
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.readCanvas(project2._id, project2.persistent.canvases[0]._id, (statusObject, canvas) => {
            expect(statusObject.status).toEqual(200);
            expect(canvas).toEqual(project2.persistent.canvases[0]);
        })
    })
})

describe('deleteCanvas', () => {
    it('should return an 404 when no project with the project id was found', () => {
        projectModel.findById.yields(undefined, null);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.deleteCanvas(project2._id, '5a353b15b11a371c416e2a52', (statusObject) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return an 404 when no canvas with the canvas id was found', () => {
        let canvasProject = Object.assign({}, project2);
        canvasProject.persistent.canvases.id = () => {
            return null
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.deleteCanvas(project2._id, 'aaaaaaaaaaaa', (statusObject) => {
            expect(statusObject.status).toEqual(404);
        })
    })

    it('should return an 200 and successfuly delete the object', () => {
        let hasBeen = {called: false, saved: false};
        let canvasProject = Object.assign({}, project2, {save: () => { hasBeen.saved = true;}});
        canvasProject.persistent.canvases.id = () => {
            return {remove: () => {hasBeen.called = true}}
        }

        projectModel.findById.yields(undefined, canvasProject);
        mongoose.connection.readyState = 1;
        let dbManager = new DBManager(projectModel, mongoose.connection);

        dbManager.deleteCanvas(project2._id, 'aaaaaaaaaaaa', (statusObject) => {
            expect(statusObject.status).toEqual(200);
            expect(hasBeen.called).toEqual(true);
            expect(hasBeen.saved).toEqual(true);
        })
    })
})