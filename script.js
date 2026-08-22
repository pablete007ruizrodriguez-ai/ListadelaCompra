const userInput = document.getElementById('userInput');
const productInput = document.getElementById('productInput');
const supermarketSelect = document.getElementById('supermarketSelect');
const locationSelect = document.getElementById('locationSelect');
const addBtn = document.getElementById('addBtn');
const shoppingList = document.getElementById('shoppingList');
const errorMessage = document.getElementById('errorMessage');

// Cargar usuario local
userInput.value = localStorage.getItem('lastUser') || '';

// Cargar la lista al iniciar
loadItems();

addBtn.addEventListener('click', addItem);

function addItem() {
  const author = userInput.value.trim();
  const text = productInput.value.trim();
  const superVal = supermarketSelect.value;
  const locVal = locationSelect.value;

  // Validación obligatoria
  if (!author || !text || !superVal || !locVal) {
    errorMessage.innerText = "⚠️ Debes rellenar tu nombre, producto, super y ubicación.";
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";
  localStorage.setItem('lastUser', author);

  const items = getStoredItems();
  items.push({ author, text, superVal, locVal, completed: false });
  
  saveItems(items);
  renderUI(items);

  productInput.value = '';
  supermarketSelect.selectedIndex = 0;
  locationSelect.selectedIndex = 0;
}

function renderUI(items) {
  shoppingList.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = `product-item ${item.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div>
        <span class="title">${item.text}</span>
        <div class="meta">
          Añadido por <span class="author">${item.author}</span> • ${item.superVal} (${item.locVal})
        </div>
      </div>
      <div class="actions">
        <button onclick="toggleItem(${index})">✓</button>
        <button onclick="deleteItem(${index})">✕</button>
      </div>
    `;

    shoppingList.appendChild(li);
  });
}

function toggleItem(index) {
  const items = getStoredItems();
  items[index].completed = !items[index].completed;
  saveItems(items);
  renderUI(items);
}

function deleteItem(index) {
  const items = getStoredItems();
  items.splice(index, 1);
  saveItems(items);
  renderUI(items);
}

function getStoredItems() {
  const saved = localStorage.getItem('lista_compra_shared');
  return saved ? JSON.parse(saved) : [];
}

function saveItems(items) {
  localStorage.setItem('lista_compra_shared', JSON.stringify(items));
}

function loadItems() {
  renderUI(getStoredItems());
}