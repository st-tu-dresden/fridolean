import {EVENT_ASSIGNMENT, EVENT_QUERYLOCK, EVENT_REQUESTLOCK, EVENT_RELEASELOCK} from '../../common/event';
import {createCleanAssignAction, createDirtyAssignAction} from '../../common/pending-actions';
import {createReducerType, createReducerTypeMapping} from '../../common/reducers';
import {createLockReleaseAction, createAddLockAction, createLock} from './lock'
import {extractAssignmentList} from '../../common/assignment'
import {applyAssignmentTransform} from './assignment_middleware'
export const TYPE_CLIENTSUBSCRIBE="clientSubscribe";
export const TYPE_CLIENTUNSUBSCRIBE="clientUnsubscribe";
const verbose=false;

export function clientSubscriptionReducer(clients=[], action){
    if(action.type===undefined) return clients;
    switch(action.type){
        case TYPE_CLIENTSUBSCRIBE:
            if(verbose) console.log("Subsc: "+JSON.stringify(action.client.id));
            //console.log("old clients: "+JSON.stringify(clients.map((client)=>client.id)));
            return [...(clients),action.client];//adds the client to clients[]
        case TYPE_CLIENTUNSUBSCRIBE:
            if(verbose) console.log("Unsub: "+action.client.id);
            //console.log("Clients before unsub: ",clients);
            return clients.filter((client)=>action.client!==client);//removes the client from clients[]
        default:
            return clients;
    }
}


export const typedClientSubscriptionReducer=createReducerTypeMapping(
    clientSubscriptionReducer,
    "volatile.activeClients",
    createReducerType(TYPE_CLIENTSUBSCRIBE, ""),
    createReducerType(TYPE_CLIENTUNSUBSCRIBE, "")
);

//creates a listener which will dispatch incoming events
export function bindClientListener(store,client,clean=false,transforms={},invokeOnLastUser){
    let assignmentTransforms=transforms.assignment||[];
    let lockingTransforms=transforms.locking||[];
    client.on(EVENT_ASSIGNMENT,(assignmentList, callback)=>{
        assignmentList=assignmentList.map((assignment)=>Object.assign({dirtySource:client.id},assignment));
        assignmentList=applyAssignmentTransform(()=>store.getState(),assignmentList,...assignmentTransforms);
        if(verbose) console.log("Updte: " + client.id,assignmentList);
        let member=store.getState().persistent.members[client.user.userID];
        if((member)&&((member.rights)==='EDIT')){
            let assignAction;
            if(clean)
                assignAction=createCleanAssignAction(assignmentList);
            else
                assignAction=createDirtyAssignAction(assignmentList);
            let lockingPaths=applyAssignmentTransform(()=>store.getState(),assignmentList.map((assign)=>assign.path),...lockingTransforms);
            let locks=lockingPaths.map((path)=>createLock(path, client.user.userID));
            assignAction.locking=locks;
            store.dispatch(assignAction);
            if((callback!==undefined)&&((typeof callback)==="function")){
                if(assignAction.success===true){
                    callback([]);
                }else{
                    callback(extractAssignmentList(assignmentList.map((assign)=>assign.path),store.getState().persistent));
                }
            }
        }else{
            if((callback!==undefined)&&((typeof callback)==="function")){
                callback(extractAssignmentList(assignmentList.map((assign)=>assign.path),store.getState().persistent));
            }
        }
    });
    client.on("disconnect",()=>{
        if(verbose) console.log("Disco: "+client.id);
        let isLast=false;
        if(store.getState().volatile.activeClients.length<=1){
            isLast=true;
        }
        store.dispatch({type: TYPE_CLIENTUNSUBSCRIBE, client: client});
        if(isLast)
            invokeOnLastUser();
    });
    client.on(EVENT_QUERYLOCK,(data,callback)=>{
        let state=store.getState();
        let locks=state.volatile.locks;
        let pendingLocks=state.volatile.pendingLocks;
        if(data.field!==undefined){
            if(locks[data.field]!==undefined){
                let owner=locks[data.field].owner;
                if(owner!==undefined)
                    callback({field:data.field,ownerID:owner.userID, owner:owner.username, free:client.user===owner});
                else
                    callback({field:data.field, free:false});
            }else if(pendingLocks[data.field]!==undefined){
                let owner=pendingLocks[data.field].owner;
                if(owner!==undefined)
                    callback({field:data.field,ownerID:owner.userID, owner:owner.username, free:client.user===owner});
                else
                    callback({field:data.field, free:false});
            }else{
                callback({field:data.field, free:true});
            }
        }else{
            let result;
            result=(Object.values(locks).map((value)=>{
                if(value.owner!==undefined)
                    return {field:value.field,ownerID:value.owner.userID, owner:value.owner.username}
                else
                    return {field:value.field};
            }));
            result=[...result,...(Object.values(pendingLocks).map((value)=>{
                if(value.owner!==undefined)
                    return {field:value.field,ownerID:value.owner.userID, owner:value.owner.username}
                else
                    return {field:value.field};
            }))];
            callback(result);
        }
    });
    client.on(EVENT_REQUESTLOCK,(data,callback)=>{
        let addLockAction=createAddLockAction(data.lock);
        store.dispatch(addLockAction);
        if((addLockAction.success===true)||(addLockAction.success===false))
            callback(addLockAction.success);
        else
            callback(new Error("Invalid locking-result: "+addLockAction.success));
    });
    client.on(EVENT_RELEASELOCK,(data)=>{
        let state=store.getState().volatile;
        let locks=data.locks;
        let filteredLocks=[];
        if(locks!==undefined){
            for(var index=0;index<locks.length;index++){
                let lock=locks[index];
                if(state.pendingLocks[lock.field]!==undefined){
                    if(state.pendingLocks[lock.field].owner===client.user){
                        filteredLocks.push(state.pendingLocks[lock.field]);
                    }
                }
                if(state.locks[lock.field]!==undefined){
                    if(state.lock[lock.field].owner===client.user){
                        filteredLocks.push(state.locks[lock.field]);
                    }
                }
            }
        }else{
            filteredLocks=Object.values(state.pendingLocks).filter((lock)=>lock.owner===client.user);
            filteredLocks=[...filteredLocks,Object.values(state.locks).filter((lock)=>lock.owner===client.user)];
        }
        store.dispatch(createLockReleaseAction(filteredLocks));
    })
}

export const createClientSubscribeAction=(client)=>({type: TYPE_CLIENTSUBSCRIBE, client: client});

export const createClientObject=(socket,user)=>({
    emit: (...args)=>socket.emit(...args),
    on: (...args)=>socket.on(...args),
    once: (...args)=>socket.once(...args),
    removeListener:(...args)=>socket.removeListener(...args),
    removeAllListeners:(...args)=>socket.removeAllListeners(...args),
    disconnect:(...args)=>socket.disconnect(...args),
    id: socket.id, //!!! socket.id is different from userID!!! (Multiple sockets to/from the same User)
    user})
export const createUserObject=(username,userID)=>{
    if((!userID)&&(!username))
        return {isGuest: true};
    else
        return {username, userID, isGuest: false};
}
