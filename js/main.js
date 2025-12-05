const defaultCSS = 
`body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    color: #333;
}

#content {
    padding: 10px;
    border: none;
}

.title-welcome-default {
    text-align: center;
}`;

let htmlBody = 
`<div id="content">
    <h1 class="title-welcome-default">Welcome to HTML Formatter</h1>
    <h3 class="title-welcome-default">The tool to help you format your HTML</h3>
    <p>Edit the CSS and JavaScript in the editors to see changes reflected here.</p>
    <p>Use the sidebar on the left to alter HTML elements.</p>
    <p>Happy coding!</p>
    <p> - Tom Sharp </p>
</div>`;

const htmlGUIBody = 
`<div id="do-not-include-in-export" class="no-highlight gui-div" style="display: none;">
    <p id="tag-gui-display">TEST</p>
    <div id="class-container-gui-display">
        <p id="classes-title-gui-display">Classes:</p>
        <table><tbody></tbody></table>
    </div>
    <div id="id-container-gui-display">
        <p id="id-title-gui-display">ID:</p>
        <table><tbody></tbody></table>
    </div>
    <button id="delete-element-btn-gui-display">Delete Element</button>
</div>`;

document.addEventListener("DOMContentLoaded", () => {
    const jsEditorEl = document.getElementById('jsEditor');
    const cssEditorEl = document.getElementById('cssEditor');

    window.jsEditor = CodeMirror.fromTextArea(jsEditorEl, {
        mode: "javascript",
        lineNumbers: true,
        autocorrect: true,
        spellcheck: true,
        theme: "gruvbox-dark"
    });

    window.cssEditor = CodeMirror.fromTextArea(cssEditorEl, {
        mode: "css",
        lineNumbers: true,
        autocorrect: true,
        spellcheck: true,
        theme: "gruvbox-dark"
    });

    jsEditor.on("change", updatePreview);
    cssEditor.on("change", updatePreview);

    window.cssEditor.setValue(defaultCSS);

    setUpIcons();
    updatePreview();
});

let includeSearch = false;
let divFormatterOpen = false;

function updatePreview(overrideHTML = false) {
    const cssCode = window.cssEditor.getValue();
    const jsCode = window.jsEditor.getValue();

    const iframe = document.getElementById('preview-frame');
    const doc = iframe.contentDocument || iframe.contentWindow.document;

    const previewBody = doc.getElementById("preview-body");
    if (previewBody && overrideHTML === false) {
        htmlBody = previewBody.innerHTML;
    }

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="css/hidden.css">
            <link rel="stylesheet" href="css/div-formatter.css">
            <style>${cssCode}</style>
        </head>
        <body>
            <main id="preview-body">
                ${htmlBody}
            </main>
            ${includeSearch ? htmlGUIBody : ''}
            <script>${jsCode}<\/script>
            ${includeSearch ? '<script src="js/preview-gui.js"></script>' : ''}
            ${divFormatterOpen ? '<script src="js/div-formatter.js"></script>' : ''}
        </body>
        </html>
    `);
    doc.close();
    }

function setUpIcons() {
    const icons = document.querySelectorAll('.icon-bar .fa');
    icons.forEach(icon => {
        icon.addEventListener('click', () => iconLogic(icon));
    });
}


function iconLogic(icon) {
    const baseClass = icon.className.split(' ')[1];
    const isActive = icon.classList.contains('active');

    if(baseClass === 'fa-times') {
        htmlBody = '';
        updatePreview(overrideHTML=true);
        return;
    }
    if (baseClass === 'fa-terminal') {
        const bottomContainer = document.querySelector('#bottom-container');
        if (!bottomContainer) return;
        bottomContainer.style.display = isActive ? 'none' : 'flex';
        icon.classList.toggle('active');
    }
    if (baseClass === 'fa-search') {
        icon.classList.toggle('active');
        includeSearch = !includeSearch;
        updatePreview();
    }
    if (baseClass === 'fa-clone') {
        icon.classList.toggle('active');
        divFormatterOpen = !divFormatterOpen;
        if (divFormatterOpen) {
            const terminalIcon = document.querySelector('.fa-terminal');
            if (terminalIcon.classList.contains('active')) {
                terminalIcon.classList.remove('active');
                const bottomContainer = document.querySelector('#bottom-container');
                if (bottomContainer) bottomContainer.style.display = 'none';
            }
            terminalIcon.style.display = 'none';
            updatePreview();
        }
        else {
            const terminalIcon = document.querySelector('.fa-terminal');
            terminalIcon.style.display = 'inline-block';
            updatePreview();
        }
    }
}

