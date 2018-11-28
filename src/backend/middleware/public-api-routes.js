import {connection} from '../project_manager/database'


export const staticRoutes=[
    "/v1/projects"
]

export const dynamicRoutes=[
    requestsPublicProject
]

export function checkRoutes(url, method){
    return new Promise(resolve=>{
        if(staticRoutes.indexOf(url)>-1){
            resolve(true);
        }else{
            let nextDepth=0;
            function next(){
                if(nextDepth>=dynamicRoutes.length){
                    resolve(false);
                    return;
                }
                let func=dynamicRoutes[nextDepth++];
                if(func)
                    func(resolve,next,url,method);
                else
                    next();
            }
            next();
        }
    });
}

const projectRequestRegex=/^\/?v1\/projects\/([^\/]+)/
function requestsPublicProject(resolve,next,url,method){
    if(method!== 'GET') return next();
    let result=projectRequestRegex.exec(url);
    if(!result) return next();
    let projectID=result[1];
    connection.checkReadAccess(projectID, undefined, (error)=>{
        if(error)
            if(error.status!==200){
                resolve(false);
                return;
            }
        resolve(true);
    })
}