-- Script simples para garantir que apenas Giovana seja master
-- Execute este SQL diretamente no painel do Supabase (SQL Editor)

-- 1. Remover status master de todos os usuários
UPDATE public.mega_promo_users 
SET is_master = false;

-- 2. Definir apenas Giovana como master (case-insensitive)
UPDATE public.mega_promo_users 
SET is_master = true 
WHERE LOWER(TRIM(username)) = 'giovana';

-- Verificar o resultado:
SELECT id, username, is_master 
FROM public.mega_promo_users 
ORDER BY is_master DESC, username;

