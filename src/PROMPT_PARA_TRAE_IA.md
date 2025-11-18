# 🚀 PROMPT PARA CONTINUAR NO TRAE IA

## ⚠️ COPIE E COLE ESTE PROMPT NO TRAE IA:

---

**Olá! Tenho um projeto React + TypeScript + Supabase 100% funcional que foi desenvolvido no Figma Make.**

**O sistema é um controle de estoque para a Mega Promo Merchandising com:**
- ✅ Login e autenticação
- ✅ Gestão de usuários com permissões
- ✅ Cadastro de produtos
- ✅ Movimentações de entrada/saída
- ✅ Histórico completo com auditoria
- ✅ Exportação para Excel
- ✅ Backend em Supabase Edge Functions (Hono)
- ✅ Frontend React + Tailwind CSS

---

## 📦 O QUE PRECISO QUE VOCÊ FAÇA:

**NÃO ALTERE NENHUM CÓDIGO!** O sistema já está perfeito e funcionando.

Preciso apenas que você:

### 1️⃣ **Me ajude a fazer o deploy**
   - Frontend: Vercel ou Netlify (o que for mais fácil)
   - Backend: Já está no Supabase (Edge Functions)
   - Banco: Já está no Supabase (PostgreSQL)

### 2️⃣ **Criar a última tabela do banco (Auditoria)**
   - Executar o SQL que vou fornecer no Supabase
   - É só 1 tabela que faltou

### 3️⃣ **Verificar se está tudo ok após deploy**
   - Testar login
   - Testar cadastro de item
   - Testar movimentações

---

## 🗄️ INFORMAÇÕES DO SUPABASE:

**URL do Projeto:** `https://dgqojbdipxpblxldgkxv.supabase.co`
**Project ID:** `dgqojbdipxpblxldgkxv`

**Tabelas já criadas:**
- ✅ `mega_promo_users` (usuários)
- ✅ `mega_promo_inventory` (estoque)
- ✅ `mega_promo_movements` (movimentações)
- ⏳ `mega_promo_audit_log` (FALTA CRIAR - SQL abaixo)

---

## 📝 SQL PARA CRIAR TABELA DE AUDITORIA:

```sql
-- Tabela de auditoria de movimentações
CREATE TABLE IF NOT EXISTS mega_promo_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'edited', 'deleted'
  changed_by VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_data JSONB,
  new_data JSONB,
  FOREIGN KEY (movement_id) REFERENCES mega_promo_movements(id) ON DELETE CASCADE
);

-- Índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_audit_movement_id ON mega_promo_audit_log(movement_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON mega_promo_audit_log(changed_at DESC);
```

**Como executar:**
1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql
2. Cole o SQL acima
3. Clique em "RUN"
4. Pronto! ✅

---

## 📁 ESTRUTURA DO PROJETO:

```
/
├── App.tsx                          # App principal
├── AppWithSupabase.tsx              # App com Supabase (USAR ESTE)
├── AppWithAuth.tsx                  # Versão intermediária (ignorar)
├── main.tsx                         # Entry point
├── index.html                       # HTML base
├── vite.config.ts                   # Config Vite
├── package.json                     # Dependências
├── components/
│   ├── CadastrarItem.tsx            # Cadastro de produtos
│   ├── EstoqueAtual.tsx             # Visualização estoque
│   ├── Historico.tsx                # Histórico + Excel
│   ├── RegistrarMovimentacao.tsx   # Entrada/Saída
│   ├── Login.tsx                    # Tela de login
│   ├── GerenciarUsuariosSupabase.tsx # Gestão usuários
│   ├── DatabaseInit.tsx             # Setup inicial
│   └── ui/                          # Componentes shadcn
├── supabase/functions/server/
│   └── index.tsx                    # Backend (Hono server)
└── utils/
    ├── api.ts                       # API client
    ├── supabase/
    │   ├── client.ts                # Supabase config
    │   └── info.tsx                 # Credenciais
    └── initialData.ts               # Produtos padrão
```

