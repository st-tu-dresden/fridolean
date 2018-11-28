const activateCORS = (process.env.activateCORS===undefined?true:process.env.activateCORS.toLowerCase()==="true");
const verbose=false;
if(process.env.activateCORS!==undefined)
    if(process.env.activateCORS.toLowerCase()!==true)
        console.log("Deactivating CORS");
module.exports=function(req,res,next){
    if(!activateCORS) return next();
    res=res.header("Access-Control-Allow-Origin", "*");
    if(req.method==="OPTIONS")
        if(req.headers['access-control-request-method']){
            if(verbose) console.log("[Preflight]@"+req.headers.origin,req.url,(req.headers.authorization?"Auth-Type: "+req.headers.authorization.split(" ")[0]:"Unauthorized"));
            res=res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
            res=res.header("Access-Control-Allow-Methods","GET, PUT, POST, DELETE");
            res.status(200).end();
            return;
        }
    if(verbose) console.log(req.method+":",req.url,(req.headers.authorization?"Auth-Type: "+req.headers.authorization.split(" ")[0]:"Unauthorized"));
    next();
} 