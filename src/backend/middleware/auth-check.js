const jwt = require('jsonwebtoken');
const User = require('../models/user/model');
const config = require('../config');
const publicRoutes = require('./public-api-routes');

// the Auth Checker middleware function
module.exports = (req, res, next) => {
    if ((!req.headers.authorization)||(req.headers.authorization==="jwt null")||(req.headers.authorization==="jwt undefined")) {
        let checkPromise=publicRoutes.checkRoutes(req.url,req.method);
        checkPromise.catch(()=>res.status(401).end()).then((result)=>{
            if(result){
                req.isGuest=true;
                next();
            }else{
                res.status(401).end();
            }
        })
        return;
    }

    // get last part from authorization header string
    const token = req.headers.authorization.split(' ')[1];

    // decode token using secret key-phrase
    // Keep in sync with '../socket/index.js'!
    return jwt.verify(token, process.env.jwtSecret||config.jwtSecret, (err, decoded) => {
        // 403 code for verification failure
        if (err) {
            return res.status(401).end();
        }

        const userId = decoded.sub;

        // check if a user exists
        return User.findById(userId, (userErr, user) => {
            if (userErr || !user) {
                return res.status(404).end();
            }

            // pass user details onto next route
            req.user = user;
            return next();
        })
    })
}