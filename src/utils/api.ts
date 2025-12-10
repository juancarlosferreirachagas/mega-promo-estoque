import { API_URL, getHeaders } from './supabase/client';
import { InventoryItem, Movement } from '../AppWithSupabase';

export interface User {
  id: string;
  username: string;
  permissions: {
    canAddItem?: boolean;
    canRegisterMovement?: boolean;
    canEditMovement?: boolean;
    canDeleteMovement?: boolean;
  };
  is_master: boolean;
  created_at: string;
}

// ============================================
// INICIALIZAÇÃO
// ============================================

export const initDatabase = async () => {
  try {
    const response = await fetch(`${API_URL}/init-database`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao inicializar banco:', error);
    throw error;
  }
};

// ============================================
// USUÁRIOS
// ============================================

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    console.log('📥 Resposta do servidor (getUsers):', {
      status: response.status,
      ok: response.ok,
      data: data
    });
    
    // Se retornou código PGRST205, tabelas não existem
    if (data.code === 'PGRST205') {
      console.log('🔍 Detectado PGRST205 - Tabelas não existem');
      const error: any = new Error(data.error || 'Tabelas não encontradas');
      error.code = 'PGRST205';
      error.tableNotFound = true;
      throw error;
    }
    
    // Se retornou outro erro, lançar exceção
    if (!response.ok || data.error) {
      throw new Error(data.error || 'Erro ao buscar usuários');
    }
    
    return data.users || [];
  } catch (error: any) {
    console.error('Erro ao buscar usuários:', error);
    // Re-lançar para o componente tratar
    throw error;
  }
};

export const createUser = async (username: string, password: string, permissions: any, isMaster: boolean = false): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password, permissions, isMaster }),
    });
    
    const data = await response.json();
    return data.success ? data.user : null;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
};

export const updateUser = async (id: string, password?: string, permissions?: any, username?: string): Promise<User | null> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ password, permissions, username }),
    });
    
    const data = await response.json();
    
    // Se o backend retornou erro, lançar exceção com a mensagem
    if (!data.success) {
      throw new Error(data.error || 'Erro ao atualizar usuário');
    }
    
    return data.user;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error; // Re-lançar o erro para o componente tratar
  }
};

// Função para corrigir usuários master (apenas Giovana)
export const fixMasterUsers = async (): Promise<{ success: boolean; message?: string; error?: string; masters?: any[] }> => {
  try {
    const response = await fetch(`${API_URL}/users/fix-master`, {
      method: 'POST',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao corrigir usuários master:', error);
    return { success: false, error: 'Erro ao corrigir usuários master' };
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return false;
  }
};

export const login = async (username: string, password: string): Promise<User | null> => {
  try {
    console.log('🔐 [Frontend] Tentando login:', { username, passwordLength: password.length });
    
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    console.log('📥 [Frontend] Resposta do servidor:', {
      status: response.status,
      success: data.success,
      hasUser: !!data.user,
      error: data.error
    });
    
    if (data.success && data.user) {
      console.log('✅ [Frontend] Login bem-sucedido!');
      return data.user;
    } else {
      console.log('❌ [Frontend] Login falhou:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ [Frontend] Erro ao fazer login:', error);
    return null;
  }
};

// ============================================
// ESTOQUE
// ============================================

export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    // Converter formato do banco para formato do app
    return (data.inventory || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      size: item.size,
      quantity: item.quantity,
      lastUpdated: new Date(item.last_updated).getTime(),
    }));
  } catch (error) {
    console.error('Erro ao buscar estoque:', error);
    return [];
  }
};

export const createInventoryItem = async (name: string, size: string, quantity: number): Promise<InventoryItem | null> => {
  try {
    const response = await fetch(`${API_URL}/inventory`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, size, quantity }),
    });
    
    const data = await response.json();
    
    if (data.success && data.item) {
      return {
        id: data.item.id,
        name: data.item.name,
        size: data.item.size,
        quantity: data.item.quantity,
        lastUpdated: new Date(data.item.last_updated).getTime(),
      };
    }
    
    // Se retornou erro, lançar exceção com a mensagem do servidor
    if (data.error) {
      const error: any = new Error(data.error);
      error.code = data.code;
      error.details = data.details;
      throw error;
    }
    
    return null;
  } catch (error: any) {
    // Não logar erros de duplicata (código 23505) - são esperados
    if (error.code !== '23505' && !error.message?.includes('duplicate key')) {
      console.error('Erro ao criar item:', error);
    }
    throw error; // Re-lançar para o componente tratar
  }
};