---

## 🎯 DEPLOY - PASSO A PASSO:

### **OPÇÃO 1: Deploy Vercel (Recomendado)**

1. **Verificar se tem os arquivos:**
   - ✅ `vercel.json` (se não tiver, criar)
   - ✅ `package.json` com script `"build": "tsc && vite build"`
   - ✅ `.gitignore` (se não tiver, criar)

2. **Conectar no Vercel:**
   - Importar repositório GitHub
   - Configurar build command: `npm run build`
   - Output directory: `dist`
   - Deploy! 🚀

3. **Variáveis de ambiente:**
   - NÃO PRECISA! Já estão no código em `/utils/supabase/info.tsx`

---

### **OPÇÃO 2: Deploy Netlify**

1. **Build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Deploy:**
   - Arrastar pasta ou conectar GitHub
   - Pronto! ✅

---

## ⚙️ BACKEND (EDGE FUNCTIONS):

**O backend JÁ ESTÁ FUNCIONANDO no Supabase!**

Arquivo: `/supabase/functions/server/index.tsx`

**Se precisar re-deploy:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref dgqojbdipxpblxldgkxv

# Deploy
supabase functions deploy server
```

**Mas provavelmente NÃO PRECISA fazer nada! Já está no ar.**

---

## 🧪 TESTES APÓS DEPLOY:

1. **Login:**
   - Usuário: `admin`
   - Senha: `admin123`

2. **Testar:**
   - ✅ Visualizar estoque
   - ✅ Cadastrar novo item
   - ✅ Registrar entrada
   - ✅ Registrar saída
   - ✅ Editar movimentação
   - ✅ Exportar Excel

---

## 🚨 IMPORTANTE:

- **NÃO ALTERE O CÓDIGO!** Está tudo funcionando.
- **NÃO RECRIE COMPONENTES!** Só fazer deploy.
- **NÃO MUDE CREDENCIAIS!** Já estão configuradas.
- **APENAS:**
  1. Criar tabela de auditoria (SQL acima)
  2. Fazer deploy do frontend
  3. Testar

---

## 📞 SE DER ERRO:

**Me informe:**
- Qual erro apareceu
- Em qual etapa (build, deploy, runtime)
- Print do console

**NÃO tente "consertar" recriando código!**

---

## ✅ CHECKLIST:

- [ ] Criar tabela `mega_promo_audit_log` no Supabase
- [ ] Deploy frontend (Vercel/Netlify)
- [ ] Testar login (admin/admin123)
- [ ] Testar cadastro de item
- [ ] Testar movimentação
- [ ] Confirmar que tudo funciona

---

## 🎉 RESULTADO ESPERADO:

Ao final, você terá:
- ✅ URL pública do sistema (ex: `mega-promo.vercel.app`)
- ✅ Sistema 100% funcional online
- ✅ Banco de dados configurado
- ✅ Todos os recursos funcionando

---

**ESTÁ TUDO PRONTO! É SÓ FAZER O DEPLOY! 🚀**

---

## 📋 RESUMO ULTRA-RÁPIDO:

```bash
# 1. Criar tabela auditoria no Supabase (copiar SQL acima)
# 2. Deploy frontend:
npm install
npm run build
# (deploy na Vercel/Netlify)

# 3. Testar login: admin / admin123
# 4. Pronto! ✅
```

---

## 🆘 PROMPT ALTERNATIVO SE O TRAE IA NÃO ENTENDER:

"Tenho um projeto React completo. NÃO PRECISO DE CÓDIGO NOVO. Preciso apenas:
1. Executar SQL no Supabase para criar 1 tabela
2. Fazer deploy do frontend na Vercel
3. Testar se funciona

O projeto JÁ ESTÁ PRONTO. Apenas me guie no deploy passo a passo."

---

**BOA SORTE! 🍀**
