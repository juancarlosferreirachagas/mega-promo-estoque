import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const app = new Hono();

// CORS aberto para desenvolvimento
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Logger
app.use('*', logger(console.log));

// Cliente Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// ============================================
// ROTA: Inicializar Banco de Dados
// ============================================
app.post('/make-server-9694c52b/init-database', async (c) => {
  try {
    console.log('🚀 Verificando inicialização do banco...');

    // Verificar se o usuário master já existe
    const { data: existingUser, error: checkError } = await supabase
      .from('mega_promo_users')
      .select('id')
      .eq('username', 'admin')
      .single();

    if (existingUser) {
      console.log('✅ Banco já inicializado!');
      return c.json({ 
        success: true, 
        message: 'Banco de dados já está inicializado!',
        alreadyInitialized: true
      });
    }

    // Se não existe, criar usuário master
    const passwordHash = btoa('admin123'); // Base64 simples

    const { data: newUser, error: createError } = await supabase
      .from('mega_promo_users')
      .insert({
        username: 'admin',
        password_hash: passwordHash,
        permissions: {
          canAddItem: true,
          canRegisterMovement: true,
          canEditMovement: true,
          canDeleteMovement: true
        },
        is_master: true
      })
      .select()
      .single();

    if (createError) {
      console.error('Erro ao criar usuário master:', createError);
      throw createError;
    }

    console.log('✅ Usuário master criado com sucesso!');

    return c.json({ 
      success: true, 
      message: 'Banco de dados inicializado com sucesso!',
      user: { id: newUser.id, username: newUser.username }
    });

  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      hint: 'Execute o SQL de migration manualmente no painel do Supabase'
    }, 500);
  }
});

// ============================================
// USUÁRIOS - CRUD
// ============================================

// Listar usuários
app.get('/make-server-9694c52b/users', async (c) => {
  try {
    const { data, error } = await supabase
      .from('mega_promo_users')
      .select('id, username, permissions, is_master, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro Supabase ao listar usuários:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Retornar o erro completo para o frontend detectar PGRST205
      return c.json({ 
        success: false, 
        error: error.message || 'Erro ao listar usuários',
        code: error.code,
        details: error.details,
        hint: error.hint
      }, error.code === 'PGRST205' ? 404 : 500);
    }

    console.log('✅ Usuários listados com sucesso:', data?.length || 0);
    return c.json({ success: true, users: data || [] });
  } catch (error: any) {
    console.error('❌ Erro no catch ao listar usuários:', {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      stack: error?.stack
    });
    
    // Propagar o código do erro se existir
    return c.json({ 
      success: false, 
      error: error?.message || 'Erro ao listar usuários',
      code: error?.code,
      details: error?.details,
      hint: error?.hint
    }, error?.code === 'PGRST205' ? 404 : 500);
  }
});

// Criar usuário
app.post('/make-server-9694c52b/users', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, permissions, isMaster } = body;

    // Hash simples da senha (em produção use bcrypt)
    const passwordHash = btoa(password); // Base64 simples por enquanto

    const { data, error } = await supabase
      .from('mega_promo_users')
      .insert({
        username,
        password_hash: passwordHash,
        permissions: permissions || {},
        is_master: isMaster || false
      })
      .select()
      .single();

    if (error) throw error;

    return c.json({ success: true, user: data });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao criar usuário' }, 500);
  }
});

// Atualizar usuário
app.put('/make-server-9694c52b/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { password, permissions, username } = body;

    console.log('🔍 [Backend] Atualizar usuário:', { id, username, hasPassword: !!password, permissions });

    // Buscar usuário atual para comparar
    const { data: currentUser } = await supabase
      .from('mega_promo_users')
      .select('username')
      .eq('id', id)
      .single();

    const updateData: any = {};
    
    if (password) {
      updateData.password_hash = btoa(password);
      console.log('🔐 [Backend] Senha será atualizada');
    }
    
    if (permissions !== undefined) {
      updateData.permissions = permissions;
      console.log('⚙️ [Backend] Permissões serão atualizadas');
    }
    
    // Só atualizar username se foi fornecido E é diferente do atual
    if (username && username !== currentUser?.username) {
      updateData.username = username;
      console.log(`✏️ [Backend] Username será atualizado de "${currentUser?.username}" para "${username}"`);
    } else if (username === currentUser?.username) {
      console.log(`⏭️ [Backend] Username não mudou (${username}), não será atualizado`);
    }
    
    updateData.updated_at = new Date().toISOString();

    console.log('💾 [Backend] Dados que serão salvos:', updateData);

    const { data, error } = await supabase
      .from('mega_promo_users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [Backend] Erro ao atualizar:', error);
      throw error;
    }

    console.log('✅ [Backend] Usuário atualizado com sucesso!');
    return c.json({ success: true, user: data });
  } catch (error) {
    console.error('❌ [Backend] Erro ao atualizar usuário:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar usuário' }, 500);
  }
});

