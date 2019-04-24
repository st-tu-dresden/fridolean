import {TYPE_CLEANUP, TYPE_DIRTYASSIGN, TYPE_CLEANASSIGN, TYPE_DIRTYINFO} from './pending-actions';
import {applyAssignmentList, pathAssign, readValue, copyValues, applyFunctions} from './assignment';

/**
 * Creates a new "Error"-Object (not actually a JS-Error, as those cannot be used as a baseclass?) with:
 * - type: "ReducerError"
 * - message: message
 * - isReducerError: true
 * @param {String} [message=""] The message of this "error".
 * @returns {{type:"ReducerError", message:string, isReducerError:true}}
 */
export const ReducerError=(message="")=>{
    return {type: "ReducerError", message, isReducerError:true};
}

const verbose=false;

/**
 * The reducer responsible for managing the "pending" state.
 * Note that TYPE_DIRTYINFO is optional. Attaching a "changed:string[]"-field to any action (except CLEANUP, CLEANASSIGN, DIRTYASSIGN) results in the same behaviour.
 * - Cleanup removes paths from pending. If cleanupaction.delta:string[] is defined, only those paths will be removed, otherwise the pending-list is cleared.
 * - Cleanassign performs assignments passed as assignment-list in cleanssignaction.assignments:assignment[] on state.values. All paths used in those assignments are removed from pending-list.
 * - Dirtyassign is just like Cleanassign, with the only difference that the assignment-paths are added to pending-list instead of removed.
 * - Dirtyinfo is the opposite of Cleanup - any path in dirtyinfoaction.paths:string[] (not optional!) will be added to the pending-list.
 * @param {{persistent:any, volatile.pending:string[]}} [state={value:{},pending:[]}] The previous state to use as a reduction-base.
 * @param {CleanupAction|CleanAssignAction|DirtyInfoAction|DirtyAssignAction} action The action that should be applied.
 * @returns {{value: any, pending:string[]}} The new state.
 * @see TYPE_CLEANUP
 * @see TYPE_CLEANASSIGN
 * @see TYPE_DIRTYASSIGN
 * @see TYPE_DIRTYINFO
 */
export const pendingReducer = (state={persistent:{},volatile:{pending:[]}},action)=>{
    if(action === undefined) return state;
    if(action.type === undefined) return state;
    let newPending;
    let newValue;
    switch(action.type){
        case TYPE_CLEANUP:
            if(action.delta===undefined)
                newPending=[];//Clean everything
            else
                newPending=state.volatile.pending.filter((el)=>!action.delta.includes(el));//Clean the keys contained in "delta"
            return {volatile:{pending: newPending}};
        case TYPE_CLEANASSIGN:
            newValue = applyAssignmentList(Object.assign({},state.persistent),action.assignments);
            let usedKeys = action.assignments.map((assign)=>assign.path);  //extracts the used keys from the assignment-list
            newPending = state.volatile.pending.filter((oldPaths)=>usedKeys.every((usedPaths)=>usedPaths!==oldPaths));//cleans assigned values from the pending-list
            return {volatile: {pending:newPending}, persistent: newValue};
        case TYPE_DIRTYINFO:
            if(state.volatile.readonly===true)
                throw ReducerError(`Attempted '${TYPE_DIRTYINFO}' in readonly-mode (paths: ${JSON.stringify(action.paths)})`)//${} seems to not print arrays correctly
            return Object.assign({},state,{pending: combinePendingPaths(state.volatile.pending, action.paths)});
        case TYPE_DIRTYASSIGN:
            let assignments=action.assignments;
            newValue=applyAssignmentList(Object.assign({},state.persistent),assignments);
            let addPending=assignments.map((assignment)=>assignment.path);//extracts the used keys from the assignment-list
            if(state.volatile.readonly===true)
                throw ReducerError(`Attempted '${TYPE_DIRTYASSIGN}' in readonly-mode (paths: ${JSON.stringify(addPending)})`)//${} seems to not print arrays correctly
            /*newPending=state.pending.filter((oldPend)=>!addPending.some((newPend)=>
                oldPend.startsWith(newPend)//"foo.bar.hello"(old) starts with "foo.bar"(new), so "foo.bar.hello"(old) should be removed, as the new pending-mark would override it.
                //Also removes "foo.bar.hello" if the new key is "foo.bar.hell", which is obviously wrong
            ));*/
            newPending=combinePendingPaths(state.volatile.pending,addPending);
            return {persistent: newValue, volatile:{pending: newPending}};
        default:
            if(action.changed!==undefined){
                if(state.volatile.readonly===true)
                    throw ReducerError(`Attempted '${TYPE_DIRTYINFO}'(via action.changed) in readonly-mode (paths: ${JSON.stringify(action.changed)})`)//${} seems to not print arrays correctly
                return {volatile:{pending: combinePendingPaths(state.volatile.pending, action.changed)}};
            }
            return state;
    }
};

