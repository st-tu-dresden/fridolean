const express = require('express');
const router= express.Router();


// test some requests

router.get("/test", function(req, res){
    console.log("GET REQUEST project");
    res.end();
});

module.exports = router;