# ✅ SQL CORRIGIDO!

## 🔧 O PROBLEMA ERA:

```
Políticas de RLS com nomes duplicados
❌ "Allow service role" (repetido 3 vezes)
```

## ✅ SOLUÇÃO:

```
Nomes únicos para cada política:
✅ "Allow service role users"
✅ "Allow service role inventory"
✅ "Allow service role movements"
```

---

## 📋 FAÇA AGORA (3 PASSOS):

### **1️⃣ ATUALIZAR A PÁGINA**
```bash
Pressione F5 no sistema
```

### **2️⃣ COPIAR O NOVO SQL**
```
Clique em "Copiar SQL" na tela
(O SQL foi atualizado automaticamente!)
```

### **3️⃣ EXECUTAR NO SUPABASE**
```
1. Volte ao SQL Editor do Supabase
2. Delete o SQL antigo (se ainda estiver lá)
3. Cole o NOVO SQL
4. Ctrl + Enter para executar
5. Aguarde "Success. No rows returned"
```

---

## 🎯 SQL CORRIGIDO COMPLETO:

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

---

## ✅ DEPOIS DE EXECUTAR:

```
1. Voltar ao sistema
2. Clicar "Já Executei o SQL - Testar Conexão"
3. Ver mensagem de sucesso
4. Fazer login: admin / admin123
5. USAR O SISTEMA! 🎉
```

---

## 🎊 ESTÁ TUDO PRONTO!

```
✅ SQL corrigido
✅ Nomes únicos nas políticas
✅ Pronto para executar
✅ Vai funcionar agora!
```

---

**🚀 F5 → COPIAR SQL → EXECUTAR → PRONTO!**
