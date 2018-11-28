import {createAssignment,extractAssignment, readValue} from '../../common/assignment'

const valuePropositionNamer=(title)=>("Value Proposition"+(title?` (${title})`:""));
const verbose=false;

/**
 * @param {function} transform
 * @param {function} [predicate]
 */
export function createAssignmentTransform(transform, predicate){
    if(predicate)
        return {transform, predicate};
    else
        return {transform}
}

/**
 *
 * @param {function} getProject
 * @param {{path: string, value}[]} assignments
 * @param {{transform: function, predicate: ?function}[]} transforms
 */
export function applyAssignmentTransform(getProject,assignments,...transforms){
    let currentAssignments=duplicateFilter(assignments);
    if(verbose)console.log("Start:",currentAssignments);
    let project=undefined;
    let isProjectDefault=true;
    let transformSize=transforms.length;
    let cachedGetProject=()=>{
        if(isProjectDefault){
            project=getProject();
            isProjectDefault=false;
        }
        return project;
    }
    //if(transformSize===0) console.warn("Empty transformation!");
    for(var index=0; index<transformSize; index++){
        let currentTransform=transforms[index];
        if(currentTransform instanceof Function)
            currentTransform={transform:currentTransform};
        if(currentTransform.predicate){
            if(currentTransform.predicate(currentAssignments,cachedGetProject)){
                currentAssignments=duplicateFilter(currentTransform.transform(currentAssignments,cachedGetProject));
                if(verbose) console.log("Step "+index,currentAssignments);
            }
        }else{
            currentAssignments=duplicateFilter(currentTransform.transform(currentAssignments,cachedGetProject));
            if(verbose) console.log("Step "+index,currentAssignments);
        }
    }
    return currentAssignments;
}

function duplicateFilter(source){
    let seen={};
    return source.filter((path)=>seen.hasOwnProperty(JSON.stringify(path)) ? false : seen[JSON.stringify(path)]=true);
    //as seen on  https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
}

const entryTextChangeRegex=/^canvases\.([^.]+)\.buildingBlocks\.([^.]+)\.entries\.([^.]+)\.content\.text$/
const entriesChangeRegex=/^(canvases\.([^.]+)\.buildingBlocks\.([^.]+)\.entries).*/
const canvasChangeRegex=/^canvases\.([^.]+)$/
const entryChangeRegex=/^canvases\.([^.]+)\.buildingBlocks\.([^.]+)\.entries\.([^.]+)$/
const entryAnyChangeRegex=/^canvases\.([^.]+)\.buildingBlocks\.([^.]+)\.entries\.([^.]+)/

export const validAssignmentTransform=createAssignmentTransform(
    (assignments,getProject)=>{
        let project=getProject();
        return assignments.filter((assignment)=>{
            let path=assignment.path;
            let splitIndex=path.lastIndexOf(".");
            if(splitIndex<0) return true;
            let superPath="".substring(0,splitIndex);
            let superValue=readValue(superPath, project);
            if(!superValue){
                console.log("Caught assignment to '"+path+"' because the parent-object ("+superPath+") does not exist");
            }
            return !!superValue;
        })
    }
)

export const linkingEntryVPCNameTransform=createAssignmentTransform(
    (assignments,getProject)=>{
        let newAssignments=[];
        assignments.forEach((assignment)=>{
            let result=entryTextChangeRegex.exec(assignment.path);
            let project=getProject();
            if(result!==null){
                let entryCanvasID=result[1];
                let entryBuildingBlockID=result[2];
                let entryID=result[3];

                let entry=project.persistent.canvases[entryCanvasID].buildingBlocks[entryBuildingBlockID].entries[entryID];
                let newTitle=valuePropositionNamer(assignment.value);
                let targetCanvasID=entry.content.reference;
                if((targetCanvasID===undefined)||(targetCanvasID=="")||(!project.persistent.canvases[targetCanvasID])) return newAssignments.push(assignment);

                newAssignments.push(createAssignment("canvases."+targetCanvasID+".title",newTitle));
            }
            newAssignments.push(assignment);
        });
        return newAssignments;
    },
    (assignments)=>
        assignments.some((assignment)=>entryTextChangeRegex.test(assignment.path))
);

