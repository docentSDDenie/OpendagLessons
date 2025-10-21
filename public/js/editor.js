const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

const out = $("#output");
const preview = $("#preview");
const STORAGE_KEY = "summa_online_editor";
const lessonsList = $("#lessons_list");
const courseImages = {};

var currentCourse = null;
var currentLessonIndex = 0;

const escapeHtml = s =>
    String(s).replace(/[&<>"]/g, c => ({
        '&': "&amp;",
        '<': "&lt;",
        '>': "&gt;",
        '"': "&quot;"
    }[c]));

function log(msg, type = 'info') {
    const color = type === "error" ? "var(--err)" : type === "warn" ? "var(--warn)" : "var(--brand)";

    //Get the current time in HH:MM:SS format
    const time = Date.now().toLocaleString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const line = document.createElement("div");

    line.innerHTML = `<span style="color: ${color}">[${time}]</span> ${escapeHtml(msg)}`;

    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
}

function clearOut() {
    out.innerHTML = "";
}

$("#clearOut")?.addEventListener("click", clearOut);

function makeEditor(id, mode) {
    const ed = ace.edit(id, {
        theme: "ace/theme/dracula",
        mode,
        tabSize: 2,
        useSoftTabs: true,
        showPrintMargin: false,
        wrap: true
    });

    ed.session.setUseWrapMode(true);

    ed.commands.addCommand({
        name: "run",
        bindKey: {
            win: 'Ctrl-Enter',
            mac: 'Command-Enter'
        },
        exec() { runWeb(false); }
    })

    ed.commands.addCommand({
        name: "save",
        bindKey: {
            win: "Ctrl-S",
            mac: "Command-S"
        },
        exec() { saveProject(); }
    });

    return ed;
}

function makeImageEditor(id, mode) {
    // Placeholder for future image editor setup
}

const ed_html = makeEditor("ed_html", "ace/mode/html");
const ed_css = makeEditor("ed_css", "ace/mode/css");
const ed_js = makeEditor("ed_js", "ace/mode/javascript");
const ed_img = makeImageEditor("ed_img", "ace/mode/text");

const TAB_ORDER = ["html", "css", "js", "img"];

const wraps = Object.fromEntries($$("#webEditors .editor-wrap").map((w) => [w.dataset.pane, w]));
console.log("Editor wraps:", wraps);
const editors = {
    html: ed_html,
    css: ed_css,
    js: ed_js,
    img: ed_img
}

function activePane() {
    const t = $(".file.active");
    return t ? t.dataset.pane : "html";
}

function showPane(name) {
    TAB_ORDER.forEach(k => {
        if (wraps[k]) {
            wraps[k].hidden = (k !== name);
        }
    })

    if (name === 'img') {

    }

    $$(".file").forEach(t => {
        let on = t.dataset.pane === name;
        if(t.dataset.pane === 'img') {
            on = false;
        }

        toggleFileActive(t, on);
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;  
    });

    requestAnimationFrame(() => {
        const ed = editors[name];
        if (ed && ed.resize) {
            ed.resize(true);
            ed.focus();
        }
    })
}

function toggleFileActive(element, isActive) {
    element.classList.toggle("active", isActive);
}

$("#fileList")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".file");
    if (!btn) {
        return;
    }
    showPane(btn.dataset.pane);
})

$("#fileList")?.addEventListener("keydown", (e) => {
    const idx = TAB_ORDER.indexOf(activePane());
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const delta = e.key === "ArrowLeft" ? -1 : -1;
        showPane(TAB_ORDER[(idx + delta + TAB_ORDER.length) % TAB_ORDER.length])
    }
})

showPane("html");

