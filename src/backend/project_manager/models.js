const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');
require('../models/index').assertCurrentVersion();

// -------------------------------------------------------------------------
//  This document contains all mongoose schemas/models used for the project
// -------------------------------------------------------------------------
// See SocketServerStore

// Dont use 'type' as property! http://mongoosejs.com/docs/guide.html#typeKey

const idFalse = {_id: false, usePushEach: true}; // prevent '_id' field in the subschema



const entrySchema = mongoose.Schema({
    entryType: String,
    _id: {type: String, default: uuidv4},
    content: {
        title: String,
        text: String,
        tags: [String],
        reference: String,
        target: String
    }
},{usePushEach: true })

const layoutEntrySchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    x: Number,
    y: Number,
    width: Number,
    height: Number
}, idFalse)

const buildingBlockSchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    buildingBlockType: String,
    title: String,
    description: String,
    layoutEntry: layoutEntrySchema,
    entries: [entrySchema]
},{usePushEach: true })

const canvasOptionsSchema = mongoose.Schema({
    enableMarkdown: {type:Boolean,default:true}
},idFalse)

const canvasSchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    canvasType: String,
    title: String,
    description: String,
    tags: [String],
    options: canvasOptionsSchema,
    configuration: String,
    lastEdited: Number,
    buildingBlocks: [buildingBlockSchema]
},{usePushEach: true })


const tagSchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    color: String,
    title: String,
    description: String,
    canvases: [String],
    entries: [String]  //`${canvas}/${block}/${entry}`
},{usePushEach: true})


const persistanceSchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    tags: [tagSchema],
    canvases: [canvasSchema]
}, idFalse)

const memberSchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    userID: String,
    email: String,
    rights: String //Can be 'READ' || 'EDIT'
}, idFalse)

// Schema for a timeline entry
const timelineEntrySchema = mongoose.Schema({
    _id: {type: String, default: uuidv4},
    timestamp: Number,
    tag: String,
    value: persistanceSchema, // the canvas data
},{usePushEach: true })

// Project model for the database
const projectState = {
    _id: {type: String, default: uuidv4},
    title: String,
    visibility:	String, // Can be 'PUBLIC' || 'PRIVATE'
    lastEdited:	Number,
    description: String,
    members: [memberSchema],
    persistent: persistanceSchema,
    timeline: [timelineEntrySchema]
};

const projectSchema = mongoose.Schema(projectState, {versionKey: false, usePushEach: true });

projectSchema.pre('save', function(next){ // PLEASE READ: message to future-me ---> dont use arrow functions here!!!

    // Assign last edited to the current utc time number
    this.lastEdited = Date.now();

    next();
});

const projectModel = mongoose.model('project', projectSchema);

module.exports = {
    projectModel
}
