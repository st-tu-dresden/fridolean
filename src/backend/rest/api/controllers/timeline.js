'use strict';
var util = require('util');
var mongoose = require('mongoose');

const {projectModel} = require('../../../project_manager/models');
const Project = projectModel;

import {manager} from '../../../project_manager/manager';
import {connection} from '../../../project_manager/database';

module.exports = {
    getTimeline,
    getTimelineState,
    postTimeline,
    restoreState,
    copyState
};

// Returns a list of the tagged states stored in the timeline
function getTimeline(req, res) {
    const projectID = req.swagger.params.projectID.value;
    let userID;
    try{
        userID=req.user._id.toString();
    }catch(er){}

    /*if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }*/
    connection.checkReadAccess(projectID, userID, (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }

        Project.findById(projectID, function(err, project) { // <-- ??? Delegate to database ???
            if (err) {
                return res.status(400).end(); 
            }

            if (project) {
                const states = project.timeline.map((timelineEntry, index) => ({
                    id: timelineEntry._id,
                    tag: timelineEntry.tag,
                    timestamp: timelineEntry.timestamp
                }));

                res.status(200).json({
                    states
                }).end();

            } else {
                res.status(404).json({message: "Project not found"});
            } 
        });
    });
}

// Get the content of a specific tagged timeline state
function getTimelineState(req, res) {
    const projectID = req.swagger.params.projectID.value;
    const stateID = req.swagger.params.stateID.value;
    let userID;
    try{
        userID=req.user._id.toString();
    }catch(er){}
    /*if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }*/
    connection.checkReadAccess(projectID, userID, (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }
        connection.readTimelineEntry(projectID,stateID, (err,result)=>{
            if(err&&(err.status!==200)){
                return res.status(err.status).json(err).end();
            }else{
                const stateInformation = {
                    id: result._id, 
                    tag: result.tag, 
                    timestamp: result.timestamp};
                const projectInformation = {
                    content: result.value
                }
                return res.status(200).json({stateInformation,...projectInformation}).end();
            }
        })
    });

    /*Project.findById(projectID,undefined,{lean:true}, function(err, project) {
        if (err) {
            return res.status(400).end(); 
        }

        if (project) {
            if (project.timeline.length > 0) {
                let counter = project.timeline.length;
                project.timeline.forEach(function(timelineEntry, index) {
                                        
                    if (timelineEntry._id.equals(stateID)) {
                        //console.log(timelineEntry._id);                                            
                        // we found the queried state
                        const stateInformation = {
                            id: timelineEntry._id,
                            tag: timelineEntry.tag,
                            timestamp: timelineEntry.timestamp
                        }

                        const projectInformation = {
                            content: timelineEntry.value
                        }
                        
                        return res.status(200).json({
                            stateInformation,
                            ...projectInformation
                        }).end();
                    }
                    
                    counter -= 1;
                    if (counter === 0) {
                        // no timelineEntry with that id found                
                        return res.status(404).json({
                            message: "Timeline State not found."
                        }).end();                        
                    }
                });


            } else {
                // not timelineEntries at all
                res.status(404).json({message: "Timeline State not found."}).end();                
            }
            
        } else {
            // no project found
            return res.status(404).json({message: "Project not found."}).end();
        }
    })*/


}

// Store the current project state in the timeline
function postTimeline(req, res) {
    const projectID = req.swagger.params.projectID.value;
    const tag = req.swagger.params.tag.value; // the state tag (string)

    console.log(tag);

    if (tag == null || tag == undefined) {
        return res.status(400).end();
    }

    // get the project and save the current(newest) project state 
    // to the project timeline
    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkEditAccess(projectID, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).send({"message": "User not authorized"});
        }

        manager.getProject(projectID, (managerError, projectManager) => {
            if (managerError) {
                return res.status(500).send({"message": "An error occurred"});
            }

            projectManager.addTimelineEntry(tag.tag, (statusCode, addedTimelineEntry) => {
                if (addedTimelineEntry && addedTimelineEntry.value){
                    addedTimelineEntry = {...addedTimelineEntry};
                    delete addedTimelineEntry.value; //retain backwards-compatibility
                }
                if (statusCode.status !== 200) {
                    res.status(statusCode.status).json({message: statusCode.message});
                } else {
                    res.status(200).json(addedTimelineEntry).end();
                }
            })
        });
    });
}