export const updateInventoryItem = async (
  id: string, 
  updates: { quantity?: number; name?: string }
): Promise<InventoryItem | null> => {
  try {
    console.log('📤 [API] Atualizando item:', { id, updates });
    
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    
    console.log('📥 [API] Status da resposta:', response.status);
    
    const data = await response.json();
    console.log('📥 [API] Dados recebidos:', data);
    
    if (data.success && data.item) {
      // IMPORTANTE: Se estamos atualizando o nome, garantir que o nome retornado seja o esperado
      // Isso evita problemas de cache do Supabase
      let returnedName = data.item.name;
      if (updates.name && data.item.name !== updates.name.trim()) {
        console.warn('⚠️ [API] Nome retornado não corresponde ao enviado, usando o nome esperado:', {
          enviado: updates.name.trim(),
          retornado: data.item.name
        });
        returnedName = updates.name.trim();
      }
      
      const result = {
        id: data.item.id,
        name: returnedName,
        size: data.item.size,
        quantity: data.item.quantity,
        lastUpdated: new Date(data.item.last_updated).getTime(),
      };
      
      console.log('✅ [API] Item atualizado:', result);
      return result;
    }
    
    if (data.error) {
      console.error('❌ [API] Erro do servidor:', data.error);
      throw new Error(data.error);
    }
    
    console.warn('⚠️ [API] Resposta sem sucesso nem erro');
    return null;
  } catch (error) {
    console.error('❌ [API] Erro ao atualizar item:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<{ success: boolean; deletedMovements?: number }> => {
  try {
    const response = await fetch(`${API_URL}/inventory/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        deletedMovements: data.deletedMovements || 0
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Erro ao deletar item:', error);
    return { success: false };
  }
};

// ============================================
// MOVIMENTAÇÕES
// ============================================

export const getMovements = async (): Promise<Movement[]> => {
  try {
    const response = await fetch(`${API_URL}/movements`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    // Converter formato do banco para formato do app
    return (data.movements || []).map((mov: any) => ({
      id: mov.id,
      itemId: mov.item_id,
      name: mov.name,
      size: mov.size,
      type: mov.type,
      quantity: mov.quantity,
      reason: mov.reason,
      personName: mov.person_name,
      responsible: mov.responsible,
      observations: mov.observations || '',
      timestamp: new Date(mov.timestamp).getTime(),
      createdBy: mov.created_by,
      editedBy: mov.edited_by,
      editedAt: mov.edited_at ? new Date(mov.edited_at).getTime() : undefined,
    }));
  } catch (error) {
    console.error('Erro ao buscar movimentações:', error);
    return [];
  }
};

export const createMovement = async (movement: {
  itemId: string;
  name: string;
  size: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  personName: string;
  responsible: string;
  observations?: string;
  createdBy: string;
}): Promise<{ success: boolean; movement?: Movement; newQuantity?: number; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/movements`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(movement),
    });
    
    const data = await response.json();
    
    if (data.success && data.movement) {
      return {
        success: true,
        movement: {
          id: data.movement.id,
          itemId: data.movement.item_id,
          name: data.movement.name,
          size: data.movement.size,
          type: data.movement.type,
          quantity: data.movement.quantity,
          reason: data.movement.reason,
          personName: data.movement.person_name,
          responsible: data.movement.responsible,
          observations: data.movement.observations || '',
          timestamp: new Date(data.movement.timestamp).getTime(),
          createdBy: data.movement.created_by,
        },
        newQuantity: data.newQuantity,
      };
    }
    
    return { success: false, error: data.error || 'Erro ao criar movimentação' };
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return { success: false, error: 'Erro ao criar movimentação' };
  }
};

export const updateMovement = async (
  id: string,
  updates: {
    type: 'entrada' | 'saida';
    quantity: number;
    reason: string;
    personName: string;
    responsible: string;
    observations?: string;
    editedBy?: string;
    name?: string;
    size?: string;
  }
): Promise<{ success: boolean; movement?: Movement; newQuantity?: number; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/movements/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (data.success && data.movement) {
      return {
        success: true,
        movement: {
          id: data.movement.id,
          itemId: data.movement.item_id,
          name: data.movement.name,
          size: data.movement.size,
          type: data.movement.type,
          quantity: data.movement.quantity,
          reason: data.movement.reason,
          personName: data.movement.person_name,
          responsible: data.movement.responsible,
          observations: data.movement.observations || '',
          timestamp: new Date(data.movement.timestamp).getTime(),
          createdBy: data.movement.created_by,
          editedBy: data.movement.edited_by,
          editedAt: data.movement.edited_at ? new Date(data.movement.edited_at).getTime() : undefined,
        },
        newQuantity: data.newQuantity,
      };
    }
    
    return { success: false, error: data.error || 'Erro ao atualizar movimentação' };
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    return { success: false, error: 'Erro ao atualizar movimentação' };
  }
};

export const deleteMovement = async (id: string): Promise<{ success: boolean; newQuantity?: number; error?: string }> => {
  try {
    const response = await fetch(`${API_URL}/movements/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao deletar movimentação:', error);
    return { success: false, error: 'Erro ao deletar movimentação' };
  }
};

// Buscar histórico de auditoria de uma movimentação
export const getMovementAuditLog = async (movementId: string): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/movements/${movementId}/audit-log`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    // Se a tabela não existe, retornar array vazio
    if (!data.success && data.error && data.error.includes('Could not find the table')) {
      console.warn('⚠️ Tabela de auditoria ainda não foi criada. Execute o SQL de migração.');
      return [];
    }
    
    return data.logs || [];
  } catch (error) {
    console.error('Erro ao buscar histórico de auditoria:', error);
    return [];
  }
};

// Buscar TODOS os logs de auditoria (para admin visualizar histórico completo)
export const getAllAuditLogs = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_URL}/audit-logs/all`, {
      method: 'GET',
      headers: getHeaders(),
    });
    
    const data = await response.json();
    
    console.log('📥 Resposta do servidor (getAllAuditLogs):', {
      success: data.success,
      logsCount: data.logs?.length || 0,
      needsSetup: data.needsSetup
    });
    
    // Se a tabela não existe, retornar array vazio
    if (!data.success && data.needsSetup) {
      console.warn('⚠️ Tabela de auditoria ainda não foi criada.');
      return [];
    }
    
    return data.logs || [];
  } catch (error) {
    console.error('Erro ao buscar todos os logs de auditoria:', error);
    return [];
  }
};