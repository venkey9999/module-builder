document.addEventListener('DOMContentLoaded', () => {
  const moduleRow = document.getElementById('moduleRow');
  const addSlots = document.querySelectorAll('.add-slot');
  const modalOverlay = document.getElementById('modalOverlay');
  const moduleTitle = document.getElementById('moduleTitle');
  const lectureList = document.getElementById('lectureList');
  const addLectureBtn = document.getElementById('addLectureBtn');
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  let dragged = null;

  function attachDrag(card) {
    card.addEventListener('dragstart', e => {
      dragged = card;
      e.dataTransfer.setData('text/plain', 'module');
      setTimeout(() => card.classList.add('dragging'), 0);
    });
    card.addEventListener('dragend', () => {
      dragged.classList.remove('dragging');
      dragged = null;
    });
  }

  document.querySelectorAll('.module-card').forEach(attachDrag);

  addSlots.forEach(slot => {
    slot.addEventListener('dragover', e => e.preventDefault());
    slot.addEventListener('dragenter', e => slot.classList.add('active'));
    slot.addEventListener('dragleave', () => slot.classList.remove('active'));
    slot.addEventListener('drop', e => {
      e.preventDefault();
      slot.classList.remove('active');
      if (dragged) openModal();
    });
    slot.addEventListener('click', openModal);
  });

  function openModal() {
    modalOverlay.classList.add('active');
    moduleTitle.value = '';
    lectureList.innerHTML = `<input type="text" placeholder="Lecture 1 — Title" />`;
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
  }

  addLectureBtn.addEventListener('click', e => {
    e.preventDefault();
    const idx = lectureList.querySelectorAll('input').length + 1;
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Lecture ${idx} — Title`;
    lectureList.appendChild(input);
  });

  cancelBtn.addEventListener('click', e => {
    e.preventDefault();
    closeModal();
  });

  saveBtn.addEventListener('click', e => {
    e.preventDefault();
    const title = moduleTitle.value.trim() || 'New Module';
    const lectures = Array.from(lectureList.querySelectorAll('input'))
      .map(i => i.value.trim())
      .filter(Boolean);

    const newCard = document.createElement('div');
    newCard.className = 'module-card';
    newCard.setAttribute('draggable', 'true');
    newCard.innerHTML = `
      <div class="module-header">
        <div class="module-title">${escapeHtml(title)}</div>
        <div class="badge">${lectures.length}</div>
      </div>
      <div class="lectures">
        ${lectures.map(l => `<div class="lecture">${escapeHtml(l)}</div>`).join('')}
      </div>
    `;
    attachDrag(newCard);
    moduleRow.insertBefore(newCard, moduleRow.firstChild);
    closeModal();
  });

  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }
});
