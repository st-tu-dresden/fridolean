let accessor;

try{
    accessor=localStorage;
}catch(e){
    console.log("Loading Auth-Mock");
    let semiPersData={};
    accessor={
        setItem: function(key, data){
            semiPersData[key]=data;
        },
        getItem: function(key){
            return semiPersData[key];
        },
        removeItem: function(key){
            delete semiPersData[key];
        }
    }
}

export const loadedLocalStore=accessor;

export default class Auth {
    // Authenticate a user. Save a token string in Local Storage.

    static authenticateUser(token) {
        accessor.setItem("token", token);
    }

    // check if user is authenticated - if a token is saved in Local Storage.
    static isUserAuthenticated() {
        return accessor.getItem("token") !== null;
    }

    // deauthenticate a user. remove token from local storage.

    static deauthenticateUser() {
        accessor.removeItem("token");
    }

    // get a token value
    static getToken() {
        return accessor.getItem("token");
    }
}