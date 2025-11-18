# ⚡ DEPLOY 100% AUTOMÁTICO - 1 COMANDO SÓ!

## 🎯 **MÉTODO MAIS RÁPIDO POSSÍVEL**

---

## ✅ **WINDOWS (1 comando):**

1. **Baixe o projeto** (Export no Figma Make)
2. **Extraia** o ZIP
3. **Clique com botão direito** na pasta
4. **Abra o Terminal** (ou PowerShell)
5. **Execute:**

```bash
npm run deploy:setup
```

✅ **PRONTO! Sistema no ar em 1 minuto!**

---

## ✅ **MAC/LINUX (1 comando):**

1. **Baixe o projeto** (Export no Figma Make)
2. **Extraia** o ZIP
3. **Abra o Terminal** na pasta
4. **Execute:**

```bash
chmod +x deploy.sh && ./deploy.sh
```

OU simplesmente:

```bash
npm run deploy:setup
```

✅ **PRONTO! Sistema no ar em 1 minuto!**

---

## 🔄 **PARA ATUALIZAR (ainda mais fácil):**

Quando eu fizer alterações aqui:

1. **Baixe novamente** o projeto
2. **Execute na pasta:**

```bash
npm run deploy
```

✅ **Atualização automática em 30 segundos!**

---

## 🤖 **O QUE O SCRIPT FAZ AUTOMATICAMENTE:**

1. ✅ Instala a Vercel CLI (se não tiver)
2. ✅ Faz login na Vercel (primeira vez só)
3. ✅ Cria o projeto automaticamente
4. ✅ Configura tudo sozinho
5. ✅ Faz o deploy em produção
6. ✅ Te dá a URL do sistema

**ZERO configuração manual!** 🎉

---

## 📋 **ÚNICA COISA QUE PRECISA FAZER 1 VEZ:**

Depois do primeiro deploy, execute o SQL no Supabase:

1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new

2. Cole e execute:

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

## 🎉 **FLUXO COMPLETO:**

### **Primeira vez:**
```bash
npm run deploy:setup
```
→ 1 minuto → Sistema no ar! 🚀

### **Atualizações:**
```bash
npm run deploy
```
→ 30 segundos → Atualizado! ✅

---

## 💡 **DICA PRO:**

Crie um atalho do tipo:
- **Windows:** `deploy.bat`
- **Mac/Linux:** `deploy.sh`

**Duplo clique = deploy automático!** 🎯

---

## ✨ **VANTAGENS:**

✅ **1 comando só** - não pode ser mais simples  
✅ **Zero configuração** - tudo automático  
✅ **Atualizações em 30s** - npm run deploy  
✅ **Funciona em qualquer OS** - Windows, Mac, Linux  
✅ **Grátis** - plano free da Vercel  
✅ **HTTPS automático** - SSL grátis  
✅ **CDN global** - super rápido  

---

## 🆘 **PROBLEMAS?**

Se der erro, me avise aqui que resolvo na hora! 🚀
