export class ProjectManager{

    constructor(id){
        this.id=id;
    }
    
    /**
     * Creates a new canvas with the given data
     * @param {{title: string, type: string, description: string}} data 
     * @param {function} callback 
     */
    createCanvas(data, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Creates a new entry in the given buildingBlock in the canvas
     * @param {string} canvasID 
     * @param {string} buildingBlock 
     * @param {{content: any, type: string}} data 
     * @param {function} callback 
     */
    createEntry(canvasID, buildingBlock, data, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Reads the current state of the project into the callback.
     * @param {function} callback The callback with error and the read state.
     */
    readProject(callback){
        throw new Error("Not overridden.");
    }

    /**
     * Reads the canvas from the project
     * @param {string} canvasID 
     * @param {function} callback 
     */
    readCanvas(canvasID, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Write new meta-data to the project
     * @param {{title : string, visibility : string, description : ?string, members : Array.<*>}} data 
     * @param {function} callback 
     */
    updateProject(data, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Writes new meta-data to the canvas
     * @param {string} canvasID 
     * @param {{title : string, lastEdited : number, type : string}} data 
     * @param {function} callback 
     */
    updateCanvas(canvasID, data, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Writes an entry to the entryID
     * @param {string} canvasID 
     * @param {string} buildingBlock 
     * @param {string} entryID 
     * @param {{content : *, type : string}} data 
     * @param {function} callback 
     */
    updateEntry(canvasID, buildingBlock, entryID, data, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Deletes the canvas from the project
     * @param {string} canvasID 
     * @param {function} callback 
     */
    deleteCanvas(canvasID, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Deletes the entry from the buildingBlock and thereby from the canvas and project.
     * @param {string} canvasID 
     * @param {string} buildingBlock 
     * @param {string} entryID 
     * @param {function} callback 
     */
    deleteEntry(canvasID, buildingBlock, entryID, callback){
        throw new Error("Not overridden.");
    }

    /**
     * Adds new collaborator to project
     * @param {string} userMail
     * @param {string} rights
     */
    addCollaborator(userMail, rights, callback) {
        throw new Error("Not overridden.");
    }

    /**
     * New values of user with userID
     * @param {string} userMail 
     * @param {string} rights 
     */
    updateCollaborator(userMail, rights, callback) {
        throw new Error("Not overridden.");
    }
    
    /**
     * Deletes collaborator from Project
     * @param {string} userMail 
     */
    deleteCollaborator(userMail, callback) {
        throw new Error("Not overridden.");
    }

    /**
     * Add entry in timeline
     * @param {string} canvasID 
     * @param {string} tag 
     * @param {function} callback 
     */
    addTimelineEntry(canvasID, tag, callback) {
        throw new Error("Not overridden.");
    }

    
    restoreStateFromTimelineEntry(stateID, callback) {
        throw new Error("Not overridden.");
    }
    

    /**
     * Delete whole project
     * @param {function} callback 
     */
    deleteProject(callback) {
        throw new Error("Not overridden.");
    }

    getID(){
        return this.id;
    }
}