/**
 * @see pendingReducer
 */
export const typedPendingReducer = createReducerTypeMapping(
    pendingReducer,
    "",
    createReducerType(TYPE_CLEANASSIGN,"persistent","volatile.pending"),
    createReducerType(TYPE_DIRTYASSIGN,"persistent","volatile.pending"),
    createReducerType(TYPE_CLEANUP,"volatile.pending"),
    createReducerType(TYPE_DIRTYINFO,"volatile.pending"),
    createReducerType((action)=>action.changed!==undefined,"volatile.pending"));

/**
 * Merges two lists containing paths into a new list.
 * Currently only performs a simple "is already contained?"-check, might include logic like "is this a assignment to a parent-field of previous subfields? if yes, discard those old sub-fields".
 * @param {string[]} oldPaths The previous old paths.
 * @param {string[]} addPaths The new paths which should be added.
 * @returns {string[]} The union of oldPaths and newPaths, where the oldPaths are always followed by the new paths.
 */
export function combinePendingPaths(oldPaths,addPaths){
    if((typeof addPaths)==="string") addPaths=[addPaths];
    return [...oldPaths.filter((oldElem)=>!addPaths.includes(oldElem)),...addPaths];//IMRPOVE: Discard useless assignments
}

/**
 * Creates a new reducer-function based on the supplied type-mappings.
 * It is possible to throw "ReducerError" to discard the current action. Note that this also discards all progress made in the current "dispatch"-phase and simply returns "state".
 * Any Error without "isReducerError:true" is rethrown, see ReducerError.
 * Implementation-detail: For each action all predicate-mappings are checked first, then the type-mappings.
 * If a reducertype is registered as type and as predicate it might be invoked twice if both apply to the action.
 * In these special scenarios, the additional constraint reducer(state,action)===reducer(reducer(state,action),action) should also be fullfilled to avoid confusion.
 *
 * @param {any} [initialstate] The initial state of the reducer, applies whenever the input-state is undefined.
 * @param {boolean} [initialPass=true] Determines whether all reducers should be invoked with the initialState if the input-state is undefined. If used together with initialstate=undefined emulates default redux-behaviour.
 * @param {...TypeMapping} mappings The mappings to use as a base for the combound reducer.
 * @return {function} The reducer function composed of the mappings.
 * @see ReducerError
 */
