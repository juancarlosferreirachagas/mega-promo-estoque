import { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, History, PlusCircle, ArrowLeftRight, Users, LogOut, Shield, Database, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import EstoqueAtual from './components/EstoqueAtual';
import Historico from './components/Historico';
import CadastrarItem from './components/CadastrarItem';
import RegistrarMovimentacao from './components/RegistrarMovimentacao';
import MessageModal from './components/MessageModal';
import EditMovementModal from './components/EditMovementModal';
import LoginModern from './components/LoginModern';
import GerenciarUsuarios from './components/GerenciarUsuariosSupabase';
import DatabaseInit from './components/DatabaseInit';
import logoMegaPromo from 'figma:asset/e2fd7edd18849ed72bbcfbbe89ce390aeaaf53bf.png';
import { PRODUCTS } from './utils/initialData';
import * as api from './utils/api';

export interface InventoryItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  lastUpdated: number;
}

export interface Movement {
  id: string;
  itemId: string;
  name: string;
  size: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  personName: string;
  responsible: string;
  observations?: string;
  timestamp: number;
  createdBy?: string;
  editedBy?: string;
  editedAt?: number;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  body: string;
}

export interface EditModalState {
  isOpen: boolean;
  movement: Movement | null;
}

export interface ProductWithVariations {
  name: string;
  variations: string[];
}

export interface User {
  id?: string;
  username: string;
  password?: string;
  permissions: {
    canAddItem?: boolean;
    canRegisterMovement?: boolean;
    canEditMovement?: boolean;
    canDeleteMovement?: boolean;
  };
  isMaster?: boolean;
}

