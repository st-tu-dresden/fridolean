import { Actions } from './actions';
import { history } from '../../store';

export const projectSubviewNavigator = store => next => action => {
    if (!action.type ||
        !store.getState().projectinfo ||
        !store.getState().projectinfo.projectId) {
        return next(action);
    }

    let projectId = store.getState().projectinfo.projectId;

    console.log(">>> NAVIGATE", projectId, action);

    switch (action.type) {
        case Actions.DELETE_PROJECT.type:
            history.push("/projects");
            break;
        case Actions.CREATE_CANVAS.type:
            history.push({
                pathname: "/projects/" + projectId + "/editor/" + action.canvasType.split(' ').join('').toLowerCase(),
                search: "?id=" + action.canvasId,
            });
            break;
        case Actions.CLONE_TAG.type:
            history.push("/projects/" + action.projectId);
            break;
        case Actions.RESTORE_TAG.type:
            history.push('/projects/' + projectId);
            break;
        case Actions.LOAD_PDF.type:
            // Source: https://stackoverflow.com/a/45872086

            // base64 string
            var base64str = action.pdf;

            // decode base64 string, remove space for IE compatibility
            var binary = atob(base64str.replace(/\s/g, ''));
            var len = binary.length;
            var buffer = new ArrayBuffer(len);
            var view = new Uint8Array(buffer);
            for (var i = 0; i < len; i++) {
                view[i] = binary.charCodeAt(i);
            }
            
            // create the blob object with content-type "application/pdf"               
            var blob = new Blob( [view], { type: "application/pdf" });
            var url = URL.createObjectURL(blob);

            // Source: stackoverflow.com

            // create a download anchor tag
            var downloadLink      = document.createElement('a');
            downloadLink.target   = '_blank';
            downloadLink.download = action.title.split(' ').join('_') + "_canvas.pdf";

            // set object URL as the anchor's href
            downloadLink.href = url;

            // append the anchor to document body
            document.body.appendChild(downloadLink);

            // fire a click event on the anchor
            downloadLink.click();

            // cleanup: remove element and revoke object URL
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            break;
        default:
            break;
    }

    return next(action);
}

export const subviewErrorAlert = store => next => action => {
    if (action && action.type && action.type === Actions.API_ERROR.type) {
        switch (action.code) {
            case 200:
                action.handler(...action.args);
                break;
            case 404:
                history.push('/404');
                break;
            default:
                console.error("API Error:\n" + action.code + " (Response: " + action.error.response.status + "), " + action.error.text);
                //alert("API Error:\n" + action.code + " (Response: " + action.error.response.status + "), " + action.error.text);
                break;
        }
    }

    return next(action);
}
