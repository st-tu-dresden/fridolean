const uuidv4 = require('uuid/v4')
const layouts = require("./canvasTypes")
/* Supported canvasType-layouts:
 *  {
 *      [canvastype]: [
 *          blockTitle,
 *          blockTitle,
 *          {title: blockTitle},
 *          blockTitle,...
 *      ],
 *      [canvastype]: {
 *          (optional) view: viewName=canvastype,
 *          blocks: [
 *              blockTitle,
 *              {title: blockTitle},
 *              blockTitle,
 *              blockTitle,
 *              {
 *                  title: blockTitle,
 *                  (optional) buildingBlockType: blockType = "data",
 *                  (optional) description: blockDescription = "",
 *                  (optional) layoutEntry: blockPositionSize = {},
 *                  (optional) entries: [
 *                      entryText,
 *                      entryText,...
 *                  ]
 *              },...
 *          ]
 *      },...
 *  }
 */

export const createCanvas = function (title = "", type = "BUSINESS_MODEL", description = "", configuration = "", parent = "") {
    let layout = layouts[type];
    if (!layout) throw new Error(`'${type}' is no valid canvas type`)
    return {
        _id: uuidv4(),
        canvasType: type,
        title: title,
        description: description,
        configuration: configuration,
        tags: [],
        options: {
            enableMarkdown: true
        },
        lastEdited: Date.now(),
        buildingBlocks: createBuildingBlocks(Array.isArray(layout) ? layout : layout.blocks || [])
    }
}

function createBuildingBlock(title = "", type = "data", description = "", entries = [], layoutEntry = {}) {
    if ((type !== "data") && (entries.length !== 0)) {
        console.log("Cannot create default-entries for non 'data'-typed buildingblock '" + title + "'");
        entries = [];
    }
    return {
        _id: uuidv4(),
        buildingBlockType: type,
        title: title,
        description: description,
        layoutEntry: { _id: uuidv4(), ...layoutEntry },
        entries: entries.map((text) => ({
            content: {
                text,
                title: "default",
                tags: [],
                reference: "",
                target: ""
            },
            _id: uuidv4(),
            entryType: "plain"
        }))//TODO: Remove duplicate entry-creation-code once vpc creation has been seperated (currently cyclic dependency)
    }
}

function createBuildingBlocks(template) {
    let result = {}
    template.forEach((blocktemplate) => {
        let block;
        if ((typeof blocktemplate) !== "string") {
            let { title, buildingBlockType, description, entries, layoutEntry } = blocktemplate;
            block = createBuildingBlock(title, buildingBlockType, description, entries, layoutEntry);
        } else
            block = createBuildingBlock(blocktemplate);
        result[block._id] = block;
    })
    return result;
}

export const getCanvasTypes = () => Object.keys(layouts)


export const getCanvasInfo = (canvastype) => {
    let layout = layouts[canvastype];
    if (!layout) throw new Error(`'${canvastype}' is no valid canvas type`)
    if (Array.isArray(layout))
        return { canvastype, view: canvastype }
    else
        return { canvastype, view: layout.view || canvastype }
}

export const getBuildingBlockInfo = (canvastype) => {
    let layout = layouts[canvastype];
    if (!layout) throw new Error(`'${canvastype}' is no valid canvas type`)
    let blocks = Array.isArray(layout) ? layout : layout.blocks
    return (blocks || []).map((block) => {
        if ((typeof block) === "string")
            return { title: block, buildingBlockType: "data", description: "" }
        else
            return {
                title: block.title || "",
                buildingBlockType: block.buildingBlockType || "data",
                description: block.description || "",
                layoutEntry: block.layoutEntry || {},
                entries: block.entries || []
            }
    })
}
