
async function fetchCourse(courseName) {
    const token = document.getElementById('csrf_token').value;
    const url = 'index.php?action=fetch_course&course_name=' + encodeURIComponent(courseName) + '&csrf_token=' + encodeURIComponent(token);
    console.log("Fetching course:", courseName, "with token:", token, "url:", url);

    const response = await fetch(url, { credentials: 'same-origin' });
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }
    const text = await response.text();
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error('Response was not valid JSON. Raw response:');
        console.error(text.slice(0, 200)); // log first 200 chars
        throw new SyntaxError('Invalid JSON response');
    }
}

function loadCourse(courseData) {
    if (!courseData || !courseData.lessons || courseData.lessons.length === 0) {
        console.error("Invalid course data:", courseData);
        return;
    }
    else {
        console.log("Course data:", courseData);
    }
}

window.onload = function() {
    const session = fetchSessionStorage();
    const courseId = session?.currentCourse || 'basic';
    
    fetchCourse(courseId).then(courseData => {
        console.log("Fetched course data:", courseData);
        loadCourse(courseData);
        console.log("Course loaded:", courseData);
    }).catch(error => {
        //See raw error in console
        console.error('Error fetching course:', error);
    });
}