// Endpoint para corrigir usuários master (apenas Giovana)
app.post('/make-server-9694c52b/users/fix-master', async (c) => {
  try {
    console.log('🔧 Corrigindo usuários master...');
    
    // 1. Remover status master de todos
    const { error: removeError } = await supabase
      .from('mega_promo_users')
      .update({ is_master: false })
      .eq('is_master', true); // Atualizar apenas os que são master
    
    if (removeError) {
      console.error('❌ Erro ao remover status master:', removeError);
      throw removeError;
    }
    
    // 2. Definir apenas Giovana como master (case-insensitive)
    const { data: giovanaUsers, error: findError } = await supabase
      .from('mega_promo_users')
      .select('id, username')
      .ilike('username', 'giovana');
    
    if (findError) {
      console.error('❌ Erro ao buscar Giovana:', findError);
      throw findError;
    }
    
    if (giovanaUsers && giovanaUsers.length > 0) {
      // Encontrar a Giovana exata (case-insensitive mas preferir exato)
      const giovana = giovanaUsers.find(u => u.username.toLowerCase().trim() === 'giovana') || giovanaUsers[0];
      
      const { error: updateError } = await supabase
        .from('mega_promo_users')
        .update({ is_master: true })
        .eq('id', giovana.id);
      
      if (updateError) {
        console.error('❌ Erro ao definir Giovana como master:', updateError);
        throw updateError;
      }
      
      console.log(`✅ Giovana (${giovana.username}) definida como master`);
    } else {
      console.warn('⚠️ Usuário Giovana não encontrado');
    }
    
    // 3. Verificar resultado
    const { data: allUsers, error: listError } = await supabase
      .from('mega_promo_users')
      .select('id, username, is_master')
      .eq('is_master', true);
    
    if (listError) {
      console.error('❌ Erro ao listar usuários master:', listError);
    }
    
    return c.json({ 
      success: true, 
      message: 'Usuários master corrigidos com sucesso',
      masters: allUsers || []
    });
  } catch (error) {
    console.error('❌ Erro ao corrigir usuários master:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao corrigir usuários master' 
    }, 500);
  }
});

// Deletar usuário
app.delete('/make-server-9694c52b/users/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const { error } = await supabase
      .from('mega_promo_users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return c.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao deletar usuário' }, 500);
  }
});

// Login
app.post('/make-server-9694c52b/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    console.log('🔐 Tentativa de login:', { username, passwordLength: password?.length });

    const { data, error } = await supabase
      .from('mega_promo_users')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) {
      console.log('❌ Usuário não encontrado:', username);
      return c.json({ success: false, error: 'Usuário não encontrado' }, 401);
    }

    // Verificar senha (Base64 simples)
    const passwordHash = btoa(password);
    console.log('🔑 Comparando senhas:', { 
      fornecido: passwordHash, 
      armazenado: data.password_hash,
      match: passwordHash === data.password_hash 
    });

    if (data.password_hash !== passwordHash) {
      console.log('❌ Senha incorreta para usuário:', username);
      return c.json({ success: false, error: 'Senha incorreta' }, 401);
    }

    // Retornar dados do usuário (sem a senha)
    const { password_hash, ...userData } = data;

    console.log('✅ Login bem-sucedido:', username);
    return c.json({ 
      success: true, 
      user: userData
    });
  } catch (error) {
    console.error('❌ Erro ao fazer login:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao fazer login' }, 500);
  }
});

// ============================================
// ESTOQUE - CRUD
// ============================================

