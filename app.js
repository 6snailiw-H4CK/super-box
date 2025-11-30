/* ==================================================
   1. IMPORTAÇÕES E CONEXÃO COM FIREBASE
   ================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// CHAVES FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyAxL9yhawQSLbPgoVZvIPUd133t7hUK1JI",
  authDomain: "thebox-79c28.firebaseapp.com",
  projectId: "thebox-79c28",
  storageBucket: "thebox-79c28.firebasestorage.app",
  messagingSenderId: "608438131326",
  appId: "1:608438131326:web:b30c919edd69915fa5562f",
  measurementId: "G-74YEW9PX52"
};

// INICIALIZA FIREBASE
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("🔥 Firebase conectado no app.js!");


/* ==================================================
   2. CONFIGURAÇÕES GERAIS
   ================================================== */
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx6IZIo7LJOSNYF8FcIz1cZ1cNeGOijH57Of2_MW6REH-BNIp7r9MigIce7bF3q5rdU/exec';
const DEFAULT_CATS = ['Combustível','Peças','Serviços','Marketing','Outros'];
const ADMIN_USER = { email: 'admin', pass: '1570', name: 'Master' };
const DEMO_LIMIT = 10;

// Estado Global
let currentUser = null;
window.state = { tx: [], categories: [], recurring: [], licenseKey: null }; 

// Prefixo para backup local por usuário
const LOCAL_PREFIX = 'thebox_user_';

/**
 * Gera a chave de localStorage específica por usuário
 * Ex.: "thebox_user_email_gmail_com"
 */
function getLocalKeyForUser(email) {
  const safe = (email || 'anon').toLowerCase().replace(/[^a-z0-9]/gi, '_');
  return `${LOCAL_PREFIX}${safe}`;
}


/* ==================================================
   3. FUNÇÕES DE BANCO DE DADOS (NUVEM + BACKUP LOCAL)
   ================================================== */

/**
 * Salva estado do usuário:
 * 1) Firestore (nuvem)
 * 2) Backup local (por usuário)
 */
async function saveState() {
  if (!currentUser || !currentUser.email) return;

  const docId = currentUser.email.toLowerCase();
  const localKey = getLocalKeyForUser(docId);

  // 1) Tenta salvar no Firestore
  try {
    await setDoc(doc(db, "usuarios", docId), window.state);
  } catch (e) {
    console.error("Erro ao salvar no Firestore:", e);
    if (window.showToast) window.showToast("Erro ao salvar na nuvem. Usando backup local.");
  }

  // 2) Sempre salva backup local
  try {
    localStorage.setItem(localKey, JSON.stringify(window.state));
  } catch (e) {
    console.error("Erro ao salvar backup local:", e);
  }
}
// expõe pro ai-assistant.js
window.saveState = saveState;

/**
 * Carrega estado do usuário:
 * 1) Tenta Firestore
 * 2) Se falhar, tenta backup local por usuário
 */
