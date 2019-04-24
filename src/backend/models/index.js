/**
 * database connection
 */

const mongoose = require('mongoose');
const expected_version = 3;
const default_version = 0;
let version_checked=false;
let version_check_required=false;

function startMigration(connection, current, target) {
    const migration = require("./migration");
    return migration.migrate(connection, current, target);
}

function testVersion() {
    return new Promise((resolve, reject) => {
        {
            const resolve_old = resolve;
            const resolve_new = (...args)=>{version_checked=true;return resolve_old(...args);}
            resolve=resolve_new;
        }
        const meta = mongoose.connection.collection("meta");
        meta.findOne({ _id: "version" }, (err, result) => {
            if (err) return reject(err);
            if (result) {
                let current_version = result.value;
                console.log("loaded db-version:", current_version);
                if (current_version != expected_version) {
                    startMigration(mongoose.connection, current_version, expected_version).catch(reject).then(()=>
                    meta.findOne({ _id: "version" }, (err, result) => {
                        if (err) return reject(err);
                        if (!result) return reject("Version not present after migration");
                        if (result.value !== expected_version) reject(`Migration failed: expected ${expected_version}, got ${result.value}`);
                        else resolve();
                    }));
                }else{
                    resolve();
                }
            }
            else {
                console.log(`missing db-version, assuming ${default_version}`);
                meta.insertOne({ _id: "version", value: default_version }, (err, res) => {
                    if (err) return reject(err);
                    if (default_version != expected_version) {//edge-case: default-version might be desired version
                        startMigration(mongoose.connection, default_version, expected_version).catch(reject).then(()=> 
                        meta.findOne({ _id: "version" }, (err, result) => {
                            if (err) return reject(err);
                            if (!result) return reject("Version not present after migration");
                            if (result.value !== expected_version) reject(`Migration failed: expected ${expected_version}, got ${result.value}`);
                            else resolve();
                        }));
                    }else resolve();
                }
                );
            }
        })
    });
}

function assertCurrentVersion(){
    if(version_check_required)
        console.assert(version_checked,"Version check has not been completed yet");
    else
        console.log("Ignoring Version-Check");
}

function requireVersionCheck(){
    version_check_required=true;
}

module.exports = {
    connect: async (uri) => {
        mongoose.connection.openUri("mongodb://" + uri);
        // plug in promise library
        mongoose.Promise = global.Promise;

        mongoose.connection.on("error", (err) => {
            console.error(`Mongoose connection error: ${err}`);
            process.exit(1);
        });

        await testVersion();
        // load models
        require("./user/model");

    },
    mongoose,
    assertCurrentVersion,
    requireVersionCheck
}
