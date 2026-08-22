const RAW_URL = 'https://raw.githubusercontent.com/pablete007ruizrodriguez-ai/ListadelaCompra/main/datos.json';

const productInput = document.getElementById('productInput');
const supermarketSelect = document.getElementById('supermarketSelect');
const locationSelect = document.getElementById('locationSelect');
const addBtn = document.getElementById('addBtn');
const shoppingList = document.getElementById('shoppingList');
const errorMessage = document.getElementById('errorMessage');

let currentItems = [];

// Cargar la lista al abrir y reconsultar cada 5 segundos
loadFromGitHub();
setInterval(loadFromGitHub, 5000);

addBtn.addEventListener('click', addItem);

async function loadFromGitHub() {
  try {
    const res = await fetch(`${RAW_URL}?nocache=${Date.now()}`);
    if (res.ok) {
      currentItems = await res.json();
      localStorage.setItem('local_list', JSON.stringify(currentItems));
      renderUI();
    } else {
      loadFromLocal();
    }
  } catch (e) {
    loadFromLocal();
  }
}

function loadFromLocal() {
  const saved = localStorage.getItem('local_list');
  currentItems = saved ? JSON.parse(saved) : [];
  renderUI();
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

function addItem() {
  const text = productInput.value.trim();
  const superVal = supermarketSelect.value;
  const locVal = locationSelect.value;

  // Bloquea el envío si falta el súper o la ubicación
  if (!text || !superVal || !locVal) {
    errorMessage.innerText = "⚠️ Elige producto, súper y ubicación.";
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";

  currentItems.push({ text, superVal, locVal, completed: false });

  productInput.value = '';
  supermarketSelect.selectedIndex = 0;
  locationSelect.selectedIndex = 0;

  saveState();
}

function toggleItem(index) {
  currentItems[index].completed = !currentItems[index].completed;
  saveState();
}

function deleteItem(index) {
  currentItems.splice(index, 1);
  saveState();
}

function saveState() {
  localStorage.setItem('local_list', JSON.stringify(currentItems));
  renderUI();
  
  // Descarga automática del archivo actualizado para GitHub
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentItems, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", "datos.json");
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}