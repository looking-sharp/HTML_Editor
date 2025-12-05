(function() {
    let activePreview = null;

    function dragstartHandler(ev) {
        ev.dataTransfer.setData("text", ev.target.id);
    }

    function dragleaveHandler(ev) {
        const mainBody = document.getElementById("preview-body");
        const rect = mainBody.getBoundingClientRect();

        if (
            ev.clientX < rect.left ||
            ev.clientX > rect.right ||
            ev.clientY < rect.top ||
            ev.clientY > rect.bottom
        ) {
            if (ev.relatedTarget && mainBody.contains(ev.relatedTarget)) {
                return;
            }

            if (activePreview && activePreview.parentNode) {
                activePreview.parentNode.removeChild(activePreview);
            }
            activePreview = null;
        }
    }

    function dragoverHandler(ev) {
        ev.preventDefault();

        if (!activePreview) {
            activePreview = document.createElement("div");
            activePreview.className = "insert-div-display";
            activePreview.innerHTML = `
                <p class="div-display">
                    <i class="fa fa-plus-circle div-display"></i>
                </p>`;
        }
        if(ev.target.tagName == "DIV" && ev.target.classList.contains("placed-div-formatter")) {
            ev.target.appendChild(activePreview);
            return;
        }
        if (ev.target.classList.contains("div-display")) return;
        // Ensure that the element chosen is actually close to mouse
        const rect = ev.target.getBoundingClientRect();
        const mouseY = ev.clientY;
        const bottomY = rect.bottom;
        console.log(bottomY - mouseY, ev.target);
        //if (bottomY-mouseY > 20) return;

        const parent = ev.target.parentNode;

        if (activePreview.previousSibling === ev.target) return;

        if (activePreview.parentNode) {
            activePreview.parentNode.removeChild(activePreview);
        }
        else {
            try {
                parent.insertBefore(activePreview, ev.target.nextSibling);
            } catch (e) {}
        }
    }

    function dropHandler(ev) {
        ev.preventDefault();

        if (activePreview && activePreview.parentNode) {
            const newDiv = document.createElement("div");
            newDiv.className = "placed-div-formatter";
            activePreview.parentNode.insertBefore(newDiv, activePreview.nextSibling);
            activePreview.parentNode.removeChild(activePreview);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        const mainBody = document.getElementById("preview-body");
        const children = mainBody.querySelectorAll("*");

        children.forEach(child => {
            if (child.classList.contains("div-display")) return;

            child.addEventListener("dragover", dragoverHandler);
            child.addEventListener("drop", dropHandler);
        });

        mainBody.addEventListener("dragleave", dragleaveHandler);
    });
})();