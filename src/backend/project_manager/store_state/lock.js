import {createReducerType, createReducerTypeMapping, ReducerError} from '../../common/reducers'
import {EVENT_LOCKINFO} from '../../common/event'

const uuidv1 = require('uuid/v1');

export const TYPE_LOCKSCHEDULED="lockScheduled";
export const TYPE_LOCKTIMEOUT="lockTimeout";
export const TYPE_LOCKRELEASE="lockReleased";
export const TYPE_ADDLOCK="lockAddToPending";

const timeoutDuration=process.env.lockDuration||3000;
const scheduleLimit=200;


export function lockReducer(state={locks:{},pendingLocks:{}},action){
    let locks=state.locks;
    let newLocks;
    let newPendingLocks;
    var index;
    switch(action.type){
        case TYPE_LOCKTIMEOUT:
            newLocks=Object.assign({},locks);
            for(index=0;index<action.locks.length;index++){
                let lock=action.locks[index];
                if(locks[lock.field]===undefined){
                    //console.log("could not find lock!",locks[lock.field]);
                    continue;
                }
                if(locks[lock.field].uuid===lock.uuid){
                    delete newLocks[lock.field];
                }
            }
            return {locks:newLocks};
        case TYPE_LOCKSCHEDULED:
            newPendingLocks=Object.assign({},state.pendingLocks);
            newLocks=Object.assign({},state.locks);
            let promoteLocks=Object.values(action.locks).filter((el)=>{
                if(locks[el.field]!==undefined){
                    if(locks[el.field].uuid!==el.uuid){
                        if(locks[el.field].owner!==el.owner){
                            //console.log("Privilige missing (uuid + owner missmatch)");
                            return false;
                        }
                    }
                }
                if(state.pendingLocks[el.field]===undefined){
                    //console.log("Nothing to promote!")
                    return false;
                }
                if(state.pendingLocks[el.field].uuid===el.uuid) return true;
                if(state.pendingLocks[el.field].owner===el.owner) return true;
                else{
                    //console.log("Missmatch:")
                    //console.log(state.pendingLocks[el.field])
                    //console.log(el);
                    return false;
                }
            })
            //console.log("Promote-locks: ");
            //console.log(promoteLocks);
            for(index=0;index<promoteLocks.length;index++){
                let lock=promoteLocks[index];
                newLocks[lock.field]=lock;
                delete newPendingLocks[lock.field];
            }
            return {locks:newLocks,pendingLocks:newPendingLocks};
        case TYPE_LOCKRELEASE:
            let delta=action.locks;
            newPendingLocks=Object.assign({},state.pendingLocks);
            newLocks=Object.assign({},locks);
            for(index=0;index<delta.length;index++){
                let lock=delta[index];
                if(newPendingLocks[lock.field]!==undefined){
                    if(newPendingLocks[lock.field].uuid===lock.uuid)
                        delete newPendingLocks[lock.field];
                }
                if(newLocks[lock.field]!==undefined){
                    if(newLocks[lock.field].uuid===lock.uuid)
                        delete newLocks[lock.field];
                }
            }
            return {locks:newLocks, pendingLocks:newPendingLocks};
        case TYPE_ADDLOCK:
            let lock=action.lock;
            if(locks[lock.field]!==undefined){
                if(locks[lock.field].owner===undefined){
                    action.success=false;
                    return state;
                }else{
                    if(locks[lock.field].owner!==lock.owner){
                        action.success=false;
                        return state;
                    }
                }
            }
            let pendingLocks=state.pendingLocks;
            if(pendingLocks[lock.field]!==undefined){
                if(pendingLocks[lock.field].owner===undefined){
                    action.success=false;
                    return state;
                }else{
                    if(pendingLocks[lock.field].owner!==lock.owner){
                        action.success=false;
                        return state;
                    }
                }
            }
            action.success=true;
            return {pendingLocks:Object.assign({},pendingLocks,{[lock.field]:lock})};
        default:
            if(action.locking!==undefined){
                newLocks=action.locking;
                if((typeof newLocks)==="string"){
                    newLocks=[createLock(newLocks)];
                }
                let newState=Object.assign({},state);
                for (var lockIndex = 0; lockIndex < newLocks.length; lockIndex++) {
                    var lock = newLocks[lockIndex];
                    if((typeof lock)==="string"){
                        lock=createLock(lock);
                    }
                    let addAction=createAddLockAction(lock);
                    newState=Object.assign(newState,lockReducer(newState,addAction));
                    if(addAction.success!==true){
                        action.success=false;
                        throw ReducerError("Could not obtain lock: "+lock);
                    }
                }
                if(action.success===undefined)
                    action.success=true;
                return newState;
            }
    }
    return state;
}

