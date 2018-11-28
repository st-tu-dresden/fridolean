/**
 * @file Contains wrappers for API-Calls to manage the data needed in ProjectOverview
 * @author Nikolai Klüver
 */

// import uuidv1 from 'uuid/v1';
import Auth from '../../modules/Auth';
import {fetchAPI,setCurrentUser} from '../../api';

/**
 * Returns all Projects belonging to current User
 * 
 * @returns {Promise}
 */
export function getProjects(filter="") {
    setCurrentUser(Auth.getToken());
    return fetchAPI(undefined,'projects')
        .then((response) => response.json()) // Parse JSON
        .then(projects => (
            // Map API-Response to expected structure in FrontEnd
            projects.map(p => ({
                id: p._id,
                isPublic: p.visibility.toLowerCase() === "public",
                title: p.title,
                description: p.description,
                timestamp: p.lastEdited,
            })))
        ).then(projects => projects.filter(p =>
            p.title.toLowerCase().indexOf(filter.toLowerCase().trim()) >= 0 ||
            p.description.toLowerCase().indexOf(filter.toLowerCase().trim()) >= 0))

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
