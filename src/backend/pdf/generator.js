import {manager} from '../project_manager/manager'
import {connection} from '../project_manager/database';
import {stateMapper,getTemplatePath} from './mapper'
import {generatePdf} from 'fill-pdf'

export function generateCanvasPDF(projectID, canvasID, tag, size="default"){
    return new Promise((resolve,reject)=>{
        if(tag){
            connection.readTimelineEntry(projectID,tag,(err,result)=>{
                if(err&&(err.status!==200)){
                    reject(err);
                    return;
                }
                let canvases=result.value.canvases;
                let canvas;
                if(canvases instanceof Array)
                    canvas=canvases.find((canv)=>canv._id==canvasID);
                else
                    canvas=canvases[canvasID];
                
                if(!canvas){
                    reject({status:404,message:"Canvas didn't exist at this time."});
                    return;
                }
                let delegate=generateCanvasStatePDF(canvas, size);
                delegate.then(resolve,reject);
            })
            return;
        }
        manager.getProject(projectID,(projError,projectManager)=>{
            if((projError)&&(projError.status!==200)){
                reject(projError);
                return;
            }
            projectManager.readCanvas(canvasID, (canvError,canvasState)=>{
                if((canvError)&&(canvError.status!==200)){
                    reject(canvError);
                    return;
                }
                let delegate=generateCanvasStatePDF(canvasState, size);
                delegate.then(resolve,reject);
            })
        })
    })
}
export function generateCanvasStatePDF(canvasState, size="default"){
    return new Promise((resolve,reject)=>{
        let pdfFields=stateMapper(canvasState);
        let templatePath=getTemplatePath(canvasState.canvasType,size);
        if(!templatePath){
            reject(new Error("Unknown canvas-type/size '"+canvasState.canvasType+"'"));
            return;
        }
        //console.log("template-path: ",templatePath)
        generatePdf(pdfFields, templatePath, (err,output)=>{
            if(err){
                reject(err);
            }else{
                resolve(output);
            }
        })
    })
}