export function composeReducersByType(initialstate=undefined,initialPass=true,...mappings){
    /*
    mappings:[{
        reducer,
        root:"value",
        types:[{
            type: typeA,
            paths: ["a", funcC, ...]
        }, {
            type: funcB,
            paths: ["b", ...]
        }, ...]
    }, ...]
    */

    /**
     * Stores all mappings which use a predicate as their selector.
     * @type {PredicateReducerMapping[]}
     * @typedef {{pred:function, reducer:function, root:string, paths: string[], funcPaths:?(function[])}} PredicateReducerMapping
     */
    let predicateMappings=[];//[{pred:predicate, reducer, root:"value", paths: ["fields"], funcPaths?: [funcA]}, ...]
    /**
     * Stores all mappings which use an action-type as their selector.
     * @type {Object.<string,UntypedReducerMapping[]>}
     * @typedef {{reducer:function, root:string, paths: string[], funcPaths:?(function[])}} UntypedReducerMapping
     */
    let typeMappings={};//{TYPE_A:[{reducer, root:"value", paths:["fields"], funcPaths?: [funcA]}, ...], TYPE_B: [...], ...}
    ///**
    // * Stores all mappings regardles of selector. Used in the initialPass-scenario.
    // * @type {UntypedReducerMapping[]}
    // */
    //let allMappings=[];

    let mappingSize=mappings.length;
    for(var index=0;index<mappingSize;index++){
        let currentMapping=mappings[index];
        let untyped=Object.assign({},currentMapping);
        let types=untyped.types;
        delete untyped.types;
        let typeSize=types.length;
        let maxSPaths=[];
        let maxFPaths=[];
        let result;
        for(var typeindex=0;typeindex<typeSize;typeindex++){
            let currentType=types[typeindex];
            let type=currentType.type;
            let paths=currentType.paths;
            let stringPaths=paths.filter((path)=>(typeof path)==="string");
            let funcPaths=paths.filter((path)=>(typeof path)==="function");
            // eslint-disable-next-line
            maxSPaths=[...maxSPaths,...(stringPaths.filter((path)=>!maxSPaths.includes(path)))];//calculate union of string-paths
            // eslint-disable-next-line
            maxFPaths=[...maxFPaths,...(funcPaths.filter((path)=>!maxFPaths.includes(path)))];//calculate union of function-paths
            //Filter into correct mapping-list.
            if((typeof type)==="function"){
                result=Object.assign({},untyped, {paths:stringPaths,pred: type});
                if(funcPaths.length!==0) result.funcPaths=funcPaths;
                predicateMappings.push(result);
            }else{
                if(typeMappings[type]===undefined)
                    typeMappings[type]=[];
                result = Object.assign({}, untyped, {paths:stringPaths});
                if(funcPaths.length!==0) result.funcPaths=funcPaths;
                typeMappings[type].push(result);
            }
        }
        //don't assign fpaths if it would be empty.
        // if(maxFPaths.length!==0)
        //     allMappings.push(Object.assign({}, untyped, {paths:maxSPaths, fpaths:maxFPaths}));
        // else
        //     allMappings.push(Object.assign({}, untyped, {paths:maxSPaths}));
    }

    /**
     * Applies the reducer passed in reducerData to the substate of state (according to root and paths) with the specified action.
     * joinState provides the ability to chain multiple reducers using the same state without them knowing of each other by applying their return-value to a copy of joinState instead of state.
     *
     * @example
     * let resultState=applyReducer(state,action,reducerData1);
     * resultState=applyReducer(state,action,reducerData2,resultState);
     * //resultState contains changes from both reducers without them interfering with another.
     * @param {any} state The input-state.
     * @param {any} action Action which should be used for the reducer.
     * @param {UntypedReducerMapping} reducerData Reducer-data, things like the reducer-function, root and the paths are used.
     * @param {any} [joinState] Optional state to join the result to. Joins to state if undefined
     * @returns {any} The result of the reducer assigned on top of joinState/state.
     */
    var applyReducer=(state,action,reducerData,joinState=undefined)=>{
        let rootStateValue=readValue(reducerData.root,state);
        if(verbose) console.log("Reducing: ",reducerData);
        let reducerResult=reducerData.reducer(rootStateValue,action);
        if(verbose) console.log("Sub-Result: ", reducerResult);
        let rootResult;
        let paths=reducerData.paths;
        if(reducerData.funcPaths!==undefined){
            let appliedPaths = applyFunctions(reducerData.funcPaths, action)
            if(verbose) console.log("Applied Paths:",appliedPaths)
            paths=combinePendingPaths(paths,appliedPaths);//merge function-paths
        }
        if(verbose) console.log("Paths: ",paths);
        if(joinState!==undefined){
            let prevInput=readValue(reducerData.root, joinState);
            if(verbose) console.log("Previous input: ",prevInput);
            rootResult=copyValues(prevInput,paths,reducerResult);
            if(verbose) console.log("rootResult: ",rootResult);
            return pathAssign(joinState,reducerData.root,rootResult);
        }else{
            if(verbose) console.log("Previous input: ",rootStateValue);
            rootResult=copyValues(rootStateValue, paths, reducerResult);
            if(verbose) console.log("rootResult: ",rootResult);
            return pathAssign(state, reducerData.root, rootResult);
        }
    }
    if(verbose){
        console.log("Generated mappings:")
        console.log("typedMappings: ", typeMappings);
        console.log("predicateMappings: ", predicateMappings);
    }

    return (state, action)=>{
        if(action.type===undefined) throw new Error("Action.type must not be undefined!")
        if(verbose) console.log("Reducing: "+action.type);
        var index;
        if(state===undefined){
            if(initialPass===false) return initialstate;
            else if(initialPass===true){
                try{
                    let resultState=initialstate;
                    let size=mappings.length;
                    for(index=0;index<size;index++){
                        resultState=applyReducer(initialstate,action,mappings[index],resultState);
                    }
                    if(action.success===undefined) action.success=true;
                    return resultState;
                }catch(e){
                    if(e.isReducerError===true){
                        if(action.success===undefined) action.success=false;
                        if(action.error===undefined) action.error=e;
                        if(verbose) console.warn("ReducerError:",e)
                        return state;
                    }else{
                        throw e;
                    }
                }
            }else{
                throw new Error("Invalid initialPass parameter, should be either true(-->initialize reducers with intialstate) or false(-->return initialstate): "+initialPass);
            }
        }else{
            try{
                let resultState=state;
                let size=predicateMappings.length;
                for(index=0;index<size;index++){
                    let current=predicateMappings[index];
                    if(current.pred(action)){
                        if(verbose) console.log("Applying ",current);
                        if(verbose) console.log("Applying(Action): ",action);
                        if(verbose) console.log("Pre-state: ",resultState);
                        resultState=applyReducer(state,action,current,resultState);
                        if(verbose) console.log("Post-state: ",resultState)
                    }
                }
                let actionTypeReducers=typeMappings[action.type];
                if(actionTypeReducers!==undefined){
                    size=actionTypeReducers.length;
                    for(index=0;index<size;index++){
                        if(verbose) console.log("Applying ",actionTypeReducers[index]);
                        if(verbose) console.log("Applying(Action): ",action);
                        if(verbose) console.log("Pre-state: ",resultState);
                        resultState=applyReducer(state,action,actionTypeReducers[index],resultState);
                        if(verbose) console.log("Post-state: ",resultState)
                    }
                }
                if(action.success===undefined) action.success=true;
                return resultState;
            }catch(e){
                if(e.isReducerError===true){
                    if(action.success===undefined) action.success=false;
                    if(action.error===undefined) action.error=e;
                    if(verbose) console.warn("ReducerError:",e)
                    return state;
                }else{
                    throw e;
                }
            }
        }
    }
}