export default function AppWithSupabase() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [customProducts, setCustomProducts] = useState<ProductWithVariations[]>([]);
  const [messageModal, setMessageModal] = useState<ModalState>({ isOpen: false, title: '', body: '' });
  const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, movement: null });
  const [activeTab, setActiveTab] = useState('estoque');
  const [isLoading, setIsLoading] = useState(true);
  const [isDatabaseInitialized, setIsDatabaseInitialized] = useState(false);

  // Estados de autenticação
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar se banco está inicializado
  useEffect(() => {
    checkDatabaseInit();
  }, []);

  const checkDatabaseInit = async () => {
    try {
      // Tentar buscar usuários (vai falhar se tabela não existir)
      const usersData = await api.getUsers();
      
      // Se chegou aqui sem erro, tabelas existem
      console.log('✅ Tabelas encontradas! Total de usuários:', usersData.length);
      setIsDatabaseInitialized(true);
      loadInitialData();
    } catch (error: any) {
      console.log('Erro ao verificar banco:', error);
      
      // Detectar erro de tabela não encontrada
      const errorMessage = error?.message || String(error);
      const isTableNotFound = 
        error?.code === 'PGRST205' || 
        error?.tableNotFound || 
        errorMessage.includes('Could not find the table') ||
        errorMessage.includes('mega_promo_users') ||
        errorMessage.includes('schema cache');
      
      if (isTableNotFound) {
        console.log('❌ Tabelas não encontradas. Setup manual necessário.');
        setIsDatabaseInitialized(false);
      } else {
        // Outro tipo de erro - também mostrar setup
        console.error('Erro desconhecido ao verificar banco:', error);
        setIsDatabaseInitialized(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar estoque
      const inventoryData = await api.getInventory();
      setInventory(inventoryData);

      // Carregar movimentações
      const movementsData = await api.getMovements();
      setMovements(movementsData);

      // Carregar usuários
      const usersData = await api.getUsers();
      
      // Converter formato da API para formato do app
      const formattedUsers = usersData.map(u => ({
        id: u.id,
        username: u.username,
        permissions: u.permissions || {},
        isMaster: u.is_master
      }));
      
      setUsers(formattedUsers);

      // Carregar produtos customizados do localStorage (temporário)
      const savedCustomProducts = localStorage.getItem('customProducts');
      if (savedCustomProducts) {
        setCustomProducts(JSON.parse(savedCustomProducts));
      }

      // Verificar se tem usuário logado no localStorage
      const savedCurrentUser = localStorage.getItem('currentUser');
      if (savedCurrentUser) {
        const user = JSON.parse(savedCurrentUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showMessage('Erro', 'Não foi possível carregar os dados do sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  // Salvar produtos customizados no localStorage
  useEffect(() => {
    localStorage.setItem('customProducts', JSON.stringify(customProducts));
  }, [customProducts]);

  // Combinar produtos padrão com customizados
  const allProducts = [...PRODUCTS, ...customProducts];

  // Funções auxiliares
  const showMessage = (title: string, body: string) => {
    setMessageModal({ isOpen: true, title, body });
  };

  const closeMessage = () => {
    setMessageModal({ isOpen: false, title: '', body: '' });
  };

  const refreshInventory = async () => {
    const inventoryData = await api.getInventory();
    setInventory(inventoryData);
  };

  const refreshMovements = async () => {
    const movementsData = await api.getMovements();
    setMovements(movementsData);
  };

  // Funções de autenticação
  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    // Login vazio = modo visualização
    if (username === '' && password === '') {
      setCurrentUser(null);
      setIsAuthenticated(true);
      setActiveTab('estoque');
      localStorage.removeItem('currentUser');
      return true;
    }

    try {
      const user = await api.login(username, password);
      
      if (user) {
        const formattedUser: User = {
          id: user.id,
          username: user.username,
          permissions: user.permissions || {},
          isMaster: user.is_master
        };

        setCurrentUser(formattedUser);
        setIsAuthenticated(true);
        setActiveTab('estoque');
        localStorage.setItem('currentUser', JSON.stringify(formattedUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Funções de estoque
  const handleAddItem = async (name: string, size: string, quantity: number) => {
    try {
      const newItem = await api.createInventoryItem(name, size, quantity);
      
      if (newItem) {
        await refreshInventory();
        
        // Adicionar produto customizado se não existir
        if (!allProducts?.find(p => p.name === name)) {
          const newProduct = { name, variations: [size] };
          setCustomProducts([...customProducts, newProduct]);
        } else {
          const product = allProducts.find(p => p.name === name);
          if (product && !product.variations.includes(size)) {
            const updatedProducts = customProducts.map(p =>
              p.name === name
                ? { ...p, variations: [...p.variations, size] }
                : p
            );
            setCustomProducts(updatedProducts);
          }
        }

        showMessage('Item Cadastrado', `${name} (${size}) foi adicionado ao estoque com quantidade ${quantity}.`);
        return true;
      } else {
        showMessage('Erro', 'Não foi possível cadastrar o item. Verifique se já existe um item com este nome e tamanho.');
        return false;
      }
    } catch (error: any) {
      // Verificar se é erro de duplicata
      if (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('already exists')) {
        console.log(`ℹ️ Tentativa de cadastrar item duplicado: ${name} (${size})`);
        showMessage(
          'Item Já Existe', 
          `O item "${name}" com tamanho/variação "${size}" já está cadastrado no estoque. Por favor, verifique o estoque atual ou use uma variação diferente.`
        );
      } else {
        // Apenas para erros que não são duplicata
        console.error('Erro ao cadastrar item:', error);
        showMessage('Erro', `Erro ao cadastrar item: ${error.message || 'Erro desconhecido'}`);
      }
      return false;
    }
  };

  const handleMovement = async (
    name: string,
    size: string,
    type: 'entrada' | 'saida',
    quantity: number,
    reason: string,
    personName: string,
    responsible: string,
    observations: string
  ) => {
    try {
      const item = inventory.find(i => i.name === name && i.size === size);
      
      if (!item) {
        showMessage('Erro', 'Item não encontrado no estoque.');
        return false;
      }

      const createdBy = currentUser?.username || 'sistema';

      const result = await api.createMovement({
        itemId: item.id,
        name,
        size,
        type,
        quantity,
        reason,
        personName,
        responsible,
        observations,
        createdBy
      });

      if (result.success) {
        await refreshInventory();
        await refreshMovements();
        
        const typeText = type === 'entrada' ? 'Entrada' : 'Saída';
        showMessage(
          `${typeText} Registrada`,
          `${typeText} de ${quantity} unidade(s) de ${name} (${size}) registrada com sucesso.`
        );
        return true;
      } else {
        showMessage('Erro', result.error || 'Não foi possível registrar a movimentação.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      showMessage('Erro', 'Erro ao registrar movimentação no banco de dados.');
      return false;
    }
  };

  const handleEditMovement = async (
    movementId: string,
    type: 'entrada' | 'saida',
    quantity: number,
    reason: string,
    personName: string,
    responsible: string,
    observations: string,
    name?: string,
    size?: string
  ) => {
    try {
      const editedBy = currentUser?.username || 'sistema';
      
      const result = await api.updateMovement(movementId, {
        type,
        quantity,
        reason,
        personName,
        responsible,
        observations,
        editedBy,
        name,
        size
      });

      if (result.success) {
        await refreshInventory();
        await refreshMovements();
        setEditModal({ isOpen: false, movement: null });
        
        showMessage('Movimentação Atualizada', 'A movimentação foi atualizada com sucesso.');
        return true;
      } else {
        showMessage('Erro', result.error || 'Não foi possível atualizar a movimentação.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao atualizar movimentação:', error);
      showMessage('Erro', 'Erro ao atualizar movimentação no banco de dados.');
      return false;
    }
  };

  const handleDeleteMovement = async (movementId: string) => {
    try {
      const result = await api.deleteMovement(movementId);

      if (result.success) {
        await refreshInventory();
        await refreshMovements();
        
        showMessage('Movimentação Excluída', 'A movimentação foi excluída e o estoque foi ajustado.');
        return true;
      } else {
        showMessage('Erro', result.error || 'Não foi possível excluir a movimentação.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao excluir movimentação:', error);
      showMessage('Erro', 'Erro ao excluir movimentação do banco de dados.');
      return false;
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      const result = await api.deleteInventoryItem(itemId);

      if (result.success) {
        await refreshInventory();
        await refreshMovements();
        
        const movText = result.deletedMovements 
          ? ` e ${result.deletedMovements} movimentação(ões) foram removidas` 
          : '';
        
        showMessage(
          'Item Removido', 
          `O item "${itemName}" foi removido do estoque${movText}.`
        );
        return true;
      } else {
        showMessage('Erro', 'Não foi possível remover o item.');
        return false;
      }
    } catch (error) {
      console.error('Erro ao remover item:', error);
      showMessage('Erro', 'Erro ao remover item do banco de dados.');
      return false;
    }
  };

  const openEditModal = (movement: Movement) => {
    setEditModal({ isOpen: true, movement });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, movement: null });
  };

  // Verificar permissões
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.isMaster) return true;

    switch (permission) {
      case 'cadastrar_itens':
        return currentUser.permissions.canAddItem || false;
      case 'registrar_movimentacoes':
        return currentUser.permissions.canRegisterMovement || false;
      case 'editar_movimentacoes':
        return currentUser.permissions.canEditMovement || false;
      case 'excluir_movimentacoes':
        // Apenas Master pode excluir movimentações
        return currentUser.isMaster || false;
      case 'gerenciar_usuarios':
        return currentUser.isMaster || false;
      default:
        return false;
    }
  };

  // Renderização condicional baseada na inicialização do banco
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Database className="w-16 h-16 text-orange-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (!isDatabaseInitialized) {
    return (
      <DatabaseInit
        onComplete={() => {
          setIsDatabaseInitialized(true);
          loadInitialData();
        }}
      />
    );
  }

  // Se não autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <LoginModern onLogin={handleLogin} />;
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-3 shadow-lg">
              <img 
                src={logoMegaPromo} 
                alt="Mega Promo" 
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-gray-900">Mega Promo</h1>
              <p className="text-orange-600 font-semibold">MERCHANDISING</p>
              <p className="text-gray-500 text-sm">Sistema de Controle de Estoque</p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-1">
                  {currentUser.isMaster && (
                    <Shield className="w-4 h-4 text-orange-600" />
                  )}
                  <p className="font-semibold text-gray-900">{currentUser.username}</p>
                </div>
                <p className="text-gray-600 text-sm">
                  {currentUser.isMaster ? 'Administrador Master' : 'Usuário Operacional'}
                </p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="text-right">
                <p className="font-semibold text-gray-900">Modo Visualização</p>
                <p className="text-gray-600 text-sm mb-2">Acesso limitado</p>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Fazer Login
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Badge de Supabase */}
        

        {/* Tabs */}
        <Tabs 
          value={activeTab} 
          onValueChange={(value) => {
            // No modo visualização, apenas permite a aba de estoque
            if (!currentUser && value !== 'estoque') {
              setActiveTab('estoque');
            } else {
              setActiveTab(value);
            }
          }} 
          className="w-full"
        >
          <TabsList className={`grid w-full ${currentUser ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1'} bg-white shadow-md mb-8`}>
            <TabsTrigger 
              value="estoque" 
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Package className="w-4 h-4 mr-2" />
              Estoque
            </TabsTrigger>
            
            {currentUser && (
              <TabsTrigger 
                value="historico" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <History className="w-4 h-4 mr-2" />
                Histórico
              </TabsTrigger>
            )}
            
            {hasPermission('cadastrar_itens') && (
              <TabsTrigger 
                value="cadastrar" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Cadastrar Item
              </TabsTrigger>
            )}
            
            {hasPermission('registrar_movimentacoes') && (
              <TabsTrigger 
                value="movimentacao" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Movimento
              </TabsTrigger>
            )}
            
            {hasPermission('gerenciar_usuarios') && (
              <TabsTrigger 
                value="usuarios" 
                className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          {/* Estoque Atual */}
          <TabsContent value="estoque">
            <EstoqueAtual 
              inventory={inventory} 
              onDelete={currentUser?.isMaster ? handleDeleteItem : undefined}
            />
          </TabsContent>

          {/* Histórico */}
          {currentUser && (
            <TabsContent value="historico">
              <Historico
                movements={movements}
                inventory={inventory}
                canEdit={hasPermission('editar_movimentacoes')}
                canDelete={hasPermission('excluir_movimentacoes')}
                onEdit={openEditModal}
                onDelete={handleDeleteMovement}
                currentUser={currentUser}
              />
            </TabsContent>
          )}

          {/* Cadastrar Item */}
          {hasPermission('cadastrar_itens') && (
            <TabsContent value="cadastrar">
              <CadastrarItem
                allProducts={allProducts}
                onCadastrar={handleAddItem}
              />
            </TabsContent>
          )}

          {/* Registrar Movimentação */}
          {hasPermission('registrar_movimentacoes') && (
            <TabsContent value="movimentacao">
              <RegistrarMovimentacao
                inventory={inventory}
                allProducts={allProducts}
                users={users}
                currentUser={currentUser!}
                onRegistrar={handleMovement}
              />
            </TabsContent>
          )}

          {/* Gerenciar Usuários */}
          {hasPermission('gerenciar_usuarios') && (
            <TabsContent value="usuarios">
              <GerenciarUsuarios
                users={users}
                currentUser={currentUser}
                onRefresh={async () => {
                  const usersData = await api.getUsers();
                  const formattedUsers = usersData.map(u => ({
                    id: u.id,
                    username: u.username,
                    permissions: u.permissions || {},
                    isMaster: u.is_master
                  }));
                  setUsers(formattedUsers);
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      <MessageModal
        isOpen={messageModal.isOpen}
        title={messageModal.title}
        body={messageModal.body}
        onClose={closeMessage}
      />

      {editModal.isOpen && editModal.movement && (
        <EditMovementModal
          isOpen={editModal.isOpen}
          movement={editModal.movement}
          inventory={inventory}
          allProducts={allProducts}
          onSave={handleEditMovement}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
}