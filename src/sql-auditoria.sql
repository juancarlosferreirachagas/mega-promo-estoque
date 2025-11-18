-- ============================================
-- TABELA DE AUDITORIA - MEGA PROMO
-- ============================================
-- Execute este SQL no Supabase:
-- https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql
-- ============================================

-- Criar tabela de auditoria de movimentações
CREATE TABLE IF NOT EXISTS mega_promo_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL, -- 'created', 'edited', 'deleted'
  changed_by VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  old_data JSONB,
  new_data JSONB,
  FOREIGN KEY (movement_id) REFERENCES mega_promo_movements(id) ON DELETE CASCADE
);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_audit_movement_id ON mega_promo_audit_log(movement_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON mega_promo_audit_log(changed_at DESC);

-- Verificar se foi criado com sucesso
SELECT 'Tabela de auditoria criada com sucesso!' AS status;
