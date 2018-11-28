'use strict';
var util = require('util');
var mongoose = require('mongoose');
const User = require('../../../models/user/model');
const {projectModel} = require('../../../project_manager/models');
const Project = projectModel;

module.exports = {
    getUser,
    updateUser,
    getUserProjects,
    createKeycloakUser
}

function getUser(req, res) {
    
    var id = req.swagger.params.userID.value;
    User.findById(id , function(err, user){
            if (err) {
                console.log(err);
                return res.status(400).end();
            }
    
            if (user) {
                if (user.email !== req.user.email) {
                    // forbidden: user has no rights
                    return res.status(403).end();
                }

                res.json({
                    id: user.id,
                    email: user.email
                }).end();
            } else {
                res.status(404).json({
                    message: "user not found"
                }).end();
            }
        });
}
  

function updateUser(req, res) {
    
    var id = req.swagger.params.userID.value;
    var data = req.swagger.params.newData.value;

    User.findById(id , function(err, user){
        if (err) {
            return res.status(400).end();
        }

        if (user) {
            if (user.email !== req.user.email) {
                // forbidden: user has no rights
                return res.status(403).end();
            }

            // validate new data (e.g. password)
            const validationResult = validateUserProfileForm(data);
            if (!validationResult.success) {
                return res.status(400).json({
                    success: false,
                    message: validationResult.message,
                    errors: validationResult.errors
                });
            }

            // now update
            user.password = data.password;

            // save the udpated user
            user.save((err, user) => {
                if (err) {
                    return res.status(400).end();
                }
                // send back updated user
                res.status(200).json({
                    id: user.id,
                    email: user.email
                }).end();
            })

        } else {
            res.status(404).json({
                message: "user not found"
            }).end();
        }
    });
}

function validateUserProfileForm(payload) {
    const errors = {};
    let isFormValid = true;
    let message = '';

  
    if (!payload || 
        typeof payload.password !== "string" || 
        payload.password.trim().length < 6) {
            isFormValid = false;
            errors.password = "Password must have at least six characters.";
    }

    if (!payload || 
        typeof payload.passwordRepeat !== "string" || 
        // payload.passwordRepeat.trim().length < 6 ||
        payload.passwordRepeat !== payload.password) {
            isFormValid = false;
            errors.passwordRepeat = "Your passwords don't match.";
    }


    if (!isFormValid) {
        message = "Check the form for errors."
    }
    
    return {
        success: isFormValid,
        message,
        errors
    };
}

function getUserProjects(req, res) {
    var id = req.swagger.params.userID.value;

    User.findById(id , function(err, user){
        if (err) {
            console.error(err);
            return res.status(400).end();
        }

        if (user) {
            if (user.email !== req.user.email) {
                // forbidden: user has no rights
                return res.status(403).end();
            }
            // apply mongoose.Types.ObjectId on the array -> not required anymore
            // const userProjectIDs = toObjectId(user.projects);

            // query the array of project ids
            Project.find({
                _id: { $in: user.projects }
                }, (err, projects) => {
                    if (err) {
                        // Note that this error doesn't mean nothing was found,
                        // it means the database had an error while searching, hence the 500 status
                        return res.status(500).send(err);
                    }

                    if (projects) {
                        // create the list of project infos
                        // const projectInfos = []
                        // projects.forEach(function(project, index) {
                        //     projectInfos.push(project.information);
                        // }, this);

                        const projectInfos = projects.map((p, i) => ({
                            "_id": p._id,
                            "title": p.title,
                            "visibility": p.visibility,
                            "lastEdited": p.lastEdited,
                            "description": p.description,
                            "members": p.members,
                        }));

                        return res.status(200).json({
                            id: user.id,
                            email: user.email,
                            projects: projectInfos
                        }).end();
                    }
                    else {
                        res.status(404).json({
                            message: "no projects found"
                        }).end();
                    }
            });

        } else {
            res.status(404).json({
                message: "user not found"
            }).end();
        }
    });
}


function createKeycloakUser(req, res) {
    const keycloak_id = req.swagger.params.keycloakID.value;
    const data = req.swagger.params.newData.value;
    User.findOne({keycloak_id: keycloak_id}, (err, user) => {
        if (err) {
            console.error(err);
            return res.status(400).end();
        }

        if (!user) {
            user = new User();
        }
        user.email = data.email;
        user.password = "loginviakeycloaknopasswordrequired";
        user.keycloak_id = keycloak_id;
        user.save((err, user) => {
            if (err) {
                return res.status(400).end();
            }
            // send back updated user
            res.status(200).json({
                id: user.id,
                email: user.email
            }).end();
        })
    });
}
