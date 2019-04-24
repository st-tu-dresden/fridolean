import {createReducerType, createReducerTypeMapping, ReducerError} from '../../../common/reducers'

/**
 * EditorReducer
 * @param {*} persistent - the persistent part of the state
 * @param {*} action  - the triggered action with its parameters
 * in EditorReducer, all needed canvas actions are handled and applyed to the state
 * the changes are not in every case shown directly but handed ofer tho the websocket connection
 */
export const EditorReducer = (persistent, action) => {

  let canvases = persistent.canvases;
  let canvas = null;
  let block = null;
  let result=null;

  if(action.canvas_uuid!==undefined){
    canvas = canvases[action.canvas_uuid];
    if(action.block_uuid!==undefined){
      block = canvas.buildingBlocks[action.block_uuid];
    }
  }

  if(action.entry){
    if(action.entry._id===undefined){
      if(action.entry.index!==undefined){
        let index=action.entry.index;
        action.entry=Object.assign({},Object.values(block.entries)[index],{index});
      }
    }
  }
  switch (action.type) {
    /* add entry : search for the right buildingBlock, the add the entry to its entry array */
    case 'ADD_ENTRY_ACTION':

      if(action.entry === {} || action.entry === undefined || action.entry._id === undefined){
        throw ReducerError("add entry failure");
      }
      if(action.block_uuid === undefined || action.canvas_uuid === undefined) {
        throw ReducerError("add entry failure");
      }

      return {
        canvases:{
          [action.canvas_uuid]: {
            buildingBlocks:{
              [action.block_uuid]:{
                entries:{...block.entries,[action.entry._id]:action.entry}
              }
            }
          }
      }
    }

    case 'ADD_ENTRY_CANVAS_ACTION':
      result={canvases:{...action.canvases}}
      if(action.canvas_uuid && action.blocks){
        let blocks={}
        result.canvases[action.canvas_uuid]={buildingBlocks:blocks}
        for (block in action.blocks) {
          var entries = action.blocks[block];
          blocks[block]={...blocks[block],entries:{...canvas.buildingBlocks[block].entries,...entries}}
        }
      }
      return result;

    case 'CHANGE_ADD_ACTION':
      let {changeAction,addAction}=action;
      let add=EditorReducer(persistent,addAction);
      let change=EditorReducer(persistent,changeAction);
      let canvases=add.canvases;
      canvases={...canvases,
        [changeAction.canvas_uuid]:{
          ...canvases[change.canvas_uuid],
          buildingBlocks:{
            ...(canvases[changeAction.canvas_uuid]||{}).buildingBlocks,
            [changeAction.block_uuid]:{
              ...((canvases[changeAction.canvas_uuid].buildingBlocks||{})[changeAction.block_uuid]),
              entries:{
                ...((canvases[changeAction.canvas_uuid].buildingBlocks||{})[changeAction.block_uuid]||{}).entries,
                ...(change.canvases[changeAction.canvas_uuid].buildingBlocks[changeAction.block_uuid]||{}).entries
              }
            }
          }
        }
      }
      return {canvases};

    case 'DEL_ADD_ACTION':
      result={canvases:{...action.newCanvases},tags:{}}
      if(action.canvas_uuid){
        let canvas_uuid=action.canvas_uuid;
        result.canvases[canvas_uuid]={buildingBlocks:{}};
        if(action.delBlocks){//{[block_id]:{[entry_id1]:entry1,[entry_id2]:entry2}}
          for(block in action.delBlocks){
            let delEntries=action.delBlocks[block];
            let entries={...(result.canvases[canvas_uuid].buildingBlocks[block]||{entries:canvas.buildingBlocks[block].entries}).entries}
            Object.keys(delEntries).forEach((entry_id)=>delete entries[entry_id]);
            result.canvases[canvas_uuid].buildingBlocks={
              ...result.canvases[canvas_uuid].buildingBlocks,
              [block]:{entries}
            }
          }
        }
        if(action.newBlocks){//{[block_id]:{[entry_id1]:entry1,[entry_id2]:entry2}}
          for(block in action.newBlocks){
            let newEntries=action.newBlocks[block];
            let oldEntries=(result.canvases[canvas_uuid].buildingBlocks[block]||canvas.buildingBlocks[block]).entries;
            let oldIds=Object.keys(oldEntries);
            let newIds=Object.keys(newEntries);
            if((oldIds.length>newIds.length)||(oldIds.some((ent)=>newIds.indexOf(ent)<0))){
              //console.log("OldIDs > newIDs?",oldIds.length,newIds.length);
              //console.log("Missing id:",oldIds.find((ent)=>newIds.indexOf(ent)<0),oldIds.findIndex((ent)=>newIds.indexOf(ent)<0));
              newEntries={...oldEntries,...newEntries};
            }
            /* eslint-disable no-loop-func */
            //inner function "(tag)=>..." cannot be moved up because of reference to block
            Object.values(newEntries).forEach((entry)=>
              entry.content.tags.forEach((tag)=>{
                result.tags[tag]={entries:{
                  ...(result.tags[tag]||{}).entries,
                  [entry._id]:{canvas:action.canvas_uuid, block, entry:entry._id}
                }}
              })
            )
            /* eslint-enable no-loop-func */
            result.canvases[canvas_uuid]={
              buildingBlocks:{
                ...result.canvases[canvas_uuid].buildingBlocks,
                [block]:{entries:newEntries}
              }
            }
          }
        }
      }
      return result;

    /*
    remove entry : search for the right buildingBlock, then remove the entry from its entry array
    */
    case 'REMOVE_ENTRY_ACTION':

      if(action.entry === {} || action.entry === undefined || action.entry._id === undefined){
        throw ReducerError("add entry failure");
      }
      if(action.block_uuid === undefined || action.canvas_uuid === undefined) {
        throw ReducerError("add entry failure");
      }
      let newEntries_remove = Object.assign({},block.entries);
      delete newEntries_remove[action.entry._id]

      return {
        canvases:{
          [action.canvas_uuid]: {
            buildingBlocks:{
              [action.block_uuid]:{
                entries:newEntries_remove
              }
            }
          }
        }
      }

    /*
    change entry : search for the right buildingBlock, 'reload' the entry within its entry array
    */
    case 'CHANGE_ENTRY_ACTION':

      if(action.entry === {} || action.entry === undefined ||
         action.entry._id === undefined || action.canvas_uuid === undefined || action.block_uuid === undefined){
        throw ReducerError("change entry failure");
      }

      return {
        canvases:{
          [action.canvas_uuid]: {
            buildingBlocks:{
              [action.block_uuid]:{
                entries:{
                  [action.entry._id]:action.entry
                }
              }
            }
          }
        }
      }
    case 'CREATE_TAG_ACTION':
      {
        let tag=action.tag;
        result={tags:{[tag._id]:tag},canvases:{}}
        tag.canvases.forEach((canvasID)=>{
          result.canvases[canvasID]={tags:[...(persistent.canvases[canvasID]||{}).tags,tag._id]}
        })
        Object.values(tag.entries).forEach((entry)=>{
          result.canvases[entry.canvas]={...result.canvases[entry.canvas],
            buildingBlocks:{...(result.canvases[entry.canvas]||{}).buildingBlocks,
              [entry.block]:{entries:{
                ...((result.canvases[entry.canvas]||{buildingBlocks:{}}).buildingBlocks[entry.block]||{}).entries,
                  [entry.entry]:{content:{tags:[
                    ...(((persistent.canvases[entry.canvas]||{buildingBlocks:{}}).buildingBlocks[entry.block]||{entries:{}}).entries[entry.entry]||{content:{tags:[]}}).content.tags,
                    tag._id
                  ]}}
              }}
            }
          }
        })
      }
      return result;

    case 'CHANGE_TAG_ACTION':
      return {
        tags:{
          [action.tag_id]:{
            color:action.color,
            title:action.title,
            description:action.description
          }
        }
      }

    case 'CHANGE_ENTRY_TAGS_ACTION':
      {
        let entry=block.entries[action.entry_uuid];
        result={
          tags:{},
          canvases:{
            [action.canvas_uuid]:{
              buildingBlocks:{
                [action.block_uuid]:{
                  entries:{
                    [action.entry_uuid]:{
                      content:{
                        tags: [
                          ...new Set([...entry.content.tags, ...action.addTags.filter(tag=>tag!=={})])
                        ].filter(tag=>action.removeTags.indexOf(tag)<0)
                      }
                    }
                  }
                }
              }
            }
          }
        }
        action.addTags.forEach((tag)=>{
          result.tags[tag]={
            entries: {
              ...(persistent.tags[tag]?persistent.tags[tag].entries:[]),
              [action.entry_uuid]:{canvas:action.canvas_uuid,block:action.block_uuid,entry:action.entry_uuid}
            }
          }
        })
        action.removeTags.forEach((tag)=>{
          result.tags[tag]={
            entries:{...persistent.tags[tag].entries}
          }
          delete result.tags[tag].entries[action.entry_uuid];
        })
      }
      return result;

    case 'CHANGE_CANVAS_TAGS_ACTION':
      result={
        tags:{},
        canvases:{
          [action.canvas_uuid]:{
            tags: [
              ...new Set([...canvas.tags, ...action.addTags.filter(tag=>tag!=={})])
            ].filter(tag=>action.removeTags.indexOf(tag)<0)
          }
        }
      };
      action.addTags.forEach((tag)=>{
        result.tags[tag]={
          canvases:[
            ...(persistent.tags[tag]?persistent.tags[tag].canvases:{}),
            action.canvas_uuid]
        }
      });
      action.removeTags.forEach((tag)=>{
        result.tags[tag]={
          canvases:persistent.tags[tag].canvases.filter((canv)=>canv!==action.canvas_uuid)
        }
      });
      return result;
    case 'CHANGE_CANVAS_TITLE_ACTION':
      return{
        canvases:{
          [action.canvas_uuid]:{
            title:action.title
          }
        }
      }
      case 'CHANGE_CANVAS_DESCRIPTION_ACTION':
      return{
        canvases:{
          [action.canvas_uuid]:{
            description:action.description
          }
        }
      }
    case 'CHANGE_CANVAS_OPTIONS_ACTION':
      return{
        canvases:{
          [action.canvas_uuid]:{
            options:action.options
          }
        }
      }
      case 'CHANGE_CANVAS_CONFIGURATION_ACTION':
        return{
          canvases:{
            [action.canvas_uuid]:{
              configuration:action.configuration
            }
          }
        }
    default:
      return persistent;
  }
}

