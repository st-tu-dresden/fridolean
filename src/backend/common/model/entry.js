import { createCanvas } from './canvas'
const uuidv4 = require('uuid/v4')

export const createEntry = function (text = "", title = "default", reference = "", target = "", isTarget = false, tags = []) {
    let entryType = "plain"
    if (reference || target)
        entryType = "link"
    if (isTarget)
        entryType = "target"
    return { content: { text, title, tags, reference, target }, _id: uuidv4(), entryType }
}

export const createTextEntry = (text = "", title = "default", tags = []) => createEntry(text, title, undefined, undefined, undefined, tags)
export const createReferencePair = function (text = "", title = "default", parentID = "") {
    let canvas = createCanvas(title, "VALUE_PROPOSITION", "", parentID);
    let targIt = createEntry(undefined, title, undefined, undefined, true);
    let linkIt = createEntry(text, title, canvas._id, targIt._id);
    return { linkIt, targIt, canvas }
}
