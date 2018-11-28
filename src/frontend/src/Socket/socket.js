import {EVENT_ASSIGNMENT} from '../common/event';
import {createCleanAssignAction,createCleanupAction} from '../common/pending-actions'
import {} from '../common/reducers'
import {extractAssignmentList} from '../common/assignment'

export function bindClient(socket, dispatch, getState, subscribe){
    function onAssignment(assignments){
      dispatch(createCleanAssignAction(assignments));
    }
    socket.on(EVENT_ASSIGNMENT,onAssignment);
    //socket.on(EVENT_LOCKINFO, (data)=>console.log("lockinfo: ",data));
    let listener=()=>{
      let state=getState();
      if(state.volatile.pending.length>0){
        let assignList=extractAssignmentList(state.volatile.pending,state.persistent);
        socket.emit(EVENT_ASSIGNMENT, assignList, (correctionList)=>{
          if(correctionList.length>0){
            console.log("Assign-Fix-response: ",correctionList);
            dispatch(createCleanAssignAction(correctionList));
          }
        })
        dispatch(createCleanupAction(state.volatile.pending));
      }
    };
    let unsubListener=subscribe(listener);
    socket.on("disconnect",()=>{
      unsubListener();
      console.warn("Listener unsubscribed");
    });

}
