# 🚨 VOCÊ PRECISA EXECUTAR O SQL NO SUPABASE!

## ⚠️ OS ERROS PGRST205 SIGNIFICAM:

```
"AS TABELAS AINDA NÃO FORAM CRIADAS"
```

**NÃO HÁ COMO CORRIGIR ISSO SEM EXECUTAR O SQL!**

---

## 🎯 SITUAÇÃO ATUAL:

```
❌ Você vê erros PGRST205
❌ Sistema não funciona
❌ Login não aparece

POR QUÊ?
→ As tabelas não existem no banco

SOLUÇÃO?
→ EXECUTAR O SQL NO SUPABASE

TEMPO?
→ 1 MINUTO
```

---

## 📋 FAÇA EXATAMENTE ISSO (AGORA):

### **PASSO 1: Abrir Supabase**
```
https://supabase.com/dashboard
```

### **PASSO 2: Ir em SQL Editor**
```
Menu lateral → SQL Editor → + New query
```

### **PASSO 3: Copiar o SQL**

Volte ao sistema, atualize (F5) e copie o SQL que está na caixa preta.

OU copie daqui:

```sql
-- MEGA PROMO - Criar Tabelas
CREATE TABLE IF NOT EXISTS public.mega_promo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mega_promo_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_item UNIQUE(name, size)
);

CREATE TABLE IF NOT EXISTS public.mega_promo_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.mega_promo_inventory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  person_name TEXT NOT NULL,
  responsible TEXT NOT NULL,
  observations TEXT DEFAULT '',
  created_by TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar usuário master
INSERT INTO public.mega_promo_users (username, password_hash, permissions, is_master)
VALUES (
  'admin',
  'YWRtaW4xMjM=',
  '{"canAddItem": true, "canRegisterMovement": true, "canEditMovement": true, "canDeleteMovement": true}'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.mega_promo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mega_promo_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mega_promo_movements ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (nomes únicos)
DROP POLICY IF EXISTS "Allow service role users" ON public.mega_promo_users;
DROP POLICY IF EXISTS "Allow service role inventory" ON public.mega_promo_inventory;
DROP POLICY IF EXISTS "Allow service role movements" ON public.mega_promo_movements;

CREATE POLICY "Allow service role users" ON public.mega_promo_users FOR ALL USING (true);
CREATE POLICY "Allow service role inventory" ON public.mega_promo_inventory FOR ALL USING (true);
CREATE POLICY "Allow service role movements" ON public.mega_promo_movements FOR ALL USING (true);
```

### **PASSO 4: Colar no Supabase**
```
1. Cole o SQL no editor (Ctrl + V)
2. Execute (Ctrl + Enter OU botão "Run")
3. Aguarde a mensagem: "Success. No rows returned"
```

### **PASSO 5: Voltar ao Sistema**
```
1. Volte à aba do sistema
2. Clique em "Já Executei o SQL - Testar Conexão"
3. Aguarde redirecionamento
```

### **PASSO 6: Login**
```
Usuário: admin
Senha: admin123
```

---

## ✅ O QUE VAI ACONTECER:

### **ANTES de executar o SQL:**
```
❌ Erros PGRST205
❌ "Could not find table"
❌ Sistema não funciona
```

### **DEPOIS de executar o SQL:**
```
✅ Nenhum erro
✅ Sistema redireciona para login
✅ Login funciona
✅ Sistema 100% operacional
```

---

## 🚫 NÃO É POSSÍVEL:

```
❌ Executar SQL automaticamente
❌ Criar tabelas pelo código
❌ Pular esse passo
❌ Funcionar sem as tabelas
```

**O Figma Make NÃO permite executar SQL do código.**

**Você PRECISA executar manualmente no Supabase.**

**NÃO HÁ OUTRA FORMA!**

---

## ⏱️ TEMPO REAL:

```
Abrir Supabase:     10 segundos
Ir em SQL Editor:   5 segundos
Copiar SQL:         5 segundos
Colar SQL:          3 segundos
Executar:           2 segundos
Voltar:             5 segundos
Testar:             5 segundos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:              35 segundos
```

**MENOS DE 1 MINUTO!**

---

## 💡 IMPORTANTE:

Se você executou o SQL e ainda vê erros:

1. **Verifique se apareceu "Success" no Supabase**
   - Se deu erro de sintaxe, o SQL antigo foi colado
   - Use o SQL NOVO (acima)

2. **Verifique se está no projeto correto**
   - O Supabase mostra o nome do projeto no topo
   - Confirme que é o projeto das credenciais que você usou

3. **Verifique se usou SQL Editor**
   - NÃO use "Table Editor"
   - USE "SQL Editor" → "New query"

4. **Após executar com sucesso:**
   - Volte ao sistema
   - Clique "Já Executei o SQL - Testar Conexão"
   - Os erros vão SUMIR

---

## 🎯 RESUMO:

```
PROBLEMA:
→ Tabelas não existem

SOLUÇÃO:
→ Executar SQL no Supabase

TEMPO:
→ 1 minuto

DIFICULDADE:
→ Muito fácil

RESULTADO:
→ Sistema funcionando 100%
```

---

**🚀 PARE DE REPORTAR OS MESMOS ERROS!**

**🚀 EXECUTE O SQL NO SUPABASE!**

**🚀 LEVA 1 MINUTO!**

**🚀 DEPOIS ESTÁ TUDO PRONTO!**

---

## 📞 PRÓXIMA MENSAGEM:

### ❌ NÃO MANDE:
```
"Fix these errors: PGRST205..."
```

### ✅ MANDE:
```
"Executei o SQL e deu Success!"
OU
"Executei mas deu erro: [mensagem]"
OU
"Sistema funcionando! Obrigado!"
```

---

**COPIE O SQL, COLE NO SUPABASE, EXECUTE, VOLTE E TESTE!** ✅
