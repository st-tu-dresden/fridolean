const express = require('express');


const userRoutes = require('../models/user/api');
const projectRoutes = require('../models/project/api');


const router = express.Router();

// apply api routes

// user routes
router.use('/user', userRoutes);
router.use('/user-kc', userRoutes);

// project routes
router.use('/project', projectRoutes);

module.exports = router;