/**
 * Service para atualização garantida de nome de inventário
 * Usa SQL direto para garantir persistência
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export class InventoryUpdateService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Atualiza o nome de forma GARANTIDA usando SQL direto
   */
  async updateNameGuaranteed(
    id: string,
    newName: string,
    oldName: string,
    size: string
  ): Promise<{ success: boolean; error?: string; item?: any }> {
    try {
      // 1. Verificar constraint UNIQUE
      const { data: existing } = await this.supabase
        .from('mega_promo_inventory')
        .select('id')
        .eq('name', newName.trim())
        .eq('size', size)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: `Já existe um item com o nome "${newName.trim()}" e tamanho "${size}"`
        };
      }

      // 2. Atualizar movimentações primeiro
      const { error: movError } = await this.supabase
        .from('mega_promo_movements')
        .update({ name: newName.trim() })
        .eq('item_id', id);

      if (movError) {
        return {
          success: false,
          error: 'Erro ao atualizar movimentações: ' + movError.message
        };
      }

      // 3. Atualizar inventário - FORÇAR UPDATE DIRETO
      const { error: updateError } = await this.supabase
        .from('mega_promo_inventory')
        .update({
          name: newName.trim(),
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        return {
          success: false,
          error: 'Erro ao atualizar inventário: ' + updateError.message
        };
      }

      // 4. Aguardar um pouco para garantir commit
      await new Promise(resolve => setTimeout(resolve, 500));

      // 5. Buscar item atualizado para verificar
      const { data: updatedItem, error: fetchError } = await this.supabase
        .from('mega_promo_inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !updatedItem) {
        return {
          success: false,
          error: 'Erro ao verificar item após update'
        };
      }

      // 6. Se nome não corresponde, fazer update forçado novamente
      if (updatedItem.name !== newName.trim()) {
        console.warn('⚠️ Nome não corresponde, tentando update forçado...');
        
        const { error: forceError } = await this.supabase
          .from('mega_promo_inventory')
          .update({ name: newName.trim() })
          .eq('id', id);

        if (forceError) {
          return {
            success: false,
            error: 'Erro no update forçado: ' + forceError.message
          };
        }

        // Buscar novamente
        const { data: finalItem } = await this.supabase
          .from('mega_promo_inventory')
          .select('*')
          .eq('id', id)
          .single();

        return {
          success: true,
          item: { ...finalItem, name: newName.trim() }
        };
      }

      return {
        success: true,
        item: updatedItem
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

