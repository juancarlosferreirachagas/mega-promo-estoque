# 🏪 Sistema de Estoque - Mega Promo Merchandising

Sistema completo de controle de estoque desenvolvido em React + Supabase.

---

## 🚀 **DEPLOY RÁPIDO (2 MINUTOS)**

### **Opção 1: Deploy Automático na Vercel** (RECOMENDADO)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/mega-promo-estoque)

**Ou siga o passo a passo:** [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)

---

## ✨ **Funcionalidades**

### 🔐 **Sistema de Login**
- Usuário master: `admin` / `admin123`
- Cadastro de novos usuários com permissões personalizadas
- Controle de acesso por funcionalidade

### 📦 **Gestão de Estoque**
- ✅ Cadastro de itens com nome e tamanho/variação
- ✅ Registro de entradas e saídas
- ✅ Visualização do estoque atual em tempo real
- ✅ Edição de movimentações (ajusta estoque automaticamente)
- ✅ Exclusão de movimentações (apenas usuário master)

### 📊 **Histórico e Auditoria**
- ✅ Histórico completo de todas as movimentações
- ✅ Log de auditoria de alterações
- ✅ Timeline visual de modificações
- ✅ Rastreabilidade total (quem, quando, o quê)
- ✅ Exportação para Excel

### 🎨 **Design**
- Interface moderna em laranja/âmbar
- Responsivo (desktop e mobile)
- Componentes ShadCN UI

---

## 🛠️ **Tecnologias**

- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **UI:** Tailwind CSS + ShadCN UI
- **Hospedagem:** Vercel
- **Ícones:** Lucide React

---

## 📋 **Configuração do Banco de Dados**

### **1. Execute o SQL de Migração**

Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new

Cole e execute este SQL:

```sql
-- Criar tabela de histórico de auditoria
CREATE TABLE IF NOT EXISTS public.mega_promo_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID REFERENCES public.mega_promo_movements(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_by TEXT NOT NULL,
  changes JSONB NOT NULL,
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.mega_promo_audit_log ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso
DROP POLICY IF EXISTS "Allow service role audit" ON public.mega_promo_audit_log;
CREATE POLICY "Allow service role audit" ON public.mega_promo_audit_log FOR ALL USING (true);

-- Recarregar schema
NOTIFY pgrst, 'reload schema';
```

### **2. Aguarde 10 segundos**

O schema do PostgREST precisa atualizar.

### **3. Pronto!**

Seu sistema está 100% funcional! 🎉

---

## 🔄 **Como Atualizar o Sistema**

### **Se usou deploy via GitHub:**

1. Baixe os arquivos atualizados
2. Faça upload no seu repositório GitHub
3. Vercel detecta e faz deploy automático em ~30 segundos

### **Se usou deploy manual:**

1. Baixe os arquivos atualizados
2. Execute `vercel` na pasta do projeto
3. Confirme o deploy

---

## 👥 **Permissões de Usuários**

O sistema possui controle granular de permissões:

- ✅ Cadastrar itens
- ✅ Registrar movimentações
- ✅ Editar movimentações
- ✅ Excluir movimentações (apenas master)
- ✅ Gerenciar usuários (apenas master)
- ✅ Visualizar estoque
- ✅ Visualizar histórico
- ✅ Exportar relatórios

---

## 📞 **Suporte**

Desenvolvido para **Mega Promo Merchandising - São Paulo/SP**

---

## 📄 **Licença**

Uso interno - Todos os direitos reservados.
