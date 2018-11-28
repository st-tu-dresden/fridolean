import {SocketProjectManager} from './socket_manager'
import {DatabaseProjectManager} from './dbproject_manager'
import {connection} from './database'
import {validAssignmentTransform, linkingEntryVPCNameTransform,entryLockTransform,VPCDeletionToEntryDeletionTransform, BMCCanvasDeletionTransform, VPEntryDeletionTransform} from './store_state/assignment_middleware'

const defaultAssignmentTransform={assignment:[validAssignmentTransform, linkingEntryVPCNameTransform, VPCDeletionToEntryDeletionTransform, BMCCanvasDeletionTransform, VPEntryDeletionTransform],locking:[entryLockTransform]};
const socketUnloadTimeout=process.env.socketUnloadTime||60000;
/**
 * The projects-manager class.
 * Responsible for managing projects.
 * (Provide Read/Write access to loaded (socket-server) and unloaded (DB) projects)
 */
class RootManager{
    constructor(dbConnection){
        /**
         * Stores the SocketProjectManagers
         * @type {Object.<String,SocketProjectManager>}
         */
        this.projects={};
        /**
         * Stores the callback list for projects which are currently being loaded.
         * @type {Object.<String,Function[]}
         */
        this.loadingProjects={};
        this.dbConnection=dbConnection;
        this.timerRef=null;
        //this.startBackupTimer(2000);
    }

    getSocketProject(id,callback){
        console.log("Retrieving socket manager ",id);
        var oldProj=this.projects[id];
        if(oldProj!==undefined){
            console.log("Previous manager found!");
            callback(undefined,oldProj);
            return;
        }
        var loadingProj = this.loadingProjects[id];
        if(loadingProj!==undefined){
            var ran=false;
            var safeCallback=(...args)=>{
                if(ran) return;
                ran=true;
                callback(...args);
            }
            loadingProj.push(safeCallback);
            if(this.loadingProjects[id]===undefined){
                oldProj=this.projects[id];
                if(oldProj!==undefined)
                    safeCallback(undefined,oldProj);
            }
            console.log("Enqueued to callbacks!");
            return;
        }else{
            this.loadingProjects[id]=[callback];
            this.dbConnection.readProject(id,
                function(error,state){
                    var loadingProjectCallbacks=this.loadingProjects[id];
                    if((error!==undefined)&&(error.status!==200)){
                        delete this.loadingProjects[id];
                        while(loadingProjectCallbacks.length>0){
                            loadingProjectCallbacks.shift()(error);
                        }
                        console.error("Error during project-loading: ",error)
                        return;
                    }
                    if(this.projects[id]!==undefined){
                        error=new Error("Threaderror: Duplicate socket-project-request");
                        delete this.loadingProjects[id];
                        while(loadingProjectCallbacks.length>0){
                            loadingProjectCallbacks.shift()(error);
                        }
                        throw error;
                    }
                    let manager=this.projects[id]=new SocketProjectManager(id,this.dbConnection,state,defaultAssignmentTransform);
                    delete this.loadingProjects[id];
                    //let manager=this.projects[id];
                    let projectUnloading=false;
                    manager.onFirstUserConnect.push(()=>{
                        if(manager.unloadTimer){
                            clearTimeout(manager.unloadTimer);
                            manager.unloadTimer=null;
                            console.log("cleared unload-timer");
                        }
                        projectUnloading=false;
                    })
                    manager.onLastUserDisconnect.push(()=>{
                        if(projectUnloading) return;
                        projectUnloading=true;
                        if(manager.unloadTimer) return;
                        if(!manager.valid) return;
                        manager.unloadTimer=setTimeout(()=>{
                            if(manager.store.getState().volatile.activeClients<1){
                                this.unloadProject(manager.getID());
                                console.log("project unloaded");
                            }else{
                                manager.unloadTimer=null;
                                projectUnloading=false;
                                console.log("project unloading aborted!");
                            }
                        },socketUnloadTimeout);
                        console.log("unload timer started!");
                    })
                    while(loadingProjectCallbacks.length>0){
                        loadingProjectCallbacks.shift()(undefined,manager);
                    }
                    console.log("Project-manager loaded successfully!");
            }.bind(this));
        }
    }

    getProject(id,callback){
        var socketProject=this.projects[id];
        if(socketProject!==undefined){
            callback(undefined,socketProject);
        }else{
            var loadingProject=this.loadingProjects[id];
            if(loadingProject!==undefined){
                loadingProject.push(callback);
            }else{
                callback(undefined,new DatabaseProjectManager(id, this.dbConnection));
            }
        }
    }

    unloadProject(id,callback){
        console.log("Unloading ",id);
        var oldProj=this.projects[id];
        if(oldProj===undefined) return false;
        oldProj.invalidate();
        oldProj.getStateModel((error,state)=>{
            if(error){
                if(callback instanceof Function)
                    return callback(error);
                else{
                    throw e;
                }
            }
            delete this.projects[id];
            this.dbConnection.pushProjectState(id,state.persistent, (e)=>{
                if((e!==undefined)&&(e.status!==200)){
                    if(callback instanceof Function)
                        callback(e);
                    else 
                        throw e;
                }else{
                    if(callback)
                        callback(undefined);
                }
            });
        });
        return true;
    }

    deleteProject(id,callback){
        if(! this.unloadProject(id,(error)=>{
            if((error!==undefined)&&(error.status!==200)) throw error;
            else{
                this.dbConnection.deleteProject(id, callback);
            }
        })){
            this.dbConnection.deleteProject(id, callback);
        }
    }

    /**
     * Starts the backup timer which will periodically save all socket-projects into the db.
     * @param {number} [interval=2000] The interval with which the timer should run in ms
     */
    startBackupTimer(interval=2000){
        if(this.timerRef!==null) stopBackupTimer();
        this.timerRef=setInterval(()=>{
            Object.entries(this.projects).forEach((entry)=>{
                entry[1].getStateModel((error,state)=>{
                    this.dbConnection.pushProjectState(entry[0],state.persistent,(e)=>{
                        if((e!==undefined)&&(e.status!==200)){
                            console.error("dbError: ",e);
                             throw e;
                            }
                    })
                })
            }, this);
        },interval);
    }
    /**
     * Stops the backup timer.
     */
    stopBackupTimer(){
        if(this.timerRef===null) return;
        clearInterval(this.timerRef);
        this.timerRef=null;
    }
}

export const manager = new RootManager(connection);
process.on("exit",()=>{
    manager.stopBackupTimer();
    let projects=[...Object.keys(manager.projects),...Object.keys(manager.loadingProjects)];
    projects.forEach((projectKey)=>manager.unloadProject(projectKey,(error)=>{
        if(error && (error.status!==200)) 
            console.error(error);
    }));
})
manager.startBackupTimer(2000);
