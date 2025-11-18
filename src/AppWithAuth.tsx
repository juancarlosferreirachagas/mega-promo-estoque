import { useState, useEffect } from 'react';
import { Package, History, PlusCircle, ArrowLeftRight, Users, LogOut, Shield } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import EstoqueAtual from './components/EstoqueAtual';
import Historico from './components/Historico';
import CadastrarItem from './components/CadastrarItem';
import RegistrarMovimentacao from './components/RegistrarMovimentacao';
import MessageModal from './components/MessageModal';
import EditMovementModal from './components/EditMovementModal';
import Login from './components/Login';
import GerenciarUsuarios from './components/GerenciarUsuarios';
import logoMegaPromo from 'figma:asset/e2fd7edd18849ed72bbcfbbe89ce390aeaaf53bf.png';
import { INITIAL_INVENTORY_DATA, PRODUCTS } from './utils/initialData';

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
  username: string;
  password: string;
  permissions: string[];
  isMaster?: boolean;
}

// Usuário master padrão
const MASTER_USER: User = {
  username: 'admin',
  password: 'admin123',
  permissions: ['cadastrar_itens', 'registrar_movimentacoes', 'editar_movimentacoes', 'excluir_movimentacoes', 'gerenciar_usuarios'],
  isMaster: true
};