export const typedEditorReducer = createReducerTypeMapping(
  EditorReducer,
  "store.persistent",
  createReducerType('ADD_ENTRY_ACTION', (action)=>{
    let result=("canvases." + action.canvas_uuid + ".buildingBlocks." + action.block_uuid + ".entries")
    return result;
  }),
  createReducerType('ADD_ENTRY_CANVAS_ACTION', (action)=>action.changed),
  createReducerType('DEL_ADD_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_ADD_ACTION',(action)=>action.changed),
  createReducerType('REMOVE_ENTRY_ACTION',(action)=>
    ("canvases." + action.canvas_uuid + ".buildingBlocks." + action.block_uuid + ".entries")),
  createReducerType('CHANGE_ENTRY_ACTION',(action)=>
    ("canvases." + action.canvas_uuid + ".buildingBlocks." + action.block_uuid + ".entries."+action.entry._id+".content")),
  createReducerType('CREATE_TAG_ACTION', (action)=>action.changed),
  createReducerType('CHANGE_TAG_ACTION', (action)=>action.changed),
  createReducerType('CHANGE_ENTRY_TAGS_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_CANVAS_TAGS_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_CANVAS_TITLE_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_CANVAS_DESCRIPTION_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_CANVAS_OPTIONS_ACTION',(action)=>action.changed),
  createReducerType('CHANGE_CANVAS_CONFIGURATION_ACTION',(action)=>action.changed)
)
