# 🔧 FIX: AI Voice 500 Error - "configuração de servidor ausente"

## ❌ Erro Encontrado
```
POST https://fantastic-unicorn-1b67a7.netlify.app/.netlify/functions/ai-assistant 500
Error: {"error":"configuração de servidor ausente"}
```

## 🎯 Causa Raiz
A variável de ambiente `DEEPSEEK_API_KEY` **não está configurada** no painel do Netlify.

Código em `backend/netlify/functions/ai-assistant.js` linha ~20:
```javascript
const API_KEY = process.env.DEEPSEEK_API_KEY;

if (!API_KEY) {
  console.error("ERRO: Chave de API não configurada no painel do Netlify.");
  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ error: 'Configuração de servidor ausente' })
  };
}
```

## ✅ Solução

### Passo 1: Obter chave da DeepSeek
1. Vá para https://platform.deepseek.com/account/keys
2. Crie uma nova chave API ou copie uma existente
3. Copie o valor da chave (começa com `sk-` ou similar)

### Passo 2: Adicionar no Netlify
1. Acesse https://app.netlify.com
2. Selecione o site **fantastic-unicorn-1b67a7** (ou seu site)
3. Vá em **Site settings** → **Build & deploy** → **Environment**
4. Clique em **Edit variables**
5. Adicione nova variável:
   - **Key**: `DEEPSEEK_API_KEY`
   - **Value**: `sk-xxxxxxxxxxxxxxxx` (sua chave)
6. Clique em **Create variable**
7. **Redeploy** o site (Deploys → Trigger deploy)

### Passo 3: Testar
- Clique no botão 🎙️ (mic) no app
- Diga algo como: "Adicionar despesa com gasolina de 100 reais"
- Deve processar sem erros

## 📝 Verificações

- ✅ Chave válida e com créditos na DeepSeek
- ✅ Variável criada com EXACT NAME: `DEEPSEEK_API_KEY`
- ✅ Função redeployada (Netlify cache limpo)
- ✅ Browser: Chrome, Edge ou Samsung Internet (require Speech Recognition API)
- ✅ User é PRO (`window.isPro()` retorna `true`)

## 🔐 Segurança
⚠️ **NÃO coloque a chave no código** (frontend ou backend commitado)  
- Chave vai APENAS em variáveis de ambiente do Netlify
- Deploy automático injeta no runtime
- App.js Firebase keys são públicas (propósito, Firebase security rules protegem)

---

**Se problema persistir**: Abra DevTools → Console → Network tab e verifique:
1. Request enviado para `/.netlify/functions/ai-assistant` com `POST`
2. Response status (500 = env var, 502 = API inválida, 200 = sucesso)
3. Body da resposta (error message)
