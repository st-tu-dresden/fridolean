import {createDirtyAssignAction} from '../common/pending-actions'
import {createAssignment, extractAssignmentList, GENERIC_ASSIGNMENT_ERROR} from '../common/assignment'
import {createStore} from 'redux'
import {createLock} from './store_state/lock'
import {ProjectManager} from './project_manager'
import {createTypedStore, EmptyDefaultState} from './store_state/init'
import {TYPE_CLIENTUNSUBSCRIBE} from './store_state/client'
import {memberActions} from './store_state/meta'
import {timelineActions} from './store_state/timeline'
import {applyAssignmentTransform} from './store_state/assignment_middleware'
import * as inflation from '../common/model/inflation'

const useCachedMemberChecks=true;

/**
 * Manages a currently loaded project and its store.
 */
export class SocketProjectManager extends ProjectManager{

    /**
     * @param {String} id The ID of the managed project
     */
    constructor(id, dbManager,externalState, transforms={}){
        super(id);
        let internalState=internalizeProject(externalState,"project");
        this.store=createTypedStore(internalState);
        this.valid=true;
        this.dbManager=dbManager;
        this.assignmentTransforms=transforms.assignment||[];
        this.lockingTransforms=transforms.locking||[];
        this.onLastUserDisconnect=[];
        this.onFirstUserConnect=[];
        this.unloadTimer=null;
    }
    
    getTransforms(){
        return {assignment: this.assignmentTransforms, locking: this.lockingTransforms};
    }

    invalidate(){
        this.valid=false;
        let clients=Object.assign([],this.store.getState().volatile.activeClients);
        if(clients.length!==0){
            console.warn(`Closing project (${this.id}) which still has open connections (n=${clients.length})`);
            let store=this.store;
            clients.forEach((client)=>client.disconnect());
            try{
                let remainingClients=[];
                while((remainingClients=store.getState().volatile.activeClients).length>0){
                    store.dispatch({type:TYPE_CLIENTUNSUBSCRIBE, client:remainingClients[0]});
                }
            }catch(e){
                console.error(e);
            }
        }else{
            console.log(`Project (${this.id}) unloaded peacefully`);
        }
    }

    get state(){
        return this.store.getState();
    }

    /**
     * Deprecated, use externalizeProject(state) instead
     * @param {*} state 
     */
    static asExternal(state){
        return externalizeProject(state);
        /*state=Object.assign({},state);
        delete state.volatile;
        let model=Object.apply({},state);
        model.members=Object.values(state.persistent.members);
        let newCanvases=Object.values(state.persistent.canvases).map((canv)=>
            canv && Object.assign({},canv,{buildingBlocks:Object.values(canv.buildingBlocks).map((block)=>
                Object.assign({},block,{entries:Object.values(block.entries)})    
            )})
        ).filter(canv => canv !== undefined && canv !== null);
        model.persistent=Object.assign({},state.persistent,{canvases:newCanvases});
        // Get metadata-changes from `persistent`-part of state
        model.title = state.persistent.title || state.title;
        model.description = state.persistent.description || state.description;
        model.visibility = state.persistent.visibility || state.visibility;
        //throw new Error();
        return model;*/
    }

    /**
     * Returns the core-model of the project in the DB/REST-Scheme
     * @param {function} [callback] The callback that should be invoked with any errors and the project-state.
     */
    getStateModel(callback){
        if(callback===undefined) return SocketProjectManager.asExternal(this.state);
        else callback(undefined,SocketProjectManager.asExternal(this.state));//Perform late-loading
    }
    /**
     * Apply the change to the project.
     * @param {String} path The path under which the value is changed
     * @param {*} value The new value
     * @param {function} [callback] The callback that should be invoked with any errors.
     * @param {*} [user] The user which should be used for lock-testing
     */
    applyChange(path,value,callback,user){
        return this.applyAssignments([createAssignment(path,value)],(error,assignment)=>callback(error,assignment.path,assignment.value),user);
    }

    checkEditRights(user,callback){
        if(user!==undefined){
            if((typeof user).toLowerCase()!=="string"){
                if(user.userID){
                    user=user.userID;
                    console.warn("Do not supply user anymore, instead use the userID!");
                }
            }
        }
        if(!useCachedMemberChecks){
            this.dbManager.checkEditAccess(this.id,user,callback);
        }else{
            if(!user) callback({status: 401});
            else{
                let rights=this.store.getState().persistent.members[user];
                //console.log("Rights: ",rights);
                if((!rights)||(rights.rights.toLowerCase()!=="edit"))
                    callback({status: 403});
                else
                    callback({status: 200});
            }
        }
    }

