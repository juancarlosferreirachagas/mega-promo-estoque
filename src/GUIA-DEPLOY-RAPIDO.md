# 🚀 GUIA RÁPIDO DE DEPLOY

## 📋 ANTES DE COMEÇAR:

✅ Projeto 100% funcional aqui no Figma Make  
✅ Backend já no ar no Supabase  
✅ Banco de dados já configurado  
✅ Falta apenas: Tabela de auditoria + Deploy frontend  

---

## ⚡ 3 PASSOS PARA COLOCAR NO AR:

### **PASSO 1: Criar Tabela de Auditoria** (2 minutos)

1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql
2. Abra o arquivo `/sql-auditoria.sql` deste projeto
3. Copie TODO o conteúdo
4. Cole no editor SQL do Supabase
5. Clique em **"RUN"**
6. ✅ Deve aparecer: "Tabela de auditoria criada com sucesso!"

---

### **PASSO 2: Exportar Projeto do Figma Make** (1 minuto)

1. Clique em **"Export"** no Figma Make (canto superior direito)
2. Baixe o arquivo ZIP
3. Descompacte em uma pasta
4. ✅ Pronto! Código no seu computador

---

### **PASSO 3: Deploy na Vercel** (3 minutos)

#### **Opção A - Via GitHub (Recomendado):**

1. **Criar repositório no GitHub:**
   - Acesse: https://github.com/new
   - Nome: `mega-promo-estoque`
   - Visibilidade: Private (ou Public)
   - Clique "Create repository"

2. **Subir código:**
   ```bash
   cd pasta-do-projeto
   git init
   git add .
   git commit -m "Sistema Mega Promo - Deploy inicial"
   git branch -M main
   git remote add origin SEU_REPO_GITHUB
   git push -u origin main
   ```

3. **Deploy na Vercel:**
   - Acesse: https://vercel.com/new
   - Clique "Import Git Repository"
   - Selecione seu repositório `mega-promo-estoque`
   - **Build Settings:**
     - Framework Preset: `Vite`
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Clique **"Deploy"**
   - ⏳ Aguarde 1-2 minutos
   - ✅ Pronto! URL pública disponível!

#### **Opção B - Sem GitHub (Mais rápido, mas menos recomendado):**

1. Instale Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Na pasta do projeto:
   ```bash
   vercel
   ```

3. Responda as perguntas:
   - "Set up and deploy?" → **Y**
   - "Which scope?" → **Sua conta**
   - "Link to existing project?" → **N**
   - "Project name?" → **mega-promo-estoque**
   - "In which directory?" → **./  (ENTER)**
   - "Want to override settings?" → **N**

4. ✅ Pronto! URL gerada automaticamente!

---

## 🧪 PASSO 4: TESTAR (2 minutos)

Acesse a URL do deploy e teste:

1. **Login:**
   - Usuário: `admin`
   - Senha: `admin123`
   - ✅ Deve entrar no sistema

2. **Cadastrar Item:**
   - Aba: "Cadastrar Item"
   - Produto: "Caneta"
   - Tamanho: "Azul"
   - Quantidade: 100
   - ✅ Deve cadastrar sem erro

3. **Registrar Entrada:**
   - Aba: "Movimentação"
   - Tipo: Entrada
   - Produto: Caneta (Azul)
   - Quantidade: 50
   - ✅ Estoque deve aumentar

4. **Exportar Excel:**
   - Aba: "Histórico"
   - Botão: "Exportar Excel"
   - ✅ Deve baixar arquivo .xlsx

---

## ✅ TUDO FUNCIONANDO?

Se todos os testes passaram:
- 🎉 **PARABÉNS! SISTEMA NO AR!**
- 🌐 Compartilhe a URL com sua equipe
- 📱 Sistema responsivo (funciona no celular!)
- ☁️ Dados salvos na nuvem (Supabase)

---

## 🚨 DEU ERRO?

### **Erro ao criar tabela:**
- Verifique se está logado no projeto correto
- Verifique se copiou TODO o SQL
- Tente criar cada comando separadamente

### **Erro no deploy:**
- Verifique se tem `package.json` na raiz
- Verifique se tem `vite.config.ts`
- Execute `npm install` antes do build

### **Erro ao logar:**
- Verifique se a tabela de auditoria foi criada
- Verifique console do navegador (F12)
- Verifique se URL do Supabase está correta em `/utils/supabase/info.tsx`

### **Erro 404 ao acessar rotas:**
- Adicione arquivo `vercel.json` na raiz:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```

---

## 📞 PRECISA DE AJUDA?

**No Trae IA, pergunte:**

"Estou fazendo deploy do projeto Mega Promo. O erro é [DESCREVA O ERRO]. 
O que devo fazer? NÃO altere o código, apenas me ajude com o deploy."

---

## 🎯 RESUMO EXECUTIVO:

```
1. SQL → Supabase (2 min)
2. Export → Figma Make (1 min)  
3. GitHub → Criar repo (1 min)
4. Vercel → Deploy (2 min)
5. Teste → admin/admin123 (2 min)

TOTAL: 8 minutos ⏱️
```

---

## 🔗 LINKS ÚTEIS:

- **Supabase Dashboard:** https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv
- **Supabase SQL Editor:** https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql
- **Vercel:** https://vercel.com
- **GitHub:** https://github.com/new

---

**BOA SORTE! 🍀**

Se seguir este guia, em 10 minutos está no ar! 🚀
