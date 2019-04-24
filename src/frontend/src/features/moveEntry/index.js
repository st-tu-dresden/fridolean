import {featureList} from "../../features/index.js";
import {createTextEntry} from '../../common/model/entry';
const fid = "moveEntry";

export function enable() {
  if (!featureList[fid].enabled) {
    // do stuff
  }
  featureList[fid].enabled = true;
}

export function onMoveEntry(editor,sourceBlockID,entryID,targetBlockID, targetPosition=-1) {
  // console.log("onMove - moveEntry");
  // console.log(editor);

  if (!featureList[fid].enabled) {
    return;
  } else {
    const state=editor.findStateById()
    let sourceBlock=editor.findBlockByID(sourceBlockID,state);
    let targetBlock=editor.findBlockByID(targetBlockID,state);
    if(!targetBlock||!sourceBlock) throw new Error("Invalid source or target!");
    let entry=sourceBlock.entries[entryID];
    if(!entry) throw new Error("Entry doesn't exist!");
    let delCanvases=[];
    let newCanvases={};
    let delBlocks={};
    let newBlocks={};
    let refCanvasID=null;
    let tarBlockID=null;
    let tarEntryID=null;
    let tarEntry=null;
    switch(sourceBlock.buildingBlockType){
      case "link":
        refCanvasID=entry.content.reference;
        tarEntryID=entry.content.target;
        for(var blockID in state.buildingBlocks){
          let block=state.buildingBlocks[blockID];
          if(block.entries[tarEntryID]){
            tarBlockID=blockID;
            tarEntry=block.entries[tarEntryID];
            break;
          }
        }
        if(refCanvasID)
          delCanvases.push(refCanvasID);
        if(tarBlockID&&tarEntryID)
          delBlocks[tarBlockID]={...delBlocks[tarBlockID],[tarEntryID]:tarEntry};
        delBlocks[sourceBlockID]={...delBlocks[sourceBlockID],[entryID]:entry};
        break;
      case "data":
        delBlocks[sourceBlockID]={...delBlocks[sourceBlockID],[entryID]:entry};
        break;
      default:
        break;
    }
    switch(targetBlock.buildingBlockType){
      case "link":
        alert("Cannot move entries to link-blocks (no partner-block)");
        return;
      case "data":
        if(entry.entryType!=="plain"){
          entry=createTextEntry(entry.content.text,entry.content.title);
          entryID=entry._id;
        }
        let targetEntries=newBlocks[targetBlockID]||targetBlock.entries;
        let ids=Object.keys(targetEntries);
        while(targetPosition<0){
          targetPosition+=ids.length+1;
        }
        if(targetBlockID!==sourceBlockID){
          ids.push(ids[ids.length-1])
          ids.copyWithin(targetPosition+1,targetPosition);
        }else{
          let prevIndex=Object.keys(targetBlock.entries).indexOf(entry._id);
          if(prevIndex===targetPosition) return;
          if(targetPosition<prevIndex){
            ids.copyWithin(targetPosition+1,targetPosition,prevIndex);
          }else{
            ids.copyWithin(prevIndex,prevIndex+1,targetPosition+1);
          }
        }
        ids[targetPosition]=entryID;
        let newEntries={}
        ids.forEach((id)=>newEntries[id]=targetEntries[id]||entry);
        newBlocks[targetBlockID]=newEntries;
        break;
      default:
        break;
    }
    editor.props.delAdd(editor.state.values.canvasID,delCanvases,newCanvases,delBlocks,newBlocks);
  }

}

export function disable() {
  if (featureList[fid].enabled) {
    // do stuff
  }
  featureList[fid].enabled = false;
}

export function toggle() {
  if (!featureList[fid].enabled) {
    enable();
  } else {
      disable();
    }
}
