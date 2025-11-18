import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, UserPlus, Trash2, Shield, Edit, X, Check, AlertCircle } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import * as api from '../utils/api';

interface User {
  id?: string;
  username: string;
  permissions: {
    canAddItem?: boolean;
    canRegisterMovement?: boolean;
    canEditMovement?: boolean;
    canDeleteMovement?: boolean;
  };
  isMaster?: boolean;
}

interface GerenciarUsuariosProps {
  users: User[];
  currentUser: User | null;
  onRefresh: () => Promise<void>;
}

export default function GerenciarUsuariosSupabase({ users, currentUser, onRefresh }: GerenciarUsuariosProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState({
    canAddItem: false,
    canRegisterMovement: false,
    canEditMovement: false,
    canDeleteMovement: false
  });

  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editOriginalUsername, setEditOriginalUsername] = useState(''); // Guardar o username original
  const [editPassword, setEditPassword] = useState('');
  const [editPermissions, setEditPermissions] = useState({
    canAddItem: false,
    canRegisterMovement: false,
    canEditMovement: false,
    canDeleteMovement: false
  });

  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availablePermissions = [
    { key: 'canAddItem', label: 'Cadastrar Itens', description: 'Permite cadastrar novos produtos no estoque' },
    { key: 'canRegisterMovement', label: 'Registrar Movimentações', description: 'Permite registrar entradas e saídas' },
    { key: 'canEditMovement', label: 'Editar Movimentações', description: 'Permite editar movimentações existentes' },
    { key: 'canDeleteMovement', label: 'Excluir Movimentações', description: 'Permite excluir movimentações do histórico' }
  ];

  const handleCreateUser = async () => {
    setError(null);
    setSuccess(null);

    if (!newUsername.trim()) {
      setError('Por favor, preencha o nome de usuário.');
      return;
    }

    if (!newPassword.trim()) {
      setError('Por favor, preencha a senha.');
      return;
    }

    if (newPassword.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsCreating(true);

    try {
      const user = await api.createUser(newUsername.trim(), newPassword, selectedPermissions, false);

      if (user) {
        setSuccess('Usuário criado com sucesso!');
        setNewUsername('');
        setNewPassword('');
        setSelectedPermissions({
          canAddItem: false,
          canRegisterMovement: false,
          canEditMovement: false,
          canDeleteMovement: false
        });
        
        await onRefresh();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erro ao criar usuário. Verifique se o nome de usuário já existe.');
      }
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError('Erro ao criar usuário no banco de dados.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      return;
    }

    try {
      const success = await api.deleteUser(userId);

      if (success) {
        setSuccess('Usuário excluído com sucesso!');
        await onRefresh();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erro ao excluir usuário.');
      }
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
      setError('Erro ao excluir usuário do banco de dados.');
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user.id || '');
    setEditUsername(user.username); // Carregar username atual
    setEditOriginalUsername(user.username); // Salvar username original para comparação
    setEditPassword('');
    setEditPermissions(user.permissions);
    setError(null);
    setSuccess(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;

    setError(null);
    setSuccess(null);

    // Validar username
    if (!editUsername.trim()) {
      setError('O nome de usuário não pode estar vazio.');
      return;
    }

    try {
      const updateData: any = {
        permissions: editPermissions
      };

      // Só enviar username se foi REALMENTE alterado (comparar com trim em ambos os lados)
      const usernameChanged = editUsername.trim() !== editOriginalUsername.trim();
      
      console.log('🔍 Debug edição usuário:', {
        editUsername: editUsername.trim(),
        editOriginalUsername: editOriginalUsername.trim(),
        usernameChanged
      });

      if (usernameChanged) {
        updateData.username = editUsername.trim();
        console.log('✏️ Username será atualizado para:', updateData.username);
      } else {
        console.log('⏭️ Username não mudou, não será enviado');
      }

      // Só enviar senha se foi preenchida
      if (editPassword.trim()) {
        if (editPassword.length < 4) {
          setError('A senha deve ter pelo menos 4 caracteres.');
          return;
        }
        updateData.password = editPassword;
      }

      const user = await api.updateUser(
        editingUser, 
        updateData.password, 
        updateData.permissions, 
        updateData.username // Só será definido se usernameChanged === true
      );

      if (user) {
        setSuccess('Usuário atualizado com sucesso!');
        setEditingUser(null);
        setEditPassword('');
        setEditUsername('');
        setEditOriginalUsername('');
        
        await onRefresh();

        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('Erro ao atualizar usuário.');
      }
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err);
      
      // Tratar erro de username duplicado
      if (err?.message?.includes('duplicate key') || err?.message?.includes('already exists')) {
        setError('Este nome de usuário já está em uso. Por favor, escolha outro.');
      } else {
        setError('Erro ao atualizar usuário no banco de dados.');
      }
    }
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditPassword('');
    setError(null);
  };

  return (
    <Card className="border-orange-200 shadow-md">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="w-6 h-6" />
          Gerenciar Usuários
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Mensagens */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            <Check className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Criar Novo Usuário */}
        <div className="p-6 bg-white border-2 border-orange-100 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-orange-600" />
            Criar Novo Usuário
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="newUsername">Nome de Usuário *</Label>
                <Input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Digite o nome de usuário"
                  className="border-gray-300"
                  disabled={isCreating}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Senha *</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="border-gray-300"
                  disabled={isCreating}
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block font-semibold">Permissões</Label>
              <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
                {availablePermissions.map((perm) => (
                  <div key={perm.key} className="flex items-start gap-3">
                    <Checkbox
                      id={`new-${perm.key}`}
                      checked={selectedPermissions[perm.key as keyof typeof selectedPermissions]}
                      onCheckedChange={(checked) => {
                        setSelectedPermissions({
                          ...selectedPermissions,
                          [perm.key]: checked === true
                        });
                      }}
                      disabled={isCreating}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`new-${perm.key}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        {perm.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreateUser}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Criando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Usuário
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usuários Cadastrados ({users.length})</h3>

          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-lg border-2 ${
                  user.isMaster
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-white border-gray-200'
                }`}
              >
                {editingUser === user.id ? (
                  // Modo de Edição
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {user.isMaster ? (
                          <Shield className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Users className="w-5 h-5 text-orange-600" />
                        )}
                        <span className="font-semibold text-gray-900">{user.username}</span>
                        {user.isMaster && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                            MASTER
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSaveEdit}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          size="sm"
                          variant="outline"
                          className="border-gray-300"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`edit-username-${user.id}`}>Nome de Usuário</Label>
                      <Input
                        id={`edit-username-${user.id}`}
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="Digite o nome de usuário"
                        className="border-gray-300"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`edit-password-${user.id}`}>Nova Senha (deixe em branco para manter)</Label>
                      <Input
                        id={`edit-password-${user.id}`}
                        type="password"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Digite a nova senha"
                        className="border-gray-300"
                      />
                    </div>

                    {!user.isMaster && (
                      <div>
                        <Label className="mb-2 block font-semibold">Permissões</Label>
                        <div className="space-y-2 bg-gray-50 p-3 rounded border border-gray-200">
                          {availablePermissions.map((perm) => (
                            <div key={perm.key} className="flex items-center gap-2">
                              <Checkbox
                                id={`edit-${user.id}-${perm.key}`}
                                checked={editPermissions[perm.key as keyof typeof editPermissions]}
                                onCheckedChange={(checked) => {
                                  setEditPermissions({
                                    ...editPermissions,
                                    [perm.key]: checked === true
                                  });
                                }}
                              />
                              <label
                                htmlFor={`edit-${user.id}-${perm.key}`}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                              >
                                {perm.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {user.isMaster && (
                      <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
                        ⚠️ O usuário Master sempre tem acesso total ao sistema
                      </div>
                    )}
                  </div>
                ) : (
                  // Modo de Visualização
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {user.isMaster ? (
                          <Shield className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-600" />
                        )}
                        <span className="font-semibold text-gray-900">{user.username}</span>
                        {user.isMaster && (
                          <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded">
                            MASTER
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEditUser(user)}
                          size="sm"
                          variant="outline"
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {!user.isMaster && (
                          <Button
                            onClick={() => handleDeleteUser(user.id!, user.username)}
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        )}
                      </div>
                    </div>

                    {user.isMaster ? (
                      <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
                        ✅ Acesso total ao sistema (todas as permissões)
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">Permissões:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {availablePermissions.map((perm) => {
                            const isActive = user.permissions[perm.key as keyof typeof user.permissions];
                            return (
                              <div
                                key={perm.key}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                                  isActive
                                    ? 'bg-green-50 border-green-300 text-green-800'
                                    : 'bg-gray-50 border-gray-300 text-gray-500'
                                }`}
                              >
                                <span className="font-bold text-base">
                                  {isActive ? '✓' : '✗'}
                                </span>
                                <span className="text-sm font-medium">
                                  {perm.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {users.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário cadastrado ainda.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}