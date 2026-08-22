const GITHUB_USER = 'pablete007ruizrodriguez-ai';
const GITHUB_REPO = 'ListadelaCompra';
const GITHUB_TOKEN = 'PEGA_AQUI_TU_TOKEN_DE_GITHUB';
const FILE_PATH = 'datos.json';

const API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

const userInput = document.getElementById('userInput');
const productInput = document.getElementById('productInput');
const supermarketSelect = document.getElementById('supermarketSelect');
const locationSelect = document.getElementById('locationSelect');
const addBtn = document.getElementById('addBtn');
const shoppingList = document.getElementById('shoppingList');
const errorMessage = document.getElementById('errorMessage');

let currentItems = [];
let fileSHA = '';

// Cargar usuario local guardado
userInput.value = localStorage.getItem('lastUser') || '';

// Cargar datos al entrar y consultar cambios cada 5 segundos
fetchItems();
setInterval(fetchItems, 5000);

addBtn.addEventListener('click', addItem);

async function fetchItems() {
  try {
    const res = await fetch(API_URL + `?t=${Date.now()}`, {
      headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
    });
    
    if (res.ok) {
      const data = await res.json();
      fileSHA = data.sha;
      const content = decodeURIComponent(escape(atob(data.content)));
      currentItems = JSON.parse(content);
      renderUI();
    } else if (res.status === 404) {
      currentItems = [];
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

async function addItem() {
  const author = userInput.value.trim();
  const text = productInput.value.trim();
  const superVal = supermarketSelect.value;
  const locVal = locationSelect.value;

  // Validación estricta de campos obligatorios
  if (!author || !text || !superVal || !locVal) {
    errorMessage.innerText = "⚠️ Rellena tu nombre, producto, super y ubicación.";
    errorMessage.style.display = "block";
    return;
  }

  errorMessage.style.display = "none";
  localStorage.setItem('lastUser', author);

  const newItem = { author, text, superVal, locVal, completed: false };
  currentItems.push(newItem);

  productInput.value = '';
  supermarketSelect.selectedIndex = 0;
  locationSelect.selectedIndex = 0;

  renderUI();
  await saveToGitHub("Añadido producto por " + author);
}

async function toggleItem(index) {
  currentItems[index].completed = !currentItems[index].completed;
  renderUI();
  await saveToGitHub("Estado cambiado");
}

async function deleteItem(index) {
  currentItems.splice(index, 1);
  renderUI();
  await saveToGitHub("Producto borrado");
}

async function saveToGitHub(commitMessage) {
  const contentEncoded = btoa(unescape(encodeURIComponent(JSON.stringify(currentItems, null, 2))));

  const bodyData = {
    message: commitMessage,
    content: contentEncoded,
    branch: 'main'
  };

  if (fileSHA) {
    bodyData.sha = fileSHA;
  }

  const res = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bodyData)
  });

  if (res.ok) {
    const responseData = await res.json();
    fileSHA = responseData.content.sha;
  }
}