async function loadState() {
  if (!currentUser || !currentUser.email) return;

  const docId = currentUser.email.toLowerCase();
  const localKey = getLocalKeyForUser(docId);

  // garante estrutura mínima
  const normalizeState = () => {
    if (!window.state) window.state = {};
    if (!Array.isArray(window.state.tx)) window.state.tx = [];
    if (!Array.isArray(window.state.categories)) window.state.categories = [...DEFAULT_CATS];
    if (!Array.isArray(window.state.recurring)) window.state.recurring = [];
    if (typeof window.state.licenseKey === 'undefined') window.state.licenseKey = null;
  };

  try {
    // 1) tenta Firestore
    const docSnap = await getDoc(doc(db, "usuarios", docId));

    if (docSnap.exists()) {
      window.state = docSnap.data();
      console.log("☁️ Carregado da nuvem.");
    } else {
      // primeiro acesso => estado inicial
      window.state = { tx: [], categories: [...DEFAULT_CATS], recurring: [], licenseKey: null };
      await saveState();
    }

    normalizeState();
    window.updateUI();
    window.checkLicense();

  } catch (e) {
    console.error("Erro ao carregar do Firestore:", e);

    // 2) backup local
    try {
      const localRaw = localStorage.getItem(localKey);
      if (localRaw) {
        window.state = JSON.parse(localRaw);
        normalizeState();
        window.updateUI();
        window.checkLicense();
        if (window.showAlert) window.showAlert("Sem conexão com a nuvem. Usando dados locais.");
      } else {
        // nada na nuvem e nada local
        window.state = { tx: [], categories: [...DEFAULT_CATS], recurring: [], licenseKey: null };
        normalizeState();
        window.updateUI();
        window.checkLicense();
        if (window.showAlert) window.showAlert("Erro ao conectar e nenhum backup local encontrado.");
      }
    } catch (err2) {
      console.error("Erro ao carregar backup local:", err2);
      if (window.showAlert) window.showAlert("Falha geral ao carregar dados.");
    }
  }
}
// expõe pro ai-assistant.js se precisar
window.loadState = loadState;


/* ==================================================
   4. UI HELPERS E MODAIS
   ================================================== */
window.showToast = function(msg) {
  const x = document.getElementById("toast");
  if (x) {
    x.textContent = msg; 
    x.className = "show";
    setTimeout(() => x.className = x.className.replace("show", ""), 3000);
  }
};

window.showConfirm = function(msg, onConfirm) {
  const modalMsg = document.getElementById('modal-msg');
  const modal = document.getElementById('custom-modal');
  
  if (modalMsg && modal) {
    modalMsg.textContent = msg;
    modal.style.display = 'flex';
    const btn = document.getElementById('modal-confirm-btn');
    const newBtn = btn.cloneNode(true);
    newBtn.textContent = "Confirmar";
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      document.getElementById('custom-modal').style.display = 'none';
      if (onConfirm) onConfirm();
    });
  } else {
    // Fallback nativo
    if (confirm(msg)) onConfirm && onConfirm();
  }
};

window.showAlert = function(msg) {
  const modalMsg = document.getElementById('modal-msg');
  const modal = document.getElementById('custom-modal');
  
  if (modalMsg && modal) {
    modalMsg.textContent = msg;
    modal.style.display = 'flex';
    const btn = document.getElementById('modal-confirm-btn');
    const newBtn = btn.cloneNode(true);
    newBtn.textContent = "OK";
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', () => {
      document.getElementById('custom-modal').style.display = 'none';
    });
  } else {
    alert(msg);
  }
};

window.closeModal = function() { 
  const m = document.getElementById('custom-modal');
  if (m) m.style.display = 'none'; 
};

/**
 * Envio opcional para Google Sheets (sem senha)
 */
