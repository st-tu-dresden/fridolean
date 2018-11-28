const models = require('./models');
models.requireVersionCheck();
const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config');
const port = process.env.PORT || 3001;

// set up express app
const app = express();

// CORS
var whitelist = ['http://localhost:3000', 'http://localhost:3001', process.env.CORS_DOMAIN]
app.use(cors({
    origin: function (origin, callback) {
        if (origin === undefined || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}));

// connect to database and load models
function onDBReady() {
    const swagger = require('./rest/app');
    const socketServer = require('./socket/index');
    // ------- apply middleware ---------
    // parse request body
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // passport middleware
    app.use(passport.initialize());

    // passport strategies
    const localSignupStrategy = require('./passport/local-signup');
    const localSigninStrategy = require('./passport/local-signin');
    const keycloakSignStrategy = require('./passport/keycloak-sign');
    passport.use("local-signup", localSignupStrategy);
    passport.use("local-signin", localSigninStrategy);
    passport.use("keycloak-sign", keycloakSignStrategy);

    //CORS middleware
    const corsCheckMiddleware = require("./middleware/cors-check");
    app.use('/', corsCheckMiddleware);

    // authentication checker middleware
    const authCheckMiddleware = require("./middleware/auth-check");
    app.use('/api', authCheckMiddleware);

    // initialize routes
    const authRoutes = require('./routes/auth');
    const apiRoutes = require('./routes/api');
    const jserrorRoutes = require('./routes/jserror');
    app.use('/jserror', jserrorRoutes);
    app.use('/auth', authRoutes);

    //Include swagger
    swagger.swaggerStart(app);

    let hSocketServer;
    console.info("Starting server with http!");
    hSocketServer = require('http').createServer(app);
    
    
    socketServer.socketStart(hSocketServer);

    hSocketServer.listen(port);
    console.log("Backend-Server listening on port " + port);
    console.log("Note that this might be remapped by a docker-container.");
}
models.connect(process.env.MONGODB_URL || config.dbUri).then(onDBReady);
console.log("Waiting on DB check")



