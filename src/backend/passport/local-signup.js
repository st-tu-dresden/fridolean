const User = require('../models/user/model');
const PassportLocalStrategy = require('passport-local').Strategy;

// return the Passport Local Strategy object.
module.exports = new PassportLocalStrategy({
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true
}, (req, email, password, done) => {
    const userData = {
        email: email.trim(),
        password: password.trim(),
        // name: req.body.name
    };
    // TODO change default user name

    const newUser = new User(userData);
    newUser.save((err) => {
        if (err) {
            return done(err);
        }

        return done(null);
    })
})