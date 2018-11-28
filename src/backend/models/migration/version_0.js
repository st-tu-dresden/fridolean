export const from=0;
export const to=1;

const typos={
    "Key Activitys": "Key Activities",
    "Key Recources": "Key Resources",
    "Pain Releavers": "Pain Relievers",
    "Relationship Menagement": "Relationship Management",
    "Relationship Menage": "Relationship Management"
};

export async function migrateProjectsUp(projects){
    let cursor=projects.find();
    let promises=[];
    while(await cursor.hasNext()){
        let next=await cursor.next();
        promises.push(migrateProjectUp(next));
    }
    let results=await Promise.all(promises);
    cursor.close();
    await Promise.all(results.map((result)=>projects.save(result)));
}

async function migrateProjectUp(project){
    project.persistent.canvases.forEach(migrateCanvasUp);
    project.timeline.forEach((tmle)=>tmle.value.canvases.forEach(migrateCanvasUp));
    return project;
}

function migrateCanvasUp(canvas){
    canvas.buildingBlocks.forEach((bb)=>{
        if (bb.title in typos){
            bb.title=typos[bb.title];
        }
    })
}

let invTypos={}
Object.keys(typos).forEach((wrong)=>{
    invTypos={[typos[wrong]]:wrong,...invTypos};//add new inverse-typo if correct spelling is not present
})

export async function migrateProjectsDown(projects){
    let cursor=projects.find();
    let promises=[];
    while(await cursor.hasNext()){
        let next=await cursor.next();
        promises.push(migrateProjectDown(next));
    }
    let results=await Promise.all(promises);
    cursor.close();
    await Promise.all(results.map((result)=>projects.save(result)));
}

async function migrateProjectDown(project){
    project.persistent.canvases.forEach(migrateCanvasDown);
    project.timeline.forEach((tmle)=>tmle.value.canvases.forEach(migrateCanvasDown));
    return project;
}

function migrateCanvasDown(canvas){
    canvas.buildingBlocks.forEach((bb)=>{
        if (bb.title in invTypos){
            bb.title=invTypos[bb.title];
        }
    })
}