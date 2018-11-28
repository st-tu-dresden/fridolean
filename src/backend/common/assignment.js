const pathRegex=/^([^.]+?)\.(.+)$/;//Matches "(Digit|Word)+'.'(Digit|Word|'.')+": "foo.bar.hello.world" ==> ("foo").("bar.hello.world")
const terminalRegex=/^([^.]+)$/; //Matches "(Digit|Word)+": "world" ==> ("world")
const assert = require('assert');

export const GENERIC_ASSIGNMENT_ERROR=517


//TODO, Optimize: replace regex-lookup with Array-Split at every "." and traversal over that.
/**
 * Assigns a value to the supplied key-path and returns the result as a new object.
 * When the path is "", value will be returned.
 * Basically returns a new object like source[path]=value, but with sub-tree support when traversing along ".".
 * @example
 * pathAssign({hello: {text: "world"}}, "hello.text", "Marc") //{hello: {text: "Marc"}}
 * @example
 * pathAssign({hello: {text: "world"}}, "hello", {type: "greetings", to: "Tom"}) //{hello: {type: "greetings", to: "Tom"}}
 * @example
 * pathAssign({foo: "hello"}, "bar", "world") //{foo: "hello", bar: "world"}
 * @example
 * pathAssign({foo: "hello"}, "", {text: "Hello World!"}) //{text: "Hello World!"}
 * @param {any} [source={}]
 * @param {string} path The path where the new value should be assigned to source. Object-Layers are seperated by "."
 * @param {any} value The value which should be assigned to source at path. Note that value is not traversed like source!
 * @returns {any} The new object with value at path.
 * @throws Error: "Invalid key: "
 * @see copyValue
 */
export function pathAssign(source={},path,value){
    if(source===null) source={};
    if(source===undefined) source={};
    if((path===undefined)||(path===null)||(path==="")) return value;
    let result=pathRegex.exec(path);
    if(result!==null){//result==["foo.bar.hello.world","foo","bar.hello.world"]
        let key=result[1];//"foo"
        let trail=result[2];//"bar.hello.world"
        //return source, but replace the value of the top-level-key with the next iteration of pathAssign
        if(source instanceof Array)
          return Object.assign([],source,{[key]: pathAssign(source[key],trail,value)});
        else
          return Object.assign({},source,{[key]: pathAssign(source[key],trail,value)});
    }else{
        result = terminalRegex.exec(path);//is this key a valid terminal key?
        if(result===null) throw new Error("Invalid key: "+JSON.stringify(path));
        let key=result[1];//result==["world","world"]
        //return source, but replace the value of the terminal-key with value.
        if(value===undefined){
            if(source instanceof Array){
                let result=Object.assign([],source);
                result.splice(key);
                return result;
            }else{
                let result= Object.assign({},source);
                delete result[key];
                return result;
            }
        }else if(source instanceof Array)
          return Object.assign([],source,{[key]: value});
        else
          return Object.assign({},source,{[key]: value});
    }
}

/**
 * Combines the two paths with a "." if both are not empty. Otherwise omit the "." and the empty parameter
 * @example
 * joinPath("foo","bar") //"foo.bar"
 * @example
 * joinPath("foo","") //"foo"
 * @example
 * joinPath("","bar") //"bar"
 * @example
 * joinPath("","") //""
 * @param {string} root
 * @param {string} path
 * @returns {string} root+"."+path, root or path, depending on which arguments are empty strings.
 */
export function joinPath(root,path){
    if(root==="") return path;
    if(path==="") return root;
    return root+"."+path;
}

/**
 * Creates a Assignment-Object with the fields "path" and "value"
 * @param {string} path A "."-seperated path which describes where the value should be placed
 * @param {any} value The value which should be placed at path.
 * @returns {assignment}
 * @typedef {{path:string, value}} assignment
 */
export function createAssignment(path, value){
    return {path, value}
}

/**
 * Creates an assignment-Object by reading the value of source at path.
 * @param {string} path A "."-seperated path which describes where the value should be read from.
 * @param {any} source The source from which the value should be read.
 * @returns {assignment} source[path]
 * @see extractAssignmentList
 */
export function extractAssignment(path, source){
    return createAssignment(path,readValue(path,source));
}

/**
 * Creates a list of assignments by reading the values of source at paths.
 * @param {string[]} paths A list of "."-seperated paths which describe where the values should be read from.
 * @param {any} source The source from which the values should be read.
 * @returns {assignment[]}
 * @see extractAssignment
 */
export function extractAssignmentList(paths, source){
    return paths.map((path)=>extractAssignment(path,source));
}

/**
 * Reads the value of source at path.
 * @param {string} path A "."-seperated path which describes where to be read from.
 * @param {any} source The source from which the value should be read.
 * @returns {any} source[path] with "." subtree support
 * @throws Error: "Invalid key: "
 */
export function readValue(path, source){
    if(source===undefined) return undefined;
    if(path==="") return source;
    let result=pathRegex.exec(path);
    if(result!==null){
        let key=result[1];
        let trail=result[2];
        return readValue(trail,source[key]);
    }else{
        result = terminalRegex.exec(path);
        if(result===null) throw new Error("Invalid key: "+JSON.stringify(path));
        let key = result[1];
        return source[key];
    }
}

