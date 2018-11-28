const express = require('express');
const router = express.Router();
const passport = require('passport');
const validator = require('validator');


const User = require('./model');

// get an authorized path
router.get("/email", (req, res, next) => {
    res.status(200).json({
        message: "You are authorized to see this page,",
        // user passed through from auth middleware
        user: req.user.email
    });
});

module.exports = router;