export const from = 1;
export const to = 2;


export async function migrateProjectsUp(projects) {
    let cursor = projects.find();
    let promises = [];
    while (await cursor.hasNext()) {
        let next = await cursor.next();
        promises.push(migrateProjectUp(next));
    }
    let results = await Promise.all(promises);
    cursor.close();
    await Promise.all(results.map((result) => projects.save(result)));
}

async function migrateProjectUp(project) {
    if (!project.persistent.tags) project.persistent.tags = [];
    project.persistent.canvases.forEach(migrateCanvasUp);
    project.timeline.forEach((tmle) => {
        if (!tmle.value.tags) tmle.value.tags = [];
        tmle.value.canvases.forEach(migrateCanvasUp)
    });
    return project;
}

function migrateCanvasUp(canvas) {
    if (!canvas.options)
        canvas.options = { enableMarkdown: true }
    else if (canvas.options.enableMarkdown === undefined)
        canvas.options.enableMarkdown = true;
    if (!canvas.tags)
        canvas.tags = [];
    canvas.buildingBlocks.forEach((bb) => {
        bb.entries.forEach((entry)=>{
            if(!entry.content.tags)
                entry.content.tags=[];
        })
    })
}

export async function migrateProjectsDown(projects) {
    let cursor = projects.find();
    let promises = [];
    while (await cursor.hasNext()) {
        let next = await cursor.next();
        promises.push(migrateProjectDown(next));
    }
    let results = await Promise.all(promises);
    cursor.close();
    await Promise.all(results.map((result) => projects.save(result)));
}

async function migrateProjectDown(project) {
    delete project.persistent.tags; 
    project.persistent.canvases.forEach(migrateCanvasDown);
    project.timeline.forEach((tmle) => {
        tmle.value.canvases.forEach(migrateCanvasDown)
        delete tmle.value.tags
    });
    return project;
}

function migrateCanvasDown(canvas) {
    delete canvas.options;
    delete canvas.tags;
    canvas.buildingBlocks.forEach((bb) => {
        bb.entries.forEach((entry) => {
            delete entry.content.tags;
        })
    })
}