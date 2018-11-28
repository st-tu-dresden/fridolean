/**
 * Cleanup actions are used to remove paths from a pending-list.
 * They are usually fired by network functions once an assignment has been relayed to the target and can be removed from the pending-list.
 * @typedef {{type:"cleanup", delta:?(string[])}} CLEANUP_ACTION
 * @see createCleanupAction
 */
export const TYPE_CLEANUP="cleanup";
/**
 * DirtyAssign actions are used to apply assignments to the value-substate and mark the modified paths as "pending" (= add the paths to the pending-list).
 * These actions are usually fired locally on the server when an assignment is recieved from a client. This applies the assignment to 
 * the state and adds its paths to the pending-list to inform the network-listeners of the required broadcast.
 * @typedef {{path:string, value}} assignment
 * @typedef {{type:"dirtyAssignment", assignments:assignment[]}} DIRTYASSIGN_ACTION
 * @see createDirtyAssignAction
 * @see TYPE_CLEANASSIGN
 */
export const TYPE_DIRTYASSIGN="dirtyAssignment";
/** @constant {string} "dirtyInfo"
 * DirtyInfo actions can be used to notify the pending-list of external changes. The values of paths are added to the pending-list.
 * Note that this behaviour can also be achieved as a side-effect of any action by adding a "changed:string[]"-field to the action.
 * @typedef {{type:"dirtyInfo", paths:string[]}}  DIRTYINFO_ACTION
 * @see createDirtyInfoAction
 */
export const TYPE_DIRTYINFO="dirtyInfo";
/**
 * CleanAssign actions are used to apply assignments to the value-substate and remove the modified paths from "pending" (if they were still in there).
 * This type of Assignment-Action does explicitly not add the paths to the pending-list, 
 * which makes it ideal for uses like assigning values recieved from the server (which should obviously not be relayed back to the server).
 * @typedef {{type:"cleanAssignment", assignments:Array.<assignment>}} CLEANASSIGN_ACTION
 * @see createCleanAssignAction
 * @see TYPE_DIRTYASSIGN
 */
export const TYPE_CLEANASSIGN="cleanAssignment";

/**
 * @param {string[]} [delta] The strings that should be removed from "pending". If not supplied, remove everything.
 * @returns {CLEANUP_ACTION}
 * @see TYPE_CLEANUP
 */
export const createCleanupAction=(delta)=>{
    if(delta===undefined)
        return {type:TYPE_CLEANUP};
    else
        return {type:TYPE_CLEANUP, delta: delta};
}

/**
 * @param {assignment[]} assignments The assignments which should be applied to the values-substate and whose paths should be removed from "pending".
 * @returns {CLEANASSIGN_ACTION}
 * @see TYPE_CLEANSSIGN
 */
export const createCleanAssignAction=(assignments)=>{
    return {type:TYPE_CLEANASSIGN, assignments:assignments};
}
/**
 * @method
 * @param {assignment[]} assignments  The assignments which should be applied to the values-substate and whose paths should be added to "pending".
 * @returns {DIRTYASSIGN_ACTION}
 * @see TYPE_DIRTYASSIGN
 */
export const createDirtyAssignAction=(assignments)=>{
    return {type:TYPE_DIRTYASSIGN, assignments:assignments};
}
/**
 * @deprecated Use action.changed:string[] instead
 * @param {string[]} paths The paths which should be added to the pending-list.
 * @returns {DIRTYINFO_ACTION}
 * @see TYPE_DIRTYINFO
 */
export const createDirtyInfoAction=(paths)=>{
    return {type:TYPE_DIRTYINFO, paths:paths};
}