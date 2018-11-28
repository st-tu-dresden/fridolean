import {ProjectManager} from './project_manager'
import {pathAssign} from '../common/assignment'
import { Error } from 'mongoose';

export class DatabaseProjectManager extends ProjectManager{
    constructor(id, dbConnection){
        super(id);
        this.dbConnection=dbConnection;
    }

    createCanvas(data,callback){
        this.dbConnection.createCanvas(this.id,data,callback);
    }

    createEntry(canvasID, buildingBlockTitle, data, callback){
        this.dbConnection.createEntry(this.id,canvasID,buildingBlockTitle,data,callback);
    }

    readEntry(canvasID, buildingBlockTitle, entryID, callback){
        this.dbConnection.readEntry(this.id,canvasID, buildingBlockTitle, entryID, callback);
    }

    deleteEntry(canvasID, buildingBlockTitle, entryID, callback){
        this.dbConnection.deleteEntry(this.id,canvasID, buildingBlockTitle, entryID, callback);        
    }

    readProject(callback){
        this.dbConnection.readProject(this.id, callback);
    }

    readCanvas(canvasID, callback){
        this.dbConnection.readCanvas(this.id, canvasID, callback);
    }

    deleteCanvas(canvasID, callback){
        this.dbConnection.deleteCanvas(this.id, canvasID, callback);
    }

    updateProject(data, callback){
        this.dbConnection.updateProject(this.id, data, (err, project) => {
            if (err.status !== 200) {
                callback(err);
                return;
            }

            callback(undefined);
        })
    }

    addCollaborator(userMail, rights, callback) {
        this.dbConnection.addCollaborator(this.id, userMail, rights, (err, project) => {
            if (err.status !== 200) {
                callback(err);
                return;
            }
            callback(undefined);
        })
    }
    updateCollaborator(userMail, rights, callback) {
        this.dbConnection.updateCollaborator(this.id, userMail, rights, (err, project) => {
            if (err.status !== 200) {
                callback(err);
                return;
            }
            callback(undefined);
        })
    }
    deleteCollaborator(userMail, callback) {
        this.dbConnection.deleteCollaborator(this.id, userMail, (err, project) => {
            if (err.status !== 200) {
                callback(err);
                return;
            }
            callback(undefined);
        })
    }

    // timeline
    addTimelineEntry(tag, callback){
        this.dbConnection.addTimelineEntry(this.id, tag, callback);
    }

    restoreStateFromTimelineEntry(stateID, callback) {
        this.dbConnection.restoreStateFromTimelineEntry(this.id, stateID, callback);
    }

    updateEntry(canvasID, buildingBlockType, entryID, data, callback){
        this.dbConnection.updateEntry(this.id, canvasID, buildingBlockType, entryID, data, callback);
    }


    deleteProject(callback) {
        console.error('DeleteProject is supposed to be relayed to the RootManager (manager.js), not individual project-managers!');
        this.dbConnection.deleteProject(this.id, callback);
    }

    
    //---------- The Old Stuff--------------
    
    /**
     * Returns the core-model of the project in the DB/REST-Scheme
     * @param {function} callback The callback that should be invoked with any errors and the project-state.
     */
    getStateModel(callback){
        this.dbConnection.readProject(this.id, callback);
    }




    applyChange(path, value, callback, user){
        throw new Error('ApplyChange is not implemented anymore');
        /*
        this.dbConnection.readProject(this.id,(error,project)=>{
            if((error!==undefined)&&(error.status!==200)){
                callback(error);
                return;
            } 
            let newProject=pathAssign(project,path,value);
            this.dbConnection.saveProject(this.id,newState, (error2,path2,value2)=>{
                if(path2===undefined) path2=path;
                if(value2===undefined) value2=value;
                callback(error2,path2,value2);
            });
        });
        */
    }
}