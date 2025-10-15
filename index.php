<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Code Editor - Summa</title>
    <link rel="stylesheet" href="public/css/styles.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.43.3/ace.min.js" integrity="sha512-BHJlu9vUXVrcxhRwbBdNv3uTsbscp8pp3LJ5z/sw9nBJUegkNlkcZnvODRgynJWhXMCsVUGZlFuzTrr5I2X3sQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>
<body>
    <header>
        <div class="container row">
            <div class="brand">
                <div class="logo"></div>
                <div class="title">Online Code Editor - Summa</div>
            </div>

            <div class="row">
                <button class="btn secondary" id="saveBtn" title="Save work locally"><span>Save</span></button>
                <button class="btn secondary" id="loadBtn" title="Load work file"><span>Load</span></button>
                <input type="file" id="openFile" accept="application/json" hidden/>
            </div>
        </div>
    </header>
    
    <main>
        <aside class="card panel stack">
            <h2>Task / Assignment</h2>

            <textarea id="assignment" class="text" placeholder="Write the task description here..."></textarea>

            <div class="stack">
                <label for="testArea">Validation tests (Javascript only - optional)</label>
                <textarea id="testArea" class="text" placeholder="Write simple tests to append afer the students code to check solution"></textarea>
            </div>

            <div class="muted">
                Tip: <span class="kbd">Ctrl</span> + <span class="kbd">S</span> to save,
                <span class="kbd">Ctrl</span> + <span class="kbd">Enter</span> to run.
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

                <div class="tabs" id="webTabs" role="tablist" aria-label="web editors">
                    <button class="tab active" role="tab" aria-selected="true" tabindex="0" data-pane="html">HTML</button>
                    <button class="tab" role="tab" aria-selected="false" tabindex="-1" data-pane="css">CSS</button>
                    <button class="tab" role="tab" aria-selected="false" tabindex="-1" data-pane="js">Javascript</button>
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
                <div class="stack">
                    <h3>Preview</h3>
                    <iframe id="preview" class="preview" sandbox="allow-scripts allow-same-origin allow-modals allow-forms" title="preview"></iframe>
                </div>
            </div>
        </section>
        <aside class="stack panel card">
            <h2>Output</h2>
            <div class="out" id="output" aria-live="polite"></div>
            <div class="row">
                <button class="btn warn" id="runTests">Run with tests</button>
                <button id="clearOut" class="btn secondary">Clear log</button>
            </div>
            <h3>Notes</h3>
            <ul class="muted">
                <li class="label">Everything runs inside the browserin a sanbox.</li>
                <li class="label">You can save the work as a JSON file and restore it...</li>
            </ul>
        </aside>
    </main>
    <footer>
        &copy 2025 Summa College - All rights reserved.
    </footer>
    <script src="public/js/script.js" type="text/javascript"></script>
</body>
</html>