    /**
     * Applies the assignments to the state.
     * @param {{path:string, value:any}[]} assignments
     * @param {function} [callback] The callback which should be invoked with any errors should they occur.
     * @param {*} [user]
     */
    applyAssignments(assignments, callback, user){
        if(user!==undefined){
            if((typeof user).toLowerCase()!=="string"){
                if(user.userID){
                    user=user.userID;
                    console.warn("Do not supply user anymore, instead use the userID!");
                }
            }
        }
        this.checkEditRights(user,(result)=>{
            if((!result)||(result.status!==200)){
                callback(result);
            }else{
                let newAssignments=applyAssignmentTransform(()=>this.store.getState(),assignments,...this.assignmentTransforms);
                let action=createDirtyAssignAction(newAssignments);
                let lockingPaths=applyAssignmentTransform(()=>this.store.getState(),newAssignments.map((assign)=>assign.path),...this.lockingTransforms);
                action.locking=lockingPaths.map((path)=>createLock(path,user));
                this.store.dispatch(action);
                if(callback!==undefined){
                    if(action.error!==undefined){
                        let actionError=action.error;
                        if(actionError.status===undefined)
                            actionError.status=GENERIC_ASSIGNMENT_ERROR;
                        callback(action.error,newAssignments);
                    }else if(action.success===false){
                        callback(Object.assign(new Error("Could not perform assignment."),{status: GENERIC_ASSIGMENT_ERROR}),newAssignments);
                    }else{
                        callback(undefined,newAssignments);
                    }
                }
            }
        })
    }

    /**
     * Creates a new canvas with the given data
     * @param {{title: string, type: string}} data
     * @param {function} callback
     * @param {*} [user]
     */
    createCanvas(data, callback, user){
        this.dbManager.createCanvas(this.id,data,(error,result)=>{
            if((error!==undefined)&&(error.status!==200)){
                callback(error);
            }else{
                let importObject=createImportObject(result,"canvas");
                this.importObject(importObject,(err,result)=>{
                    if(err && err.status!==200){
                        callback(err);
                    }else{
                        callback(err,result[0].value);
                    }
                },user)
                //this.importCanvas(result,callback);
            }
        });
    }

    /**
     * Creates a new entry in the given buildingBlock in the canvas
     * @param {string} canvasID
     * @param {string} buildingBlock
     * @param {{content: any, type: string}} data
     * @param {function} callback
     * @param {*} [user]
     */
    createEntry(canvasID, buildingBlock, data, callback, user){
        if(user!==undefined){
            if((typeof user).toLowerCase()!=="string"){
                if(user.userID){
                    user=user.userID;
                    console.warn("Do not supply user anymore!");
                }
            }
        }
        this.dbManager.createEntry(this.id,canvasID, buildingBlock.title, data, (error,result,additionalData)=>{
            if((error!==undefined)&&(error.status!==200)){
                callback(error);
            }else{
                let importObject=createImportObject(result,"entry",{canvasID:canvasID, buildingBlockID:buildingBlock._id});
                if(additionalData){
                    let importObjects=[Object.assign({},importObject)];
                    if(additionalData.canvases){
                        //console.log("Additional Canvases found")
                        importObjects.push(...(additionalData.canvases.map((canv)=>createImportObject(canv,"canvas"))));
                    }
                    if(additionalData.entries){
                        //console.log("Additional Entries found");
                        importObjects.push(...(additionalData.entries.map((entryData)=>
                        createImportObject(entryData.entry,"entry",{canvasID:entryData.canvasID||canvasID,buildingBlockID:entryData.buildingBlockID||buildingBlock._id}))));
                    }
                    importObject=createCombinedImportObject(...importObjects);
                }
                this.importObject(importObject,(err,result)=>{
                    if(err && err.status!==200){
                        callback(err);
                    }else{
                        callback(err,result);
                    }},user);
                //this.importEntry(canvasID,buildingBlock,result,callback);
            }
        })
    }

    /**
     * Reads the current state of the project into the callback.
     * @param {function} callback The callback with error and the read state.
     */
    readProject(callback){
        let state=Object.assign({},this.store.getState());
        let externalState=SocketProjectManager.asExternal(state);
        this.dbManager.readProject(this.id,(error,result)=>{
            let resultState=Object.assign({},result,externalState)
            callback(error,resultState);
        });
    }

    /**
     * Reads the canvas from the project
     * @param {string} canvasID
     * @param {function} callback
     */
    readCanvas(canvasID, callback){
        let result=this.store.getState().persistent.canvases[canvasID];
        if(result===undefined)
            callback({status : 404});
        else
            callback({status: 200},inflation.flattenCanvas(result));
    }

