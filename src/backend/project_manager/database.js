import { setInterval } from 'timers';
import { Error } from 'mongoose';
import { type } from 'os';
import {createCanvas, getBuildingBlockInfo, getCanvasTypes} from '../common/model/canvas';
import {createEntry} from '../common/model/entry';
import {flattenCanvas} from '../common/model/inflation'

const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
const {projectModel} = require('./models');
const User = require('../models/user/model');


//
// ─── HELPER ─────────────────────────────────────────────────────────────────────
//

// Strategy:
// Useful javascript hack to make mongoose objects deep copyable
function mongooseDeepCopy( object){
    return JSON.parse(JSON.stringify(object));
}



export class DBManager{

    constructor(_projectModel, _dbConnection){
        this.dbConnection = _dbConnection;

        // Project model for the database
        this.projectModel = _projectModel;

        // The `Successful` status object
        this.OK = {status: 200};

        this.buildingBlockTitles = {};
        getCanvasTypes().forEach((canvasType)=>{
            this.buildingBlockTitles[canvasType]=getBuildingBlockInfo(canvasType).map((block)=>block.title||"")
        });

        this.projectVisibilities = [
            'PUBLIC',
            'PRIVATE',
        ]

        this.rights = [
            'READ',
            'EDIT'
        ]
    }



    checkReadAccess(projectID, userID, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'});

        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error('`projectID` is undefined');

        // undefined userID means "guest" 

        //if(userID === undefined)
        //    throw new Error('`userID` is undefined');

        // Looking for the project
        this.projectModel.findById(projectID, (err, project)=>{
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Check if sub-fields exist
            let members = project.members;
            if(members === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Special case: project is public, so everybody is allowed to see it
            if (project.visibility.toUpperCase() === 'PUBLIC')
                return callback(this.OK);

            for(let index = 0; index < members.length; index++){
                let member = members[index]; 
                if(member.userID === userID && (member.rights === 'READ' || member.rights === 'EDIT'))
                    return callback(this.OK);
            }

            callback({status: 403, message: 'user is not authorized to access resource'})            
        });
    }

    checkEditAccess(projectID, userID, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'});

        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error('`projectID` is undefined');
        
        // undefined userID means "guest" 

        //if(userID === undefined)
        //    throw new Error('`userID` is undefined');

        // Looking for the project
        this.projectModel.findById(projectID, (err, project)=>{
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Check if sub-fields exist
            let members = project.members;
            if(members === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            for(let index = 0; index < members.length; index++){
                let member = members[index]; 
                if(member.userID === userID && member.rights === 'EDIT')
                    return callback(this.OK);
            }

            callback({status: 403, message: 'user is not authorized to access resource'})            
        });
    }

    //
    // ─── PROJECT ────────────────────────────────────────────────────────────────────
    //

    /**
     * Creates a new project in the database
     * 
     * @param {string} userID 
     * @param {{title: string, description: string, visibility: string}} data 
     * @param {function} callback 
     */
    createProject(userID, userMail, data, callback){
        
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, project);

        // Check if arguments undefined!
        if(data === undefined)
            return callback({status: 500, message: "An internal error occurred!"});
        if(data.title === undefined)
            return callback({status: 400, message: "'title' is not defined in the body"});
        if(data.description === undefined)
            return callback({status: 400, message: "'description' is not defined in the body"});
        if(data.visibility === undefined)
            return callback({status: 400, message: "'visibility' is not defined in the body"});
        if( this.projectVisibilities.indexOf(data.visibility) === -1 ) // Check if visibility is PUBLIC or PRIVATE
            return callback({status: 400, message: "Invalid visability-type"});
            

        // Upload new project
        let newProject = new this.projectModel({
            title: data.title,
            visibility:	data.visibility, // Can be 'PUBLIC' || 'PRIVATE'
            description: data.description,
            members: [{
                userID: userID,
                email: userMail,
                rights: "EDIT" //Can be 'READ' || 'EDIT'
            }],
            persistent: { canvases: [], tags:[]},
            timeline: []
        });
        newProject.save((err, project) => {

            if(err){
                console.log(err)
                return callback({status: 500, message: 'Object could not be stored in the database'}, undefined);
            }

            callback( this.OK, mongooseDeepCopy(project));
        });
    }

    /**
     * Loads the data of a specific project from the database
     * 
     * @param {string} projectID 
     * @param {function} callback 
     */
    readProject(projectID, callback){
        //console.log(`Try to read project (id: ${projectID})`);

        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'});

        // Check if arguments undefined!
        if(projectID === undefined)
            return callback({status: 500, message: "An internal error occurred!"});
  

        // Looking for the project
        this.projectModel.findById(projectID, undefined, {lean:true}, (err, project)=>{
            // Error 404
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No project found with this id'}, undefined)
            
            // General Error
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            return callback(this.OK, project);
        })
    }

    /**
     * Loads the specified "persistent" part of the project from the database.
     * @param {string} projectID 
     * @param {string} timelineID
     * @param {function} callback 
     */
    readTimelineEntry(projectID, timelineID, callback){
        this.readProject(projectID, (error,result)=>{
            if(error&&(error!=this.OK))
                return callback(error);
            let taggedState=result.timeline.find((state)=>state._id==timelineID);
            if(!taggedState)
                return callback({status: 404,message: "Timeline State not found."});
            else
                return callback(this.OK, taggedState);
        });
    }

    /**
     * Deletes a project from the database
     * 
     * @param {string} projectID 
     * @param {function} callback 
     */
    deleteProject(projectID, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, project);

        // Check if arguments undefined!
        if(projectID === undefined)
            return callback({status: 500, message: "An internal error occurred!"});

        
        // Looking for the project
        this.projectModel.findById(projectID, (err, project)=>{
            // Error 404
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No project found with this id'}, undefined)
            
            // General Error
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Try to delete project
            project.remove((err) => {
                if(err)
                    return callback({status: 500, message: 'An error occurred! Project can not be deleted'});

                return callback(this.OK);
            })
        })
    }