function syncToGoogle(payload) {
  if (!GOOGLE_SHEETS_URL || GOOGLE_SHEETS_URL.includes('COLE_SUA')) return;
  fetch(GOOGLE_SHEETS_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(err => console.error(err));
}
// expõe pro ai-assistant.js
window.syncToGoogle = syncToGoogle;


/* ==================================================
   5. AUTENTICAÇÃO E REGISTRO
   ================================================== */
window.toggleAuth = function(view) {
  const loginView = document.getElementById('login-view');
  const regView = document.getElementById('register-view');
  if (loginView) loginView.style.display = view === 'login' ? 'block' : 'none';
  if (regView) regView.style.display = view === 'register' ? 'block' : 'none';
};

window.doLogin = async function() {
  const uInput = document.getElementById('loginUser');
  const pInput = document.getElementById('loginPass');
  
  if (!uInput || !pInput) return;

  const u = uInput.value.trim();
  const p = pInput.value.trim();
  const btn = document.querySelector('#login-view button');

  if (!u || !p) return window.showAlert("Preencha email e senha.");

  if (btn) { btn.textContent = "Verificando..."; btn.disabled = true; }

  // 1. Login Admin
  if (u === ADMIN_USER.email && p === ADMIN_USER.pass) { 
    await setUser(ADMIN_USER); 
    if (btn) { btn.textContent = "Entrar"; btn.disabled = false; }
    return; 
  }
  
  const localUsers = JSON.parse(localStorage.getItem('boxmotors_users_db') || '[]');
  const found = localUsers.find(user => user.email === u && user.pass === p);
  
  if (found) {
    await setUser(found);
  } else {
    const errDiv = document.getElementById('loginError');
    if (errDiv) errDiv.style.display = 'block';
    if (btn) { btn.textContent = "Entrar"; btn.disabled = false; }
  }
};

async function setUser(user) {
  currentUser = user;
  window.currentUser = user; // deixa visível pro ai-assistant.js
  sessionStorage.setItem('boxmotors_logged_user', JSON.stringify(user));
  
  const authContainer = document.getElementById('auth-container');
  const appContent = document.getElementById('app-content');
  const userDisplay = document.getElementById('currentUserDisplay');

  if (authContainer) authContainer.style.display = 'none';
  if (appContent) appContent.style.display = 'block';
  if (userDisplay) userDisplay.textContent = `Logado: ${user.name || user.email}`;
  
  window.showToast("Conectando à nuvem...");
  await loadState(); 
  initApp();
}

window.doLogout = function() {
  sessionStorage.removeItem('boxmotors_logged_user');
  currentUser = null;
  window.currentUser = null;
  window.state = { tx:[], categories:[], recurring:[], licenseKey: null };
  location.reload();
};

window.doRegister = function() {
  const nameEl = document.getElementById('regName');
  const emailEl = document.getElementById('regEmail');
  const phoneEl = document.getElementById('regPhone');
  const passEl = document.getElementById('regPass');

  if (!nameEl || !emailEl || !phoneEl || !passEl) return;

  const name = nameEl.value.trim();
  const email = emailEl.value.trim();
  const phone = phoneEl.value.trim();
  const pass = passEl.value.trim();
  
  if (!name || !email || !phone || !pass) return window.showAlert('Preencha todos os campos.');

  const localUsers = JSON.parse(localStorage.getItem('boxmotors_users_db') || '[]');
  if (localUsers.find(u => u.email === email)) { 
    window.showAlert('Usuário já existe.'); 
    return; 
  }
  
  localUsers.push({ name, email, phone, pass });
  localStorage.setItem('boxmotors_users_db', JSON.stringify(localUsers));
  
  syncToGoogle({ action: 'register', nome: name, email: email, telefone: phone, senha: pass });
  
  window.showAlert("Conta criada! Faça login.");
  window.toggleAuth('login');
};

window.resetSystemUsers = function() {
  const password = prompt("Digite a senha do Admin:");
  if (password === "1570") {
    window.showConfirm("Isso limpará os logins DESTE COMPUTADOR. Continuar?", () => {
      localStorage.removeItem('boxmotors_users_db');
      window.showAlert("Limpeza concluída.");
      location.reload();
    });
  }
};


/* ==================================================
   6. LÓGICA DO APP (TRANSAÇÕES)
   ================================================== */
function initApp() {
  const dateInput = document.getElementById('data');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0,10);
  window.updateUI();
}

// Função global para IA e UI
window.updateUI = function() {
  if (!window.state) return;
  renderTxList(); 
  renderChart(); 
  updateTotals();
  
  const catSelect = document.getElementById('categoria');
  const filtroCat = document.getElementById('filtroCategoria');
  if (window.state.categories) {
    const opts = window.state.categories.map(c => `<option value="${c}">${c}</option>`).join('');
    if (catSelect) catSelect.innerHTML = opts;
    if (filtroCat) filtroCat.innerHTML = '<option value="">Todas categorias</option>' + opts;
  }
};

window.uid = function() { 
  return Date.now().toString(36) + Math.random().toString(36).substr(2); 
};