    /**
     * Write new meta-data to the project
     * @param {{title : string, visibility : string, description : ?string, members : Array.<*>}} data
     * @param {function} callback
     * @param {*} [user]
     */
    updateProject(data, callback, user){
        console.log(">>> Updating project: ", this.store.getState());
        this.dbManager.updateProject(this.id, data, (err) => {
            if (err && err.status !== 200) {
                callback(err);
            }

            this.applyAssignments(
                extractAssignmentList(
                    Object.keys(data),
                    data
                ),(error,result)=>{
                    if((error!==undefined)&&(error.status!==200)){
                        callback(error,undefined);
                    }else{
                        console.log("update-Project: ",result);
                        callback(error,result);
                    }
                }, user);
        })
    }

    /**
     * Writes new meta-data to the canvas
     * @param {string} canvasID
     * @param {{title : string, lastEdited : number, type : string}} data
     * @param {function} callback
     * @param {*} [user]
     */
    updateCanvas(canvasID, data, callback, user){
        this.applyAssignments(
            extractAssignmentList(
                Object.keys(data),
                data
            ).map((assignment)=>Object.assign({},assignment,{path:"canvases."+canvasID+"."+assignment.path})),
            (error,result)=>{
                if((error!==undefined)&&(error.status!==200)){
                    callback(error,undefined);
                }else{
                    callback(error,data);
                }
            }, user);
    }

    /**
     * Writes an entry to the entryID
     * @param {string} canvasID
     * @param {string} buildingBlock
     * @param {string} entryID
     * @param {{content : *, type : string}} data
     * @param {function} callback
     * @param {*} [user]
     */
    updateEntry(canvasID, buildingBlock, entryID, data, callback, user){
        this.applyAssignments(
            extractAssignmentList(
                Object.keys(data),
                data
            ).map((assignment)=>Object.assign({},assignment,{path:"canvases."+canvasID+".buildingBlocks."+buildingBlock+".entries."+entryID+"."+assignment.path}))
            ,(error,result)=>{
                if((error!==undefined)&&(error.status!==200)){
                    callback(error,undefined);
                }else{
                    callback(error,data);
                }
            }, user);
    }

    /**
     * Deletes the canvas from the project
     * @param {string} canvasID
     * @param {function} callback
     * @param {*} [user]
     */
    deleteCanvas(canvasID, callback, user){
        this.applyChange("canvases."+canvasID,undefined,callback,user);
    }

    /**
     * Deletes the entry from the buildingBlock and thereby from the canvas and project.
     * @param {string} canvasID
     * @param {string} buildingBlock
     * @param {string} entryID
     * @param {function} callback
     * @param {*} [user]
     */
    deleteEntry(canvasID, buildingBlock, entryID, callback, user){
        this.applyChange("canvases."+canvasID+".buildingBlocks."+buildingBlock+".entries."+entryID,undefined,callback,user);
    }

    /**
     * Adds new collaborator to project
     * @param {string} userMail
     * @param {string} rights
     */
    addCollaborator(userMail, rights, callback) {
        this.dbManager.addCollaborator(this.id, userMail, rights, (err, res) => {
            if (err && err.status != 200) {
                return callback(err);
            }

            memberActions(this.store.dispatch).addMember(res.user, rights);
            callback(undefined);
        });
    }

    /**
     * New values of user with userID
     * @param {string} userMail
     * @param {string} rights
     */
    updateCollaborator(userMail, rights, callback) {
        this.dbManager.updateCollaborator(this.id, userMail, rights, (err, res) => {
            if (err && err.status != 200) {
                return callback(err);
            }
            
            memberActions(this.store.dispatch).updateMember(res.user, rights);
            callback(undefined);
        });
    }

    /**
     * Deletes collaborator from Project
     * @param {string} userMail
     */
    deleteCollaborator(userMail, callback) {
        this.dbManager.deleteCollaborator(this.id, userMail, (err, res) => {
            if (err && err.status != 200) {
                return callback(err);
            }

            memberActions(this.store.dispatch).deleteMember(res.user);
            callback(undefined);
        });
    }

    /**
     * Add entry in timeline
     * @param {string} tag 
     * @param {function} callback 
     */
    addTimelineEntry(tag, callback){
        this.dbManager.addTimelineEntry(this.id, tag, (err, res) => {
            if(err && err.status!=200){
                return callback(err);
            }
            timelineActions(this.store.dispatch).addEntry(res);
            callback(err,res);
        });
    }
    
    restoreStateFromTimelineEntry(stateID, callback) {
        let volatile=this.store.getState().volatile;
        if((Object.keys(volatile.locks).length+Object.keys(volatile.pendingLocks).length)!=0){
            callback({status: 423, message: "Cannot restore project, users are still currently using it."});
            return;
        }
        this.dbManager.restoreStateFromTimelineEntry(this.id, stateID, (err, restoredEntry, project) => {
            if (err && err.status !== 200) {
                callback(err, restoredEntry);
            }

            let stateModel = internalizeProject(project);
            timelineActions(this.store.dispatch).restoreState(stateModel);
            console.log(">>> Restoring: ", stateModel);

            callback(err, restoredEntry);
        });
    }

