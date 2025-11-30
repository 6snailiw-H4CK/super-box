# 📚 Índice de Documentação - THE BOX v2.0

## 🎯 Rápido & Direto

### Você quer corrigir o erro AI 500?
→ **[FIX_PASSO_A_PASSO.md](FIX_PASSO_A_PASSO.md)** ⭐  
Instruções visuais passo-a-passo em 5 minutos

### Você quer entender a arquitetura?
→ **[.github/copilot-instructions.md](.github/copilot-instructions.md)**  
Guia para agentes IA (patterns, fluxos, debugging)

### Você quer desenvolver localmente?
→ **[SETUP_DEPLOY.md](SETUP_DEPLOY.md)**  
Backend Express, setup, deploy Netlify

### Você quer saber o que foi analisado?
→ **[RESUMO_ANALISE.md](RESUMO_ANALISE.md)**  
Visão geral técnica, bugs encontrados, insights

---

## 📄 Arquivo por Arquivo

| Arquivo | Propósito | Leitura |
|---------|-----------|---------|
| **FIX_PASSO_A_PASSO.md** | Corrigir erro 500 da IA em produção | 5 min |
| **FIX_AI_ERROR.md** | Documentação técnica do bug | 3 min |
| **SETUP_DEPLOY.md** | Local dev + Netlify deploy | 10 min |
| **RESUMO_ANALISE.md** | Análise completa da codebase | 8 min |
| **.github/copilot-instructions.md** | Guia para agentes IA/Copilot | 7 min |

---

## 🔥 O que foi feito

### ✅ Análise Completa
- [x] Leitura de todos os arquivos (frontend + backend)
- [x] Identificação do erro 500 (variável env faltando)
- [x] Mapeamento da arquitetura (Firebase + Netlify + DeepSeek)

### ✅ Documentação Criada
- [x] `.github/copilot-instructions.md` - Guia IA
- [x] `FIX_AI_ERROR.md` - Documentação técnica
- [x] `FIX_PASSO_A_PASSO.md` - Guia visual do fix
- [x] `SETUP_DEPLOY.md` - Dev + Deploy guide
- [x] `RESUMO_ANALISE.md` - Overview técnico
- [x] `INDEX.md` - Este arquivo

### ✅ Bug Documentado
- [x] Erro identificado: `DEEPSEEK_API_KEY` ausente em Netlify
- [x] Severidade: 🔴 CRÍTICA (afeta IA em produção)
- [x] Solução: Adicionar env var no painel Netlify
- [x] Verificações: Checklist de testes

---

## 🎓 Estrutura da Codebase

```
THE BOX (PWA Gestão Financeira)
│
├─ Frontend (estático, módulo)
│  ├─ index.html (UI + PWA manifest)
│  ├─ app.js (State + Firebase + Auth)
│  ├─ ai-assistant.js (Voice + Speech API)
│  └─ styles.css (Dark theme)
│
├─ Backend Serverless (Netlify Functions)
│  └─ backend/netlify/functions/ai-assistant.js
│     └─ DeepSeek API integration
│
└─ Backend Express (local dev only)
   └─ backend/server.js
```

---

## 🚀 Quickstart

### Ambiente Produção (Netlify)
```
1. Obter chave DeepSeek: https://platform.deepseek.com/account/keys
2. Adicionar no Netlify: Environment → DEEPSEEK_API_KEY
3. Redeploy
4. Testar 🎙️
```

**Veja**: [FIX_PASSO_A_PASSO.md](FIX_PASSO_A_PASSO.md)

### Ambiente Local (Dev)
```
cd backend
npm install
echo DEEPSEEK_API_KEY=sk-xxx > .env
npm start
```

**Veja**: [SETUP_DEPLOY.md](SETUP_DEPLOY.md)

---

## 🐛 Bug Principal

```javascript
// ❌ backend/netlify/functions/ai-assistant.js
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  return { statusCode: 500, body: '{"error":"configuração de servidor ausente"}' }
}
```

**Status**: Não é um bug de código, é falta de config  
**Fix**: Adicionar `DEEPSEEK_API_KEY` em Netlify Environment  
**Impacto**: Voice/IA desativada até configurar

---

## 📋 Padrões Importantes

### State Management
```javascript
window.state = {
  tx: [],              // transações
  categories: [],      // categorias
  recurring: [],       // contas recorrentes
  licenseKey: null     // 'BOXPRO' se ativada
}

// Salva em Firestore + localStorage
window.saveState()
```

### Authentication
```javascript
// Admin
{ email: 'admin', pass: '1570' }

// Usuários
localStorage: 'boxmotors_users_db' // array

// Session
sessionStorage: 'boxmotors_logged_user' // user obj
```

### IA/Voice
```javascript
// Flow
Speech Recognition → askAIBackend(text)
  → POST /.netlify/functions/ai-assistant
  → DeepSeek API (com contexto de categorias)
  → JSON { action, tipo, desc, val, ... }
  → executeAIAction(cmd)
  → saveTx() ou saveRecurring()
```

---

## 🔐 Security Checklist

- ✅ Firebase keys públicas (Firebase rules protect)
- ✅ `DEEPSEEK_API_KEY` nunca em código (env vars only)
- ✅ `.env` local em `.gitignore` (não commitado)
- ✅ Netlify stores securely (não expõe valor)
- ⚠️ License key é string `'BOXPRO'` (fácil burlar em dev - rever depois)

---

## 📞 Contato / Debug

### Console Browser (F12)
```javascript
window.isPro()                    // true/false
window.state.licenseKey           // 'BOXPRO' ou null
window.currentUser                // { email, name, ... }
localStorage.getItem('thebox_user_admin')  // backup local
```

### Network Tab (F12 → Network)
```
POST /.netlify/functions/ai-assistant
Status: 200 (ok), 500 (env missing), 502 (API error)
Response: { action, tipo, desc, ... }
```

### Netlify Logs
```
https://app.netlify.com
Site → Functions → ai-assistant → Check logs
```

---

## 📅 Próximas Steps

1. **HOJE**: Adicionar `DEEPSEEK_API_KEY` em Netlify (veja FIX_PASSO_A_PASSO.md)
2. **HOJE**: Testar voice após redeploy
3. **ESTA SEMANA**: Ler `.github/copilot-instructions.md` para entender patterns
4. **PRÓXIMA SEMANA**: Setup local dev com SETUP_DEPLOY.md
5. **BACKLOG**: Refactor auth (usuarios em banco, não localStorage)

---

## 📞 Links Importantes

- **App**: https://fantastic-unicorn-1b67a7.netlify.app
- **Netlify**: https://app.netlify.com
- **Firebase**: https://console.firebase.google.com
- **DeepSeek**: https://platform.deepseek.com
- **GitHub**: (seu repo)

---

## ✨ Resumo

**Status**: 🟡 FUNCIONANDO (exceto AI)  
**Blocker**: ❌ DEEPSEEK_API_KEY não configurado  
**Tempo Fix**: ⏱️ 5 minutos  
**Documentação**: ✅ COMPLETA

**Próximo passo**: Seguir [FIX_PASSO_A_PASSO.md](FIX_PASSO_A_PASSO.md)

---

**Documentação Criada**: Nov 2025  
**Versão**: THE BOX v2.0 PLANO 2026  
**Status**: 🟢 PRONTO PARA DEPLOY
