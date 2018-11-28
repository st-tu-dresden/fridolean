import {combinePendingPaths,composeReducersByType,createReducerType,createReducerTypeMapping,pendingReducer,typedPendingReducer,ReducerError} from '../reducers'

function getType(action){return action.type;}
function asJSON(action){return JSON.stringify(action)};
function hasName(action){return action.name!==undefined}
function hasChanged(action){return action.changed!==undefined}

describe("combinePendingPaths",()=>{
    it("automatically wraps strings to lists",()=>{
        expect(combinePendingPaths([],"123")).toEqual(["123"])
    })
    it("appends empty lists to empty lists"), ()=>{
        expect(combinePendingPaths([],[])).toEqual([])
    }
    it("appends an empty list to another list"), ()=>{
        expect(combinePendingPaths([],["123"])).toEqual(["123"])
        expect(combinePendingPaths(["123"],[])).toEqual(["123"])
    }
    it("appends to non empty lists", ()=>{
        expect(combinePendingPaths(["123"],["456"])).toEqual(["123","456"]);
    })
    it("removes previous occurances in the oldList",()=>{
        expect(combinePendingPaths(["123","456"],["123"])).toEqual(["456","123"]);
    })
});

describe("createReducerType",()=>{
    it("allows having only a type", ()=>{
        expect(createReducerType("TypeA")).toEqual({type: "TypeA", paths:[]});
    })
    it("only has one type and can have paths",()=>{
        expect(createReducerType("TypeB","1","2","a.b","cd.de.fg")).toEqual({type: "TypeB", paths:["1","2","a.b","cd.de.fg"]});
    })
    it("can also accept functions as paths",()=>{
        expect(createReducerType("TypeC",getType,"pending",asJSON)).toEqual({type: "TypeC", paths:[getType, "pending", asJSON]});
    })
    it("can also accept a predicate as type",()=>{
        expect(createReducerType(hasChanged,"pending")).toEqual({type: hasChanged, paths: ["pending"]});
    })
    it("follows the examples in its file",()=>{
        
        expect(createReducerType("TYPE_DIRTYASSIGN","value","pending")).toEqual({type: "TYPE_DIRTYASSIGN",paths: ["value","pending"]});

        expect(createReducerType("TYPE_CLEANUP","pending")).toEqual({type: "TYPE_CLEANUP",paths: ["pending"]});

        expect(createReducerType(hasChanged,"pending")).toEqual({type: hasChanged, paths: ["pending"]});

        let changedContentNodeMapping=(action)=>action.changedNode+".content";
        expect(createReducerType("TYPE_CONTENTCHANGE", changedContentNodeMapping)).toEqual({type: "TYPE_CONTENTCHANGE",paths: [changedContentNodeMapping]});
    })
});
