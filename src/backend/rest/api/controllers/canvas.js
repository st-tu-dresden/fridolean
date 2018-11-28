'use strict';


// Import other modules
import {manager} from '../../../project_manager/manager';
import {connection} from '../../../project_manager/database';


//------Helpers-------

/**
 * @param {object} statusCode 
 * @param {*} res 
 * 
 * @returns {bool} if an error occurred
 */
function handleError(statusCode, res){
    if(statusCode == undefined)
        return false;
    if(statusCode.status === 200)
        return false;
    else if(statusCode.status === undefined)
        throw new Error("Unexpected statusCode: "+JSON.stringify(statusCode));

    try{
        res.status(statusCode.status).send({"message": statusCode.message});
        return true;
    }catch(err){
        res.status(statusCode.status).send({"message": "No project found with this id"});
        return true;
    }
}











//
// ─── CONTROLLERS ────────────────────────────────────────────────────────────────
//
// See swagger file!

function createCanvas(req, res) {

    let data;
    let projectID;
    
    try{ // If params cant be accessed
        data = req.swagger.params.data.value;
        projectID = req.swagger.params.projectID.value;
    }catch (err) {
        return res.status(500).send({"message": "An error occurred"});
    }
    
    let userID = req.user._id.toString();
    
    connection.checkEditAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;

        manager.getProject(projectID, (managerError, dbProjectManager) => {
            // Handle manager error 
            if(managerError){
                console.log(managerError);
                return res.status(500).send({"message": "An error occurred"});
            }
        
            dbProjectManager.createCanvas(data, (statusCode, canvasInformation) => {
                if( handleError(statusCode, res))
                    return;

                res.json(canvasInformation);
            },userID);
        })
    })
}


function readCanvas(req, res) {
    let projectID;
    let canvasID;

    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;        
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }


    let userID = req.user._id.toString();
    
    connection.checkReadAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;

        manager.getProject(projectID,(managerError, dbProjectManager) => {

            dbProjectManager.readCanvas(canvasID, (statusCode, project) => {

                if( handleError(statusCode, res))
                    return;

                res.json(project);
            })
        });
    })
}


function deleteCanvas(req, res){
    let projectID;
    let canvasID;

    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;        
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let userID = req.user._id.toString();
    
    connection.checkEditAccess(projectID, userID,(accessError) => {
        if( handleError(accessError, res))
            return;

        manager.getProject(projectID,(managerError, dbProjectManager) => {
            
            dbProjectManager.deleteCanvas(canvasID, (statusCode, project) => {

                if( handleError(statusCode, res))
                    return;

                res.json(project);
            },userID)
        });
    })
}




//-------Export---------
module.exports = {
    createCanvas,
    readCanvas,
    deleteCanvas,
};
