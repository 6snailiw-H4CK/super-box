# 🚀 Setup & Deployment Guide - THE BOX

## 📦 Local Development Setup

### Prerequisites
- Node.js 18+ (para backend local)
- Git
- Navegador moderno (Chrome, Edge - para Speech API)

### Instalação

```bash
# 1. Clone ou abra o projeto
cd "PLANO 2026/2.0"

# 2. Instalar dependências do backend
cd backend
npm install
# Instala: express, cors, dotenv, node-fetch

# 3. Criar arquivo .env local
echo 'DEEPSEEK_API_KEY=sk-seu_valor_aqui' > .env

# 4. Rodar servidor Express (dev local)
npm start
# Servidor em http://localhost:3000/api/ai/assistant
```

### Desenvolvimento Frontend
```bash
# Frontend é estático - abra em VS Code e use Live Server
# ou simplesmente abra index.html no navegador
# (funciona offline exceto a IA - que precisa do backend)
```

### Testar IA Localmente
1. Deixar servidor backend rodando: `npm start`
2. No código `ai-assistant.js`, mudar o endpoint (debug):
   ```javascript
   // Temporário para dev:
   const endpoint = 'http://localhost:3000/api/ai/assistant';
   // Depois volta para produção:
   const endpoint = '/.netlify/functions/ai-assistant';
   ```
3. Clique no botão 🎙️ e teste

---

## 🌐 Deployment - Netlify

### Preparação

1. **Push para GitHub**
   ```bash
   git add .
   git commit -m "Setup THE BOX v2.0"
   git push origin main
   ```

2. **Conectar Netlify**
   - Vá para https://app.netlify.com
   - Clique em "New site from Git"
   - Selecione seu repositório GitHub
   - **Build settings:**
     - Build command: (deixe vazio - site estático)
     - Publish directory: `.` (ou `./` )

3. **Configurar Variáveis de Ambiente**
   - Após o deploy, vá em Site settings → Environment
   - Adicione: `DEEPSEEK_API_KEY` = `sk-xxxxxxxx`
   - Ou use:
   ```bash
   netlify env:set DEEPSEEK_API_KEY sk-xxxxxxxx
   ```

4. **Redeploy**
   - Vá em Deploys → Trigger deploy
   - Escolha branch `main`
   - Aguarde (2-3 min)

### Verificar Deploy
```bash
# No terminal Netlify CLI (se tiver instalado):
netlify deploy --prod

# Ou via interface web:
# https://app.netlify.com → seu site → Deploys
```

---

## 🔧 Troubleshooting

### Problema: 500 "configuração de servidor ausente"
**Solução**: `DEEPSEEK_API_KEY` não está em Netlify
1. Verifique em Site → Settings → Environment
2. Redeploy após adicionar a variável

### Problema: Firebase não conecta
**Solução**: Verificar config em `app.js` linha ~10
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAxL9yhawQSLbPgoVZvIPUd133t7hUK1JI",
  // ... verifique se está com valores válidos
};
```
- Se offline, app usa `localStorage` como fallback
- Mensagem: "Usando dados locais"

### Problema: Voice não funciona
**Solução**:
1. Use Chrome, Edge ou Samsung Internet
2. User deve ser PRO (`window.isPro()` = true)
   - Debug: `window.state.licenseKey` deve ser `'BOXPRO'`
3. Check console para erros:
   ```javascript
   console.log(window.isPro())
   console.log(window.state.licenseKey)
   ```

### Problema: Estado não persiste após logout
**Solução**: Logout faz `location.reload()` - volta ao login
- Dados persistem em Firestore + localStorage
- Login novamente carrega tudo

---

## 📋 Testing Checklist

### ✅ Local (antes de dar push)
- [ ] Login admin: `admin` / `1570`
- [ ] Criar transaction e verifica se salva
- [ ] Criar usuário novo e verifica isolamento de dados
- [ ] Testar categorias (add/remove)
- [ ] Testar recorrentes

### ✅ PRO Features (com `DEEPSEEK_API_KEY` local)
- [ ] Voice test: "adicionar despesa combustível 50 reais"
- [ ] Verificar JSON retornado da IA
- [ ] Backup/Restore funciona
- [ ] Reset data funciona

### ✅ Produção (após Netlify deploy)
- [ ] Acesse site público
- [ ] Login funciona
- [ ] Voice testa com mic real
- [ ] Dados sincronizam com Firestore
- [ ] Offline mode (localStorage) funciona

---

## 📝 Build & Publish Files

| File | Dev Local? | Netlify Deploy? | Notes |
|------|-----------|-----------------|-------|
| `index.html` | ✅ | ✅ | UI principal |
| `app.js` | ✅ | ✅ | Module Firestore |
| `ai-assistant.js` | ✅ | ✅ | Speech + fetch |
| `styles.css` | ✅ | ✅ | Styling |
| `sw.js` | ✅ | ✅ | Service Worker |
| `manifest.json` | ✅ | ✅ | PWA config |
| `backend/server.js` | ✅ Dev | ❌ | Express local |
| `backend/netlify/functions/ai-assistant.js` | ❌ | ✅ | Serverless |
| `.env` | ✅ | ❌ | Local vars (never commit!) |
| `netlify.toml` | ❌ | ✅ | Build config |

---

## 🔐 Env Vars Checklist

### Local (`.env` no backend/)
```
DEEPSEEK_API_KEY=sk-xxxxxxxx
PORT=3000
```

### Netlify (Site → Settings → Environment)
```
DEEPSEEK_API_KEY=sk-xxxxxxxx
```

### Firebase (em `app.js` - pública, ok)
```javascript
const firebaseConfig = {
  apiKey: "...", // PUBLIC key (Firebase rules protect)
  projectId: "thebox-79c28",
  // ...
};
```

---

**Last Updated**: Nov 2025  
**Version**: THE BOX v2.0 PLANO 2026
