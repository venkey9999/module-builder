const container = document.getElementById("topRow");
const buttons = document.querySelectorAll(".draggable-btn");
let draggedType = null;
let filledBoxes = [];
let moduleCount = 0;
let dataSaved = false;
let posted = false;

// ========== REMOVE DRAG ON SAVE & POST ==========
buttons.forEach(btn => {
  const type = btn.dataset.type;

  if (type === "Save") {
    btn.addEventListener("click", saveData);
    return;
  }

  if (type === "Post") {
    btn.addEventListener("click", postData);
    return;
  }

  // keep DRAG only for Module / Quiz / Assignment / Live Class
  btn.addEventListener("dragstart", e => {
    draggedType = e.target.dataset.type;
    e.target.classList.add("dragging");
  });
  btn.addEventListener("dragend", e => e.target.classList.remove("dragging"));
});

// ===== CREATE A NEW +BOX =====
function createPlusBox() {
  const box = document.createElement("div");
  box.className = "plus-box";
  box.innerHTML = `<div class="plus">+</div>`;
  enableDrop(box);
  container.appendChild(box);
}

// ===== ENABLE DROP =====
function enableDrop(box) {
  box.addEventListener("dragover", e => {
    e.preventDefault();
    box.classList.add("drag-over");
  });
  box.addEventListener("dragleave", () => box.classList.remove("drag-over"));

  box.addEventListener("drop", () => {
    box.classList.remove("drag-over");
    if (!draggedType) return;

    // prevent overwrite
    if (box.classList.contains("filled")) return;

    let name = "";
    if (draggedType === "Module") {
      name = "Module " + String.fromCharCode(65 + moduleCount);
      moduleCount++;
    } else if (draggedType === "Quiz") {
      name = "Quiz";
    } else if (draggedType === "Assignment") {
      name = "Assignment";
    } else if (draggedType === "Live Class") {
      name = "Live Class";
    }

    // update box UI
    box.classList.add("filled");
    box.innerHTML = `<div class="box-label">${name}</div>`;

    if (draggedType === "Module") box.classList.add("module-filled");
    else if (draggedType === "Quiz") box.classList.add("quiz-filled");
    else if (draggedType === "Assignment") box.classList.add("assignment-filled");
    else if (draggedType === "Live Class") box.classList.add("liveclass-filled");

    // save data
    filledBoxes.push({
      type: draggedType,
      name: name,
      page:
        draggedType === "Module"
          ? "module_page.html"
          : draggedType === "Quiz"
          ? "quiz_page.html"
          : draggedType === "Assignment"
          ? "assignment_page.html"
          : draggedType === "Live Class"
          ? "liveclass_page.html"
          : null,
    });

    // open page later (only after save + post)
    box.addEventListener("click", () => openPage(name));

    // auto-create +box
    const hasEmpty = [...container.querySelectorAll(".plus-box")].some(
      b => !b.classList.contains("filled")
    );
    if (!hasEmpty) createPlusBox();

    enableReorder();

    // 🔥 AUTO-SAVE FEATURE
    autoSave();
  });
}

// ===== AUTO-SAVE =====
function autoSave() {
  if (filledBoxes.length > 0) {
    dataSaved = true;
    console.log("🔄 Auto-Saved:", filledBoxes);
  }
}

// ===== OPEN PAGE (UPDATED) =====
function openPage(boxName) {
  const savedItem = filledBoxes.find(item => item.name === boxName);
  if (!savedItem) return;

  // 🔒 Must click Save AND Post first
  if (!dataSaved || !posted) {
    alert("⚠️ You must Save AND Post before opening.");
    return;
  }

  // 🔓 Now open page
  if (savedItem.page) {
    window.location.href = savedItem.page;
  }
}

// ===== INITIAL BOXES =====
document.querySelectorAll(".plus-box").forEach(box => enableDrop(box));

// ===== ENABLE REORDER (unchanged) =====
function enableReorder() {
  const boxes = container.querySelectorAll(".plus-box");
  boxes.forEach(box => {
    box.setAttribute("draggable", "true");
    box.addEventListener("dragstart", e => e.target.classList.add("dragging-box"));
    box.addEventListener("dragend", e => e.target.classList.remove("dragging-box"));
  });

  container.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging-box");
    const afterElement = getAfterElement(container, e.clientX);
    if (!afterElement) container.appendChild(dragging);
    else container.insertBefore(dragging, afterElement);
  });
}

function getAfterElement(container, x) {
  const elements = [...container.querySelectorAll(".plus-box:not(.dragging-box)")];
  return elements.reduce(
    (closest, child) => {
      const rect = child.getBoundingClientRect();
      const offset = x - rect.left - rect.width / 2;
      if (offset < 0 && offset > closest.offset) return { offset, element: child };
      else return closest;
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// ===== SAVE BUTTON CLICK =====
function saveData() {
  if (filledBoxes.length === 0) {
    alert("⚠️ No data added!");
    return;
  }
  dataSaved = true;
  console.log("✅ Saved:", filledBoxes);
  alert("✅ Data saved!");
}

// ===== POST BUTTON CLICK =====
function postData() {
  if (!dataSaved) {
    alert("⚠️ Please click Save before Post.");
    return;
  }

  posted = true;
  alert("📢 Posted successfully!");
}