/**
 * Creates a new reducer-mapping. Reducer-mappings are used by composeReducersByType to provide a more runtime-efficient combined reducer by using type-lookup.
 * @typedef {{reducer:function, root:string, types:ReducerType[]}} TypeMapping
 * @param {function} reducer The reducer function to be applied by this mapping
 * @param {string} [root=""] The root of this mapping. If specified, the reducer will be passed the sub-state of the state at this path instead of the whole state. This also applies to the return value accordingly.
 * @param {...ReducerType} types The types this mapping applies to. These also include the paths to which assignments should be made.
 * @returns {TypeMapping}
 * @example
 * createReducerTypeMapping(
 *  pendingReducer,
 *  "",
 *  createReducerType(TYPE_CLEANASSIGN,"value","pending"),
 *  createReducerType(TYPE_DIRTYASSIGN,"value","pending"),
 *  createReducerType(TYPE_CLEANUP,"pending"),
 *  createReducerType(TYPE_DIRTYINFO,"pending"),
 *  createReducerType((action)=>action.changed!==undefined,"pending"));
 */
export function createReducerTypeMapping(reducer, root="", ...types){
    if((typeof reducer)!=="function") throw new Error("Reducer must be a function! (was "+(typeof reducer)+")");
    if((typeof root)!=="string"){//root might have been omitted and could instead contain the first "type"
        if((typeof root)==="object"){
            types=[root,...types];
            root="";
        }else{
            throw new Error("Invalid root-type("+(typeof root)+") : "+root);
        }
    }
    return {reducer, root, types:types};
}

/**
 * @typedef {{type:(string|function), paths:Array.<(string|function)>}} ReducerType
 * @param {(string|function)} type The type to listen to. Can either be a string representing the action.type or a function (action)=>boolean. In the latter case, the reducer will be used if the function evaluates to true.
 * @param {Array.<(string|function)>} paths The paths to copy while branching. Each path can either be a string representing the path or a function (action)=>path.
 * @returns {ReducerType}
 * @example
 * createReducerType(TYPE_DIRTYASSIGN,"value","pending");
 * @example
 * createReducerType(TYPE_CLEANUP,"pending");
 * @example
 * createReducerType((action)=>action.changed!==undefined,"pending"));
 * @example
 * createReducerType(TYPE_CONTENTCHANGE, (action)=>action.changedNode+".content"));
 */
export function createReducerType(type,...paths){
    return {type,paths:paths};
}

console.log("Reducer-module loaded");
