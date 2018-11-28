// Controller for all collaborator specific rest endpoints

// Import other modules
var mongoose = require('mongoose');
const User = require('../../../models/user/model');

import {manager} from '../../../project_manager/manager';
import {connection} from '../../../project_manager/database';


//
// ─── HELPERS ────────────────────────────────────────────────────────────────────
//


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

    try{
        res.status(statusCode.status).send({"message": statusCode.message});
        return true;
    }catch(err){
        res.status(statusCode.status).send({"message": "No project found with this id"});
        return true;
    }
}




//
// ─── CONTROLLER ─────────────────────────────────────────────────────────────────
//

// See swagger file!


function addCollaborator(req, res) {
    let id;
    let data;
    
    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    if(data.email === undefined){
        return res.status(400).send("invalid body! no email");        
    }
    
    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkEditAccess(id, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }

        manager.getProject( id, (managerError, projectManager) => {
            projectManager.addCollaborator(data.email, data.rights, (err) => {
                if (err) {
                    res.status(err.status).send(err.message);
                } else {
                    res.status(200).end();
                }
            })
        });
    });
}

function updateCollaborator(req, res) {
    let id;
    let data;
    
    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    if(data.email === undefined){
        return res.status(400).send("invalid body! no email");        
    }

    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkEditAccess(id, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }

        manager.getProject( id, (managerError, projectManager) => {
            projectManager.updateCollaborator(data.email, data.rights, (err) => {
                if (err) {
                    res.status(err.status).send(err.message);
                } else {
                    res.status(200).end();
                }
            })
        });
    });
}

function deleteCollaborator(req, res) {
    let id;
    let data;
    
    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    if((typeof data.email).toLowerCase()!="string")
        return res.status(400).send({"message": "Invalid body (missing email property)"});
        

    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkEditAccess(id, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }
    
        manager.getProject( id, (managerError, projectManager) => {
            projectManager.deleteCollaborator(data.email, (err) => {
                if (err) {
                    res.status(err.status).send(err.message);
                } else {
                    res.status(200).end();
                }
            })
        });
    });
}

//-------Export-------
module.exports = {
    addCollaborator,
    updateCollaborator,
    deleteCollaborator,
}
