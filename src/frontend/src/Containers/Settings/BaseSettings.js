import { Component } from 'react'

class BaseSettings extends Component {

    getPersistent(timeTagID=this.props.timeTagID){
        return this.props.store.persistent;
    }

    getGlobalTags(){
        return this.getPersistent().tags;
    }

    getTag(tagID = this.props.tagID) {
        return this.getGlobalTags()[tagID]
    }

    getCanvas(canvasID = this.props.canvasID) {
        return this.getPersistent().canvases[canvasID]
    }

    getBlock(canvasID = this.props.canvasID, blockID = this.props.blockID) {
        return this.getCanvas(canvasID).buildingBlocks[blockID]
    }

    getEntry(canvasID = this.props.canvasID, blockID = this.props.blockID, entryID = this.props.entryID) {
        return this.getBlock(canvasID, blockID).entries[entryID]
    }
}

export default BaseSettings