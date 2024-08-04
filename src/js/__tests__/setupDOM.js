export function setupDOM() {
  document.body.innerHTML = `
    <div id="todo-column" class="column">
      <h2>To Do</h2>
      <div id="todo-cards"></div>
      <div class="add-card-input" style="display: none;">
        <textarea class="new-card-text" placeholder="Enter card text"></textarea>
        <div class="char-counter">0/100</div>
        <button class="add-btn">Add</button>
        <button class="cancel-btn">Cancel</button>
      </div>
      <button class="add-card-btn">Add Card</button>
    </div>
    <div id="inprogress-column" class="column">
      <h2>In Progress</h2>
      <div id="inprogress-cards"></div>
      <div class="add-card-input" style="display: none;">
        <textarea class="new-card-text" placeholder="Enter card text"></textarea>
        <div class="char-counter">0/100</div>
        <button class="add-btn">Add</button>
        <button class="cancel-btn">Cancel</button>
      </div>
      <button class="add-card-btn">Add Card</button>
    </div>
    <div id="done-column" class="column">
      <h2>Done</h2>
      <div id="done-cards"></div>
      <div class="add-card-input" style="display: none;">
        <textarea class="new-card-text" placeholder="Enter card text"></textarea>
        <div class="char-counter">0/100</div>
        <button class="add-btn">Add</button>
        <button class="cancel-btn">Cancel</button>
      </div>
      <button class="add-card-btn">Add Card</button>
    </div>
  `;

  require('../app.js');
}