export const typedLockReducer=createReducerTypeMapping(
    lockReducer,
    "volatile",
    createReducerType(TYPE_LOCKSCHEDULED, "locks", "pendingLocks"),
    createReducerType(TYPE_LOCKTIMEOUT, "locks"),
    createReducerType(TYPE_LOCKRELEASE, "locks", "pendingLocks"),
    createReducerType(TYPE_ADDLOCK, "pendingLocks"),
    createReducerType((action)=>action.locking!==undefined, "pendingLocks")
);

export function createLockScheduledAction(scheduledLocks){
    return {type:TYPE_LOCKSCHEDULED,locks:scheduledLocks}
}

export function createLockTimeoutAction(locks){
    return {type:TYPE_LOCKTIMEOUT, locks};
}

export function createLockReleaseAction(locks){
    return {type:TYPE_LOCKRELEASE, locks};
}

export function createAddLockAction(lock){
    return {type:TYPE_ADDLOCK, lock}
}

export const createLockScheduler=(store,
    lookup={
        locks:(s)=>s.volatile.locks,
        pendingLocks:(s)=>s.volatile.pendingLocks})=>(()=>{
    let state=store.getState();
    let locks=lookup.locks(state);
    let pendingLocks=lookup.pendingLocks(state);
    if((pendingLocks===undefined)||(Object.keys(pendingLocks).length===0)) return;
    let result={};
    let pendingLockValues=Object.values(pendingLocks);
    let size=pendingLockValues.length;
    if(size>scheduleLimit) size=scheduleLimit;
    for (var index = 0; index < size; index++) {
        let lock = pendingLockValues[index];
        if(locks[lock.field]!==undefined){
            //console.log("Preventing callback: ")
            //console.log(locks[lock.field].timerRef);
            preventCallback(locks[lock.field]);
        }
        let timerRef = setTimeout(unlock, timeoutDuration, store.dispatch, lock);
        result[lock.field]=(Object.assign({},lock,{timerRef}));
    }
    //console.log("scheduling locks:",result);
    store.dispatch(createLockScheduledAction(result));
})

export const createLockBroadcastListener=(store,
    lookup={
        clients:(s)=>s.volatile.activeClients,
        locks:(s)=>s.volatile.locks,
        pendingLocks:(s)=>s.volatile.pendingLocks})=>{
    let previousLockInfo={};
    return ()=>{
        let state=store.getState();
        let clients=lookup.clients(state);
        let generatedLocks={};
        let locksObject=lookup.locks(state);
        let pendingLocksObject=lookup.pendingLocks(state);
        let locks=Object.values(locksObject);
        let pendingLocks=Object.values(pendingLocksObject);
        let combinedLocks=Object.assign({},pendingLocksObject,locksObject);
        {
            let previousKeys=Object.keys(previousLockInfo);
            if(previousKeys.length===Object.keys(combinedLocks).length){
                let hasDifference=previousKeys.some((key)=>{
                    if(combinedLocks[key]===undefined)
                        return true;
                    let owner=combinedLocks[key].owner;
                    if(owner!==undefined){
                        return owner!==previousLockInfo[key].owner;
                    }
                    return combinedLocks[key].uuid!==previousLockInfo[key].uuid;
                });
                if(!hasDifference){
                    return;
                }
            }
            previousLockInfo=combinedLocks;
        }
        for (var pIndex = 0; pIndex < pendingLocks.length; pIndex++) {
            var pendingLock = pendingLocks[pIndex];
            generatedLocks[pendingLock.field]=pendingLock.owner;
        }
        for(var lIndex=0; lIndex< locks.length; lIndex++){
            var lock=locks[lIndex];
            generatedLocks[lock.field]=lock.owner;
        }
        //console.log("Emitting lock-info: ",generatedLocks);
        for(var cIndex=0; cIndex< clients.length; cIndex++){
            var client=clients[cIndex];
            client.emit(EVENT_LOCKINFO, {locks: generatedLocks, self: client.user.userID});
        }
    }
}

function unlock(dispatch, lock){
    dispatch(createLockTimeoutAction([lock]));
}

function preventCallback(lock){
    clearTimeout(lock.timerRef);
}

export function createLock(field, owner=undefined, uuid=undefined){
    if(uuid===undefined) uuid=uuidv1();
    if(owner===undefined) {
        console.warn("lock '"+field+"' doesn't have an owner!");
        return {field, uuid};
    }
    else return {field, owner, uuid};
}
