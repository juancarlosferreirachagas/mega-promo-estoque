# ⚡ EXECUTE ISTO AGORA!

## 🚀 **1 COMANDO = SISTEMA NO AR**

---

## ✅ **JÁ ESTÁ CONECTADO AO SUPABASE!**

Falta apenas fazer o deploy.

---

## 📋 **EXECUTE:**

### **Windows:**
Dê **duplo clique** no arquivo: **`colocar-no-ar.bat`**

### **Mac/Linux:**
Abra o **Terminal** nesta pasta e execute:
```bash
chmod +x colocar-no-ar.sh && ./colocar-no-ar.sh
```

### **Qualquer Sistema (via NPM):**
Abra o **Terminal/PowerShell** nesta pasta e execute:
```bash
npm run publicar
```

---

## ⏱️ **EM 2 MINUTOS:**

1. ⏳ Instala dependências (30s)
2. ⏳ Instala Vercel CLI (20s)
3. ⏳ Faz deploy (1min)
4. ✅ **SISTEMA NO AR!**

---

## 🗄️ **ÚLTIMO PASSO:**

Depois do deploy, você precisa criar a tabela de auditoria **apenas 1 vez**.

**Escolha uma opção:**

### **Opção A: Automático (1 clique)**
1. A URL do sistema vai aparecer no terminal
2. Acesse a URL e adicione `/setup-database.html` no final
3. Clique no botão
4. Aguarde 10 segundos

### **Opção B: Manual (30 segundos)**
1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new
2. Cole o SQL abaixo e clique em **"Run"**:

```sql
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

ALTER TABLE public.mega_promo_audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow service role audit" ON public.mega_promo_audit_log;
CREATE POLICY "Allow service role audit" ON public.mega_promo_audit_log FOR ALL USING (true);
NOTIFY pgrst, 'reload schema';
```

---

## 🎉 **PRONTO!**

**Login:**
- Usuário: `admin`
- Senha: `admin123`

---

## 🔄 **ATUALIZAÇÕES:**

Depois de fazer alterações, execute:
```bash
npm run deploy
```

✅ **Atualizado em 30 segundos!**
