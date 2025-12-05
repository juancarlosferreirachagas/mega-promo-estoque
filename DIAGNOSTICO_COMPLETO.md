# 🔍 DIAGNÓSTICO COMPLETO - UPDATE DE NOME NÃO PERSISTE

## ❌ PROBLEMA

O nome muda na tela mas não persiste no banco. Ao recarregar, volta ao valor antigo.

## 🔎 POSSÍVEIS CAUSAS

1. **Constraint UNIQUE bloqueando**: Se já existe item com mesmo nome+tamanho
2. **UPDATE não sendo commitado**: Transação não está sendo finalizada
3. **Cache do Supabase**: Retornando dados em cache
4. **Edge Function desatualizada**: Código novo não foi deployado
5. **RLS bloqueando**: Row Level Security impedindo update

## ✅ SOLUÇÕES TESTADAS

- ✅ Update direto
- ✅ Verificação pós-update
- ✅ Retry automático
- ✅ Refresh forçado
- ⏳ SQL direto (próximo)

## 🚀 PRÓXIMA AÇÃO

Vou implementar SQL direto usando a função RPC que já existe no banco.

