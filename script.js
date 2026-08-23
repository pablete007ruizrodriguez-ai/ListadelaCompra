const BIN_ID = '6a8a35b3da38895dfe054758';
const MASTER_KEY = '$2a$10$bfoIuap49SbeuQPD8OeM2uhbtgLp4UeJlxu6l86raKDguIbyLgwxq';

const API_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const productInput = document.getElementById('productInput');
const supermarketSelect = document.getElementById('supermarketSelect');
const locationSelect = document.getElementById('locationSelect');
const addBtn = document.getElementById('addBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const shoppingList = document.getElementById('shoppingList');
const errorMessage = document.getElementById('errorMessage');

let currentItems = [];
let isSaving = false; // Bloquea la lectura mientras se guardan cambios

// Consulta la nube cada 3 segundos solo si no estamos guardando
fetchItems();
setInterval(() => {
  if (!isSaving) {
    fetchItems();
  }
}, 3000);

addBtn.addEventListener('click', addItem);
clearAllBtn.addEventListener('click', clearAllItems);

async function fetchItems() {
  try {
    const res = await fetch(`${API_URL}/latest`, {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    if (res.ok) {
      const data = await res.json();
      
      // Maneja tanto un array directo como un objeto con propiedad items
      if (data.record && Array.isArray(data.record.items)) {
        currentItems = data.record.items;
      } else if (Array.isArray(data.record)) {
        currentItems = data.record;
      } else {
        currentItems = [];
      }
      
      renderUI();
    }
  } catch (err) {
    console.error("Error al obtener datos:", err);
  }
}

function renderUI() {
  shoppingList.innerHTML = '';
  currentItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = `product-item ${item.completed ? 'completed' : ''}`;

    li.innerHTML = `
      <div>
        <span class="title">${item.text}</span>
        <div class="meta">${item.superVal} • ${item.locVal}</div>
      </div>
      <div class="actions">
        <button onclick="toggleItem(${index})">✓</button>
        <button onclick="deleteItem(${index})">✕</button>
      </div>
    `;

    shoppingList.appendChild(li);
  });
}

async function addItem() {
  const text = productInput.value.trim();
  const superVal = supermarketSelect.value;
  const locVal = locationSelect.value;

  if (!text || !superVal || !locVal) {
    errorMessage.innerText = "⚠️ Debes escribir un producto, elegir súper y ubicación.";
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";
  currentItems.push({ text, superVal, locVal, completed: false });

  productInput.value = '';
  supermarketSelect.selectedIndex = 0;
  locationSelect.selectedIndex = 0;

  renderUI();
  await saveToCloud();
}

async function toggleItem(index) {
  currentItems[index].completed = !currentItems[index].completed;
  renderUI();
  await saveToCloud();
}

async function deleteItem(index) {
  currentItems.splice(index, 1);
  renderUI();
  await saveToCloud();
}

async function clearAllItems() {
  currentItems = [];
  renderUI();
  await saveToCloud();
}

async function saveToCloud() {
  isSaving = true; // Activa el bloqueo
  try {
    await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      },
      body: JSON.stringify({ items: currentItems }) // Guarda estructurado
    });
  } catch (err) {
    console.error("Error al guardar:", err);
  } finally {
    // Mantiene el bloqueo 2.5 segundos extra para que la nube actualice completamente
    setTimeout(() => {
      isSaving = false;
    }, 2500);
  }
}