function fmt(n) { 
  return 'R$ ' + Number(n).toFixed(2).replace('.',','); 
}

/**
 * Salvar/atualizar transação
 * Chamado tanto pelo botão quanto pela IA (via executeAIAction)
 */
window.saveTx = async function(id) {
  const tipoEl = document.getElementById('tipo');
  const catEl  = document.getElementById('categoria');
  const descEl = document.getElementById('descricao');
  const valEl  = document.getElementById('valor');
  const dtEl   = document.getElementById('data');

  if (!tipoEl || !catEl || !descEl || !valEl || !dtEl) {
    return window.showAlert('Campos de transação não encontrados.');
  }

  const tipo = tipoEl.value;
  const cat  = catEl.value;
  const desc = descEl.value.trim();
  const val  = Number(valEl.value);
  const dt   = dtEl.value;

  if (!val || val <= 0) {
    return window.showAlert('Valor inválido');
  }

  const txId  = id || window.uid();
  const txObj = { 
    id: txId,
    tipo,
    categoria: cat,
    descricao: desc,
    valor: val,
    data: dt 
  };

  const idx = window.state.tx.findIndex(t => t.id === txId);
  if (idx >= 0) {
    window.state.tx[idx] = txObj;
  } else {
    window.state.tx.push(txObj);
  }

  window.cancelEdit();
  window.updateUI();

  await saveState();
  window.showToast("Salvo!");

  // Envio opcional ao Google Sheets
  syncToGoogle({
    action: 'transaction',
    userEmail: (window.currentUser && window.currentUser.email) || '',
    ...txObj
  });
};

window.editTx = function(id) {
  const t = window.state.tx.find(x => x.id === id);
  if (!t) return;
  document.getElementById('tipo').value = t.tipo;
  document.getElementById('categoria').value = t.categoria;
  document.getElementById('descricao').value = t.descricao;
  document.getElementById('valor').value = t.valor;
  document.getElementById('data').value = t.data;
  document.getElementById('editingId').value = id;
  document.getElementById('addTx').style.display='none';
  document.getElementById('updateTx').style.display='inline-block';
  document.getElementById('cancelEdit').style.display='inline-block';
};

window.deleteTx = function(id) {
  window.showConfirm('Apagar esta transação?', async () => {
    window.state.tx = window.state.tx.filter(t => t.id !== id);
    if (document.getElementById('editingId').value === id) window.cancelEdit();
    window.updateUI();
    await saveState();
    window.showToast("Apagado!");
  });
};

window.cancelEdit = function() {
  document.getElementById('descricao').value = '';
  document.getElementById('valor').value = '';
  document.getElementById('editingId').value = '';
  document.getElementById('addTx').style.display='inline-block';
  document.getElementById('updateTx').style.display='none';
  document.getElementById('cancelEdit').style.display='none';
};

function renderTxList() {
  const el = document.getElementById('tx-list'); 
  if (!el) return;
  el.innerHTML = '';
  
  const fCatEl = document.getElementById('filtroCategoria');
  const fDatEl = document.getElementById('filtroData');
  const fCat = fCatEl ? fCatEl.value : '';
  const fDat = fDatEl ? fDatEl.value : '';
  
  if (!window.state.tx) return;

  const list = window.state.tx
    .filter(t => {
      if (fCat && t.categoria !== fCat) return false;
      if (fDat && t.data !== fDat) return false;
      return true;
    })
    .sort((a,b) => b.data.localeCompare(a.data));

  list.forEach(t => {
    el.innerHTML += `
      <div class="tx">
        <div class="meta">
          <div>
            <div style="font-weight:600">${t.descricao}</div>
            <div class="small">${t.categoria} - ${t.data}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="amount ${t.tipo}">${t.tipo==='income'?'+':'-'} ${fmt(t.valor)}</div>
          <div style="margin-top:4px">
             <button class="ghost" style="font-size:10px;padding:4px" onclick="editTx('${t.id}')">Edit</button>
             <button class="ghost" style="font-size:10px;padding:4px" onclick="deleteTx('${t.id}')">Del</button>
          </div>
        </div>
      </div>`;
  });
}