export default function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [customProducts, setCustomProducts] = useState<ProductWithVariations[]>([]);
  const [messageModal, setMessageModal] = useState<ModalState>({ isOpen: false, title: '', body: '' });
  const [editModal, setEditModal] = useState<EditModalState>({ isOpen: false, movement: null });
  const [activeTab, setActiveTab] = useState('estoque');

  // Estados de autenticação
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([MASTER_USER]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Carrega dados do localStorage ao iniciar
  useEffect(() => {
    const savedInventory = localStorage.getItem('inventory');
    const savedMovements = localStorage.getItem('movements');
    const savedCustomProducts = localStorage.getItem('customProducts');
    const savedUsers = localStorage.getItem('users');
    const savedCurrentUser = localStorage.getItem('currentUser');
    
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory(INITIAL_INVENTORY_DATA);
    }
    
    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    }

    if (savedCustomProducts) {
      setCustomProducts(JSON.parse(savedCustomProducts));
    }

    if (savedUsers) {
      const loadedUsers = JSON.parse(savedUsers);
      // Sempre mantém o master user
      const hasMaster = loadedUsers.some((u: User) => u.username === 'admin');
      if (!hasMaster) {
        setUsers([MASTER_USER, ...loadedUsers]);
      } else {
        setUsers(loadedUsers);
      }
    }

    if (savedCurrentUser) {
      const user = JSON.parse(savedCurrentUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
    }
  }, []);

  // Salva inventory no localStorage quando mudar
  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  // Salva movements no localStorage quando mudar
  useEffect(() => {
    if (movements.length > 0) {
      localStorage.setItem('movements', JSON.stringify(movements));
    }
  }, [movements]);

  // Salva customProducts no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('customProducts', JSON.stringify(customProducts));
  }, [customProducts]);

  // Salva users no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Salva currentUser no localStorage quando mudar
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Combina produtos padrão com produtos personalizados, mesclando variações
  const allProducts: ProductWithVariations[] = PRODUCTS.map(standardProduct => {
    const customProduct = customProducts.find(cp => cp.name === standardProduct.name);
    if (customProduct) {
      const mergedVariations = Array.from(new Set([...standardProduct.variations, ...customProduct.variations]));
      return {
        name: standardProduct.name,
        variations: mergedVariations
      };
    }
    return standardProduct;
  });
  
  customProducts.forEach(customProduct => {
    if (!PRODUCTS.some(p => p.name === customProduct.name)) {
      allProducts.push(customProduct);
    }
  });

  // Funções de autenticação
  const handleLogin = (username: string, password: string): boolean => {
    // Login vazio = modo visualização
    if (username === '' && password === '') {
      setCurrentUser(null);
      setIsAuthenticated(true);
      setActiveTab('estoque');
      return true;
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setActiveTab('estoque');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    setActiveTab('estoque');
  };

  const handleCreateUser = (username: string, password: string, permissions: string[]) => {
    const exists = users.find(u => u.username === username);
    if (exists) {
      alert('❌ Usuário já existe. Escolha outro nome de usuário.');
      return;
    }

    const newUser: User = {
      username,
      password,
      permissions,
      isMaster: false
    };

    setUsers([...users, newUser]);
    showModal('✅ Usuário Criado', `Usuário <strong>${username}</strong> foi criado com sucesso!`);
  };

  const handleDeleteUser = (username: string) => {
    setUsers(users.filter(u => u.username !== username));
    showModal('✅ Usuário Excluído', `Usuário <strong>${username}</strong> foi excluído com sucesso.`);
  };

  // Verifica permissões
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    return currentUser.permissions.includes(permission) || currentUser.isMaster === true;
  };

  const showModal = (title: string, body: string) => {
    setMessageModal({ isOpen: true, title, body });
  };

  const closeModal = () => {
    setMessageModal({ isOpen: false, title: '', body: '' });
  };

  const openEditModal = (movement: Movement) => {
    if (!hasPermission('editar_movimentacoes')) {
      alert('❌ Você não tem permissão para editar movimentações.');
      return;
    }
    setEditModal({ isOpen: true, movement });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, movement: null });
  };

  const createDocId = (name: string, size: string) => {
    const normalizedName = name.toLowerCase().replace(/\s/g, '_');
    const normalizedSize = size.toLowerCase().replace(/\s/g, '_');
    return `${normalizedName}_${normalizedSize}`;
  };

  const handleCadastrarItem = (name: string, size: string, quantity: number) => {
    if (!hasPermission('cadastrar_itens')) {
      alert('❌ Você não tem permissão para cadastrar itens.');
      return;
    }

    const docId = createDocId(name, size);
    
    const exists = inventory.find(item => item.id === docId);
    if (exists) {
      showModal('❌ Produto Já Cadastrado', `O produto \"<strong>${name}</strong>\" com tamanho \"<strong>${size}</strong>\" já existe no sistema. Para atualizar o estoque, use a aba \"Movimentar\".`);
      return;
    }

    const isStandardProduct = PRODUCTS.some(p => p.name === name);
    
    if (!isStandardProduct) {
      const existingCustomProduct = customProducts.find(p => p.name === name);
      
      if (existingCustomProduct) {
        if (!existingCustomProduct.variations.includes(size)) {
          setCustomProducts(customProducts.map(p => 
            p.name === name 
              ? { ...p, variations: [...p.variations, size] }
              : p
          ));
        }
      } else {
        setCustomProducts([...customProducts, { name, variations: [size] }]);
      }
    } else {
      const standardProduct = PRODUCTS.find(p => p.name === name);
      if (standardProduct && !standardProduct.variations.includes(size)) {
        const existingCustomProduct = customProducts.find(p => p.name === name);
        
        if (existingCustomProduct) {
          if (!existingCustomProduct.variations.includes(size)) {
            setCustomProducts(customProducts.map(p => 
              p.name === name 
                ? { ...p, variations: [...p.variations, size] }
                : p
            ));
          }
        } else {
          setCustomProducts([...customProducts, { name, variations: [size] }]);
        }
      }
    }

    const newItem: InventoryItem = {
      id: docId,
      name,
      size,
      quantity,
      lastUpdated: Date.now()
    };

    setInventory([...inventory, newItem]);
    showModal('✅ Cadastro Realizado', `Produto \"<strong>${name}</strong>\" (${size}) cadastrado com sucesso!<br><br>Quantidade inicial: <strong>${quantity} unidades</strong>`);
  };

  const handleRegistrarMovimentacao = (
    name: string,
    size: string,
    type: 'entrada' | 'saida',
    quantity: number,
    reason: string,
    personName: string,
    responsible: string,
    observations?: string
  ) => {
    if (!hasPermission('registrar_movimentacoes')) {
      alert('❌ Você não tem permissão para registrar movimentações.');
      return;
    }

    const docId = createDocId(name, size);
    let item = inventory.find(i => i.id === docId);

    if (!item && type === 'entrada') {
      const newItem: InventoryItem = {
        id: docId,
        name,
        size,
        quantity: 0,
        lastUpdated: Date.now()
      };
      
      setInventory([...inventory, newItem]);
      item = newItem;
      
      const isStandardProduct = PRODUCTS.some(p => p.name === name);
      
      if (!isStandardProduct) {
        const existingCustomProduct = customProducts.find(p => p.name === name);
        
        if (existingCustomProduct) {
          if (!existingCustomProduct.variations.includes(size)) {
            setCustomProducts(customProducts.map(p => 
              p.name === name 
                ? { ...p, variations: [...p.variations, size] }
                : p
            ));
          }
        } else {
          setCustomProducts([...customProducts, { name, variations: [size] }]);
        }
      }
    }

    if (!item) {
      showModal('❌ Produto Não Encontrado', `O produto \"<strong>${name}</strong>\" (${size}) não está cadastrado no estoque.<br><br>💡 <strong>Dica:</strong> Para registrar uma SAÍDA, primeiro faça uma ENTRADA para criar o item no estoque.`);
      return;
    }

    const movementValue = type === 'entrada' ? quantity : -quantity;
    const newQuantity = item.quantity + movementValue;

    if (newQuantity < 0) {
      showModal('❌ Estoque Insuficiente', `A saída de <strong>${quantity} unidades</strong> ultrapassa o estoque disponível de <strong>${item.quantity} unidades</strong>.`);
      return;
    }

    setInventory(inventory.map(i => 
      i.id === docId 
        ? { ...i, quantity: newQuantity, lastUpdated: Date.now() }
        : i
    ));

    const newMovement: Movement = {
      id: Date.now().toString(),
      itemId: docId,
      name,
      size,
      type,
      quantity,
      reason,
      personName,
      responsible,
      observations,
      timestamp: Date.now()
    };

    setMovements([newMovement, ...movements]);
    
    const typeText = type === 'entrada' ? 'ENTRADA' : 'SAÍDA';
    const createdMessage = item.quantity === 0 ? '<br><br>🆕 <strong>Novo tamanho criado automaticamente!</strong>' : '';
    showModal(`✅ ${typeText} Registrada com Sucesso`, `<strong>${typeText}</strong> de <strong>${quantity} unidades</strong> do produto \"<strong>${name}</strong>\" (${size}) foi registrada.<br><br>📊 Estoque atualizado: <strong>${newQuantity} unidades</strong>${createdMessage}<br><br>A operação foi salva no histórico.`);
    setActiveTab('historico');
  };

  const handleDeleteMovement = (movementId: string) => {
    if (!hasPermission('excluir_movimentacoes')) {
      alert('❌ Você não tem permissão para excluir movimentações.');
      return;
    }

    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;

    if (!confirm('Tem certeza que deseja EXCLUIR esta movimentação? O estoque será ajustado.')) {
      return;
    }

    const item = inventory.find(i => i.id === movement.itemId);
    if (!item) {
      setMovements(movements.filter(m => m.id !== movementId));
      showModal('Atenção', 'Item de inventário não encontrado. Deletando apenas o registro de movimento.');
      return;
    }

    const reverseValue = movement.type === 'entrada' ? -movement.quantity : movement.quantity;
    const newQuantity = item.quantity + reverseValue;

    if (newQuantity < 0) {
      showModal('Erro', `Não é possível reverter a movimentação. O estoque ficaria negativo (${newQuantity}).`);
      return;
    }

    setInventory(inventory.map(i => 
      i.id === movement.itemId 
        ? { ...i, quantity: newQuantity, lastUpdated: Date.now() }
        : i
    ));

    setMovements(movements.filter(m => m.id !== movementId));
    showModal('Excluído com Sucesso', `Movimentação do item '${movement.name}' (Tamanho: ${movement.size}) foi excluída e o estoque ajustado.`);
  };

  const handleEditMovement = (
    movementId: string,
    newType: 'entrada' | 'saida',
    newQuantity: number,
    newReason: string,
    newPersonName: string,
    newResponsible: string,
    newObservations?: string
  ) => {
    if (!hasPermission('editar_movimentacoes')) {
      alert('❌ Você não tem permissão para editar movimentações.');
      return;
    }

    const movement = movements.find(m => m.id === movementId);
    if (!movement) return;

    const item = inventory.find(i => i.id === movement.itemId);
    if (!item) {
      showModal('Erro', 'O item de inventário associado não existe mais. Não é possível editar.');
      return;
    }

    const originalImpact = movement.type === 'entrada' ? movement.quantity : -movement.quantity;
    const quantityAfterReverse = item.quantity - originalImpact;
    const newImpact = newType === 'entrada' ? newQuantity : -newQuantity;
    const finalQuantity = quantityAfterReverse + newImpact;

    if (finalQuantity < 0) {
      showModal('Erro', `Não é possível aplicar a edição. O estoque final ficaria negativo (${finalQuantity}).`);
      return;
    }

    setInventory(inventory.map(i => 
      i.id === movement.itemId 
        ? { ...i, quantity: finalQuantity, lastUpdated: Date.now() }
        : i
    ));

    setMovements(movements.map(m => 
      m.id === movementId 
        ? { 
            ...m, 
            type: newType,
            quantity: newQuantity,
            reason: newReason,
            personName: newPersonName,
            responsible: newResponsible,
            observations: newObservations,
            timestamp: Date.now()
          }
        : m
    ).sort((a, b) => b.timestamp - a.timestamp));

    closeEditModal();
    showModal('Edição Concluída', `Movimentação do item '${movement.name}' (Tamanho: ${movement.size}) foi atualizada com sucesso. O estoque foi reajustado.`);
  };

  // Se não autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Determina quais abas mostrar no TabsList
  const availableTabs = [];
  availableTabs.push('estoque');
  availableTabs.push('historico');
  if (hasPermission('cadastrar_itens')) availableTabs.push('cadastro');
  if (hasPermission('registrar_movimentacoes')) availableTabs.push('movimentacao');
  if (hasPermission('gerenciar_usuarios')) availableTabs.push('usuarios');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border-2 border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-amber-600 p-1">
              <div className="bg-white p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-white rounded-full p-1 shadow-xl border-4 border-orange-100">
                      <img 
                        src={logoMegaPromo} 
                        alt="Mega Promo Merchandising" 
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full"
                      />
                    </div>
                    <div>
                      <h1 className="text-gray-900 mb-2 text-2xl md:text-3xl">
                        Mega Promo
                      </h1>
                      <p className="text-orange-600 font-semibold text-sm md:text-base mb-1">
                        MERCHANDISING
                      </p>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Package className="w-4 h-4 text-orange-500" />
                        <span>Sistema de Controle de Estoque</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    {/* Info do usuário */}
                    {currentUser ? (
                      <div className="mb-3">
                        <div className="flex items-center justify-end gap-2 mb-1">
                          <Shield className="w-4 h-4 text-orange-600" />
                          <p className="text-gray-900 font-bold">{currentUser.username}</p>
                          {currentUser.isMaster && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded border border-amber-300">
                              MASTER
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          size="sm"
                          className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          Sair
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-3">
                        <p className="text-gray-600 text-sm mb-2">Modo Visualização</p>
                        <Button
                          onClick={handleLogout}
                          variant="outline"
                          size="sm"
                          className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                        >
                          <LogOut className="w-3 h-3 mr-1" />
                          Fazer Login
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Localização</p>
                    <p className="text-gray-900 font-semibold">São Paulo - SP</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full mb-6 bg-white border border-orange-100 p-1 rounded-lg shadow-sm h-auto`} style={{ gridTemplateColumns: `repeat(${availableTabs.length}, minmax(0, 1fr))` }}>
            <TabsTrigger 
              value="estoque" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3"
            >
              <Package className="w-4 h-4 mr-2" />
              Estoque
            </TabsTrigger>
            <TabsTrigger 
              value="historico" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3"
            >
              <History className="w-4 h-4 mr-2" />
              Histórico
            </TabsTrigger>
            {hasPermission('cadastrar_itens') && (
              <TabsTrigger 
                value="cadastro" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Cadastrar
              </TabsTrigger>
            )}
            {hasPermission('registrar_movimentacoes') && (
              <TabsTrigger 
                value="movimentacao" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3"
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Movimentar
              </TabsTrigger>
            )}
            {hasPermission('gerenciar_usuarios') && (
              <TabsTrigger 
                value="usuarios" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all py-3"
              >
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="estoque">
            <EstoqueAtual inventory={inventory} />
          </TabsContent>

          <TabsContent value="historico">
            <Historico 
              movements={movements} 
              onEdit={openEditModal}
              onDelete={handleDeleteMovement}
            />
          </TabsContent>

          {hasPermission('cadastrar_itens') && (
            <TabsContent value="cadastro">
              <CadastrarItem onCadastrar={handleCadastrarItem} allProducts={allProducts} />
            </TabsContent>
          )}

          {hasPermission('registrar_movimentacoes') && (
            <TabsContent value="movimentacao">
              <RegistrarMovimentacao 
                inventory={inventory}
                onRegistrar={handleRegistrarMovimentacao}
                allProducts={allProducts}
              />
            </TabsContent>
          )}

          {hasPermission('gerenciar_usuarios') && (
            <TabsContent value="usuarios">
              <GerenciarUsuarios 
                users={users}
                onCreateUser={handleCreateUser}
                onDeleteUser={handleDeleteUser}
              />
            </TabsContent>
          )}
        </Tabs>

        <MessageModal
          isOpen={messageModal.isOpen}
          title={messageModal.title}
          body={messageModal.body}
          onClose={closeModal}
        />

        <EditMovementModal
          isOpen={editModal.isOpen}
          movement={editModal.movement}
          onClose={closeEditModal}
          onSave={handleEditMovement}
        />
      </div>
    </div>
  );
}