    /*importCanvas(canvas,callback){
        let newCanvas=internalize(canvas,"canvas")
        this.applyChange(`canvases.${newCanvas._id}`, newCanvas, (err, result) => {
            if (err && err.status !== 200) {
                callback(err);
            } else {
                callback(err, newCanvas);
            }
        })
    }*/

    /**
     * 
     * @param {{target: any, type: string, additionalData: [any]}} importObj
     * @param {function} callback
     * @param {any} [user]
     * @param {function} [performAssignment] The function to use for the assignments. If not specified, uses this.applyAssignmets
     */
    importObject(importObj, callback, user, performAssignments){
        if(performAssignments===undefined){
            performAssignments=(assignments)=>this.applyAssignments(assignments,callback,user);
        }
        //console.log("ImportObject: ",importObj);
        switch(importObj.type){
            case "entry":{
                let internalEntry=inflation.inflateEntry(importObj.target);
                let canvasID=importObj.additionalData.canvasID;
                let buildingBlockID=importObj.additionalData.buildingBlockID;
                let path="canvases."+canvasID+".buildingBlocks."+buildingBlockID+".entries."+internalEntry._id;
                if(canvasID===undefined) throw new Error("CanvasID cannot be undefined!");
                if(buildingBlockID===undefined) throw new Error("BuildingBlockID cannot be undefined!");
                performAssignments([createAssignment(path,internalEntry)]);
            }
            break;
            case "canvas":{
                let internalCanvas=inflation.inflateCanvas(importObj.target);
                if(internalCanvas._id===undefined) throw new Error("Canvas._id cannot be undefined!");
                performAssignments([createAssignment("canvases."+internalCanvas._id,internalCanvas)]);
            }
            break;
            case "tag":{
                let internalTag = inflation.inflateTag(importObj.target);
                if(internalTag._id===undefined) throw new Error("Tag._id cannot be undefined!");
                performAssignments([createAssignment("tags."+internalTag._id,internalTag)]);
            }
            case "combined":{
                let assignments=[];
                let errored=false;
                importObj.target.forEach((subObj)=>this.importObject(subObj,(error,result)=>{
                    if(errored) return;
                    if((error!==undefined)&&(error.status!==200)){
                        errored=true;
                        callback(error);
                    }
                },user,(newAssignments)=>assignments.push(...newAssignments)));
                if(errored===false){
                    performAssignments(assignments);
                }
            }
            break;
            default: throw new Error("Unknown type: ",importObj.type);
        }
    }

    /*importEntry(canvasID,buildingBlock,entry,callback,additionalData={}){
        let newEntry=internalize(entry,"entry");
        this.applyChange("canvases."+canvasID+".buildingBlocks."+buildingBlock._id+".entries."+entry._id,entry,(error,result)=>{

            if((error!==undefined)&&(error.status!==200)){
                callback(error,undefined);
            }else{
                callback(error,entry,additionalData);
            }
        })
    }*/
}

function createImportObject(target,type,additionalData){
    return {target,type,additionalData};
}

function createCombinedImportObject(...importObjs){
    return createImportObject(importObjs, "combined");
}


function internalizeProject(target){
    if(target["_doc"]!==undefined){
        console.warn("Doc is not undefined!");
        target=target["_doc"];
    }
    let newCanvases=inflation.inflateCanvases(target.persistent.canvases)
    let newTags=inflation.inflateTags(target.persistent.tags)
    let newMembers={};
    target.members.forEach((member)=>{
        if(member.userID===undefined) throw new Error("member.userID cannot be undefined!");
        newMembers[member.userID]=member
    });
    let newModel=Object.assign({},target,EmptyDefaultState);
    newModel.persistent=Object.assign({},(newModel.persistent),{canvases:newCanvases,members:newMembers,tags:newTags});
    return newModel;
}

function externalizeProject(target){
    let newCanvases=inflation.flattenCanvases(target.persistent.canvases);
    let newTags=inflation.flattenTags(target.persistent.tags);
    let newMembers=Object.values(target.persistent.members);
    let newModel=Object.assign({},target,{members:newMembers,persistent:{...target.persistent,canvases:newCanvases,tags:newTags}});
    delete newModel.volatile;
    newModel.title = target.persistent.title || target.title;
    newModel.description = target.persistent.description || target.description;
    newModel.visibility = target.persistent.visibility || target.visibility;
    newModel.timeline = target.persistent.timeline || target.timeline;
    return newModel;
}