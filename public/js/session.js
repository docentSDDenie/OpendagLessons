// Create a new session in session storage if it doesn't exist
function createSessionStorage(courses=[]) {
    if(!sessionStorage.getItem("ltc_editor_session")) {

        //Create a new session object with files, current file, settings, courses and current course
        const session = {
            files: [],
            currentFile: null,
            settings: { 
                theme: "light",
                fontSize: 14,
                autoSave: false
            },
            courses: courses,
            currentCourse: null
        };

        sessionStorage.setItem("ltc_editor_session", JSON.stringify());
    }
}

// Fetch the current session from session storage
function fetchSessionStorage() {
    const sessionData = sessionStorage.getItem("ltc_editor_session");
    return sessionData ? JSON.parse(sessionData) : null;
}

// Update the current file in session storage
function updateCurrentFileInSessionStorage(filePath) {
    const session = fetchSessionStorage() || {};
    session.currentFile = filePath;
    sessionStorage.setItem("ltc_editor_session", JSON.stringify(session));
}

// Update the current course in session storage
function updateCurrentCourseInSessionStorage(courseId) {
    const session = fetchSessionStorage() || {};
    session.currentCourse = courseId;
    sessionStorage.setItem("ltc_editor_session", JSON.stringify(session));
}

// Save settings to session storage
function saveSettingsToSessionStorage(settings) {
    const session = fetchSessionStorage() || {};
    session.settings = { ...session.settings, ...settings };
    sessionStorage.setItem("ltc_editor_session", JSON.stringify(session));
}

// Save a file to session storage, ensuring no duplicates and maintaining order
function saveFileToSessionStorage(filePath, fileName) 
{
    const session = fetchSessionStorage() || {};

    let files = session.files || [];
    
    if (!Array.isArray(files)) {
        files = [];
    }
    
    const existingIndex = files.findIndex(file => file.path === filePath);
    
    if (existingIndex !== -1) {
        files.splice(existingIndex, 1);
    }
    
    files.unshift({ path: filePath, name: fileName, contents: ed_html.getValue() });

    session.files = files;
    sessionStorage.setItem("ltc_editor_session", JSON.stringify(session));
}

// Delete a file from session storage
function deleteFileFromSessionStorage(filePath) {
    const session = fetchSessionStorage() || {};

    let files = session.files || [];
    files = files.filter(file => file.path !== filePath);

    session.files = files;
    sessionStorage.setItem("ltc_editor_session", JSON.stringify(session));
}


