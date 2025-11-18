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

-- Comentários nas tabelas
COMMENT ON TABLE public.mega_promo_users IS 'Usuários do sistema Mega Promo';
COMMENT ON TABLE public.mega_promo_inventory IS 'Estoque de itens da Mega Promo';
COMMENT ON TABLE public.mega_promo_movements IS 'Histórico de movimentações de estoque';

-- MIGRATION COMPLETA!