/**
 * Simple function for client-side canvas-/project-title verification
 * @param {String} title - Title of the Project/Canvas
 */
export function verifyTitle(title) {
    title = title.trim();

    if (title.length === 0) {
        return null;
    } else {
        return title;
    }
}