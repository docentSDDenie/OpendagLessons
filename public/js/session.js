// Create a new session in session storage if it doesn't exist
SESSION_STORAGE_KEY = "ltc_editor_session";

function createSessionStorage(courses=[]) {
    if(!sessionStorage.getItem(SESSION_STORAGE_KEY)) {

        //Create a new session object with files, current file, settings, courses and current course
        const session = {
            images: {},
            currentFile: null,
            settings: { 
                theme: "light",
                fontSize: 14,
                autoSave: false
            },
            courses: courses,
            courseSlug: "basic/0"
        };

        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify());
    }

    clearImagesFromSessionStorage();
}

// Fetch the current session from session storage
function fetchSessionStorage() {
    const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return sessionData ? JSON.parse(sessionData) : null;
}

// Update the current file in session storage
function updateCurrentFileInSessionStorage(filePath) {
    const session = fetchSessionStorage() || {};
    session.currentFile = filePath;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

// Update the current course in session storage
function updateCurrentCourseInSessionStorage(courseSlug) {
    const session = fetchSessionStorage() || {};
    session.courseSlug = courseSlug;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

// Save settings to session storage
function saveSettingsToSessionStorage(settings) {
    const session = fetchSessionStorage() || {};
    session.settings = { ...session.settings, ...settings };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function addImageToSessionStorage(fileName, dataUrl) {
    const session = fetchSessionStorage() || {};
    let images = session.images || {};
    imgObj = {};
    images[fileName] = dataUrl;

    session.images = images;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function fetchImagesFromSessionStorage(fileName) {
    const session = fetchSessionStorage() || {};
    let images = session.images || {};
   
    return images[fileName] || null;
}

function removeImageFromSessionStorage(fileName) {
    const session = fetchSessionStorage() || {};
    let images = session.images || {};
    delete images[fileName];
   
    session.images = images;
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function clearImagesFromSessionStorage() {
    const session = fetchSessionStorage() || {};
    session.images = {};
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}