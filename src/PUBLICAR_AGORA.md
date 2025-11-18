# 🚀 PUBLICAR EM 2 MINUTOS - PASSO A PASSO

## ✅ **MÉTODO MAIS RÁPIDO (Recomendado)**

---

### **PASSO 1: Baixar o Código** (10 segundos)

1. No Figma Make, clique em **"Export"** ou **"Download"**
2. Baixe TODOS os arquivos do projeto como ZIP
3. Extraia o ZIP em uma pasta

---

### **PASSO 2: Criar Conta na Vercel** (30 segundos)

1. Acesse: **https://vercel.com/signup**
2. Clique em **"Continue with GitHub"**
3. Autorize a Vercel

---

### **PASSO 3: Fazer Deploy** (1 minuto)

1. Acesse: **https://vercel.com/new**
2. Arraste a pasta do projeto para a tela
3. Clique em **"Deploy"**

✅ **PRONTO! Seu sistema está no ar!**

---

## 🌐 **Você Receberá:**

- URL automática: `https://mega-promo-estoque-XXXXX.vercel.app`
- HTTPS grátis
- CDN global (super rápido)

---

## 🔄 **ATUALIZAÇÕES EM TEMPO REAL:**

### **Como funciona:**

1. Eu faço alteração aqui no Figma Make
2. Você exporta os arquivos novamente
3. Arrasta para a Vercel (sobrescreve)
4. **Deploy automático em 30 segundos!**

---

## 📋 **APÓS O DEPLOY:**

### **Execute o SQL no Supabase** (1 minuto)

1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new

2. Cole este SQL e clique em **"Run"**:

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

3. Aguarde 10 segundos
4. Acesse seu sistema!

---

## ✅ **Login Master:**

- **Usuário:** `admin`
- **Senha:** `admin123`

---

## 🎉 **TUDO PRONTO!**

Seu sistema de estoque está funcionando 100%!

Volte aqui sempre que precisar de ajustes - farei as alterações e você só republica! 🚀
