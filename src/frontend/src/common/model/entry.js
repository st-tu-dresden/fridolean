import { createCanvas } from './canvas'
const uuidv4 = require('uuid/v4')

export const createEntry = function (text = "", title = "default", reference = "", tags = []) {
    let entryType = "plain"
    if (reference)
        entryType = "link"
    return { content: { text, title, tags, reference }, _id: uuidv4(), entryType }
}

export const createTextEntry = (text = "", title = "default", tags = []) => createEntry(text, title, undefined, tags)
export const createReferencePair = function (text = "", title = "default", parentID = "") {
    let canvas = createCanvas(title, "VALUE_PROPOSITION", "", parentID);
    let linkIt = createEntry(text, title, canvas._id);
    return { linkIt, canvas }
}