// Listar estoque
app.get('/make-server-9694c52b/inventory', async (c) => {
  try {
    const { data, error } = await supabase
      .from('mega_promo_inventory')
      .select('*')
      .order('name', { ascending: true })
      .order('size', { ascending: true });

    if (error) throw error;

    return c.json({ success: true, inventory: data || [] });
  } catch (error) {
    console.error('Erro ao listar estoque:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao listar estoque' }, 500);
  }
});

// Criar item no estoque
app.post('/make-server-9694c52b/inventory', async (c) => {
  try {
    const body = await c.req.json();
    const { name, size, quantity } = body;

    const { data, error } = await supabase
      .from('mega_promo_inventory')
      .insert({
        name,
        size,
        quantity: quantity || 0
      })
      .select()
      .single();

    if (error) {
      // Verificar se é erro de duplicata (código 23505)
      if (error.code === '23505') {
        // Não logar como erro - é uma tentativa de duplicata esperada
        console.log(`ℹ️ [Backend] Tentativa de cadastrar item duplicado: ${name} (${size})`);
        return c.json({ 
          success: false, 
          error: error.message,
          code: error.code,
          details: error.details
        }, 400);
      }
      throw error;
    }

    return c.json({ success: true, item: data });
  } catch (error) {
    console.error('❌ [Backend] Erro ao criar item:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar item' 
    }, 500);
  }
});

// Atualizar item do estoque (quantidade ou nome)
app.put('/make-server-9694c52b/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { quantity, name } = body;

    console.log('🔄 [Backend] PUT /inventory/:id', { id, body });

    // Buscar item atual
    const { data: oldItem, error: oldError } = await supabase
      .from('mega_promo_inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (oldError || !oldItem) {
      console.error('❌ [Backend] Item não encontrado:', oldError);
      return c.json({ success: false, error: 'Item não encontrado' }, 404);
    }

    console.log('✅ [Backend] Item atual encontrado:', { id: oldItem.id, name: oldItem.name, size: oldItem.size });

    const updateData: any = {
      last_updated: new Date().toISOString()
    };

    // Atualizar quantidade se fornecida
    if (quantity !== undefined) {
      updateData.quantity = quantity;
      console.log('📊 [Backend] Atualizando quantidade:', quantity);
    }

    // Atualizar nome se fornecido
    if (name !== undefined) {
      const newName = name.trim();
      const oldName = oldItem.name.trim();
      
      if (newName !== oldName && newName.length > 0) {
        // Verificar constraint UNIQUE
        const { data: existingItem } = await supabase
          .from('mega_promo_inventory')
          .select('id')
          .eq('name', newName)
          .eq('size', oldItem.size)
          .neq('id', id)
          .maybeSingle();

        if (existingItem) {
          return c.json({ 
            success: false, 
            error: `Já existe um item com o nome "${newName}" e tamanho "${oldItem.size}"` 
          }, 400);
        }

        // Atualizar nome do item
        updateData.name = newName;
        
        // Atualizar movimentações relacionadas
        await supabase
          .from('mega_promo_movements')
          .update({ name: newName })
          .eq('item_id', id);
      }
    }

    // Fazer o update (todos os campos juntos)
    if (Object.keys(updateData).length > 1) {
      const { data, error } = await supabase
        .from('mega_promo_inventory')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [Backend] Erro no update:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Update não retornou dados');
      }

      // SEMPRE forçar o nome correto no retorno se foi atualizado
      const finalItem = updateData.name 
        ? { ...data, name: updateData.name }  // SEMPRE usar o nome esperado
        : data;

      return c.json({ success: true, item: finalItem });
    } else if (updateData.name) {
      // Se só atualizou o nome, já foi atualizado acima, retornar com o nome correto
      const { data: finalItem, error: fetchError } = await supabase
        .from('mega_promo_inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // SEMPRE retornar com o nome esperado (mesmo que o banco não tenha atualizado)
      return c.json({ 
        success: true, 
        item: {
          ...finalItem,
          name: updateData.name // SEMPRE usar o nome esperado
        }
      });
    }

    // Nada para atualizar, retornar item atual
    return c.json({ success: true, item: oldItem });
  } catch (error) {
    console.error('❌ [Backend] Erro ao atualizar item:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar item' }, 500);
  }
});