function updateTotals() {
  if (!window.state.tx) return;
  const inc = window.state.tx.filter(t=>t.tipo==='income').reduce((a,b)=>a+b.valor,0);
  const exp = window.state.tx.filter(t=>t.tipo==='expense').reduce((a,b)=>a+b.valor,0);
  
  const salEl = document.getElementById('saldo');
  const recEl = document.getElementById('receitas');
  const desEl = document.getElementById('despesas');

  if (salEl) salEl.textContent = fmt(inc - exp);
  if (recEl) recEl.textContent = fmt(inc);
  if (desEl) desEl.textContent = fmt(exp);
}

// Listeners (com verificação de existência)
const btnAdd = document.getElementById('addTx');
if (btnAdd) btnAdd.addEventListener('click', () => { 
  if (!window.canAdd()) return; 
  window.saveTx(); 
});

const btnUpd = document.getElementById('updateTx');
if (btnUpd) btnUpd.addEventListener('click', () => { 
  window.saveTx(document.getElementById('editingId').value); 
});

const btnFilter = document.getElementById('aplicarFiltro');
if (btnFilter) btnFilter.addEventListener('click', window.updateUI);

const btnClear = document.getElementById('limparFiltro');
if (btnClear) btnClear.addEventListener('click', () => { 
  document.getElementById('filtroCategoria').value=''; 
  document.getElementById('filtroData').value=''; 
  window.updateUI(); 
});

function renderChart() {
  const cv = document.getElementById('chart'); 
  if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0,0,cv.width,cv.height);
  if (!window.state.tx) return;
  
  const sums = {}; 
  window.state.tx
    .filter(t=>t.tipo==='expense')
    .forEach(t => sums[t.categoria] = (sums[t.categoria]||0) + t.valor);
  const data = Object.entries(sums).sort((a,b)=>b[1]-a[1]);
  
  if (!data.length) { 
    ctx.fillStyle='#555'; ctx.font='14px Arial'; ctx.fillText('Sem dados', 10,20); 
    return; 
  }
  
  let y=10; 
  const max = data[0][1] || 1;
  data.forEach(([k,v], i) => {
    const w = (v/max) * (cv.width - 120);
    ctx.fillStyle = `hsl(${i*50}, 70%, 50%)`; 
    ctx.fillRect(100, y, w, 20);
    ctx.fillStyle = '#fff'; 
    ctx.font='12px Arial'; 
    ctx.fillText(k, 10, y+14); 
    ctx.fillText(fmt(v), 100+w+5, y+14); 
    y += 30;
  });
}


/* ==================================================
   7. LICENÇA, BACKUP E RECORRENTES
   ================================================== */
window.isPro = function() { 
  return window.state && window.state.licenseKey === 'BOXPRO'; 
};

window.checkLicense = function() {
  const backupBtn = document.getElementById('backupBtn');
  const aiMic = document.getElementById('aiMic');
  const demoBadge = document.getElementById('demoBadge');
  const licenseRow = document.getElementById('licenseRow'); // CORRIGIDO (era licenseKey)
  const buyBtn = document.getElementById('buyBtn');
  const proMenu = document.getElementById('proMenu');
  const resetAllBtn = document.getElementById('resetAll');
  const commArea = document.getElementById('commercialArea');

  if (window.isPro()) {
    if (demoBadge) demoBadge.style.display='none'; 
    if (licenseRow) licenseRow.style.display='none';
    if (buyBtn) buyBtn.style.display='none'; 
    if (commArea) commArea.style.display='none';

    if (proMenu) proMenu.style.display='inline-flex'; 
    if (resetAllBtn) resetAllBtn.disabled = false;
    if (backupBtn) backupBtn.style.display = 'inline-block';
    if (aiMic) aiMic.style.display = 'flex';
  } else {
    if (demoBadge) demoBadge.style.display='inline-block'; 
    if (licenseRow) licenseRow.style.display='inline-flex';
    if (buyBtn) buyBtn.style.display='inline-block'; 
    if (commArea) commArea.style.display='flex';

    if (proMenu) proMenu.style.display='none'; 
    if (resetAllBtn) resetAllBtn.disabled = true;
    if (backupBtn) backupBtn.style.display = 'none';
    if (aiMic) aiMic.style.display = 'none';
  }
};

