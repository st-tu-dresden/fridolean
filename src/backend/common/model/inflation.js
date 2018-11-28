export const inflateEntry = function (entry) {
    return entry;
}

export const flattenEntry = function (entry) {
    return entry;
}

export const inflateEntries = function (entries) {
    let newEntries = {};
    entries.forEach((entry) => {
        if (!entry) return;
        if (!entry._id) throw new Error("entry._id cannot be falsy!");
        newEntries[entry._id] = inflateEntry(entry);
    })
    return newEntries;
}

export const flattenEntries = function (entriesObject) {
    return Object.values(entriesObject).filter((entry) => !!entry).map(flattenEntry);
}

export const inflateBuildingBlock = function (block) {
    return { ...block, entries: inflateEntries(block.entries) }
}

export const flattenBuildingBlock = function (block) {
    return { ...block, entries: flattenEntries(block.entries) }
}

export const inflateBuildingBlocks = function (buildingBlocks) {
    let newBuildingBlocks = {};
    buildingBlocks.forEach((block) => {
        if (!block) return;
        if (!block._id) throw new Error("block._id cannot be falsy!");
        newBuildingBlocks[block._id] = inflateBuildingBlock(block)
    })
    return newBuildingBlocks;
}

export const flattenBuildingBlocks = function (buildingBlocksObject) {
    return Object.values(buildingBlocksObject).filter((block) => !!block).map(flattenBuildingBlock);
}

export const inflateCanvas = function (canvas) {
    return { ...canvas, buildingBlocks: inflateBuildingBlocks(canvas.buildingBlocks) }
}

export const flattenCanvas = function (canvas) {
    return { ...canvas, buildingBlocks: flattenBuildingBlocks(canvas.buildingBlocks) }
}

export const inflateCanvases = function (canvases) {
    let newCanvases = {};
    canvases.forEach((canvas) => {
        if (!canvas) return;
        if (!canvas._id) throw new Error("canvas._id cannot be falsy!");
        newCanvases[canvas._id] = inflateCanvas(canvas)
    })
    return newCanvases;
}

export const flattenCanvases = function (canvasesObject) {
    return Object.values(canvasesObject).filter((canvas) => !!canvas).map(flattenCanvas);
}

export const inflateTag = function(tag) {
    let result={...tag,entries:{}};
    tag.entries.forEach((locStr)=>{
        let [canvas,block,entry] = locStr.split("/");
        result.entries[entry]={canvas,block,entry};
    });
    return result;
}

export const flattenTag = function(tag) {
    return {...tag,entries:Object.values(tag.entries).map((locObj)=>{
        let {canvas,block,entry} = locObj;
        return `${canvas}/${block}/${entry}`
    })};
}

export const inflateTags = function (tags) {
    let newTags = {};
    tags.forEach((tag) => {
        if (!tag) return;
        if (!tag._id) throw new Error("tag._id cannot be falsy!");
        newTags[tag._id] = inflateTag(tag)
    })
    return newTags;
}

export const flattenTags = function (tags) {
    return Object.values(tags).filter((tags)=>!!tags).map(flattenTag)
}