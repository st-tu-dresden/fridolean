// Controller for all project specific rest endpoints

// Import other modules
import {manager} from '../../../project_manager/manager';
import {connection} from '../../../project_manager/database';
import { access } from 'fs';


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
    if(statusCode==undefined)
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

function createProject(req, res){
    let data;

    try{ // If params cant be accessed
        data = req.swagger.params.data.value;
    }catch (err) {
        return res.status(500).send({"message": "An error occurred"});
    }

    let userID = req.user._id;
    let userMail = req.user.email;

    // Create new Project
    connection.createProject(userID, userMail, data, (statusCode, project) => {
        if( handleError(statusCode, res)) return;

        req.user.projects = [
            ...req.user.projects,
            project._id,
        ];
        req.user.save();

        res.json( project);
    });
}



function getProjectInfo(req, res){
    let id;

    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let userID = (req.user?req.user._id.toString():undefined);

    connection.checkReadAccess(id, userID,(accessError) => {
        if( handleError(accessError, res))
            return;

        manager.getProject( id, (managerError, dbProjectManager) => {
            dbProjectManager.readProject((statusCode, project) => {
    
                if( handleError(statusCode, res))
                    return;
                
                res.json(project);
            })
        });
    });
}

function getPublicProjects(req, res){
    let title;
    let start;
    let count;

    try { // If params cant be accessed
        title = req.swagger.params.title.value||"";
        start = req.swagger.params.start.value||"0";
        count = req.swagger.params.count.value||"-1";
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let startInt = parseInt(start);
    let countInt = parseInt(count);
    if(startInt === NaN || countInt === NaN)
        return res.status(400).send({"message": "start or count is not a number"});

    if(title === undefined || title === ""){
        connection.getPublicProjects((dbError, projects)=>{
            if(handleError(dbError, res))
                return;

            res.json(projects);
        },startInt,countInt);
    } else {
        connection.getPublicProjectsByTitle(title,(dbError, projects)=>{
            if(handleError(dbError, res))
                return;
            res.json(projects);
        },startInt,countInt);
    }
}


function deleteProject(req, res){
    let id;
    
    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let userID = req.user._id.toString();

    connection.checkEditAccess(id, userID,(accessError) => {
        if( handleError(accessError, res))
            return;
        manager.deleteProject(id, (managerError)=>{
            if( handleError(managerError, res))
                return;
            res.status(200).json({message: 'Project successfully deleted!'});
        },userID)
    })
        

}

function updateProject(req, res) {
    let id;
    let data;
    
    try { // If params cant be accessed
        id = req.swagger.params.projectID.value;
        data = req.swagger.params.data.value;
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let userID = req.user._id.toString();
    
    connection.checkEditAccess(id, userID,(accessError) => {
        if( handleError(accessError, res))
            return;

        manager.getProject( id, (managerError, projectManager) => {
            projectManager.updateProject(data, (err) => {
                if (err) {
                    res.status(500).send(err);
                } else {
                    res.status(200).end();
                }
            },userID);
        });
    })
}


//-------Export-------
module.exports = {
    getProjectInfo,
    createProject,
    deleteProject,
    updateProject,
    getPublicProjects,
}