window.canAdd = function() {
  if (window.isPro()) return true;
  if (window.state.tx.length >= DEMO_LIMIT) { 
    window.showConfirm('Limite DEMO atingido. Comprar?', () => window.openLink()); 
    return false; 
  }
  return true;
};

window.activateLicense = async function() { 
  const inp = document.getElementById('licenseKey');
  const k = inp ? inp.value : '';
  if (k === 'BOXPRO') { 
    window.state.licenseKey = k; 
    await saveState(); 
    window.showAlert('Ativado!'); 
    // atualiza UI imediatamente
    window.updateUI();
    window.checkLicense();
  } else {
    window.showAlert('Chave inválida'); 
  }
};

window.revokeLicense = function() { 
  window.showConfirm("Desativar licença?", async () => { 
    window.state.licenseKey = null; 
    await saveState(); 
    window.checkLicense();
  }); 
};

window.openLink = function() { 
  window.open('https://linktr.ee/BoxMotors'); 
};

// Backup
window.toggleBackupMenu = function() {
  if (!window.isPro()) { 
    window.showAlert("Função PRO."); 
    return; 
  }
  const menu = document.getElementById('backupMenu');
  if (menu) menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
};

const expJson = document.getElementById('exportJson');
if (expJson) expJson.addEventListener('click', () => {
  if (!window.isPro()) return window.showAlert("Backup é função PRO.");
  const dataStr = JSON.stringify(window.state);
  downloadFile(dataStr, 'json', 'application/json');
});

const expCsv = document.getElementById('exportCsv');
if (expCsv) expCsv.addEventListener('click', () => {
  if (!window.isPro()) return window.showAlert("Exportar é função PRO.");
  if (!window.state.tx || window.state.tx.length === 0) return window.showAlert('Sem dados.');
  let csv = "\uFEFFID;Tipo;Categoria;Descrição;Valor;Data\n";
  window.state.tx.forEach(row => {
    let val = String(row.valor).replace('.', ',');
    let desc = (row.descricao||'').replace(/"/g, '""');
    csv += `${row.id};${row.tipo};${row.categoria};"${desc}";${val};${row.data}\n`;
  });
  downloadFile(csv, 'csv', 'text/csv;charset=utf-8;');
});

function downloadFile(content, ext, type) {
  const blob = new Blob([content], { type: type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); 
  a.href = url; 
  a.download = `backup_${new Date().toISOString().slice(0,10)}.${ext}`;
  document.body.appendChild(a); 
  a.click(); 
  document.body.removeChild(a);
}

// Restore
window.processRestore = function(input) {
  if (!window.isPro()) return input.value='', window.showAlert("Restauração é função PRO.");
  const file = input.files[0]; 
  if (!file) return;
  if (!file.name.endsWith('.json')) { 
    window.showAlert("ERRO: Selecione o arquivo .json"); 
    input.value=''; 
    return; 
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.tx)) {
        window.showConfirm("Isso irá SUBSTITUIR seus dados na nuvem. Continuar?", async () => {
          const lic = window.state.licenseKey; 
          window.state = data;
          if (lic === 'BOXPRO') window.state.licenseKey = 'BOXPRO';
          await saveState();
          window.showAlert("Restaurado!"); 
          location.reload();
        });
      } else window.showAlert("Arquivo inválido.");
    } catch(err) { 
      window.showAlert("Erro ao ler arquivo."); 
    }
  };
  reader.readAsText(file);
};

