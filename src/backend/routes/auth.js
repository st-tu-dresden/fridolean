const express = require('express');
const passport = require('passport');
const validator = require('validator');

const router = express.Router();

function validateSignupForm(payload) {
    const errors = {};
    let isFormValid = true;
    let message = '';

    if (!payload || 
        typeof payload.email !== "string" ||
        !validator.isEmail(payload.email)
    ) {
            isFormValid = false;
            errors.email = "Please provide a correct email address.";
    }

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

    if (!payload || 
        payload.termsAndConditions !== true) {
            isFormValid = false;
            errors.termsAndConditions = "You must agree to our terms and conditions."
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

function validateSigninForm(payload) {
    const errors = {};
    let isFormValid = true;
    let message = "";

    if (!payload || 
        typeof payload.email !== "string" ||
        payload.email.trim().length === 0 ||
        !validator.isEmail(payload.email)) {
            isFormValid = false;
            errors.email = "Please provide your email address.";
    }


    if (!payload || 
        typeof payload.password !== "string" ||
        payload.password.trim().length === 0) {
            isFormValid = false;
            errors.password = "Please provide your password.";
    }


    if (!isFormValid) {
        message = "Check your form for errors.";
    }

    return {
        success: isFormValid,
        message,
        errors
    };
}

router.post("/signup", (req, res, next) => {
    console.log("signup POST request");    
    const validationResult = validateSignupForm(req.body); 

    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }

    return passport.authenticate("local-signup", (err) => {
        if (err) {
            if (err.name === "MongoError" && err.code === 11000) {

                // 11000 Mongo code for a duplication email error
                // 409 HTTP status code for conflict error
                return res.status(409).json({
                    success: false,
                    message: "Check the form for errors.",
                    errors: {
                        email: "This email is already in use."
                    }
                });
            }

            return res.status(400).json({
                success: false,
                message: "Could not process the form."
            });
        }

        return res.status(200).json({
            success: true,
            message: "You have successfully signed up! Now you should be able to log in."
        });
    
    })(req, res, next);

});

router.post("/signin", (req, res, next) => {
    const validationResult = validateSigninForm(req.body);
    if (!validationResult.success) {
        return res.status(400).json({
            success: false,
            message: validationResult.message,
            errors: validationResult.errors
        });
    }

    return passport.authenticate("local-signin", (err, token, userData) => {
        if (err) {
            if (err.name === "IncorrectCredentialsError") {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(400).json({
                success: false,
                message: "Couldn't process the form."
            });
        }

        return res.status(200).json({
            success: true,
            message: "You have successfully logged in!",
            token,
            user: userData
        });
    })(req, res, next);

});

router.post("/kc_signin", (req, res, next) => {
    return passport.authenticate("keycloak-sign", (err, token, userData) => {
        if (err) {
            console.error(err);

            if (err.name === "IncorrectCredentialsError") {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }

            return res.status(400).json({
                success: false,
                message: "Couldn't process the form."
            });
        }

        return res.status(200).json({
            success: true,
            message: "You have successfully logged in!",
            token,
            user: userData
        });
    })(req, res, next);
});


module.exports = router;
