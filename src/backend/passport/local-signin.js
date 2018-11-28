const jwt = require('jsonwebtoken');
const User = require('../models/user/model');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../config');

// return the Passport Local Strategy object.
module.exports = new PassportLocalStrategy({
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true
}, (req, email, password, done) => {
    const userData = {
        email: email.trim(),
        password: password.trim()
    };

    // find user by email address
    return User.findOne({email: userData.email}, (err, user) => {
        if (err) {
            return done(err);
        }

        if (!user) {            
            const error = new Error("Incorrect email or password");
            error.name = "IncorrectCredentialsError";
            
            return done(error);
        }

        // check if hashed users's password is equal to value saved in db
        return user.comparePassword(userData.password, (passwordErr, isMatch) => {
            if (passwordErr) {
                return done(passwordErr);
            }

            if (!isMatch) {
                const error = new Error("Incorrect email or password");
                error.name = "IncorrectCredentialsError";

                return done(error);
            }

            const payload = {
                sub: user._id
            };

            // create token string and pass user data
            const token = jwt.sign(payload, process.env.secret || config.jwtSecret);
            const data = {
                id: user.id,
                email: user.email
            };

            return done(null, token ,data);
        })
    });
})