/**
 * Returns a new copy of target where the value at path is replaced with sources value at path.
 * If path is "", a copy of source is returned.
 * Basically target[path]=source[path]
 * @param {*} target The target to which the value will be assigned.
 * @param {String} path The path to use for the assignment.
 * @param {*} source The source from which the value will be read.
 * @returns {*} The new object with source[path] at path.
 * @see pathAssign
 * @throws Error: "Invalid key: "
 */
export function copyValue(target, path, source){
    if(source===undefined){
        //console.log("source undefined!");
        return pathAssign(target,path,undefined);
    }
    if(target===undefined){
        //console.log("target undefined!");
        if(source instanceof Array)
          return pathAssign([],path,source);
        else
          return pathAssign({},path,source);
    }
    if(path===""){
        //console.log("path empty!");
        if(source instanceof Array)
          return Object.assign([],source);
        else
          return Object.assign({},source);
    }
    let result=pathRegex.exec(path);
    if(result!==null){
        let key=result[1];
        let trail=result[2];
        if(target instanceof Array)
          return Object.assign([],target,{[key]:copyValue(target[key],trail,source[key])});
        else
          return Object.assign({},target,{[key]:copyValue(target[key],trail,source[key])});
    }else{
        result=terminalRegex.exec(path);
        if(result===null) throw new Error("Invalid key: "+JSON.stringify(path));
        let key=result[1];
        // let newValue=source[key];
        if(source[key]===undefined){
            if(target instanceof Array){
                let result=Object.assign([],target);
                result.splice(key);
                return result;
            }else{
                let result= Object.assign({},target);
                delete result[key];
                return result;
            }
        }else if(target instanceof Array)
          return Object.assign([],target,{[key]:source[key]});
        else
          return Object.assign({},target,{[key]:source[key]});
    }
}

/**
 * Returns a new copy of target where the values at path are replaced with sources values at path for each path.
 * @param {*} target The target to which the values will be assigned.
 * @param {String[]} paths The paths to use for the assignment.
 * @param {*} source The source from which the values will be read.
 * @returns {*} The new object with source[path] at path for each path in paths.
 * @see copyValue
 * @throws Error: "Invalid key: "
 */
export function copyValues(target, paths, source){
    let tempTarget=target;
    let size=paths.length;
    for (var index = 0; index < size; index++) {
        tempTarget=copyValue(tempTarget, paths[index], source);
    }
    return tempTarget;
}

/**
 * Traverses the entries in the objects-list. If a function is encountered, it is invoked with the ...args-arguments.
 * Its return-value is added to the returned list. If a non-function is encountered, the object is added to the result directly.
 * @example
 * applyFunctions(["Hello", (target) => target.name ], { name: "World"}) //["Hello","World"]
 * @example
 * applyFunctions(["Hello", (target) => target.name], { name: "Foo"}) //["Hello","Foo"]
 * @param {any[]} objects The list of objects and functions which should be traversed
 * @param {...any} args The arguments which should be applied to the functions
 * @returns {any[]} A new list containing the old object or the result of the function, depending of the type found in paths.
 */
export function applyFunctions(objects, ...args){
    let paths=[];
    objects.forEach((path)=>{
        if((typeof path)==="function"){
            let result=path(...args);
            if(typeof result === "string")
                paths.push(result);
            else if(Array.isArray(result))
                paths.push(...result);
            else
                throw new Error("Unsupported path type: "+(typeof result)+": "+result);
        }
        else
            paths.push(path);
    });
    return paths;
}

/**
 * Applies the list of assignments to a new copy of target and returns it.
 * @param {any} target The target of the assignments.
 * @param {assignment[]} assignments The assignments that should be applied.
 * @returns {any} A copy of target on which the assignments have been applied.
 * @see applyAssignment
 */
export function applyAssignmentList(target={}, assignments){
    var result=target;
    for (var index = 0; index < assignments.length; index++) {
        var assignment = assignments[index];
        result=applyAssignment(result, assignment);
    }
    return result;
}

/**
 * Applies the assignment to a new copy of target and returns it.
 * @param {any} target The target of the assignment.
 * @param {assignment[]} assignments The assignment that should be applied.
 * @returns {any} A copy of target on which the assignment has been applied.
 * @see applyAssignmentList
 */
export function applyAssignment(target, assignment){
    return pathAssign(target,assignment.path,assignment.value);
}


//TODO: Extract into seperate test-file


//Sanity-Check Assistant
function AssertPathAssign(input, path, value, expectedResult){
    var tempInput = Object.assign({},input);
    assert.deepEqual(input,tempInput);
    var result = pathAssign(input, path, value);
    assert.deepEqual(result,expectedResult);
    assert.deepEqual(input,tempInput);
    return result;
}

//Sanity checks
const testObj={foo: {bar: "hello"}, bar: "world"};
const expectedResult1={foo:{bar: "hello"}, bar: "hello"};
const expectedResult2={foo:{bar: "world"}, bar: "hello"};
const expectedResult3={foo:{bar: "world", temp:{testing:{deep:{nesting:"success!"}}}}, bar: "hello"};
AssertPathAssign(
    AssertPathAssign(
        AssertPathAssign(
            testObj,
            "bar",
            "hello",
            expectedResult1),
        "foo.bar",
        "world",
        expectedResult2),
    "foo.temp.testing.deep.nesting",
    "success!",
    expectedResult3);
