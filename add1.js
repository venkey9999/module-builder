const container = document.getElementById("topRow");
const buttons = document.querySelectorAll(".draggable-btn");
let draggedType = null;
let filledBoxes = [];
let moduleCount = 0;

// ===== DRAG START from bottom buttons =====
buttons.forEach(btn => {
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

// ===== ENABLE DROP on each box =====
function enableDrop(box) {
  box.addEventListener("dragover", e => {
    e.preventDefault();
    box.classList.add("drag-over");
  });
  box.addEventListener("dragleave", () => box.classList.remove("drag-over"));

  box.addEventListener("drop", () => {
    box.classList.remove("drag-over");
    if (!draggedType) return;

    // --- SAVE BUTTON ---
    if (draggedType === "Save") {
      saveData();
      return;
    }

    // prevent overwriting
    if (box.classList.contains("filled")) return;

    // --- Assign automatic names ---
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

    // --- Update box visually ---
    box.classList.add("filled");
    box.innerHTML = `<div class="box-label">${name}</div>`;

    if (draggedType === "Module") box.classList.add("module-filled");
    else if (draggedType === "Quiz") box.classList.add("quiz-filled");
    else if (draggedType === "Assignment") box.classList.add("assignment-filled");
    else if (draggedType === "Live Class") box.classList.add("liveclass-filled");

    // --- Save data ---
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

    // Attach click listener to open later (only after saved)
    box.addEventListener("click", () => openPage(name));

    // Always ensure there’s one empty +box
    const hasEmpty = [...container.querySelectorAll(".plus-box")].some(b => !b.classList.contains("filled"));
    if (!hasEmpty) createPlusBox();

    enableReorder();
  });
}

// ===== OPEN PAGE ON CLICK (AFTER SAVE) =====
function openPage(boxName) {
  const savedItem = filledBoxes.find(item => item.name === boxName);
  if (!savedItem) return;

  // Check if data is saved first
  if (!dataSaved) {
    alert("⚠️ Please click 'Save' before opening this page.");
    return;
  }

  // Redirect only after saving
  if (savedItem.page) {
    window.location.href = savedItem.page;
  }
}

let dataSaved = false;

// ===== INITIAL +BOXES =====
document.querySelectorAll(".plus-box").forEach(box => enableDrop(box));

// ===== ENABLE REORDER (no prompts) =====
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

// ===== MANUAL SAVE =====
function saveData() {
  if (filledBoxes.length === 0) {
    alert("⚠️ No data added yet!");
    return;
  }
  console.log("✅ Saved data:", filledBoxes);
  alert("✅ Data saved successfully!");
  dataSaved = true;
}
