import {EVENT_INIT} from '../common/event'
import {manager} from '../project_manager/manager'
import {SocketProjectManager} from '../project_manager/socket_manager'
import {createClientSubscribeAction, bindClientListener} from '../project_manager/store_state/client'
import {loadClientObject} from './user'
import {connection} from '../project_manager/database';
const socketIO = require('socket.io');

const checkUserID=true;

export function socketStart(server){
    let socketServer=socketIO(server);
    socketServer.on("connection",onConnection);
}

export function onConnection(socket){
    socket.once(EVENT_INIT,(data,callback)=>{
        let projectID=data.id;
        let userID=data.userID;//TODO: validate/filter!!!
        let token=data.token;
        console.log("UserID: ",userID)

        loadClientObject(socket, userID, token, (error2,clientObj)=>{
            if((error2!==undefined)&&(error2.status!==200)){
                console.error("Error to client: ",error2);
                callback(error2);
                return;
            }
            console.log("Clientobj userID: ",clientObj.user.userID);
            connection.checkReadAccess(projectID, clientObj.user.userID, (readResult)=>{
                if(readResult&&(readResult.status!==200)){
                    console.error("Error to client: ",readResult);
                    callback(readResult);
                    return;
                }
                connection.checkEditAccess(projectID,clientObj.user.userID, (editResult)=>{
                    let hasWriteAccess=!(editResult&&(editResult.status!==200));
                    console.log("Edit-result: ",editResult);
                    manager.getSocketProject(projectID,(error,projectManager)=>{
                        if((error!==undefined)&&(error.status!==200)){
                            console.error("Error to client: ",error);
                            callback(error);
                            return;
                        }
                        if(!(projectManager instanceof SocketProjectManager)){
                            callback({status: 500, message: "Error during project-loading"});
                            console.error(projectManager);
                            throw new Error("ProjectManager is not a SocketProjectManager");
                        }else
                            console.log("SocketManager loaded successfully!");
                        //console.log("Project: ",project);
                        callback(undefined,transformInitState(projectManager.state),(hasWriteAccess?'EDIT':'READ'));
                        let action=createClientSubscribeAction(clientObj);
                        let firstClient=false;
                        if(projectManager.store.getState().volatile.activeClients.length===0){
                            firstClient=true;
                        }
                        projectManager.store.dispatch(action);
                        if((action.success===false)||((action.error!==undefined)&&(action.success!==true))){
                            console.log("Subscribe error: ",action.error);
                            if(action.error!==undefined)
                                socket.emit("subscribeError",action.error);
                            else
                                socket.emit("subscribeError");
                            socket.disconnect();
                            return;
                        }
                        projectManager.onFirstUserConnect.forEach((func)=>func());
                        //console.log("Binding client listener");
                        let invokeOnLastUser=()=>projectManager.onLastUserDisconnect.forEach((func)=>func());
                        bindClientListener(projectManager.store,clientObj,false,projectManager.getTransforms(),invokeOnLastUser);
                        clientObj.on("Add_Entry",(data,callback)=>{
                            let canvasID=data.canvasID;
                            let buildingBlock=data.buildingBlock;
                            let entry = data.entry;
                            projectManager.createEntry(canvasID,buildingBlock,entry,(err,res)=>{
                                if((err!==undefined)&&(err.status!==200)){
                                    console.error("Entry-Create-Error: ",err);
                                    callback();
                                }else{
                                    callback(res[0].value._id);
                                }

                            },clientObj.user.userID);
                        });
                    });
                });
            });
        });
    });
}

function transformInitState(reduxState){
    //console.log("Transforming reduxState: ",reduxState);
    let result=Object.assign({},reduxState);
    result.volatile={locks:{}};
    Object.values(reduxState.volatile.locks).forEach((lock)=>{
        let lockList=result.volatile.locks[lock.owner];
        if(lockList===undefined) lockList=[];
        lockList=[...lockList,lock.field]
        result.volatile.locks[lock.owner]=lockList;
    })
    return result;
}
