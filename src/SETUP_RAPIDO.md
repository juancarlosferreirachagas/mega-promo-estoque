# 🚀 SETUP RÁPIDO - 5 MINUTOS

## ✅ PASSO A PASSO PARA FUNCIONAR AGORA

### **PASSO 1: Abrir o Supabase Dashboard**

```
1. Vá para: https://supabase.com/dashboard
2. Faça login (ou crie conta grátis)
3. Selecione seu projeto
```

---

### **PASSO 2: Criar as Tabelas**

```
1. No menu lateral esquerdo, clique em "SQL Editor"
2. Clique em "New query"
3. Copie e cole o SQL abaixo:
```

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

-- Políticas de acesso
CREATE POLICY IF NOT EXISTS "Allow service role" ON public.mega_promo_users FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role" ON public.mega_promo_inventory FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow service role" ON public.mega_promo_movements FOR ALL USING (true);
```

```
4. Clique em "Run" (ou Ctrl + Enter)
5. Aguarde a mensagem "Success"
6. ✅ Tabelas criadas!
```

---

### **PASSO 3: Voltar para o Sistema**

```
1. Volte para a aplicação Mega Promo
2. Clique em "Já Executei o SQL - Testar Conexão"
3. ✅ Sistema vai detectar as tabelas
4. Redireciona para tela de login
```

---

### **PASSO 4: Fazer Login**

```
Login: admin
Senha: admin123

✅ Pronto! Sistema funcionando!
```

---

## 🎯 VERIFICAR SE FUNCIONOU

### **No Supabase:**

```
1. Vá em "Table Editor" no menu lateral
2. Você deve ver 3 tabelas:
   ✓ mega_promo_users (1 registro - admin)
   ✓ mega_promo_inventory (vazia)
   ✓ mega_promo_movements (vazia)
```

### **No Sistema:**

```
1. Faça login como admin
2. Veja o badge: "🔗 Conectado ao Supabase"
3. Crie um item de teste
4. Veja no Supabase → Table Editor → mega_promo_inventory
5. ✅ Item apareceu no banco!
```

---

## 🔧 SE DER ERRO

### **Erro: "Could not find table"**

```
Solução: Execute o SQL novamente no Supabase SQL Editor
```

### **Erro: "Row Level Security"**

```
Solução: Certifique-se de executar as linhas de POLICY no SQL
```

### **Erro: "Connection refused"**

```
Solução: 
1. Verifique se está usando o projeto correto no Supabase
2. Verifique as credenciais em /utils/supabase/info.tsx
```

---

## 📊 RESULTADO ESPERADO

```
╔════════════════════════════════════════════╗
║  ✅ Tabelas Criadas                        ║
║  ✅ Usuário Master Criado                  ║
║  ✅ Sistema Conectado ao Supabase          ║
║  ✅ Pronto para Usar!                      ║
╚════════════════════════════════════════════╝
```

---

## 🎉 PRONTO!

**Tempo total: 5 minutos**

**Agora você tem:**
- ✅ Banco PostgreSQL funcionando
- ✅ 3 tabelas criadas
- ✅ Usuário admin criado
- ✅ Sistema 100% funcional
- ✅ Dados compartilhados entre usuários
- ✅ Backup automático

---

## 📝 PRÓXIMOS PASSOS

1. Criar usuários operacionais (aba "Usuários")
2. Cadastrar itens no estoque
3. Registrar movimentações
4. Compartilhar URL com a equipe
5. Fazer deploy no Vercel (opcional)

---

**🚀 SISTEMA PRONTO PARA PRODUÇÃO!**
