import {connection} from '../../../project_manager/database'
import {generateCanvasPDF} from '../../../pdf/generator'

const useBase64=true;

export function sendPDF(req, res){
    let userID=undefined;
    if(req.user){
        userID=req.user._id.toString();
    }
    
    let projectID;
    let canvasID;
    let size;
    try { // If params cant be accessed
        projectID = req.swagger.params.projectID.value;
        canvasID = req.swagger.params.canvasID.value;
        size = req.swagger.params.size.value;        
    }catch(err){
        return res.status(500).send({"message": "An error occurred"});
    }

    let tag;
    try{
        tag = req.swagger.params.tag.value;
    }catch(err){}

    connection.checkReadAccess(projectID, userID, (accessError)=>{
        if((accessError)&&(accessError.status!==200)){
            res.status(accessError.status||400).send("Access-Error: "+JSON.stringify(accessError));
        }else{
            generateCanvasPDF(projectID, canvasID, tag, size)
            .then((value)=>{
                //console.log("PDF-Success!");
                if(useBase64){
                    //console.log("Sending base64");
                    res.status(200).send({pdf: value.toString('base64')});
                }else{
                    //console.log("Sending pdf");
                    res.type('application/pdf');
                    res.status(200).send(value);
                }
            })
            .catch((reason)=>{
                console.error("PDF error: ",reason);
                res.status(reason.status||500).type("application/json").send(reason);
            })
        }
    })
}