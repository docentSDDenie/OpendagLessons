<?php
session_start();

include 'course.php';
include 'utils.php';

//Set a default user session
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 'guest';
    $_SESSION['role'] = 'guest';
    //Set a CSRF token - so we can validate requests with hash_equals
    $_SESSION['token'] = bin2hex(random_bytes(32));
}


if (
    $_SERVER['REQUEST_METHOD'] == "GET" &&
    isset($_REQUEST['action']) &&
    $_REQUEST['action'] == 'fetch_course' &&
    isset($_REQUEST['csrf_token']) &&
    validateToken($_REQUEST['csrf_token']) &&
    isset($_REQUEST['course_name']) &&
    $_REQUEST['course_name'] == true
) {

    //Clear the output buffer to avoid corrupting the JSON output
    ob_clean();

    $name = filter_var($_REQUEST['course_name'], FILTER_SANITIZE_FULL_SPECIAL_CHARS,);

    //Fetch a specific course
    $courses = Courses::fetchCourse($name, $_SESSION['role']);

    header('Content-Type: application/json');
    echo $courses;
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Code Editor - Summa</title>
    <link rel="icon" type="image/x-icon" href="public/images/favicon.ico">
    <link rel="stylesheet" href="public/css/styles.css">
    <link rel="stylesheet" href="public/fontawesome/css/fontawesome.css">
    <link rel="stylesheet" href="public/fontawesome/css/regular.css">
    <link rel="stylesheet" href="public/fontawesome/css/solid.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.3/ace.min.js" integrity="sha512-BHJlu9vUXVrcxhRwbBdNv3uTsbscp8pp3LJ5z/sw9nBJUegkNlkcZnvODRgynJWhXMCsVUGZlFuzTrr5I2X3sQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.12/ext-language_tools.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="public/js/session.js" type="text/javascript"></script>
    <script src="public/js/utils.js" type="text/javascript"></script>
</head>

<body>
    <input type="hidden" id="csrf_token" name="csrf_token" value="<?php echo $_SESSION['token']; ?>" />
    <header>
        <div class="container row">
            <div class="brand">
                <div class="logo"></div>
                <div class="title">Learn to code!</div>
            </div>

            <div class="row">
                <button class="btn secondary" id="saveBtn" title="Save work locally"><span>Save</span></button>
                <button class="btn secondary" id="loadBtn" title="Load work file"><span>Load</span></button>
                <input type="file" id="openFile" accept="application/json" hidden />

                <!-- Course selection -->
                <select id="courseSelect" class="btn secondary" onchange="loadCourse(this.value)">
                    <option value="" disabled selected>Load course...</option>
                </select>

                <!-- Course panel toggle -->
                <button id="toggleCoursePanel" class="btn secondary" title="Toggle courses" aria-pressed="false">Courses</button>
            </div>
        </div>
        <div id="course_container" class="row">
            <div class="course_panel">
                <div class="course_header">
                    <h1 id="course_title">Course Name</h1>
                    <p id="course_description"></p>
                </div>
                <div id="lessons_bar" class="stack panel">
                    <div id="lessons_list" class="stack">
                        <!-- Lessons will be loaded here -->

                    </div>
                </div>
            </div>
        </div>
    </header>

    <main>
        <aside id="course_files" class="card panel stack">
            <!-- Image upload -->
            <div class="file_image_upload">
                <button id="addImage" class="btn secondary" title="Insert image">Add image</button>
                <input id="imageUpload" type="file" accept="image/*" hidden>
            </div>
            <div id="coursefiles">
                <div class="files" id="fileList" role="tablist" aria-label="web editors">
                    <span class="file active" role="tab" aria-selected="true" tabindex="0" data-pane="html">index.html</span>
                    <span class="file" role="tab" aria-selected="false" tabindex="-1" data-pane="css">style.css</span>
                    <span class="file" role="tab" aria-selected="false" tabindex="-1" data-pane="js">script.js</span>
                </div>
                <div id="imageList" role="tablist" aria-label="course images">
                    <span class="folder closed">afbeeldingen</span>
                    <!-- Uploaded images will appear here -->   
                </div>
            </div>
        </aside>

        <section class="stack" id="web-only">
            <div id="webEditors" class="stack panel card">
                <div class="row">
                    <h2>HTML / CSS / JS</h2>
                    <div class="row">
                        <button id="runWeb" class="btn ok">Run</button>
                        <button class="btn secondary" id="openPreview">Open preview in a new window</button>
                    </div>
                </div>

                <div class="editor-wrap" data-pane="html">
                    <div id="ed_html" class="editor"></div>
                </div>
                <div class="editor-wrap" data-pane="css" hidden>
                    <div id="ed_css" class="editor"></div>
                </div>
                <div class="editor-wrap" data-pane="js" hidden>
                    <div id="ed_js" class="editor"></div>
                </div>
                <div class="editor-wrap" data-pane="img" hidden>
                    <div id="ed_img" class="editor">Hier komt een plaatje</div>
                </div>
                
                <div class="stack">
                    <h3>Preview</h3>
                    <iframe id="preview" class="preview" sandbox="allow-scripts allow-same-origin allow-modals allow-forms" title="preview"></iframe>
                </div>
            </div>
        </section>
        <aside class="stack panel card">
            <h2>Console</h2>
            <div class="out" id="output" aria-live="polite"></div>
            <div class="row">
                <button class="btn warn" id="runTests" hidden>Run with tests</button>
                <button id="clearOut" class="btn secondary">Clear log</button>
            </div>
            <h3>Notes</h3>
            <ul class="muted">
                <li class="label">Everything runs inside the browserin a sanbox.</li>
                <li class="label">You can save the work as a JSON file and restore it...</li>
            </ul>
            <div class="muted">
                Tip: <span class="kbd">Ctrl</span> + <span class="kbd">S</span> to save,
                <span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> to run.
            </div>
        </aside>
    </main>
    <footer>
        &copy 2025 Summa College - All rights reserved.
    </footer>
    <script src="public/js/editor.js" type="text/javascript"></script>
    <script src="public/js/fileops.js" type="text/javascript"></script>
</body>

</html>