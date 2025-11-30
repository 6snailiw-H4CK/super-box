/* =========================================
   CLIENTE DE IA (FRONTEND) - VIA RENDER
   ========================================= */

// ⚠️ IMPORTANTE: Substitua o link abaixo pela URL que o Render.com gerou para você.
// Exemplo: 'https://thebox-backend-xyz.onrender.com/api/ai/assistant'
const BACKEND_URL = 'https://thebox-api.onrender.com'; 

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// Configuração do microfone
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = false;
} else {
  console.warn("Navegador sem suporte a voz.");
  // Tenta esconder o botão se ele já existir na tela
  const checkBtn = setInterval(() => {
      const btn = document.getElementById('aiMic');
      if(btn) { btn.style.display = 'none'; clearInterval(checkBtn); }
  }, 500);
}

// Torna a função global para o botão HTML poder chamar
window.toggleVoiceAssistant = function() {
  // Verifica se é PRO (função global do app.js)
  if (typeof window.isPro === 'function' && !window.isPro()) {
      if(typeof window.showAlert === 'function') window.showAlert("IA exclusiva da versão PRO.");
      else alert("Funcionalidade exclusiva PRO.");
      return;
  }

  if (!recognition) return alert("Use Chrome ou Edge para voz.");
  
  const btn = document.getElementById('aiMic');
  if(!btn) return;

  if (btn.classList.contains('listening')) {
    recognition.stop();
    btn.classList.remove('listening');
    btn.innerHTML = "🎙️";
  } else {
    recognition.start();
    btn.classList.add('listening');
    btn.innerHTML = "👂"; // Ícone ouvindo
    if(typeof window.showToast === 'function') window.showToast("Ouvindo...");
  }

  recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    btn.classList.remove('listening');
    btn.innerHTML = "⏳"; // Ícone processando
    
    console.log("🎤 Texto:", transcript);
    if(typeof window.showToast === 'function') window.showToast("Processando...");
    
    await sendToBackend(transcript);
    
    btn.innerHTML = "🎙️";
  };

  recognition.onerror = (e) => {
    btn.classList.remove('listening');
    btn.innerHTML = "🎙️";
    console.error("Erro voz:", e);
    if(typeof window.showToast === 'function') window.showToast("Erro ao ouvir.");
  };
}

async function sendToBackend(userText) {
  try {
    // Pega categorias do estado global
    let catsList = "Geral";
    if (typeof window.state !== 'undefined' && window.state.categories) {
        catsList = window.state.categories.join(', ');
    }

    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userText,
        categories: catsList
      })
    });

    if (!response.ok) {
        throw new Error(`Erro servidor: ${response.status}`);
    }

    const cmd = await response.json();
    console.log("🤖 Resposta IA:", cmd);
    
    executeAIAction(cmd);

  } catch (error) {
    console.error("IA Erro:", error);
    if(typeof window.showToast === 'function') window.showToast("Erro de conexão com a IA.");
  }
}

function executeAIAction(cmd) {
  if (typeof window.state === 'undefined') return;

  if (cmd.action === 'add_tx') {
    // Usa a função global do app.js se disponível
    const newTx = {
      id: 'ai_' + Date.now(),
      tipo: cmd.tipo,
      categoria: cmd.cat || 'Outros',
      descricao: cmd.desc,
      valor: Number(cmd.val),
      data: cmd.data
    };
    
    window.state.tx.push(newTx);
    
    // Persiste
    if(typeof window.saveState === 'function') window.saveState(); // Salva no Firebase
    if(typeof window.updateUI === 'function') window.updateUI();
    
    // Sincronia Google (Se configurado no app.js)
    if(typeof window.syncToGoogle === 'function' && window.currentUser) {
        window.syncToGoogle({ action: 'transaction', userEmail: window.currentUser.email, ...newTx });
    }
    
    if(typeof window.showToast === 'function') window.showToast(`✅ Adicionado: ${cmd.desc}`);
  } 
  else if (cmd.action === 'add_rec') {
    const newRec = {
      id: 'ai_rec_' + Date.now(),
      desc: cmd.desc,
      valor: Number(cmd.val),
      dia: cmd.dia,
      history: {}
    };
    
    if(!window.state.recurring) window.state.recurring = [];
    window.state.recurring.push(newRec);
    
    if(typeof window.saveState === 'function') window.saveState();
    
    // Atualiza tela se estiver aberta
    try {
        const recPage = document.getElementById('rec-page');
        if(recPage && recPage.style.display === 'block' && typeof window.renderRecList === 'function') {
            window.renderRecList();
        }
    } catch(e){}
    
    if(typeof window.showToast === 'function') window.showToast(`🔄 Recorrente criada: ${cmd.desc}`);
  }
}