// Categorias
window.openCategories = function() { 
  document.querySelector('main').style.display='none'; 
  document.getElementById('cat-page').style.display='block'; 
  renderCatList(); 
};

window.addCat = async function() {
  const n = document.getElementById('newCatName').value.trim();
  if (n && !window.state.categories.includes(n)) { 
    window.state.categories.push(n); 
    document.getElementById('newCatName').value=''; 
    await saveState(); 
    renderCatList(); 
  }
};

function renderCatList() {
  const el = document.getElementById('cat-list'); 
  if (!el) return;
  el.innerHTML='';
  window.state.categories.forEach((c, i) => { 
    el.innerHTML += `<div class="tx">
      <span>${c}</span>
      <button class="ghost" onclick="delCat(${i})">X</button>
    </div>`; 
  });
}

window.delCat = function(i) { 
  window.showConfirm('Apagar?', async () => { 
    window.state.categories.splice(i,1); 
    await saveState(); 
    renderCatList(); 
  }); 
};

// Recorrentes
let recFocusDate = new Date();
function getMonthKey(d) { return d.getFullYear() + '-' + (d.getMonth()+1); }
function formatMonth(d) { const opts = { year:'numeric', month:'long' }; return d.toLocaleDateString('pt-BR', opts); }
function setRecMonth(d) { 
  recFocusDate = new Date(d.getFullYear(), d.getMonth(), 1); 
  document.getElementById('recMonthLabel').textContent = formatMonth(recFocusDate); 
  window.renderRecList(); 
}
window.prevRecMonth = function() { const d = new Date(recFocusDate); d.setMonth(d.getMonth() - 1); setRecMonth(d); };
window.nextRecMonth = function() { const d = new Date(recFocusDate); d.setMonth(d.getMonth() + 1); setRecMonth(d); };
window.openRecurring = function() { 
  document.querySelector('main').style.display='none'; 
  document.getElementById('rec-page').style.display='block'; 
  setRecMonth(recFocusDate || new Date()); 
};
window.closePages = function() { 
  document.getElementById('cat-page').style.display='none'; 
  document.getElementById('rec-page').style.display='none'; 
  document.querySelector('main').style.display='grid'; 
  window.updateUI(); 
};

window.saveRecurring = async function() {
  const id = document.getElementById('recEditId').value; 
  const desc = document.getElementById('recDesc').value; 
  const val = Number(document.getElementById('recValor').value); 
  const dia = document.getElementById('recDia').value;
  if (!desc || !val) return window.showAlert('Dados incompletos.');
  if (!window.state.recurring) window.state.recurring = [];
  const existing = id ? window.state.recurring.find(r => r.id === id) : null;
  const newItem = { 
    id: id || window.uid(), 
    desc, 
    valor: val, 
    dia, 
    history: (existing && existing.history) ? existing.history : {} 
  };
  if (id) { 
    const idx = window.state.recurring.findIndex(r => r.id === id); 
    if (idx>=0) window.state.recurring[idx] = newItem; 
  } else {
    window.state.recurring.push(newItem);
  }
  await saveState(); 
  window.resetRecForm(); 
  window.renderRecList(); 
  window.showToast("Salvo!");
};

window.editRec = function(id) { 
  const r = window.state.recurring.find(x => x.id === id); 
  if (!r) return; 
  document.getElementById('recDesc').value=r.desc; 
  document.getElementById('recValor').value=r.valor; 
  document.getElementById('recDia').value=r.dia; 
  document.getElementById('recEditId').value=id; 
  document.getElementById('recFormTitle').textContent = "Editando"; 
  document.getElementById('btnSaveRec').textContent = "Atualizar"; 
  document.getElementById('btnCancelRec').style.display = "inline-block"; 
};

window.deleteRec = function(id) { 
  window.showConfirm('Apagar?', async () => { 
    window.state.recurring = window.state.recurring.filter(r => r.id !== id); 
    await saveState(); 
    window.renderRecList(); 
  }); 
};

