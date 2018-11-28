import {createUserObject, createClientObject} from '../project_manager/store_state/client'
const jwt = require('jsonwebtoken');
const config = require('../config');

var mongoose = require('mongoose');

const User = require('../models/user/model');

const performUserLoad=true;

export function loadUserObject(userID, token, callback){
    if(!performUserLoad){
        callback(undefined,createUserObject("username_"+userID,userID));
        return;
    }
    if(!token){
        callback(undefined, createUserObject(undefined, undefined));
    }else{
        jwt.verify(token, process.env.jwtSecret||config.jwtSecret, (err, decoded) => {
            if (err) {
                callback(err);
                return;
            }
    
            const decodedID = decoded.sub;
            if(decodedID !== userID){
                callback({status:403, message: "Token missmatch!"});
                return;
            }
            // check if a user exists
            User.findById(decodedID, (userErr, user) => {
                if (userErr || !user) {
                    callback(userErr||{status:404});
                    return;
                }
                callback(undefined, createUserObject(user.email, user.id));
            })
        })
    }
}

export function loadClientObject(socket, userID, token, callback){
    loadUserObject(userID, token, (error,userObj)=>{
        if(error!==undefined){
            callback(error);
        }else{
            callback(undefined,createClientObject(socket,userObj));
        }
    })
}
