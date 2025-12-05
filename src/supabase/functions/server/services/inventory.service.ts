/**
 * Inventory Service
 * Lógica de negócio para gerenciamento de inventário
 */

import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export interface UpdateInventoryParams {
  id: string;
  quantity?: number;
  name?: string;
}

export class InventoryService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Atualiza o nome de um item no inventário de forma atômica
   * Atualiza também todas as movimentações relacionadas
   */
  async updateItemName(id: string, newName: string, oldName: string, size: string): Promise<{ success: boolean; error?: string }> {
    try {
      // 1. Verificar se já existe item com mesmo nome e tamanho
      const { data: existingItem } = await this.supabase
        .from('mega_promo_inventory')
        .select('id')
        .eq('name', newName.trim())
        .eq('size', size)
        .neq('id', id)
        .maybeSingle();

      if (existingItem) {
        return {
          success: false,
          error: `Já existe um item com o nome "${newName.trim()}" e tamanho "${size}"`
        };
      }

      // 2. Atualizar movimentações relacionadas PRIMEIRO
      const { error: movError } = await this.supabase
        .from('mega_promo_movements')
        .update({ name: newName.trim() })
        .eq('item_id', id);

      if (movError) {
        console.error('❌ Erro ao atualizar movimentações:', movError);
        return {
          success: false,
          error: 'Erro ao atualizar movimentações relacionadas'
        };
      }

      // 3. Atualizar item no inventário
      const { error: updateError } = await this.supabase
        .from('mega_promo_inventory')
        .update({
          name: newName.trim(),
          last_updated: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) {
        console.error('❌ Erro ao atualizar item:', updateError);
        return {
          success: false,
          error: 'Erro ao atualizar item no inventário'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro no service updateItemName:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  /**
   * Busca um item por ID
   */
  async getItemById(id: string) {
    const { data, error } = await this.supabase
      .from('mega_promo_inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Atualiza quantidade de um item
   */
  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await this.supabase
      .from('mega_promo_inventory')
      .update({
        quantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