export const VPCDeletionToEntryDeletionTransform=createAssignmentTransform((assignments,getProject)=>
        assignments.map((assignment)=>{
            if(assignment.value){
                return assignment;
            }
            let result=canvasChangeRegex.exec(assignment.path);
            if(!result){
                return assignment;
            }
            let canvasID=result[1];
            let projectState=getProject();
            let canvas=projectState.persistent.canvases[canvasID];
            if(!canvas){
                return assignment;
            }
            if(canvas.canvasType==="VALUE_PROPOSITION"){
                let linkEntry=null;
                let linkBlock=null;
                let linkBMC=Object.values(projectState.persistent.canvases).filter((canvas)=>canvas.canvasType==="BUSINESS_MODEL").find((canvas)=>{
                    linkBlock=Object.values(canvas.buildingBlocks).find((bb)=>{
                        if(linkEntry) return;
                        let testEntry=Object.values(bb.entries).find((entry)=>{
                            if(entry.entryType!=="link") return false;
                            return entry.content.reference==canvasID;
                        });
                        if(!testEntry) return false;
                        linkEntry=testEntry;
                        return true;
                    });
                    return (linkBlock);
                });
                if(!linkBMC){
                    console.warn("Could not perform canvas-entrylink-lookup for "+canvasID);
                    return assignment;
                }else{
                    let path="canvases."+linkBMC._id+".buildingBlocks."+linkBlock._id+".entries."+linkEntry._id;
                    return createAssignment(path,undefined);
                }
            }else{
                return assignment;
            }
        })
    ,
    (assignments)=>{
        let result = assignments.some((assignment)=>(!assignment.value)&&canvasChangeRegex.test(assignment.path));
        return result;
    }
);

export const BMCCanvasDeletionTransform=createAssignmentTransform(
    (assignments,getProject)=>{
        let newAssignments=[];
        assignments.forEach((assignment)=>{
            if(assignment.value){
                newAssignments.push(assignment);
                return;
            }
            let regResult=canvasChangeRegex.exec(assignment.path);
            if(!regResult){
                newAssignments.push(assignment);
                return;
            }
            let canvasID=regResult[1];
            let projState=getProject();
            let canvas=projState.persistent.canvases[canvasID];
            if(canvas){
                let buildingBlocks=Object.values(canvas.buildingBlocks).filter((bb)=>bb.buildingBlockType=="link");
                buildingBlocks.forEach((buildingBlock)=>{
                    let addition=Object.values(buildingBlock.entries).map((entry)=>createAssignment(
                        "canvases."+canvasID+".buildingBlocks."+buildingBlock._id+".entries."+entry._id,undefined));
                    newAssignments.push(...addition);
                });
            }else{
                console.warn("Canvas not found:",canvasID);
            }
            newAssignments.push(assignment);
        });
        return newAssignments;
},(assignments)=>assignments.some((assignment)=>true||(!assignment.value)&&canvasChangeRegex.test(assignment.path)));

export const VPEntryDeletionTransform=createAssignmentTransform((assignments,getProject)=>{
    let newAssignments=[];
    assignments.forEach((assignment)=>{
        if(assignment.value) return newAssignments.push(assignment);
        let result=entryChangeRegex.exec(assignment.path);
        if(!result) return newAssignments.push(assignment);
        let canvasID=result[1];
        let buildingBlockID=result[2];
        let entryID=result[3];
        let projectState=getProject();
        let canvas=projectState.persistent.canvases[canvasID];
        if(!canvas) return newAssignments.push(assignment);
        let buildingBlock=canvas.buildingBlocks[buildingBlockID];
        if(!buildingBlock) return newAssignments.push(assignment);
        let entry=buildingBlock.entries[entryID];
        if(!entry) return newAssignments.push(assignment);
        if(entry.entryType!=="link") return newAssignments.push(assignment);
        let content=entry.content;
        let vpCanvasID=content.reference;
        let targetEntryID=content.target;
        if(vpCanvasID) newAssignments.push(createAssignment("canvases."+vpCanvasID,undefined));
        if(targetEntryID){
            let targetBuildingBlock=Object.values(canvas.buildingBlocks).find((buildBlock)=>buildBlock.entries[targetEntryID]);
            if(!targetBuildingBlock){
                console.error("Could not find target-BuildingBlock!",targetEntryID);
                return newAssignments.push(assignment);
            }
            let targetBuildingBlockID=targetBuildingBlock._id;
            newAssignments.push(createAssignment("canvases."+canvasID+".buildingBlocks."+targetBuildingBlockID+".entries."+targetEntryID,undefined));
        }
        newAssignments.push(assignment);
    })
    return newAssignments;
},(assignments)=>{
    return assignments.some((assignment)=>(!assignment.value)&&(entryChangeRegex.test(assignment.path)))
})

export const entryLockTransform=createAssignmentTransform(
    (paths)=>{
        let newPaths=paths.map((path)=>{
            let result=entriesChangeRegex.exec(path);
            if(result===null)
                return path;
            else{
                return result[1];
            }
        });
        return newPaths;
    }
)