function buildWebSrcdoc(withTests = false) {
    let html = ed_html.getValue();

    //Replace all img src attiributes with data from session storage
    html = html.replace(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi, (match, src) => {

        let imgData = null;

        if (src in courseImages) {
            imgData = courseImages[src];
        }
        else {
            imgData = fetchImagesFromSessionStorage(src);
        }

        if (imgData) {
            return match.replace(src, imgData);
        }

        return match;
    });

    let css = ed_css.getValue();

    //Replace all img src attiributes with data from session storage
    css = css.replace(/url\(["']?([^"')]+)["']?\)/gi, (match, src) => {

        let imgData = null;
        if (src in courseImages) {
            imgData = courseImages[src];
        }
        else {
            imgData = fetchImagesFromSessionStorage(src);
        }

        if (imgData) {
            return `url('${imgData}')`;
        }

        return match;
    });

    const js = ed_js.getValue();

    errors = (scripts) => {
        try {
            new Function(js)();
            return null;
        } catch (e) {
            return e;
        }
    }

    if (e = errors(js)) {
        log("JavaScript error: " + e, "error");
    }

    return `
    <!DOCTYPE html>
    <html leng="en" dir="ltr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                ${css}\n
            </style>
        </head>
        <body>
            ${html}

        <script>
            try {
                ${js}

                ${withTests && tests ? `\n/* tests */\n${tests}` : ''}
            }
            catch(e)
            {
                console.error(e);
            }
            
        </script>
    </body>
    </html>`;
};

function runWeb(withTests = false) {
    preview.srcdoc = buildWebSrcdoc(withTests);
    log(withTests ? "Run with tests" : "Web preview updated");
}

$("#runWeb")?.addEventListener("click", () => runWeb(false));

// $("#runtTests")?.addEventListener("click", () => runWeb(true));

$("#openPreview")?.addEventListener("click", () => {
    const src = buildWebSrcdoc(false);

    const w = window.open("about:blank");

    w.document.open();
    w.document.write(src);
    w.document.close();
})

function projectJSON() {
    return {
        version: 1,
        kind: 'web-only',
        assignment: $("#assignment")?.value || "",
        test: $("#testArea")?.value || "",
        html: ed_html.getValue(),
        css: ed_css.getValue(),
        js: ed_js.getValue()
    }
}


// Course panel toggle handling
(function () {
    const btn = document.getElementById('toggleCoursePanel');
    const panel = document.getElementById('course_container');
    if (!btn || !panel) return;

    const STORAGE_KEY = 'coursePanelCollapsed';
    const isCollapsed = localStorage.getItem(STORAGE_KEY) === '1';
    if (isCollapsed) {
        panel.classList.add('collapsed');
        btn.setAttribute('aria-pressed', 'true');
    }

    btn.addEventListener('click', () => {
        const nowCollapsed = panel.classList.toggle('collapsed');
        btn.setAttribute('aria-pressed', nowCollapsed ? 'true' : 'false');
        localStorage.setItem(STORAGE_KEY, nowCollapsed ? '1' : '0');
    });
})();

function addImageToPanel(safeName, editable = false) {
    const panel = document.getElementById('imageList');

    const imgContainer = document.createElement('div');
    imgContainer.className = 'image-item-container';

    const imgSpan = document.createElement('span');
    imgSpan.className = 'file imagefile tab-4';
    imgSpan.role = 'image';
    imgSpan.ariaSelected = 'false';
    imgSpan.tabIndex = -1;
    imgSpan.dataset.pane = 'img';
    imgSpan.textContent = safeName;
    imgSpan.addEventListener('click', (e) => {
        // ensure the image pane is visible
        showPane('img');

        $$(".imagefile").forEach(t => {
            const on = t === imgSpan
            toggleFileActive(t, on);
            t.setAttribute("aria-selected", on);
            t.tabIndex = on ? 0 : -1;
        });

        // show the image in the image editor using stored path
        const path = courseImages[safeName] || fetchImagesFromSessionStorage(safeName) || null;
        showImageInEditor(path, safeName);
    });

    imgContainer.appendChild(imgSpan);

    if (editable) {
        trashSpan = document.createElement('span');
        trashSpan.className = 'img-trash-btn fa fa-trash';
        trashSpan.title = 'Delete image from course';
        trashSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            // Remove from session storage
            removeImageFromSessionStorage(safeName);
            // Remove from panel
            panel.removeChild(imgContainer);
            showPane('html');
        });

        imgContainer.appendChild(trashSpan);
    }
    panel.appendChild(imgContainer);
}

