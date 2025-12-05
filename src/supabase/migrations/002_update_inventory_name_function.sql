-- Função para atualizar nome do inventário de forma garantida
CREATE OR REPLACE FUNCTION update_inventory_name(
  p_id UUID,
  p_name TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.mega_promo_inventory
  SET name = p_name,
      last_updated = NOW()
  WHERE id = p_id;
  
  -- Atualizar movimentações relacionadas
  UPDATE public.mega_promo_movements
  SET name = p_name
  WHERE item_id = p_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a função pode ser executada
GRANT EXECUTE ON FUNCTION update_inventory_name(UUID, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION update_inventory_name(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_inventory_name(UUID, TEXT) TO anon;

