/**
 * @file Contains wrappers for API-Calls to manage the data needed in ProjectOverview
 * @author Nikolai Klüver
 */

import {fetchAPI, setCurrentUser} from '../../api'

// import uuidv1 from 'uuid/v1';

import Auth from '../../modules/Auth';
import store from '../../store';

/**
 * Returns all Projects belonging to current User
 * 
 * @returns {Promise}
 */
export function getProjects() {
    setCurrentUser(Auth.getToken());
    let userId = store.getState().user.id;

    return fetchAPI(undefined,`users/${userId}/projects`)
        .then((response) => response.json()) // Parse JSON
        .then((jsonres) => jsonres.projects) // Get project-array from parsed response 
        .then(projects => projects.map(p => ({
            id: p._id,
            isPublic: p.visibility.toLowerCase() === "public",
            title: p.title,
            description: p.description,
            timestamp: p.lastEdited,
            _id: undefined
        }))) // Map API-Response to expected structure in FrontEnd

    // // https://stackoverflow.com/a/9035732
    // function randomDate(start, end) {
    //     return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    // }
    // 
    // let exampleProjects = [
    //     { id: "pid_0", title: "Rewe", description: "Business structure for Rewe", timestamp: randomDate(new Date(0), new Date()).valueOf()},
    //     { id: "pid_1", title: "IKEA", description: "Business structure for IKEA", timestamp: randomDate(new Date(0), new Date()).valueOf()},
    //     { id: "pid_2", title: "Uber", description: "Business structure for Uber", timestamp: randomDate(new Date(0), new Date()).valueOf()},
    //     { id: "pid_3", title: "World Domination", description: "!!!Top Secret!!!\nPlans to take over the world", timestamp: randomDate(new Date(0), new Date()).valueOf()},
    //     { id: "pid_4", title: "Intel", description: "Business structure for Intel", timestamp: randomDate(new Date(0), new Date()).valueOf()},
    // ];
    // 
    // return Promise.resolve(exampleProjects);
}

/**
 * Creates new Project with specific title
 * 
 * @param {string} title
 * @returns {Promise<string>} 
 */
export function createProject(title) {
    setCurrentUser(Auth.getToken());
    let data = {
        title,
        description: "This is a newly created project.",
        visibility: "PRIVATE",
    }

    return  fetchAPI('POST',"projects", {
                body: JSON.stringify(data),
            })
        .then(response => response.json())
        .then(jsonresp => jsonresp._id);

    // return Promise.reject(); // Promise.resolve(title + "_" + uuidv1());
}