//Restore a project state saved in the timeline (copy it to the current project state)
function restoreState(req, res) {
    const projectID = req.swagger.params.projectID.value;
    const stateID = req.swagger.params.stateID.value; // ID of a specific timeline state

    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkEditAccess(projectID, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).end();
        }
        manager.getProject(projectID, (managerError, projectManager) => {
            if (managerError) {
                return res.status(500).send({"message": "An error occurred"});
            }

            projectManager.restoreStateFromTimelineEntry(stateID, (statusCode, restoredTimelineEntry) => {
                if (statusCode.status !== 200) {
                    res.status(statusCode.status).json({message: statusCode.message});
                } else {
                    res.status(200).json(restoredTimelineEntry).end();
                }
            })
        });
    });
}

// Copy a project state (including all previous timeline states) and create a new project (for the user).
function copyState(req, res) {
    const projectID = req.swagger.params.projectID.value;
    const stateID = req.swagger.params.stateID.value;
    // metadata of copied Project (not required)
    const data = req.swagger.params.data.value;
    // the user passed from the auth middleware
    const user = req.user;

    if (!req.user) {
        return res.status(401).send({"message": "No authorization sent"});
    }
    connection.checkReadAccess(projectID, req.user._id.toString(), (accessError) => {
        if (accessError && accessError.status !== 200) {
            return res.status(accessError.status).end();
        }
        Project.findById(projectID, function (err, project){
            if (err) {
                return res.status(400).end();             
            }

            if (project) {
                let entries = project.timeline.filter(e => e._id == stateID);

                if (entries.length === 0) {
                    return res.status(404).json({message:'Timeline entry not found.'}).end();  
                }

                let timelineEntry = entries[0];

                //  get all earlier timeline Entries
                let timelineEntriesToCopy = project.timeline.filter(e => {
                    return (e.timestamp <= timelineEntry.timestamp);

                });


                // the documents that will need unique id's
                let dataToClone = {
                    persistent: timelineEntry.value,
                    timeline: timelineEntriesToCopy   
                };

                // now make the id's unique 

                // For cloning, we will recursively delete the _id key from the object and then again save 
                // it as a Mongoose object which will automatically generate _id for the cloned object.
                // http://www.connecto.io/blog/deep-copyingcloning-of-mongoose-object/
                var copiedObjectWithId = JSON.parse(JSON.stringify(dataToClone));
                // call the lower function (see js hoisting) -> NOT needed to regenerate ids!!!
                //objectIdDel(copiedObjectWithId);
                function objectIdDel(copiedObjectWithId) {
                    if (copiedObjectWithId != null && typeof(copiedObjectWithId) != 'string' &&
                      typeof(copiedObjectWithId) != 'number' && typeof(copiedObjectWithId) != 'boolean' ) {
                      //for array length is defined however for objects length is undefined
                      if (typeof(copiedObjectWithId.length) == 'undefined') { 
                        delete copiedObjectWithId._id;
                        for (var key in copiedObjectWithId) {
                          objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
                        }
                      }
                      else {
                        for (var i = 0; i < copiedObjectWithId.length; i++) {
                          objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
                        }
                      }
                    }
                } 

                let copiedProject = new Project({
                    title: data.title || timelineEntry.tag, // new project title -> timeline entry tag
                    visibility:	data.visibility || 'PRIVATE', // default PRIVATE'
                    lastEdited:	Date.now(),
                    description: data.description || project.description,
                    members: [{
                        userID: user._id,
                        email: user.email,
                        rights: 'EDIT'

                    }],
                    persistent: copiedObjectWithId.persistent,
                    timeline: copiedObjectWithId.timeline   
                })

                // save the copied Project            
                // now we save the document and all missing ids will generate automatically
                copiedProject.save(function(err, project) {
                    if (err) {
                        return res.status(500).json({message:'An error occurred',error:err}).end();
                    }else {
                        // push the project id to the user projects list    
                        user.projects.push(project._id);
                        user.save(function(err, user){
                            if (err) {
                                return res.status(500).json({message:'An error occurred',error:err}).end();                    
                            } else {
                                return res.status(200).json({
                                    message: 'Project copied successfully.',
                                    _id: project._id,
                                    title: project.title,
                                    visibility: project.visibility,
                                    lastEdited: project.lastEdited,
                                    description: project.description,
                                    members: project.members
                                }).end();                            
                            }
                        })                
                    }
                });




            }
        }) 
    });

}