// Display an image (or an error message) inside the image editor pane
function showImageInEditor(path, name) {
    const ed = document.getElementById('ed_img');
    if (!ed) return;
    ed.innerHTML = '';

    if (!path) {
        const msg = document.createElement('div');
        msg.className = 'img-error';
        msg.textContent = 'No image available for this selection.';
        ed.appendChild(msg);
        return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'img-viewer';

    const image = document.createElement('img');
    image.src = path;
    image.alt = name || '';
    image.draggable = false;
    image.addEventListener('error', () => {
        ed.innerHTML = '';
        const err = document.createElement('div');
        err.className = 'img-error';
        err.textContent = 'Unable to load image.';
        ed.appendChild(err);
    });

    wrapper.appendChild(image);

    const caption = document.createElement('div');
    caption.className = 'img-caption muted';
    caption.textContent = name || '';
    wrapper.appendChild(caption);

    ed.appendChild(wrapper);
}

function buildCourse(course) {
    try {
        console.log("Building course:", course);
        // if($('#assignment')) $("#assignment").value = obj.assignment;
        if (course.lessons.length > 0) {
            // Clear existing list
            lessonsList.innerHTML = "";

            course.lessons.forEach((lesson, index) => {
                const lessonDiv = document.createElement("button");
                lessonDiv.type = 'button';
                lessonDiv.classList.add("lesson-item", "btn", "secondary");
                lessonDiv.dataset.index = index;
                lessonDiv.innerHTML = `<span class=\"lesson-title\"><strong>Lesson ${index + 1}:</strong> ${lesson.title}</span>`;
                lessonDiv.addEventListener('click', () => selectLesson(index));
                lessonsList.appendChild(lessonDiv);
            });

            currentCourse = course;
            currentLessonIndex = 0;

            $("#course_title").textContent = course.course;
            $("#course_description").textContent = course.description;

            selectLesson(currentLessonIndex);

            log("Web project loaded");
        }
        else {
            setDefaultContent();
        }

    } catch (e) {
        log("Unable to load project." + e, "error");
    }
}

function buildLesson(lesson) {
    // Show description for initial lesson
    showLessonDescription(lesson);
    // Populate image list from course lessons
    populateImageList(lesson);

    ed_html.setValue(lesson.html || "", -1);
    ed_css.setValue(lesson.css || "", -1);
    ed_js.setValue(lesson.javascript || "", -1);

    showPane("html");
}

function populateImageList(lesson) {
    const list = document.getElementById('imageList');
    if (!list) return;

    // Clear existing content but keep folder header if present
    list.innerHTML = '<span class="folder closed">afbeeldingen</span>';

    // Collect images from all lessons
    const images = [];

    if (lesson.images && typeof lesson.images === 'object') {
        Object.entries(lesson.images).forEach(([name, path]) => {
            images.push({ name, path });
        });
    }

    images.forEach(img => {
        courseImages[img.name] = img.path;
        addImageToPanel(img.name, false);
    });
}

function selectLesson(index) {
    if (!currentCourse || !currentCourse.lessons) return;
    currentLessonIndex = index;
    const lesson = currentCourse.lessons[index];
    buildLesson(lesson);

    $(".lesson-item.active")?.classList.remove("active");
    const btn = lessonsList.querySelector(`.lesson-item[data-index="${index}"]`);
    if (btn) btn.classList.add("active");
}

function showLessonDescription(lesson) {
    // Ensure a container exists
    let desc = document.getElementById('lesson_description');
    if (!desc) {
        desc = document.createElement('div');
        desc.id = 'lesson_description';
        desc.className = 'lesson-description muted panel card';
        const container = document.getElementById('lessons_bar') || document.getElementById('course_container');
        if (container) container.appendChild(desc);
    }

    desc.innerHTML = `<h3>${escapeHtml(lesson.title)}</h3><p>${escapeHtml(lesson.taskDescription || 'No description provided.')}</p>`;
}

function setDefaultContent() {
    ed_html.setValue(`<!-- Write your code here... -->`, -1);
    ed_css.setValue(`/* Write your css code here...*/`, -1)
    ed_js.setValue(`//Your javascript code goes here...`, -1)
}

function saveProject() {
    try {
        const data = JSON.stringify(projectJSON(), null, 2);
        localStorage.setItem(STORAGE_KEY, data);
        const blob = new Blob([data], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "summa-editor.json";
        a.click();
        log("Saved locally and downloaded JSON file");
    }
    catch (e) {
        log("Unable to save: " + e, "error");
    }
}

$("#saveBtn")?.addEventListener("click", saveProject)
$("#loadBtn")?.addEventListener("click", (() => $("#openFile").click()));

$("#openFile")?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) {
        return;
    }
    try {
        const obj = JSON.parse(await f.text());
        buildCourse(obj);
    }
    catch (err) {
        log("Invalid project file", "error");
    }
});

setDefaultContent();


log("Ready - Web only Editor");
