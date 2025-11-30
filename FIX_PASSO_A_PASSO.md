# 📸 PASSO-A-PASSO: Corrigir Erro AI 500

> Baseado no erro capturado na foto do console do browser

---

## 🔴 Erro na Foto

```
POST https://fantastic-unicorn-1b67a7.netlify.app/.netlify/functions/ai-assistant 500 (Internal Server Error)
Erro HTTP IA: 500 {"error":"configuração de servidor ausente"}
```

---

## ✅ Solução em 5 Minutos

### 1️⃣ Obter Chave DeepSeek
```
URL: https://platform.deepseek.com/account/keys
1. Faça login
2. Procure por "API Keys"
3. Clique em "+ Create New Key" (ou copie existente)
4. Copie o valor (começa com "sk-")
```

**Exemplo:**
```
sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

### 2️⃣ Adicionar no Netlify (Parte 1)

**URL:** https://app.netlify.com

```
1. Login Netlify
2. Clique no seu site (fantastic-unicorn-1b67a7)
3. Menu esquerdo → "Site configuration" ou "Settings"
```

![Imagem Esperada]
- Home do site → Dashboard do Netlify
- Seu site listado

---

### 3️⃣ Acessar Environment (Parte 2)

**Dentro do site no Netlify:**

```
1. Vá em: Site configuration → Build & deploy → Environment
   OU
   Settings → Environment (pode variar por versão)
2. Procure por botão: "Edit variables" ou "+ Add a variable"
```

![Imagem Esperada]
- Seção "Environment" com botão ou lista

---

### 4️⃣ Adicionar Variável

**Clique em "+ Add a variable" ou "Add environment variable":**

```
Key:     DEEPSEEK_API_KEY
Value:   sk-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
Scope:   (deixe padrão - Production)

Clique em "Create variable" ou "Save"
```

**⚠️ Importante:**
- Key é **case-sensitive**: `DEEPSEEK_API_KEY` (exatamente assim)
- Não esqueça de colar a chave (Value)
- Não use aspas ou espaços extras

---

### 5️⃣ Redeploy

**De volta no Netlify:**

```
1. Vá em "Deploys" (menu lateral)
2. Procure pelo último deploy
3. Clique em "Trigger deploy" ou "Clear cache and redeploy"
4. Escolha branch: main
5. Aguarde 2-3 minutos
```

**Status esperado:**
```
✅ Deploy em progresso...
✅ Deploy publicado
✅ Site ao vivo
```

---

## 🧪 Testar o Fix

### No Browser (Production)

1. Abra seu site: `https://fantastic-unicorn-1b67a7.netlify.app`
2. Faça login (admin / 1570 ou outro usuário)
3. Procure pelo botão **🎙️** (microfone azul)
4. **Se não aparecer:** Usuário não é PRO
   - Vai ao input "Chave" e digita: `BOXPRO`
   - Clica "Ativar"
   - Recarrega página
5. Clique no 🎙️
6. Fale: **"Adicionar despesa gasolina 50 reais"**
7. Deve processar sem erro 500

**Resultado esperado:**
```
✅ Toast: "Processando..."
✅ Toast: "✅ Salvo: gasolina (R$ 50.00)"
✅ Transação aparece na lista
```

---

### Se Ainda Tiver Erro

**Verificações:**

1. **Erro ainda é 500?**
   - Aguarde 1-2 min depois do redeploy (cache)
   - Recarregue página (Ctrl+F5)
   - Verifique se `DEEPSEEK_API_KEY` está em "Environment"

2. **Erro 502 ou "Resposta inválida da IA"?**
   - Chave DeepSeek é válida?
   - Conta DeepSeek tem créditos?
   - Teste API diretamente: `curl -X GET https://api.deepseek.com/user`

3. **Botão 🎙️ não aparece?**
   - User é PRO? (License: BOXPRO)
   - Browser é Chrome/Edge/Samsung? (Firefox não tem Web Speech API)
   - Console.log: `window.isPro()` deve ser `true`

4. **Browser não reconhece voz?**
   - Use Chrome em desktop (não funciona em modal/iframe)
   - Microfone do PC está funcionando?
   - Permissão de acesso ao microfone foi negada?
   - DevTools Console → Check for errors

---

## 🔐 Verificar Segurança

**Chave NUNCA deve ir no código:**

```javascript
// ❌ NUNCA faça isso
const API_KEY = "sk-a1b2c3d4e5f6";

// ✅ Sempre use environment var
const API_KEY = process.env.DEEPSEEK_API_KEY;
```

**Arquivo `.env` local (dev):**
```
echo "DEEPSEEK_API_KEY=sk-seu_valor" > backend/.env
# Arquivo .env NÃO é commitado (está em .gitignore)
```

**Netlify (production):**
```
✅ Variáveis seguras no painel
✅ Injetadas no runtime
✅ Nunca aparecem no git
```

---

## 📝 Checklist Final

- [ ] Chave DeepSeek obtida (começa com `sk-`)
- [ ] Netlify: `DEEPSEEK_API_KEY` adicionada em Environment
- [ ] Redeploy completado com sucesso
- [ ] Aguardou 2-3 min para cache limpar
- [ ] User é PRO (license BOXPRO ativada)
- [ ] Testou 🎙️ no browser
- [ ] Falou comando e recebeu resposta sem erro 500

---

## 💬 Suporte

Se tiver dúvidas:

1. **Verificar Console do Browser** (F12 → Console)
   ```javascript
   // Digite:
   window.isPro()               // deve ser true
   window.state.licenseKey      // deve ser 'BOXPRO'
   // Se não tiver error na rede POST
   ```

2. **Check Netlify Logs**
   - Netlify → Site → Functions → ai-assistant
   - Ver logs da função

3. **Check DeepSeek API**
   - Sua conta tem créditos?
   - Chave é válida?
   - Quota não foi excedida?

---

**Feito! 🎉**  
Ao seguir estes passos, o error 500 desaparecerá e a IA funcionará.

---

*Última atualização: Nov 2025*
*Versão: THE BOX v2.0*
