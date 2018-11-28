const User = require('../models/user/model');
const PassportLocalStrategy = require('passport-local').Strategy;

const KeyCloakCerts = require('get-keycloak-public-key');
const jwt = require('jsonwebtoken');
const keyCloakCerts = new KeyCloakCerts(process.env.KEYCLOAK_URL, 'linc');
const config = require('../config');

// return the Passport Local Strategy object.
module.exports = new PassportLocalStrategy({
    usernameField: "token",
    passwordField: "token2",
    session: false,
    passReqToCallback: true
}, (req, kc_token, kc_token2, done) => {
    const kid = jwt.decode(kc_token, { complete: true }).header.kid;

    function synchronizeUserFromKc(keycloak_id, userData, callback) {
        const newUser = new User(userData);
        newUser.keycloak_id = keycloak_id;
        newUser.save((err) => {
            if (err) {
                return done(err);
            }
            callback();
        });
    }

    function found(user) {
        const payload = {
            sub: user._id
        };

        // create token string and pass user data
        const token = jwt.sign(payload, process.env.secret || config.jwtSecret);
        const data = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        return done(null, token ,data);
    }

    function findByKeycloakId(keycloak_id, userData) {
        return User.findOne({keycloak_id: keycloak_id}, (err, user) => {
            if (err) {
                return done(err);
            }

            if (!user) {
                return synchronizeUserFromKc(keycloak_id, userData, function() {
                    return User.findOne({keycloak_id: keycloak_id}, (err, user) => {
                        if (err || !user) {
                            return done(err);
                        }
                        return found(user);
                    });
                });
            }
            return found(user);
        });
    }

    return keyCloakCerts.fetch(kid).then((publicKey) => {
        if (publicKey) {
            let decoded;
            try {
                // Verify and decode the token 
                // clocktolerance is important otherwise small clock differences will mean most tokens are expired
                // compared to my computer vs server the clock skew was 40 seconds
                decoded = jwt.verify(kc_token, publicKey, {clockTolerance: 300});
            } catch (error) {
                return done("Error decoding token");
            }
            const userData = {
                email: decoded.email,
                name: decoded.name,
                password: "Must be set - but will not be used",
                keycloak_id: decoded.sub,
            }
            return findByKeycloakId(userData.keycloak_id, userData);
        } else {
            return done("This token has no public key");
        }
    }).catch((err) => {
        console.error(err);
        return done("Unknown error occured");
    });
})
