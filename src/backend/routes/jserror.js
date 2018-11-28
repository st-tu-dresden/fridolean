const express = require('express');

const router = express.Router();

router.post("/jserror", (req, res, next) => {
    const log = req.body; 
    const type = log.type;
    delete log.type;
    switch (type) {
        case "error":
            console.error(log); 
            break;
        case "warn":
            console.warn(log); 
            break;
        default:
            console.log(log); 
            break;
    }

    return res.status(200);
});

module.exports = router;
