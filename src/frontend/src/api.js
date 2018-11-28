import Auth from './modules/Auth';

export const backendLocation=process.env.REACT_APP_BACKEND_URL||((window.location.protocoll||"http://")+window.location.hostname+":3001");

export const socketIoLocation=process.env.REACT_APP_SOCKETIO_URL||backendLocation.replace("://", ":@@").replace(/\/[^/]*$/, "").replace(":@@","://");
export const apiRoute=process.env.REACT_APP_API_ROUTE||"/api/v1";
export const apiLocation=backendLocation+apiRoute;

let currentUserToken;
export function setCurrentUser(token) {
    currentUserToken = token;
}

/**
 * Wrapper around fetch-requests to our API;
 * Automatically appends /api/v1 to URL, includes Beader-Token & Content-Type
 * 
 * @param {String} method - HTTP Request method, e.g. "GET", "POST", "DELETE", ...
 * @param {String} url - URL of fetch-request
 * @param {*} [init] - RequestInit
 */
export const fetchAPI = (method, url, init) => {
    init = init || {};
    init.headers = init.headers || {};
    let targetURL
    if(url.startsWith("/")){
        targetURL=backendLocation+url;
    }else{
        targetURL=apiLocation+"/"+url;
    }
    init = {
        ...init,
        headers: {
            "Authorization": "jwt " + (currentUserToken||Auth.getToken()),
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...init.headers,
        }
    };
    console.log("Body: ("+(typeof init.body)+")",init.body);
    if(init.body){
        if((typeof init.body).toLowerCase() !== "string"){
            console.log("Fixing init-body");
            init={...init,body:JSON.stringify(init.body)};
        }
    }
    if(method){
        init={...init,method};
    }

    console.log("|> API Request: ", targetURL, init);

    return fetch(targetURL, init).then(response => {
        if (!response.ok) {
            return response.text().then(text => Promise.reject({ response, text }));
        }

        return response;
    });
}