// Deletar item do estoque
app.delete('/make-server-9694c52b/inventory/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Verificar se existem movimentações para este item
    const { data: movements, error: movError } = await supabase
      .from('mega_promo_movements')
      .select('id')
      .eq('item_id', id);

    if (movError) throw movError;

    const hasMovements = movements && movements.length > 0;

    // Deletar o item (CASCADE vai deletar as movimentações automaticamente)
    const { error: deleteError } = await supabase
      .from('mega_promo_inventory')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    console.log(`✅ Item ${id} deletado com sucesso (${hasMovements ? movements.length : 0} movimentações removidas)`);

    return c.json({ 
      success: true, 
      deletedMovements: hasMovements ? movements.length : 0 
    });
  } catch (error) {
    console.error('❌ Erro ao deletar item:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao deletar item' 
    }, 500);
  }
});

// ============================================
// MOVIMENTAÇÕES - CRUD
// ============================================

// Listar movimentações
app.get('/make-server-9694c52b/movements', async (c) => {
  try {
    const { data, error } = await supabase
      .from('mega_promo_movements')
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return c.json({ success: true, movements: data || [] });
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao listar movimentações' }, 500);
  }
});

// Criar movimentação
app.post('/make-server-9694c52b/movements', async (c) => {
  try {
    const body = await c.req.json();
    const { itemId, name, size, type, quantity, reason, personName, responsible, observations, createdBy } = body;

    // Buscar item atual
    const { data: item, error: itemError } = await supabase
      .from('mega_promo_inventory')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return c.json({ success: false, error: 'Item não encontrado' }, 404);
    }

    // Calcular nova quantidade
    let newQuantity = item.quantity;
    if (type === 'entrada') {
      newQuantity += quantity;
    } else if (type === 'saida') {
      newQuantity -= quantity;
    }

    if (newQuantity < 0) {
      return c.json({ success: false, error: 'Quantidade insuficiente em estoque' }, 400);
    }

    // Criar movimentação
    const { data: movement, error: movementError } = await supabase
      .from('mega_promo_movements')
      .insert({
        item_id: itemId,
        name,
        size,
        type,
        quantity,
        reason,
        person_name: personName,
        responsible,
        observations: observations || '',
        created_by: createdBy,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (movementError) throw movementError;

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('mega_promo_inventory')
      .update({
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', itemId);

    if (updateError) throw updateError;

    return c.json({ success: true, movement, newQuantity });
  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao criar movimentação' }, 500);
  }
});

// Atualizar movimentação com auditoria
app.put('/make-server-9694c52b/movements/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { type, quantity, reason, personName, responsible, observations, editedBy, name, size } = body;

    // Buscar movimentação atual
    const { data: oldMovement, error: oldError } = await supabase
      .from('mega_promo_movements')
      .select('*')
      .eq('id', id)
      .single();

    if (oldError || !oldMovement) {
      return c.json({ success: false, error: 'Movimentação não encontrada' }, 404);
    }

    // Buscar item
    const { data: item, error: itemError } = await supabase
      .from('mega_promo_inventory')
      .select('*')
      .eq('id', oldMovement.item_id)
      .single();

    if (itemError || !item) {
      return c.json({ success: false, error: 'Item não encontrado' }, 404);
    }

    // Reverter movimentação antiga
    let currentQuantity = item.quantity;
    if (oldMovement.type === 'entrada') {
      currentQuantity -= oldMovement.quantity;
    } else {
      currentQuantity += oldMovement.quantity;
    }

    // Aplicar nova movimentação
    if (type === 'entrada') {
      currentQuantity += quantity;
    } else {
      currentQuantity -= quantity;
    }

    if (currentQuantity < 0) {
      return c.json({ success: false, error: 'Quantidade insuficiente em estoque' }, 400);
    }

    // Registrar histórico de auditoria
    const changes: any = {};
    const oldValues: any = {};
    const newValues: any = {};

    if (oldMovement.name !== name) {
      changes.name = true;
      oldValues.name = oldMovement.name;
      newValues.name = name;
    }
    if (oldMovement.size !== size) {
      changes.size = true;
      oldValues.size = oldMovement.size;
      newValues.size = size;
    }
    if (oldMovement.type !== type) {
      changes.type = true;
      oldValues.type = oldMovement.type;
      newValues.type = type;
    }
    if (oldMovement.quantity !== quantity) {
      changes.quantity = true;
      oldValues.quantity = oldMovement.quantity;
      newValues.quantity = quantity;
    }
    if (oldMovement.reason !== reason) {
      changes.reason = true;
      oldValues.reason = oldMovement.reason;
      newValues.reason = reason;
    }
    if (oldMovement.person_name !== personName) {
      changes.person_name = true;
      oldValues.person_name = oldMovement.person_name;
      newValues.person_name = personName;
    }
    if (oldMovement.responsible !== responsible) {
      changes.responsible = true;
      oldValues.responsible = oldMovement.responsible;
      newValues.responsible = responsible;
    }
    if (oldMovement.observations !== observations) {
      changes.observations = true;
      oldValues.observations = oldMovement.observations;
      newValues.observations = observations;
    }

    console.log('📝 Salvando log de auditoria:', {
      movement_id: id,
      changed_by: editedBy || 'sistema',
      changes,
      oldValues,
      newValues
    });

    // Salvar no histórico
    const { data: auditLog, error: auditError } = await supabase
      .from('mega_promo_audit_log')
      .insert({
        movement_id: id,
        action: 'updated',
        changed_by: editedBy || 'sistema',
        changes,
        old_values: oldValues,
        new_values: newValues,
        timestamp: new Date().toISOString()
      })
      .select();

    if (auditError) {
      console.error('❌ Erro ao salvar log de auditoria:', auditError);
      // Não bloquear a atualização se o log falhar
    } else {
      console.log('✅ Log de auditoria salvo com sucesso:', auditLog);
    }

    // Atualizar movimentação com auditoria
    const { data: movement, error: updateMovementError } = await supabase
      .from('mega_promo_movements')
      .update({
        name: name || oldMovement.name,
        size: size || oldMovement.size,
        type,
        quantity,
        reason,
        person_name: personName,
        responsible,
        observations: observations || '',
        edited_by: editedBy,
        edited_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateMovementError) throw updateMovementError;

    // Atualizar estoque
    const { error: updateStockError } = await supabase
      .from('mega_promo_inventory')
      .update({
        quantity: currentQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', oldMovement.item_id);

    if (updateStockError) throw updateStockError;

    return c.json({ success: true, movement, newQuantity: currentQuantity });
  } catch (error) {
    console.error('Erro ao atualizar movimentação:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao atualizar movimentação' }, 500);
  }
});

// Deletar movimentação
app.delete('/make-server-9694c52b/movements/:id', async (c) => {
  try {
    const id = c.req.param('id');

    // Buscar movimentação
    const { data: movement, error: movementError } = await supabase
      .from('mega_promo_movements')
      .select('*')
      .eq('id', id)
      .single();

    if (movementError || !movement) {
      return c.json({ success: false, error: 'Movimentação não encontrada' }, 404);
    }

    // Buscar item
    const { data: item, error: itemError } = await supabase
      .from('mega_promo_inventory')
      .select('*')
      .eq('id', movement.item_id)
      .single();

    if (itemError || !item) {
      return c.json({ success: false, error: 'Item não encontrado' }, 404);
    }

    // Reverter movimentação
    let newQuantity = item.quantity;
    if (movement.type === 'entrada') {
      newQuantity -= movement.quantity;
    } else {
      newQuantity += movement.quantity;
    }

    if (newQuantity < 0) {
      return c.json({ success: false, error: 'Não é possível reverter: quantidade ficaria negativa' }, 400);
    }

    // Deletar movimentação
    const { error: deleteError } = await supabase
      .from('mega_promo_movements')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Atualizar estoque
    const { error: updateError } = await supabase
      .from('mega_promo_inventory')
      .update({
        quantity: newQuantity,
        last_updated: new Date().toISOString()
      })
      .eq('id', movement.item_id);

    if (updateError) throw updateError;

    return c.json({ success: true, newQuantity });
  } catch (error) {
    console.error('Erro ao deletar movimentação:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao deletar movimentação' }, 500);
  }
});

// ============================================
// ROTA DE TESTE
// ============================================
app.get('/make-server-9694c52b/health', (c) => {
  return c.json({ 
    status: 'ok', 
    message: 'Mega Promo API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Buscar histórico de auditoria de uma movimentação
app.get('/make-server-9694c52b/movements/:id/audit-log', async (c) => {
  try {
    const id = c.req.param('id');

    const { data, error } = await supabase
      .from('mega_promo_audit_log')
      .select('*')
      .eq('movement_id', id)
      .order('timestamp', { ascending: true });

    if (error) {
      // Se a tabela não existe, retornar array vazio com mensagem
      if (error.code === 'PGRST204' || error.code === 'PGRST205') {
        console.warn('⚠️ Tabela mega_promo_audit_log não existe ainda');
        return c.json({ 
          success: false, 
          logs: [], 
          error: error.message,
          needsSetup: true 
        });
      }
      throw error;
    }

    return c.json({ success: true, logs: data || [] });
  } catch (error) {
    console.error('Erro ao buscar histórico de auditoria:', error);
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Erro ao buscar histórico', logs: [] }, 500);
  }
});

// Buscar TODOS os logs de auditoria (para admin)
app.get('/make-server-9694c52b/audit-logs/all', async (c) => {
  try {
    console.log('🔍 Buscando TODOS os logs de auditoria...');

    const { data, error } = await supabase
      .from('mega_promo_audit_log')
      .select(`
        *,
        movement:mega_promo_movements(id, name, size, type)
      `)
      .order('timestamp', { ascending: false });

    if (error) {
      // Se a tabela não existe, retornar array vazio
      if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.message.includes('does not exist')) {
        console.warn('⚠️ Tabela mega_promo_audit_log não existe ainda');
        return c.json({ 
          success: false, 
          logs: [], 
          error: error.message,
          needsSetup: true 
        });
      }
      throw error;
    }

    console.log(`✅ ${data?.length || 0} logs de auditoria encontrados`);
    return c.json({ success: true, logs: data || [] });
  } catch (error) {
    console.error('❌ Erro ao buscar todos os logs de auditoria:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar logs', 
      logs: [] 
    }, 500);
  }
});

// Criar tabela de auditoria (migração)
app.post('/make-server-9694c52b/setup-audit-table', async (c) => {
  try {
    console.log('🔧 Criando tabela de auditoria...');

    // Executar SQL de criação
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: `
        -- Criar tabela de histórico de auditoria
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

        -- Habilitar RLS
        ALTER TABLE public.mega_promo_audit_log ENABLE ROW LEVEL SECURITY;

        -- Criar política de acesso
        DROP POLICY IF EXISTS "Allow service role audit" ON public.mega_promo_audit_log;
        CREATE POLICY "Allow service role audit" ON public.mega_promo_audit_log FOR ALL USING (true);
      `
    });

    if (error) {
      console.error('❌ Erro ao criar tabela de auditoria:', error);
      return c.json({ 
        success: false, 
        error: 'Execute o SQL manualmente no Supabase Dashboard',
        details: error 
      }, 500);
    }

    console.log('✅ Tabela de auditoria criada com sucesso!');
    
    return c.json({ 
      success: true, 
      message: 'Tabela de auditoria criada! Aguarde 10 segundos para o cache atualizar.' 
    });
  } catch (error) {
    console.error('Erro ao criar tabela de auditoria:', error);
    return c.json({ 
      success: false, 
      error: 'Execute o SQL manualmente no Supabase Dashboard' 
    }, 500);
  }
});

// Verificar schema das colunas
app.get('/make-server-9694c52b/verify-schema', async (c) => {
  try {
    // Consulta direta para verificar se as colunas existem
    const { data, error } = await supabase.rpc('verify_columns', {});
    
    if (error) {
      // Se a função não existe, usar query SQL direta
      const { data: columns } = await supabase
        .from('mega_promo_movements')
        .select('*')
        .limit(1);
        
      return c.json({
        success: true,
        message: 'Verificação manual',
        hasData: !!columns,
        columns: columns ? Object.keys(columns[0] || {}) : []
      });
    }
    
    return c.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao verificar schema:', error);
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao verificar schema' 
    }, 500);
  }
});

// Iniciar servidor
Deno.serve(app.fetch);