import {createCleanupAction,TYPE_CLEANASSIGN,TYPE_CLEANUP,TYPE_DIRTYASSIGN,TYPE_DIRTYINFO} from '../../common/pending-actions';
import {extractAssignmentList,applyAssignmentList} from '../../common/assignment'
import {EVENT_ASSIGNMENT} from '../../common/event'
import {typedPendingReducer} from '../../common/reducers'

export const createPendingListener=(getState,dispatch)=>(()=>{
    let state=getState();
    let pending=state.volatile.pending;
    if(Object.keys(pending).length>0){
        let assignmentList=extractAssignmentList(Object.keys(pending),state.persistent)
        let clients=state.volatile.activeClients;
        clients.forEach((client)=>{
            let personalAssignments=assignmentList.filter((assignment)=>pending[assignment.path]!==client.id);
            if(personalAssignments.length>0){
                client.emit(EVENT_ASSIGNMENT,personalAssignments);
            }
        });
        dispatch(createCleanupAction(pending));
    }});

export const serverPendingReducer=(state,action)=>{
    let newPending;
    let newValue;
    switch(action.type){
        case TYPE_CLEANUP:
            if(action.delta===undefined)
                newPending={};//Clean everything
            else{
                newPending=Object.assign({},state.volatile.pending);
                Object.keys(action.delta).forEach((key)=>{
                    delete newPending[key];
                });
            }
            return {volatile:{pending: newPending}};
        case TYPE_CLEANASSIGN:
            newValue = applyAssignmentList(Object.assign({},state.persistent),action.assignments);
            let usedKeys = action.assignments.map((assign)=>assign.path);  //extracts the used keys from the assignment-list
            newPending = Object.assign({},state.volatile.pending);
            usedKeys.forEach((key)=>{
                delete newPending[key];
            });
            //newPending = state.volatile.pending.filter((oldPaths)=>usedKeys.every((usedPaths)=>usedPaths!==oldPaths));//cleans assigned values from the pending-list
            return {volatile: {pending:newPending}, persistent: newValue};
        case TYPE_DIRTYINFO:
            newPending= Object.assign({},state.volatile.pending);
            let paths=action.paths;
            if((typeof paths)=="string") paths=[paths]; 
            if(action.dirtySource!==undefined){
                paths.forEach((path)=>{
                    let prevSource=newPending[path];
                    if(prevSource===null) return;
                    if(prevSource===undefined){
                        newPending[path]=action.dirtySource;
                    }else if(prevSource!==action.dirtySource){
                        newPending[path]=null;
                    }
                });
            }else{
                paths.forEach((path)=>{
                    newPending[path]=null;
                });
            }
            return {volatile: {pending: newPending}};
        case TYPE_DIRTYASSIGN:
            let assignments=action.assignments;
            newValue=applyAssignmentList(Object.assign({},state.persistent),assignments);
            newPending= Object.assign({},state.volatile.pending);
            assignments.forEach((assignment)=>{
                let path=assignment.path;
                let dirtySource=action.dirtySource||assignment.dirtySource;
                let prevSource=newPending[path];
                if(prevSource===null) return;
                if(prevSource===undefined){
                    newPending[path]=dirtySource;
                }else if(prevSource!==dirtySource){
                    newPending[path]=null;
                }
            });
            return {persistent: newValue, volatile:{pending: newPending}};
        default:
            if(action.changed!==undefined){
                newPending= Object.assign({},state.volatile.pending);
                let changed=action.changed;
                if((typeof changed)=="string") changed=[changed]; 
                if(action.dirtySource!==undefined){
                    changed.forEach((path)=>{
                        let prevSource=newPending[path];
                        if(prevSource===null) return;
                        if(prevSource===undefined){
                            newPending[path]=action.dirtySource;
                        }else if(prevSource!==action.dirtySource){
                            newPending[path]=null;
                        }
                    });
                }else{
                    changed.forEach((path)=>{
                        newPending[path]=null;
                    });
                }
                return {volatile: {pending: newPending}};
            }
            return state;
    }
}

export const typedServerPendingReducer=Object.assign({},typedPendingReducer,{reducer:serverPendingReducer});