    /**
     * Overwrites the current project state with `projectData`
     * 
     * @param {string} projectID 
     * @param {object} projectData 
     * @param {function} callback 
     */
    pushProjectState(projectID, projectData, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return ({status: 500, message: 'Could not connect to the database'}, project);
    
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        
        this.projectModel.findById(projectID, (err, project) => {
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Maybe todo... Validate projectData
            project.persistent = projectData;

            project.save((err, updatedProject) => {
                if(err)
                    return callback({status: 500, message: 'An error occurred! ProjectState can not be pushed'});

                return callback(this.OK, mongooseDeepCopy(updatedProject));
            });
        })
    }

    /**
     * Updates the metadata of an project
     * 
     * @param {string} projectID 
     * @param {{title: string, description: string, visibility: string}} data 
     * @param {function} callback 
     */
    updateProject(projectID, data, callback) {
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);
        
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");     
        if(data === undefined)
            throw new Error("data is not defined");

        this.projectModel.findById(projectID, (err, project) => {
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);
            if( this.projectVisibilities.indexOf(data.visibility) === -1 ) // Check if visibility is PUBLIC or PRIVATE
                return callback({status: 400, message: "Invalid visability-type"}); 
                
            project.title = data.title || project.title;
            project.description = data.description || project.description;
            project.visibility = data.visibility || project.visibility;
            project.save((err)=>{
                if(err)
                    return callback({status: 500, message: 'An error occurred! Project can not be updated'});

                return callback(this.OK);
            });
        });
    }

    getPublicProjects(callback,start=0,count=-1){
        let query=this.projectModel.find({visibility : "PUBLIC"});
        if(start>0)
            query=query.skip(start);
        if(count>-1)
            query=query.limit(count);
        query.lean().exec((err, data)=>{callback(this.OK, data)}); // Todo handle error
    }

    getPublicProjectsByTitle(title, callback,start=0,count=-1){
        this.getPublicProjects((err,data)=>{
            if(err&&(err.status!==200))
                callback(err,data)
            else{
                data = data.filter((proj)=>proj.title.indexOf(title)>=0||proj.description.indexOf(title)>=0)
                callback(err,data)
            }
        },start,count)
    }

    // ────────────────────────────────────────────────────────────────────────────────









    //
    // ─── COLLABORATOR ───────────────────────────────────────────────────────────────
    //

    /**
     * 
     * @param {string} projectID 
     * @param {string} userMail 
     * @param {function} collaboratorFunction 
     * @param {function} callback 
     */
    _collaboratorBoilerplate(projectID, userMail, collaboratorFunction, callback) {
        
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);
    
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");     
        if(userMail === undefined)
            throw new Error("userMail is not defined");
        
        User.find({ email: { $eq: userMail } }, (err, users) => {
            if (err) {
                // Note that this error doesn't mean nothing was found,
                // it means the database had an error while searching, hence the 500 status
                return callback({status: 500, message: 'An error occurred'}, undefined);    
            }
            if (!users || users.length === 0) {
                return callback({status: 404, message: 'No User found with this id'}, undefined);
            }
    
            let user = users[0];
            
            this.projectModel.findById(projectID, (err, project) => {
                if(project === undefined || project === null)
                    return callback({status: 404, message: 'No Project found with this id'}, undefined);
                if(err)
                    return callback({status: 500, message: 'An error occurred'}, undefined);    

                if (collaboratorFunction(project, user)) {
                    callback(this.OK, { project: project, user: user });
                }

            });
        });
    }

    /**
     * 
     * @param {string} projectID 
     * @param {string} userMail 
     * @param {string} rights 
     * @param {function} callback 
     */
    addCollaborator(projectID, userMail, rights, callback) {
        if( this.rights.indexOf(rights) === -1 )
            return callback({status: 400, message: "invalid right"});
                 
        this._collaboratorBoilerplate(projectID, userMail, (project, user) => {
            if (project.members.filter(m => m.userID === user._id).length > 0) {
                callback({status: 500, message: "User already in project"});
                return false;
            }

            project.members = [
                ...project.members,
                {
                    userID: user._id,
                    email: userMail,
                    rights,
                },
            ];
            project.save();

            user.projects.push(projectID);
            user.save();

            return true;
        }, callback);
    }

    /**
     * 
     * @param {sting} projectID 
     * @param {string} userMail 
     * @param {string} rights 
     * @param {function} callback 
     */
    updateCollaborator(projectID, userMail, rights, callback) {
        if( this.rights.indexOf(rights) === -1 )
            return callback({status: 400, message: "invalid right"});
        this._collaboratorBoilerplate(projectID, userMail, (project, user) => {
            if (project.members.filter(m => m.userID === user._id).length === 0) {
                callback({status: 500, message: "User is not member of this project"});
                return false;
            }

            project.members = project.members.map(m => m.userID !== user._id ? m :
            ({
                userID: user._id,
                email: userMail,
                rights,
            }));
            project.save();

            return true;
        }, callback);
    }

    /**
     * 
     * @param {string} projectID 
     * @param {string} userMail 
     * @param {function} callback 
     */
    deleteCollaborator(projectID, userMail, callback) {
        this._collaboratorBoilerplate(projectID, userMail, (project, user) => {
            if (project.members.filter(m => m.userID === user._id).length === 0) {
                callback({status: 500, message: "User is not a member of this project"});
                return false;
            }

            project.members = project.members.filter(m => m.userID !== user._id);
            project.save();
            
            user.projects = user.projects.filter(p => p.toString() !== projectID);
            user.save();

            return true;
        }, callback);
    }

    // ────────────────────────────────────────────────────────────────────────────────







    //
    //++++Timeline+++++
    //
    /**
     * 
     * @param {string} projectID 
     * @param {string} tag 
     * @param {function} callback 
     */
    addTimelineEntry(projectID, tag, callback) {
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
        return callback({status:500, message:'An error occurred'}, undefined);
        
        // Check if arguments undefined!
        if(projectID === undefined) {
            return callback({status: 400,  message:'bad request'});            
            // throw new Error("projectID is not defined");                 
        }
        if(tag === undefined) {
            return callback({status: 400,  message:'bad request'});
            // throw new Error("tag is not defined");            
        }

        this.projectModel.findById(projectID, (err, project) => {
            if(project === undefined || project === null) {
                return callback({status:404, message:'No Project found with this id'}, undefined);    
            }

            if(err) {
                return callback({status:500, message:'An error occurred'}, undefined);
            }
            
            // metadata
            if (tag === "") {
                tag = "Untitled";
            }
            const newTimelineEntry = {
                _id: mongoose.Types.ObjectId(),
                tag: tag,
                timestamp: Date.now(),
            }    
            // the actual canvas content -> copy it to a new "persistent model" (with new ids)
            const oldValue = project.persistent;



            // For cloning, we will recursively delete the _id key from the object and then again save 
            // it as a Mongoose object which will automatically generate _id for the cloned object.
            // http://www.connecto.io/blog/deep-copyingcloning-of-mongoose-object/
            var copiedObjectWithId = JSON.parse(JSON.stringify(oldValue));

            // call the lower function (see js hoisting)
            //objectIdDel(copiedObjectWithId);  <---- maybe need again!?

            // This function is currently not used but maybe we need it again ;D
            function objectIdDel(copiedObjectWithId) {
                if (copiedObjectWithId != null && typeof(copiedObjectWithId) != 'string' &&
                  typeof(copiedObjectWithId) != 'number' && typeof(copiedObjectWithId) != 'boolean' ) {
                  //for array length is defined however for objects length is undefined
                  if (typeof(copiedObjectWithId.length) == 'undefined') { 
                    delete copiedObjectWithId._id;
                    for (var key in copiedObjectWithId) {
                      objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
                    }
                  }
                  else {
                    for (var i = 0; i < copiedObjectWithId.length; i++) {
                      objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
                    }
                  }
                }
              } 
            
            const entry = {
                ...newTimelineEntry,
                value: copiedObjectWithId // it has no old and no new ids
            }
                        
            project.timeline.push(entry);

            // now we save the document and all missing ids will generate automatically
            project.save(function(err, project) {
                if (err) {
                    return callback({status:500, message:'An error occurred'}, undefined);
                }else {
                    return callback({status:200, message:'Entry created'}, entry);
                }
            });
            
            
        });
    }

        /**
     * 
     * @param {string} projectID 
     * @param {string} tag 
     * @param {function} callback 
     */
    restoreStateFromTimelineEntry(projectID, stateID, callback) {
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
        return callback({status:500, message:'An error occurred'}, undefined);
        
        // Check if arguments undefined!
        if(projectID === undefined) {
            return callback({status: 400,  message:'bad request'});                        
            // throw new Error("projectID is not defined");                 
        }
        if(stateID === undefined) {
            return callback({status: 400,  message:'bad request'});
            // throw new Error("stateID is not defined");            
        }

        this.projectModel.findById(projectID, (err, project) => {
            if(project === undefined || project === null) {
                return callback({status:404, message:'No Project found with this id'}, undefined);    
            }

            if(err) {
                return callback({status:500, message:'An error occurred'}, undefined);
            }

            let entries = project.timeline.filter(e => e._id == stateID)

            if (entries.length === 0) {
                return callback({status:404, message:'Timeline entry not found.'}, undefined);  
            }

            let timelineEntry = entries[0];

            console.log('!!! FOUND ENTRY !!!');
            const stateInformation = {
                id: timelineEntry._id,
                tag: timelineEntry.tag,
                timestamp: timelineEntry.timestamp
            }

            // save (restore) the timelineEntry value in persistent
            project.persistent = timelineEntry.value;
            // TODO: push it to the timeline as a new state??
            // project.timeline.push(entry);
            
            // now we save the document 
            project.save(function(err, project) {
                if (err) {
                    return callback({status:500, message:'An error occurred.'}, undefined);
                }else {
                    return callback({status:200, message:'Timeline state restored.'}, stateInformation, mongooseDeepCopy(project));
                }
            });
        });
    }


    //
    // ─── CANVAS ─────────────────────────────────────────────────────────────────────
    //


    /**
     * Creates a new canvas along with their needed building blocks
     * 
     * @param {string} projectID 
     * @param {{title: string, type: string}} data 
     * @param {function} callback 
     */
    createCanvas(projectID, data, callback){

        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);
        
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");        
        if(data === undefined)
            throw new Error("data is not defined");
        if(data.title === undefined)
            return callback({status: 400, message: "'title' is not defined in the body"});
        if(data.type === undefined)
            return callback({status: 400, message: "'type' is not defined in the body"});

        

        // Try to find the project associated with the id and update it!
        this.projectModel.findById(projectID, (err, project) => {
            
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            let newCanvas;
            try{
                newCanvas=flattenCanvas(createCanvas(data.title, data.type))
            }catch(error){
                return callback({status: 400, message: error}, undefined)
            }

            // Try to add the now canvas object to the canvases array
            try{
                project.persistent.canvases.push(newCanvas);
            } catch(err){
                return callback({status: 500, message: 'An internal error occurred! Canvas list can not be extended', err}, undefined);
            }

            project.save((err, savedProject) => {
                if(err)
                    return callback({status: 500, message: 'An internal error occurred! Canvas cant be saved'}, undefined); 
                newCanvas._id = newCanvas._id;
                newCanvas.buildingBlocks = newCanvas.buildingBlocks.map((buildingBlock) => {buildingBlock._id = buildingBlock._id; return buildingBlock});
                callback(this.OK, mongooseDeepCopy(newCanvas));
            })
        });
    };

    /**
     * Get the content of a specific canvas stored in the database
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {function} callback 
     */
    readCanvas(projectID, canvasID, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);

        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");
        if(callback === undefined)
            throw new Error("callback is not defined");


        this.projectModel.findById(projectID, (err, project) => {

            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Check if sub-fields exist
            let persistent = project.persistent;
            if(persistent === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            let canvases = persistent.canvases;
            if(canvases === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            let foundCanvas = canvases.id( canvasID);
            if(foundCanvas === undefined || foundCanvas === null)
                return callback({status: 404, message: 'No canvas found with this id'}, undefined);

            callback(this.OK, mongooseDeepCopy(foundCanvas));
        })        
    }


    // Todo: Update Canvas (Meta)

    /**
     * Deletes a specific canvas from the database
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {function} callback 
     */
    deleteCanvas(projectID, canvasID, callback){
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);

        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");
        if(callback === undefined)
            throw new Error("callback is not defined");

        this.projectModel.findById(projectID, (err, project) => {
            if(!project)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Check if sub-fields exist
            let persistent = project.persistent;
            if(persistent === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            let canvases = persistent.canvases;
            if(canvases === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            let foundCanvas = canvases.id( canvasID);
            if(foundCanvas === undefined || foundCanvas === null)
                return callback({status: 404, message: 'No canvas found with this id'}, undefined);

            switch(foundCanvas.canvasType){
                case 'VALUE_PROPOSITION':
                    // Get all BusinessModelCanvases
                    let BMCArray = [];
                    canvases.forEach( (currentCanvas)=>{
                        if(currentCanvas.canvasType === 'BUSINESS_MODEL')
                            BMCArray.push(currentCanvas);
                    })

                    // Get all ValueProposition Building Blocks                
                    let valuePropositionBBArray = [];
                    let customerSegmentBBArray = [];
                    BMCArray.forEach( (currentBMC) => {
                        for(let currentBB of currentBMC.buildingBlocks){
                            if(currentBB.title === 'Value Propositions')
                                valuePropositionBBArray.push( currentBB);
                            if(currentBB.title === 'Customer Segments')
                                customerSegmentBBArray.push( currentBB);
                        }
                    })

                    // Get all target entries
                    let targetEntryArray = [];
                    customerSegmentBBArray.forEach( (currentCSBB) => {
                        currentCSBB.entries.forEach( (currentEntry) => {
                            if(currentEntry.entryType === 'target')
                                targetEntryArray.push(currentEntry);
                        })
                    })

                    // Get all link entries
                    let linkEntryArray = [];
                    valuePropositionBBArray.forEach( (currentVPBB) => {
                        currentVPBB.entries.forEach( (currentEntry) => {
                            if(currentEntry.entryType === 'link')
                                linkEntryArray.push(currentEntry);
                        })
                    })

                    // Find the needed (link-) Entry
                    let linkEntry = linkEntryArray.find( (currentEntry) => {
                        let content = currentEntry.content;
                        if(content === undefined){
                            return false;
                        }else{
                            let reference = content.reference;
                            return (reference === canvasID);
                        }
                    })

                    let targetID = linkEntry.content.target;
                    let targetEntry = targetEntryArray.find( (currentEntry) => {
                        return  currentEntry._id === targetID;
                    });

            
                    foundCanvas.remove();
                    if(linkEntry !== undefined && linkEntry !== null){
                        linkEntry.remove();
                    }else{
                        console.log('WARNING: linkEntry referencing the VP-Canvas could not be found. ')
                    }
                    if(targetEntry !== undefined && targetEntry !== null){
                        targetEntry.remove();
                    }else{
                        console.log('WARNING: targetEntry referenced by the linkEntry while deleting an VP-Canvas could not be found. ')
                    }
                    break;
                case 'BUSINESS_MODEL':
                    for( let currentBB of foundCanvas.buildingBlocks){
                        if(currentBB.title==='Value Propositions'){
                            currentBB.entries.forEach( (currentEntry) => {
                                let valuePropositionCanvas = canvases.id(currentEntry.content.reference);
                                if(valuePropositionCanvas)
                                    valuePropositionCanvas.remove();
                            })
                        }
                    }
                    foundCanvas.remove();
                    break;
                default:
                    foundCanvas.remove();
                    break;
            }

            project.save((err)=>{
                if(err)
                    return callback({status: 500, message: 'An error occurred! Canvas can not be deleted'});

                return callback(this.OK);
            })
        })    
    }

    // ────────────────────────────────────────────────────────────────────────────────




    
    
    //
    // ─── ENTRY ──────────────────────────────────────────────────────────────────────
    //
    
    

    /**
     * This method is used to make the code more readable, it invokes the mainFunction after it has done all its logic and pass an object with all the field-pointers in the project
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {string} buildingBlockTitle 
     * @param {function} callback 
     * @param {function} mainFunction 
     */
    getEntryOfProjectBoilerplate(projectID, canvasID, buildingBlockTitle, callback, mainFunction){
        
        // Try to find the project associated with the id and update it!
        this.projectModel.findById(projectID, (err, project) => {
            
            // Check errors
            if(project === undefined || project === null)
                return callback({status: 404, message: 'No Project found with this id'}, undefined);
            if(err)
                return callback({status: 500, message: 'An error occurred'}, undefined);

            // Init project fields object
            let $ = {};
            $.project = project;

            // Check if fields exits
            $.persistent = project.persistent;
            if($.persistent === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);
            $.canvases = $.persistent.canvases;
            if($.canvases === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);


                // Try to get the needed canvas
            $.foundCanvas = $.canvases.id( canvasID);
            if($.foundCanvas === undefined || $.foundCanvas === null)
                return callback({status: 404, message: 'No canvas found with this id'}, undefined);


            // Check if the canvas type is valid
            $.foundCanvasType = $.foundCanvas.canvasType; // CanvasType of the needed canvas
            $.validCanvasTypeArray = getCanvasTypes(); // Array of all valid canvas types
            if( $.validCanvasTypeArray.indexOf($.foundCanvasType) === -1)
                return callback({status: 500, message: 'Database-model inconsistent! Invalid canvas-type'}, undefined);


            // Check if buildingBlockTitle parameter is valid (in the "canvas-type-scope")
            $.validBuildingBlockTitleArray = this.buildingBlockTitles[$.foundCanvasType]; // Array of all valid building block titles in this "canvas-type-scope"           
            if( $.validBuildingBlockTitleArray.indexOf(buildingBlockTitle) === -1)
                return callback({status: 400, message: 'Invalid building block title'}, undefined); // <--- buildingBlockTitle is generated from the buildingBlockType parameter (in the REST API)


            // The array of all building blocks of the canvas
            $.foundBuildingBlockArray = $.foundCanvas.buildingBlocks;

            // Search for the building block with needed title
            $.foundBuildingBlock = null;
            $.foundBuildingBlockArray.forEach( buildingBlock => {
                if(buildingBlock.title === buildingBlockTitle)
                    $.foundBuildingBlock = buildingBlock;
            });
            if($.foundBuildingBlock === null) // If no buildingBlock was found with this title
                return callback({status: 500, message: 'An internal error occurred! There is an inconsistency at the naming of the building block title'}, undefined);


            // Get `Entry` field of the building block
            $.foundEntries = $.foundBuildingBlock.entries;
            if($.foundEntries === undefined)
                return callback({status: 500, message: 'An error occurred'}, undefined);


            // Execute main function:
            mainFunction($);
        });
    }


    /** 
     * Creates a new entry in a specific building block
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {string} buildingBlockTitle specified in the documentation!
     * @param {{type: string}} data 
     * @param {function} callback 
     */
    createEntry(projectID, canvasID, buildingBlockTitle, data, callback){
        
        // Check if not connected to db
        if(this.dbConnection.readyState !== 1)
            return callback({status: 500, message: 'Could not connect to the database'}, undefined);
        
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");  
        if(buildingBlockTitle === undefined)
            throw new Error("buildingBlock is not defined");  
        if(data === undefined)
            throw new Error("data is not defined");
        if(data.type === undefined)
            return callback({status: 400, message: "'type' is not defined in the body"});
        if(data.content===undefined)
            data={...data,content:{}};

        // Try to find the project associated with the id and update it!
        this.getEntryOfProjectBoilerplate( projectID, canvasID, buildingBlockTitle, callback, ($) => {
            
            // ------------------------------ Create and add the entry ----------------------------------

            if($.foundCanvasType === 'BUSINESS_MODEL' && buildingBlockTitle === 'Customer Segments')
                return callback({status: 400, message: 'Creating entries in a customer segment building block is not allowed'}, undefined);           


            let newEntry;
            let additionalData=null;
            switch(data.type){  // EntryTypes: `link`, `target`, `plain`  
                case 'link':
                    if(buildingBlockTitle !== 'Value Propositions')
                        return callback({status: 400, message: 'Creating entries of type `link` building block other than value proposition is not allowed'}, undefined); 
                    
                    // Create new Value Proposition Canvas
                    let newVPCanvas = flattenCanvas(createCanvas('Value Proposition', 'VALUE_PROPOSITION', canvasID))

                    // Search for the building block with customer segment title
                    let customerSegmentBuildingBlock = null;
                    $.foundBuildingBlockArray.forEach( buildingBlock => {
                        if(buildingBlock.title === 'Customer Segments')
                            customerSegmentBuildingBlock = buildingBlock;
                    });
                    if(customerSegmentBuildingBlock === null) // If no buildingBlock was found with title 
                        return callback({status: 500, message: 'An internal error occurred! There is an inconsistency at the naming of the building block title! No customer segment building block'}, undefined);
                    let customerSegmentEntryArray = customerSegmentBuildingBlock.entries;
                    if(customerSegmentEntryArray === undefined)
                        return callback({status: 500, message: 'An error occurred'}, undefined);


                    let newCustomerSegmentEntryID = uuidv4();
                    let newCustomerSegmentEntry = {
                        _id: newCustomerSegmentEntryID,
                        entryType: 'target',
                        content: {
                            title: '',
                            text: '',
                            reference: undefined,
                            target: undefined
                        }
                    }

                    let newEntryID = uuidv4();
                    newEntry = {
                        _id: newEntryID,
                        entryType: 'link',
                        content: {
                            title: data.content.title||'',
                            text: data.content.text||'',
                            reference: newVPCanvas._id,
                            target: newCustomerSegmentEntryID
                        }
                    }

                    // Assign new objects
                    $.canvases.push(newVPCanvas);
                    $.foundEntries.push(newEntry);
                    customerSegmentEntryArray.push(newCustomerSegmentEntry);
                    additionalData={canvaslocation:[newVPCanvas._id],entries:[{buildingBlockID:customerSegmentBuildingBlock._id,entry:newCustomerSegmentEntry}]};
                    //console.log("Additional data:", additionalData);
                break;

                case 'plain':
                    if(buildingBlockTitle === 'Customer Segments' || buildingBlockTitle === 'Value Propositions')
                        return callback({status: 400, message: 'Creating entries of type `plain` in a customer segment or a value proposition building block is not allowed'}, undefined); 
                    
                    newEntry = {
                        _id: uuidv4(),
                        entryType: 'plain',
                        content: { // Auto-generated
                            title: data.content.title||'',
                            text: data.content.text||'',
                            reference: '',
                            target: ''
                        }
                    }
                    $.foundEntries.push(newEntry);                    
                break;

                case 'target':
                    return callback({status: 400, message: '`target` can not be set explicit'}, undefined); 
                break;

                default:
                    return callback({status: 400, message: 'Invalid entry type'}, undefined); 
                break;
            }

        $.project.save((err, savedProject) => {
                if(err)
                    return callback({status: 500, message: 'An internal error occurred! Entry cant be saved'}, undefined); 
                if(additionalData===null){
                    callback(this.OK, mongooseDeepCopy(newEntry));
                }else{
                    callback(this.OK, mongooseDeepCopy(newEntry),mongooseDeepCopy(readAdditionalData(savedProject,additionalData)));
                }
            });
        });        
    }

    /**
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {string} buildingBlockTitle 
     * @param {string} entryID 
     * @param {function} callback 
     */
    readEntry(projectID, canvasID, buildingBlockTitle, entryID, callback){
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");  
        if(buildingBlockTitle === undefined)
            throw new Error("buildingBlock is not defined");  
        if(entryID === undefined)
            throw new Error("data is not defined");

        // Try to find the project associated with the id and update it!
        this.getEntryOfProjectBoilerplate( projectID, canvasID, buildingBlockTitle, callback, ($) => {
            let foundEntry = $.foundEntries.id( entryID);
            if(foundEntry === undefined)
                return callback({status: 404, message: 'No entry found with this id'}, undefined);

            return callback(this.OK, mongooseDeepCopy(foundEntry));
        });     
    }

    /**
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {string} buildingBlockTitle 
     * @param {string} entryID 
     * @param {{content:{text: string, target: string, reference: string, title: string}}} data 
     * @param {function} callback 
     */
    updateEntry(projectID, canvasID, buildingBlockTitle, entryID, data, callback){
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");  
        if(buildingBlockTitle === undefined)
            throw new Error("buildingBlock is not defined");  
        if(entryID === undefined)
            throw new Error("entryID is not defined");
        if(data === undefined)
            throw new Error("data is not defined");
        if(data.content === undefined)
            return callback({status: 400, message: "'content' is not defined in the body"});

        // Try to find the project associated with the id and update it!
        this.getEntryOfProjectBoilerplate( projectID, canvasID, buildingBlockTitle, callback, ($) => {
            let foundEntry = $.foundEntries.id( entryID);
            if(foundEntry === undefined || foundEntry === null)
                return callback({status: 404, message: 'No entry found with this id'}, undefined);
            
            let entryContent = foundEntry.content;
            if(entryContent === undefined)
                return callback({status: 500, message: 'Database-model inconsistent! Entry has no content'}, undefined);
            

            foundEntry.content = { // Use foundEntry.content not entryContent (to NOT overwrite the object pointer!!!!)
                title: data.content.title || entryContent.title,
                text: data.content.text || entryContent.text,
                reference: data.content.reference || entryContent.reference,
                target: data.content.target || entryContent.target
            }

            $.project.save((err) => {
                if(err)
                    return callback({status: 500, message: 'An internal error occurred! Entry cant be updated'}, undefined); 

                return callback(this.OK, mongooseDeepCopy(foundEntry));                
            })
        });
    }

    /**
     * 
     * @param {string} projectID 
     * @param {string} canvasID 
     * @param {string} buildingBlockTitle 
     * @param {string} entryID 
     * @param {function} callback 
     */
    deleteEntry(projectID, canvasID, buildingBlockTitle, entryID, callback){
        // Check if arguments undefined!
        if(projectID === undefined)
            throw new Error("projectID is not defined");
        if(canvasID === undefined)
            throw new Error("canvasID is not defined");  
        if(buildingBlockTitle === undefined)
            throw new Error("buildingBlock is not defined");  
        if(entryID === undefined)
            throw new Error("entryID is not defined");

        // Try to find the project associated with the id and update it!
        this.getEntryOfProjectBoilerplate( projectID, canvasID, buildingBlockTitle, callback, ($) => {
            let foundEntry = $.foundEntries.id( entryID);
            if(foundEntry === undefined || foundEntry === null)
                return callback({status: 404, message: 'No entry found with this id'}, undefined);
            
            let entryContent = foundEntry.content;
            if(entryContent === undefined)
                return callback({status: 500, message: 'Database-model inconsistent! Entry has no content'}, undefined);
            
            //if entry of type link, so an according VPC has to be deleted
            switch(foundEntry.entryType){
                case 'link': // Delete referenced target-entry and canvas too
                    // Search for the building block with needed title
                    let customerSegmentBB = null;
                    $.foundBuildingBlockArray.forEach( buildingBlock => {
                        if(buildingBlock.title === 'Customer Segments')
                            customerSegmentBB = buildingBlock;
                    });
                    if(customerSegmentBB === null) // If no buildingBlock was found with this title
                        return callback({status: 500, message: 'An internal error occurred! There is an inconsistency at the naming of the building block title'}, undefined);


                    console.log(customerSegmentBB.entries);
                        
                    let targetEntry = customerSegmentBB.entries.id(entryContent.target);
                    let VPCanvas = $.canvases.id(entryContent.reference);

                    foundEntry.remove();
                    targetEntry.remove();
                    VPCanvas.remove();
                    break;
                case 'target': // Cannot be deleted
                    return callback({status: 400, message: 'Entries of type target can not be deleted'}, undefined);
                case 'plain':
                    // (Maybe test if entry is located in the right buildingBlock)
                    foundEntry.remove();
                    break;
                default: // Some inconsistency here!
                    return callback({status: 500, message: 'Database-model inconsistent! Invalid entryType'}, undefined);
            }

            $.project.save((err) => {
                if(err)
                    return callback({status: 500, message: 'An internal error occurred! Entry cant be updated'}, undefined); 

                return callback(this.OK);                
            })
        });
    }

}



//
// ─── SOME OTHER STUFF ───────────────────────────────────────────────────────────
//

function readAdditionalData(projectState,additionalData){
    if(additionalData===undefined) return undefined;
    if(additionalData===null) return null;
    let newAdditionalData={};
    Object.entries(additionalData).forEach((data)=>{
        let key=data[0];
        let value=data[1];
        switch(key){
            case "canvaslocation":
            case "canvasid":{
                if(!(value instanceof Array))
                    value=[value];
                let canvases=value.map((canvasID)=>{
                    return projectState.persistent.canvases.find((canvas)=>canvas._id===canvasID);
                })
                if(newAdditionalData.canvases===undefined){
                    newAdditionalData.canvases=canvases;
                }else{
                    newAdditionalData.canvases=[...(newAdditionalData.canvases),...canvases];
                }
            }
            break;
            case "entrylocation":{
                if(!(value instanceof Array))
                    value=[value];
                let entries=value.map((entryData)=>{
                    let canvasID=value.canvasID;
                    let buildingBlockID=value.buildingBlockID;
                    if(canvasID===undefined) throw new Error("canvasID cannot be undefined!");
                    if(buildingBlockID===undefined) throw new Error("buildingBlockID cannot be undefined!");
                    let entryID=value.entryID||entryData.entry._id;
                    return {
                        canvasID : canvasID,
                        buildingBlockID : buildingBlockID,
                        entry: projectState.persistent.canvases
                        .find((canvas)=>canvas._id===canvasID).buildingBlocks
                        .find((buildingBlock)=>buildingBlock._id===buildingBlockID).entries
                        .find((entry)=>entry._id===entryID)};
                });
                if(newAdditionalData.entries===undefined){
                    newAdditionalData.entries=entries;
                }else{
                    newAdditionalData.entries=[...(newAdditionalData.entries),...entries];
                }
            }
            break;
            default:{
                if((newAdditionalData[key]===undefined)||(newAdditionalData[key]===null)){
                    newAdditionalData[key]=value;
                } else if(newAdditionalData[key] instanceof Array){
                    if(value instanceof Array){
                        newAdditionalData[key]=[...(newAdditionalData[key]),...value];
                    }else{
                        newAdditionalData[key]=[...(newAdditionalData[key]),value];
                    }
                } else {
                    throw new Error("Cannot merge "+key+"into existing data");
                }
            }
        }
    });
    return newAdditionalData;
}

export const connection = new DBManager(projectModel, mongoose.connection);