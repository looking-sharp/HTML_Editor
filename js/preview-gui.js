function initDomInspector(onSelect) {
    let lastHighlighted = null;
    let guiOpen = false;

    const gui_div = document.querySelector('.gui-div');
    const highlightBox = document.createElement("div");
    highlightBox.style.position = "fixed";
    highlightBox.style.pointerEvents = "none";
    highlightBox.style.border = "2px solid #4A90E2";
    highlightBox.style.background = "rgba(74, 144, 226, 0.15)";
    highlightBox.style.zIndex = "999999";
    highlightBox.style.display = "none";
    document.body.appendChild(highlightBox);

    function highlight(el) {
        if (!el) return;

        if(el.tagName.toLowerCase() === "html" || el.classList.contains("no-highlight")) {
            clearHighlight();
            return;
        }

        const rect = el.getBoundingClientRect();
        highlightBox.style.left = rect.left + "px";
        highlightBox.style.top = rect.top + "px";
        highlightBox.style.width = rect.width + "px";
        highlightBox.style.height = rect.height + "px";
        highlightBox.style.display = "block";

        lastHighlighted = el;
    }

    function clearHighlight() {
        highlightBox.style.display = "none";
        lastHighlighted = null;
    }

    document.addEventListener("mousemove", (e) => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (el && !guiOpen && el !== document.body && el !== highlightBox) {
            highlight(el);
        } else if (!guiOpen){
            clearHighlight();
        }
    });

    function placeGUIDiv(content) {
        guiOpen = true;
        gui_div.style.display = "block";
        const rectContent = content.getBoundingClientRect();

        let x = (rectContent.right - rectContent.left) / 2;
        let y = rectContent.bottom + 3;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = gui_div.getBoundingClientRect();

        if (x + rect.width > vw) {
            x = vw - rect.width - 10;
        }
        if (x < 0) x = 0;

        if (y + rect.height > vh) {
            y = vh - rect.height - 10;
        }
        if (y < 0) y = 0;

        gui_div.style.left = x + "px";
        gui_div.style.top = y + "px";
    }

    function updateGuiContent(el) {
        const tagP = document.getElementById("tag-gui-display");
        const classContainer = document.getElementById("class-container-gui-display");
        const idContainer = document.getElementById("id-container-gui-display");

        tagP.innerHTML = `Looking at: <span style="font-weight:bold;">${el.tagName.toLowerCase()}</span>`;

        classContainer.querySelector("tbody").innerHTML = `<tr><td><i class="fa fa-plus-circle" title="Add new class"></i></td></tr>`;
        idContainer.querySelector("tbody").innerHTML = "";

        const classes = [...el.classList];
        if (classes.length === 0) {
            addClassRow("");
        } else {
            classes.forEach(cls => addClassRow(cls));
        }

        function addClassRow(value = "") {
            const tbody = classContainer.querySelector("tbody");
            if (value === "" && tbody.querySelector('input[value=""]')) return;

            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.innerHTML = `
                <input type="text" class="class-input-gui-display" placeholder="Add class" value="${value}">
                <i class="fa fa-minus-circle remove-class-btn" title="Remove class" style="color:red; margin-left:5px;"></i>
            `;
            tr.appendChild(td);
            tbody.insertRow(0).appendChild(td);
        }

        const tdId = document.createElement("td");
        tdId.style.width = "208px";
        tdId.innerHTML = `<input style="float:right;" type="text" id="id-input-gui-display" placeholder="Add ID" value="${el.id || ''}">`;
        const trId = document.createElement("tr");
        trId.appendChild(tdId);
        idContainer.querySelector("tbody").appendChild(trId);

        classContainer.addEventListener("click", function(e) {
            if (e.target.classList.contains("remove-class-btn")) {
                const tbody = classContainer.querySelector("tbody");
                const row = e.target.closest("tr");
                const rows = tbody.querySelectorAll("tr").length - 1;

                if (rows === 1) {
                    const input = row.querySelector("input");
                    if (input) input.value = "";
                } else {
                    row.remove();
                }
            }
        });

        const plusBtn = classContainer.querySelector(".fa-plus-circle");
        if (plusBtn) {
            plusBtn.onclick = () => addClassRow();
        }

        const deleteBtn = gui_div.querySelector("#delete-element-btn-gui-display");
        if (deleteBtn) {
            deleteBtn.onclick = () => {
                if (lastHighlighted) {
                    lastHighlighted.remove();
                    gui_div.style.display = "none";
                    guiOpen = false;
                    clearHighlight();
                }
            };
        }
    }


    document.addEventListener("click", (e) => {
        if(guiOpen && !gui_div.contains(e.target)) {
            // Alter element classes and ID based on GUI inputs
            const el = lastHighlighted;
            const classInputs = gui_div.querySelectorAll(".class-input-gui-display");
            classInputs.forEach(input => {
                const val = input.value.trim();
                if (val) el.classList.add(val.replace(" ", "_"));
            });

            const idInput = gui_div.querySelector("#id-input-gui-display");
            if (idInput) {
                const idVal = idInput.value.trim();
                el.id = idVal || "";
            }
            
            guiOpen = false;
            gui_div.style.display = "none";
            clearHighlight();
            return;
        }
        if(gui_div.contains(e.target)) return;
        
        e.preventDefault();
        e.stopPropagation();

        const el = lastHighlighted;
        if (!el || el.tagName.toLowerCase() === "html") return;

        const info = {
            tag: el.tagName.toLowerCase(),
            id: el.id || null,
            classes: [...el.classList],
            attributes: [...el.attributes].map(a => [a.name, a.value]),
            inlineStyle: el.getAttribute("style"),
            computedStyle: getComputedStyle(el),
            text: el.textContent,
            element: el
        };
        
        placeGUIDiv(el);
        updateGuiContent(el);

        if (typeof onSelect === "function") onSelect(el, info);
    }, true);

    console.log("DOM Inspector initialized.");
}

window.addEventListener("DOMContentLoaded", () => {
    initDomInspector((el, info) => {
        //console.log("Selected element:", info);
    });
});
