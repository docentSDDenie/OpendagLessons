
async function fetchCourse(courseName) {
    const token = document.getElementById('csrf_token').value;
    const url = 'index.php?action=fetch_course&course_name=' + encodeURIComponent(courseName) + '&csrf_token=' + encodeURIComponent(token);
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

function getCoursesFromList(courses) {
    try {
        const list = window.courses.map(course => ({
            course: course.course,
            description: course.description
        }));

        return list;
    }
    catch (err) {
        console.error("Error processing courses:", err);
        return [];
    }
}

function loadCourse(courseId) {

    try {
        const course = window.courses.find(c => c.course === courseId);
        
        if (!course) {
            throw new Error('Course not found: ' + courseId);
        }

        const slug = courseId + '/0';
        updateCurrentCourseInSessionStorage(slug);
        
        //Function in editor.js
        buildCourse(course);

    } catch (err) {
        console.error("Error loading course:", err);
    }
}

window.onload = function() {
    const session = fetchSessionStorage();
    const courseId = session?.currentCourse || 'basic';
    
    fetchCourse(courseId).then(courseData => {
        window.courses = courseData;
        const courses = getCoursesFromList(courseData);
        console.log("Processed courses list:", courses);
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.course;
            option.textContent = course.course;
            document.getElementById('courseSelect').appendChild(option);
        });
    }).catch(error => {
        //See raw error in console
        console.error('Error fetching course:', error);
    });
}