window.markRecPaid = async function(id) {
  const r = window.state.recurring.find(x => x.id === id); 
  if (!r) return;
  if (!r.history) r.history={}; 
  const k=getMonthKey(recFocusDate); 
  r.history[k]=(r.history[k]==='pago')?'pendente':'pago'; 
  await saveState(); 
  window.renderRecList();
};

window.resetRecForm = function() { 
  document.getElementById('recDesc').value=''; 
  document.getElementById('recValor').value=''; 
  document.getElementById('recDia').value=''; 
  document.getElementById('recEditId').value=''; 
  document.getElementById('recFormTitle').textContent = "Nova Recorrente"; 
  document.getElementById('btnSaveRec').textContent = "Salvar Regra"; 
  document.getElementById('btnCancelRec').style.display="none"; 
};

window.renderRecList = function() {
  const el = document.getElementById('rec-list'); 
  if (!el) return; 
  el.innerHTML = '';
  const k = getMonthKey(recFocusDate);
  if (window.state.recurring && window.state.recurring.length > 0) {
    window.state.recurring.forEach(r => {
      const st = (r.history && r.history[k]) ? r.history[k] : 'pendente';
      el.innerHTML += `
        <div class="rec-item">
          <div class="meta">
            <div>
              <div style="font-weight:600">${r.desc}</div>
              <div class="small">Dia ${r.dia} <span class="tag ${st}">${st}</span></div>
            </div>
            <div style="display:flex;gap:5px">
              <button class="ghost" onclick="markRecPaid('${r.id}')">👍</button>
              <button class="ghost" onclick="editRec('${r.id}')">✏️</button>
              <button class="ghost" onclick="deleteRec('${r.id}')">🗑️</button>
            </div>
          </div>
        </div>`;
    });
  } else {
    el.innerHTML = '<div class="small" style="text-align:center;padding:10px">Vazio.</div>';
  }
  
  // Totais recorrentes
  let t=0, p=0, pn=0;
  window.state.recurring.forEach(r => {
    const st = (r.history && r.history[k]) ? r.history[k] : 'pendente';
    t += r.valor;
    if (st==='pago') p += r.valor; else pn += r.valor;
  });
  const recTotal = document.getElementById('recTotal'); if (recTotal) recTotal.textContent = fmt(t);
  const recPaid = document.getElementById('recPaid'); if (recPaid) recPaid.textContent = fmt(p);
  const recPending = document.getElementById('recPending'); if (recPending) recPending.textContent = fmt(pn);
};

const resetBtn = document.getElementById('resetAll');
if (resetBtn) resetBtn.addEventListener('click', () => { 
  if (!window.isPro()) return window.showAlert('Função PRO.'); 
  window.showConfirm('TEM CERTEZA? Apagará tudo da nuvem.', async () => { 
    window.state = { 
      tx:[], 
      categories:[...DEFAULT_CATS], 
      recurring:[], 
      licenseKey: window.state.licenseKey 
    }; 
    await saveState(); 
    location.reload(); 
  }); 
});


/* ==================================================
   8. TEMA
   ================================================== */
function applyTheme() { 
  const t = localStorage.getItem('boxmotors_theme'); 
  if (t === 'light') document.body.setAttribute('data-theme', 'light'); 
  else document.body.removeAttribute('data-theme'); 
}

window.toggleTheme = function() { 
  const c = localStorage.getItem('boxmotors_theme'); 
  localStorage.setItem('boxmotors_theme', c === 'light' ? 'dark' : 'light'); 
  applyTheme(); 
};


/* ==================================================
   9. INICIALIZAÇÃO
   ================================================== */
// IIFE para restaurar sessão
;(function() { 
  applyTheme();
  const s = sessionStorage.getItem('boxmotors_logged_user'); 
  if (s) setUser(JSON.parse(s)); 
})();
