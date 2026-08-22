document.addEventListener('DOMContentLoaded', () => {
  const productInput = document.getElementById('productInput');
  const supermarketSelect = document.getElementById('supermarketSelect');
  const locationSelect = document.getElementById('locationSelect');
  const addBtn = document.getElementById('addBtn');
  const shoppingList = document.getElementById('shoppingList');
  const clearAllBtn = document.getElementById('clearAllBtn');

  loadItems();

  addBtn.addEventListener('click', addItem);
  productInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addItem();
  });

  function addItem() {
    const text = productInput.value.trim();
    if (text === '') return;

    const superVal = supermarketSelect.value;
    const locVal = locationSelect.value;

    createListItem(text, superVal, locVal, false);
    saveItems();

    productInput.value = '';
    supermarketSelect.selectedIndex = 0;
    locationSelect.selectedIndex = 0;
    productInput.focus();
  }

  function createListItem(text, superVal, locVal, completed) {
    const li = document.createElement('li');
    if (completed) li.classList.add('completed');

    let tagsText = [superVal, locVal].filter(Boolean).join(' • ');
    
    li.innerHTML = `
      <div class="item-text">
        <strong>${text}</strong>
        ${tagsText ? `<span class="tags">${tagsText}</span>` : ''}
      </div>
      <div class="actions">
        <button class="check-btn" title="Tachar">✓</button>
        <button class="delete-btn" title="Borrar">✕</button>
      </div>
    `;

    li.querySelector('.check-btn').addEventListener('click', () => {
      li.classList.toggle('completed');
      saveItems();
    });

    li.querySelector('.delete-btn').addEventListener('click', () => {
      li.remove();
      saveItems();
    });

    shoppingList.appendChild(li);
  }

  clearAllBtn.addEventListener('click', () => {
    shoppingList.innerHTML = '';
    localStorage.removeItem('shoppingList');
  });

  function saveItems() {
    const items = [];
    shoppingList.querySelectorAll('li').forEach(li => {
      const text = li.querySelector('strong').innerText;
      const tagsSpan = li.querySelector('.tags');
      let superVal = '', locVal = '';
      
      if (tagsSpan) {
        const parts = tagsSpan.innerText.split(' • ');
        if (parts.length === 2) {
          superVal = parts[0];
          locVal = parts[1];
        } else if (parts.length === 1) {
          if (['Mercadona', 'Eroski', 'BM'].includes(parts[0])) superVal = parts[0];
          else locVal = parts[0];
        }
      }

      items.push({
        text,
        superVal,
        locVal,
        completed: li.classList.contains('completed')
      });
    });
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }

  function loadItems() {
    const saved = localStorage.getItem('shoppingList');
    if (!saved) return;
    const items = JSON.parse(saved);
    items.forEach(item => {
      createListItem(item.text, item.superVal, item.locVal, item.completed);
    });
  }
});