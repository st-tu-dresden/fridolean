import {createTag as createTagModel} from '../../../common/model/tag'

/**
 * addEntry
 * @param {*} e - the entry wich should be added
 * @param {*} block_uuid - the id of the parent block
 * @param {*} canvas_uuid  - the id of the parent canvas
 */
export const addEntry = (e, block_uuid, canvas_uuid) => {
  return {
    type: 'ADD_ENTRY_ACTION',
    entry: e,
    block_uuid: block_uuid,
    canvas_uuid: canvas_uuid,
    changed: "canvases."+canvas_uuid+".buildingBlocks."+block_uuid+".entries"
  }
};

export const addEntryCanvas = function(canvas_uuid, blocks={}, canvases={}){
  let changed = [
    ...Object.keys(canvases).map((canvas)=>"canvases."+canvas),
    ...Object.keys(blocks).map((block)=>`canvases.${canvas_uuid}.buildingBlocks.${block}.entries`)
  ];
  return{
    type: 'ADD_ENTRY_CANVAS_ACTION',
    canvas_uuid,
    blocks,
    canvases,
    changed
  }
}

export const delAdd = function(canvas_uuid, delCanvases=[], newCanvases={}, delBlocks={},newBlocks={}){
  let changed = [
    ...[...delCanvases,...Object.keys(newCanvases)].map((canvas_id)=>"canvases."+canvas_id),
    ...[...Object.keys(delBlocks),...Object.keys(newBlocks)].map((block_id)=>`canvases.${canvas_uuid}.buildingBlocks.${block_id}.entries`)
  ];
  Object.keys(delBlocks).forEach((block_id)=>Object.values(delBlocks[block_id]).forEach((entry)=>entry.content.tags.forEach((tag)=>changed.push(`tags.${tag}.entries.${entry._id}`))))
  return {
    type: 'DEL_ADD_ACTION',
    canvas_uuid,
    delCanvases,
    newCanvases,
    delBlocks,
    newBlocks,
    changed
  }
}

/**
 * removeEntry
 * @param {*} e - the entry wich should be removed
 * @param {*} block_uuid  - the id of the parent block
 * @param {*} canvas_uuid  - the id of the parent canvas
 */
export const removeEntry = (e, block_uuid, canvas_uuid) => {
  let changed=["canvases."+canvas_uuid+".buildingBlocks."+block_uuid+".entries."+e._id];
  if(e.content && e.content.tags){
    changed.push(...(e.content.tags.map(tag=>`tags.${tag}.entries.${e._id}`)))
  }
  return {
    type: 'REMOVE_ENTRY_ACTION',
    entry: e,
    block_uuid: block_uuid,
    canvas_uuid: canvas_uuid,
    changed
  }
};

/**
 * changeEntry : means change content of the entry
 * @param {*} e - the entry wich content should be changed
 * @param {*} block_uuid  - the id of the parent block
 * @param {*} canvas_uuid - the id of the parent canvas
 */
export const changeEntry = (e, block_uuid, canvas_uuid) => {
  //console.log("entry: ",e);
  return {
    type: 'CHANGE_ENTRY_ACTION',
    entry: e,
    block_uuid: block_uuid,
    canvas_uuid: canvas_uuid,
    changed: "canvases."+canvas_uuid+".buildingBlocks."+block_uuid+".entries"+(e._id?"."+e._id+".content":"")
  }
};

export const changeEntryTags = (entry_uuid, block_uuid, canvas_uuid, addTags=[], removeTags=[]) =>{
  return {
    type: 'CHANGE_ENTRY_TAGS_ACTION',
    entry_uuid,
    block_uuid,
    canvas_uuid,
    addTags,
    removeTags,
    changed: [`canvases.${canvas_uuid}.buildingBlocks.${block_uuid}.entries.${entry_uuid}.content.tags`,...[...addTags,...removeTags].map(tag=>`tags.${tag}.entries`)]
  }
}

export const changeCanvasTags = (canvas_uuid, addTags=[], removeTags=[]) =>{
  return {
    type: 'CHANGE_CANVAS_TAGS_ACTION',
    canvas_uuid,
    addTags,
    removeTags,
    changed: [`canvases.${canvas_uuid}.tags`,...[...addTags,...removeTags].map(tag=>`tags.${tag}.canvases`)]
  }
}

export const changeAdd=(changeArgs,addArgs) =>{
  let changeAction=changeEntry(...changeArgs)
  let addAction=addEntry(...addArgs)
  return {
    type: 'CHANGE_ADD_ACTION',
    changeAction,
    addAction,
    changed: [changeAction.changed,addAction.changed]
  }
}

/**
 * initAction
 * @param {*} state - the state wich should be initialized
 */
export const initAction = (state) => {
  return {
    type: 'INIT_ACTION',
    state
  }
};

/**
 * changeToVP
 * @param {*} e - the entry from type link
 * @deprecated
 */
export const changeToVP = (e) => {
  return {
    type: 'CHANGE_TO_VALUE_PROPOSITION',
    entry: e
  }
}

/**
 * createTag
 * @param {string} title - the title of the tag
 * @param {string} color - the color of the tag
 * @param {Array<{canvas:string, block:string, entry:string}>} entries - any entries the tag should be added to
 * @param {Array<string>} canvases - any canvases the tag should be added to
 */
export const createTag = (title,color,entries=[],canvases=[]) => {
  const tag=createTagModel(color,title);
  entries.forEach(loc=>tag.entries[loc.entry]=loc)
  tag.canvases.push(...canvases)
  return {
    type: "CREATE_TAG_ACTION",
    tag,
    changed:[`tags.${tag._id}`,...canvases.map((canv)=>`canvases.${canv}.tags`),...entries.map((ent)=>`canvases.${ent.canvas}.buildingBlocks.${ent.block}.entries.${ent.entry}.content.tags`)]
  }
}

export const changeTag = (tag_id, title=null, color=null, description=null) =>{
  let data={title,color,description}
  return {
    type: 'CHANGE_TAG_ACTION',
    tag_id,
    title,
    color,
    description,
    changed: Object.keys(data).filter(prop=>(data[prop]!==null)&&(data[prop]!==undefined)).map(prop=>`tags.${tag_id}.${prop}`)
  }
}

export const changeCanvasTitle = (canvas_uuid, title)=>{
  return {
    type: "CHANGE_CANVAS_TITLE_ACTION",
    title,
    canvas_uuid,
    changed:`canvases.${canvas_uuid}.title`
  }
}

export const changeCanvasOptions = (canvas_uuid, options)=>{
  return {
    type: "CHANGE_CANVAS_OPTIONS_ACTION",
    options,
    canvas_uuid,
    changed:`canvases.${canvas_uuid}.options`
  }
}