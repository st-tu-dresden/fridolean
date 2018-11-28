const uuidv4 = require('uuid/v4')

export const createTag = (color = "", title = "", description = "") => {
    return {
        _id:uuidv4(),
        color,
        title,
        description,
        canvases: [],
        entries: {}
    }
}