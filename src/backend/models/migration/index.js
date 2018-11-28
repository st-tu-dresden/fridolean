const fs = require("fs");
const path = require("path");
const nodes = {};

export const addFile = function (path, err = (msg) => { throw new Error(msg) }) {
    let { to, from,
        migrateUp, migrateDown,
        migrateUsersUp, migrateUsersDown,
        migrateProjectsUp, migrateProjectsDown } = require(path);
    if (to === undefined || from === undefined)
        return err(`File '${path}' does not provide 'to' and 'from' constants`);
    
    if (!migrateUp) {
        migrateUp=(db)=>{
            let promises=[];
            if(migrateProjectsUp)
                promises.push(migrateProjectsUp(db.collection("projects")));
            if(migrateUsersUp)
                promises.push(migrateUsersUp(db.collection("users")));
            return Promise.all(promises);
        }
    }
    if (!migrateDown) {
        migrateDown=(db)=>{
            let promises=[];
            if(migrateProjectsDown)
                promises.push(migrateProjectsDown(db.collection("projects")));
            if(migrateUsersDown)
                promises.push(migrateUsersDown(db.collection("users")));
            return Promise.all(promises);
        }
    }
    if (migrateUp)
        nodes[from] = { ...nodes[from], [to]: migrateUp };
    if (migrateDown)
        nodes[to] = { ...nodes[to], [from]: migrateDown };
}

export const migrate = async function (db, from, to) {
    let path = findMigrationPath(from, to);
    let meta = db.collection("meta");
    console.log("Planned version-path:",path);
    for (var index = 1; index < path.length; index++) {
        var prev = path[index - 1], next = path[index];
        await nodes[prev][next](db);
        console.log(`Version-Update from ${from} to ${to}: ${(await meta.updateOne({ _id: "version" }, { value: next })).result.ok==1?"Success":"Failure"}`);
    }
    console.log("Migration complete");
}

function findMigrationPath(from, to) {
    let previous = { [from]: null };//{version:previous_version}
    let fringe = [from];
    let current = undefined;
    fringing: while ((current = fringe.shift()) != undefined) {
        for (var edge in nodes[current]) {
            if (edge in previous)
                continue;
            previous[edge] = current;
            if (edge == to)
                break fringing;
            fringe.push(edge);
        }
    }
    if (to in previous) {
        current = to;
        let path = [to];
        while ((current = previous[current]) !== null) {
            path.unshift(current);
        };
        console.assert(path[0] === from, "Path starts at 'from' node");
        console.assert(path[path.length - 1] === to, "Path ends at 'to' node");
        return path;
    } else {
        throw new Error(`Could not find migration-path from ${from} to ${to}`);
    }

}

function loadFiles(basepath, ...except) {
    let dir = fs.readdirSync(basepath);
    dir = dir.filter((file) => ((except.indexOf(file) === -1)&&(file.endsWith(".js"))));
    dir.forEach((file) => addFile(path.join(basepath, file), console.warn));
}

loadFiles(__dirname, path.basename(__filename));