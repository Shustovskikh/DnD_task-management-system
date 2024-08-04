document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'trelloCloneData';
  const boardData = JSON.parse(localStorage.getItem(storageKey)) || {
    todo: [],
    inprogress: [],
    done: [],
  };

  let draggedElement = null;
  let dropTarget = null;
  let editingCard = null;
  let addingCard = null;

  function saveToLocalStorage() {
    localStorage.setItem(storageKey, JSON.stringify(boardData));
  }

  function renderBoard() {
    ['todo', 'inprogress', 'done'].forEach((status) => {
      const container = document.getElementById(`${status}-cards`);
      if (container) {
        container.innerHTML = '';
        boardData[status].forEach((cardText, index) => {
          const card = createCardElement(cardText, index, status);
          container.appendChild(card);
        });
        updatePlaceholderVisibility(container, boardData[status].length === 0);
      }
    });
  }

  function createCardElement(text, index, status) {
    const card = document.createElement('div');
    card.className = 'card';
    card.draggable = true;
    card.dataset.index = index;
    card.dataset.status = status;

    card.innerHTML = `
      <div class="card-content">
        <div class="card-text">${text}</div>
      </div>
      <div class="card-actions">
        <div class="card-actions-left">
          <span class="edit-btn">✎</span>
          <span class="expand-btn">↕</span>
        </div>
        <div class="card-actions-right">
          <span class="delete-btn">×</span>
        </div>
      </div>
    `;

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);

    card.querySelector('.delete-btn').addEventListener('click', () => {
      deleteCard(status, index);
    });

    card.querySelector('.edit-btn').addEventListener('click', () => {
      if (!addingCard && !editingCard) {
        editCard(status, index, card);
      } else {
        showErrorHighlight(editingCard || addingCard);
      }
    });

    card.querySelector('.expand-btn').addEventListener('click', () => {
      toggleExpandCard(card);
    });

    return card;
  }

  function handleDragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.setData('text/plain', JSON.stringify({
      index: e.target.dataset.index,
      status: e.target.dataset.status,
    }));
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
    e.target.style.cursor = 'grabbing';

    const dragPreview = e.target.cloneNode(true);
    dragPreview.style.position = 'absolute';
    dragPreview.style.top = '-999px';
    dragPreview.style.left = '-999px';
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const targetCard = e.target.closest('.card');
    const placeholder = e.target.closest('.card-placeholder');
    const column = e.target.closest('.column');

    if (placeholder) {
      dropTarget = { column: placeholder.closest('.column') };
    } else if (targetCard && targetCard !== draggedElement) {
      const rect = targetCard.getBoundingClientRect();
      const offset = e.clientY - rect.top;
      const middleY = rect.height / 2;

      if (offset > middleY) {
        targetCard.style.marginTop = '';
        targetCard.style.marginBottom = '60px';
        dropTarget = { card: targetCard, position: 'below' };
      } else {
        targetCard.style.marginTop = '60px';
        targetCard.style.marginBottom = '';
        dropTarget = { card: targetCard, position: 'above' };
      }
    } else if (column) {
      dropTarget = { column };
    }

    removePlaceholderBorders();
    if (dropTarget && dropTarget.card) {
      if (dropTarget.position === 'above') {
        dropTarget.card.style.borderTop = '3px solid orange';
      } else {
        dropTarget.card.style.borderBottom = '3px solid orange';
      }
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    removePlaceholderBorders();

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const fromStatus = data.status;
    const fromIndex = parseInt(data.index, 10);

    let newStatus = '';
    let targetIndex = 0;

    if (dropTarget && dropTarget.column) {
      newStatus = dropTarget.column.id.replace('-column', '');
      targetIndex = boardData[newStatus].length;
    } else if (dropTarget && dropTarget.card) {
      newStatus = dropTarget.card.closest('.column').id.replace('-column', '');
      targetIndex = Array.from(dropTarget.card.parentNode.children).indexOf(dropTarget.card);
      if (dropTarget.position === 'below') {
        targetIndex += 1;
      }
    }

    if (newStatus && boardData[newStatus]) {
      moveCard(fromStatus, fromIndex, newStatus, targetIndex);
    }
  }

  function handleDragEnd(e) {
    e.target.style.opacity = '1';
    e.target.style.cursor = 'grab';
    draggedElement = null;
    dropTarget = null;
    removePlaceholderBorders();
    document.body.querySelectorAll('.drag-preview').forEach((preview) => preview.remove());
  }

  function moveCard(fromStatus, fromIndex, toStatus, toIndex) {
    const [movedCard] = boardData[fromStatus].splice(fromIndex, 1);
    boardData[toStatus].splice(toIndex, 0, movedCard);
    saveToLocalStorage();
    renderBoard();
  }

  function deleteCard(status, index) {
    boardData[status].splice(index, 1);
    saveToLocalStorage();
    renderBoard();
  }

  function editCard(status, index, card) {
    if (addingCard || editingCard) {
      showErrorHighlight(editingCard || addingCard);
      return;
    }

    editingCard = card;
    const cardContentDiv = card.querySelector('.card-content');
    const currentText = card.querySelector('.card-text').textContent;

    cardContentDiv.innerHTML = '';

    const textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.className = 'card-textarea';
    textarea.style.width = '100%';
    textarea.style.height = '60px';
    textarea.style.resize = 'none';

    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.textContent = `${textarea.value.length}/100`;

    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save';

    const closeBtn = document.createElement('span');
    closeBtn.className = 'close-btn';
    closeBtn.textContent = '×';

    cardContentDiv.appendChild(textarea);
    cardContentDiv.appendChild(counter);
    cardContentDiv.appendChild(saveBtn);
    cardContentDiv.appendChild(closeBtn);

    textarea.focus();

    card.querySelector('.card-actions').style.display = 'none';

    textarea.addEventListener('input', () => {
      const textLength = textarea.value.length;
      counter.textContent = `${textLength}/100`;
      counter.style.color = textLength > 100 ? 'red' : 'black';
      if (textLength > 100) {
        textarea.value = textarea.value.substring(0, 100);
        counter.textContent = '100/100';
      }
    });

    saveBtn.addEventListener('click', () => {
      const newText = textarea.value.trim();
      if (newText !== currentText) {
        boardData[status][index] = newText;
        saveToLocalStorage();
        renderBoard();
      }
      resetEditProcess();
    });

    closeBtn.addEventListener('click', () => {
      resetEditProcess();
      cardContentDiv.innerHTML = `<div class="card-text">${currentText}</div>`;
      card.querySelector('.card-actions').style.display = 'flex';
    });
  }

  function resetEditProcess() {
    if (editingCard) {
      editingCard.querySelector('.card-actions').style.display = 'flex';
      editingCard = null;
    }
  }

  function toggleExpandCard(card) {
    card.classList.toggle('expanded');
  }

  function removePlaceholderBorders() {
    document.querySelectorAll('.card').forEach((card) => {
      card.style.borderTop = '';
      card.style.borderBottom = '';
      card.style.marginTop = '';
      card.style.marginBottom = '';
    });
  }

  function updatePlaceholderVisibility(container, isVisible) {
    let placeholder = container.querySelector('.card-placeholder');
    if (!placeholder) {
      placeholder = document.createElement('div');
      placeholder.className = 'card-placeholder';
      placeholder.style.border = '2px dashed #ccc';
      placeholder.style.padding = '1rem';
      placeholder.style.margin = '1rem 0';
      placeholder.style.textAlign = 'center';
      placeholder.textContent = 'Drag and drop or create a new card';
      placeholder.addEventListener('dragover', handleDragOver);
      placeholder.addEventListener('drop', handleDrop);
      container.appendChild(placeholder);
    }
    placeholder.style.display = isVisible ? 'block' : 'none';
  }

  function showErrorHighlight(element) {
    if (element) {
      element.classList.add('error');
      setTimeout(() => {
        element.classList.remove('error');
      }, 1000);
    }
  }

  document.querySelectorAll('.add-card-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (editingCard || addingCard) {
        showErrorHighlight(editingCard || addingCard);
        return;
      }

      addingCard = button.closest('.column');
      const inputContainer = addingCard.querySelector('.add-card-input');
      inputContainer.style.display = 'flex';
      button.style.display = 'none';
    });
  });

  document.querySelectorAll('.cancel-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const inputContainer = button.closest('.add-card-input');
      inputContainer.style.display = 'none';
      inputContainer.previousElementSibling.style.display = 'block';
      inputContainer.querySelector('.new-card-text').value = '';
      addingCard = null;
    });
  });

  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const inputContainer = button.closest('.add-card-input');
      const textarea = inputContainer.querySelector('.new-card-text');
      const counter = inputContainer.querySelector('.char-counter');
      const text = textarea.value.trim();
      const column = button.closest('.column').id.replace('-column', '');

      if (text) {
        boardData[column].push(text);
        saveToLocalStorage();
        renderBoard();
        textarea.value = '';
        counter.textContent = '0/100';
        counter.style.color = 'black';
        inputContainer.style.display = 'none';
        inputContainer.previousElementSibling.style.display = 'block';
        addingCard = null;
      }
    });
  });

  document.querySelectorAll('.new-card-text').forEach((textarea) => {
    textarea.addEventListener('input', (event) => {
      const maxChars = 100;
      const counter = textarea.closest('.add-card-input').querySelector('.char-counter');
      const textLength = textarea.value.length;
      counter.textContent = `${textLength}/${maxChars}`;
      counter.style.color = textLength > maxChars ? 'red' : 'black';
      if (textLength > maxChars) {
        textarea.value = textarea.value.substring(0, maxChars);
        counter.textContent = `${maxChars}/${maxChars}`;
      }
    });
  });

  renderBoard();
});
