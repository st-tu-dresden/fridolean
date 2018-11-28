/*
* User logic tests
*/

// for stubs of functions that might get called so it doesn't do any db access
import sinon from 'sinon'; 
// for validate() function
import mongoose, { Error } from 'mongoose'
import {expect} from 'chai';

import User from'../../../../models/user/model';
const {projectModel} = require('../../../../project_manager/models');
const Project = projectModel;

// import routes to test
import {getUser} from '../user';


// User model tests

// Testing model validation

describe('User Model', () => {
    it ('should be invalid if email field is empty', (done) => {
        // set up the model in a way the validation should fail
        const u = new User({password: "123456"});

        u.validate((err) => {
            // check for the error property that should exist            
            expect(err.errors.email).to.exist;
            done();
        })
    })

    it ('should be invalid if password field is empty', (done) => {
        // set up the model in a way the validation should fail        
        const u = new User({email: "email@mail.com"});

        u.validate((err) => {
            expect(err.errors.password).to.exist;
            done();
        })
    })

    it ('should be valid user', (done) => {
        // set up the model not to have any errors
        const u = new User({email: "email@mal.com", password: "123456"});

        u.validate((err) => {
            // check for the error that shouldn't exist now
            expect(err).to.not.exist;
            done();
        })
    })
})
