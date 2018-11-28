import {composeReducersByType} from '../../common/reducers'
import {typedServerPendingReducer} from './pending'
import {typedLockReducer, createLockBroadcastListener, createLockScheduler} from './lock'
import {typedClientSubscriptionReducer} from './client'
import {typedMemberReducer} from './meta'
import {typedTimelineReducer} from './timeline'
import {createPendingListener} from './pending'
import {createStore} from 'redux'

export const EmptyDefaultState={
  volatile:{locks:{},pendingLocks:{},activeClients:[],pending:[]}
}
/**
 * @param {*} initialState
 * @param {boolean} [initialPass]
 */
export function createReducer(initialState,initialPass){
    if(initialPass===undefined){
        initialPass=(initialState===undefined);
    }
    return composeReducersByType(
        initialState,
        initialState===undefined,
        typedServerPendingReducer,
        typedLockReducer,
        typedClientSubscriptionReducer,
        typedMemberReducer,
        typedTimelineReducer,
    );
}

export const defaultReducer=createReducer(undefined,false);

export function createTypedStore(initialState, useCustomReducer=false){
    let reducer=defaultReducer;
    if(useCustomReducer){
        reducer=createReducer(initialState,false);
    }
    let store=createStore(reducer,initialState);
    store.subscribe(createLockScheduler(store));
    store.subscribe(createLockBroadcastListener(store));
    store.subscribe(createPendingListener(()=>store.getState(),(...args)=>store.dispatch(...args)));
    //store.subscribe(()=>console.log("\n\tCanvas:\n\t",store.getState().persistent.canvases[Object.keys(store.getState().persistent.canvases)[0]].buildingBlocks));
    return store;
}
