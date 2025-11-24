import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Users, UserPlus, Trash2, Shield, Info, Edit, X, Check } from 'lucide-react';
import { User } from '../AppWithSupabase';
import { Checkbox } from './ui/checkbox';

interface GerenciarUsuariosProps {
  users: User[];
  onCreateUser: (username: string, password: string, name: string, permissions: string[]) => void;
  onDeleteUser: (username: string) => void;
  onEditUser: (oldUsername: string, newUsername: string, newPassword: string, newName: string) => void;
  onEditMasterCredentials: (newUsername: string, newPassword: string, newName: string) => void;
}

export default function GerenciarUsuarios({ users, onCreateUser, onDeleteUser, onEditUser, onEditMasterCredentials }: GerenciarUsuariosProps) {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Estado para edição - inicializar com strings vazias ao invés de null
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');

  // Estado para edição do master
  const [editingMaster, setEditingMaster] = useState(false);
  const [masterUsername, setMasterUsername] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [masterName, setMasterName] = useState('');

  const availablePermissions = [
    { id: 'cadastrar_itens', label: 'Cadastrar Itens', description: 'Permite cadastrar novos produtos no estoque' },
    { id: 'registrar_movimentacoes', label: 'Registrar Movimentações', description: 'Permite registrar entradas e saídas' },
    { id: 'editar_movimentacoes', label: 'Editar Movimentações', description: 'Permite editar movimentações existentes' },
    { id: 'excluir_movimentacoes', label: 'Excluir Movimentações', description: 'Permite excluir movimentações do histórico' }
  ];

  const handleTogglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim() || !newPassword.trim() || !newName.trim()) {
      alert('Por favor, preencha nome completo, login e senha.');
      return;
    }

    if (newPassword.length < 4) {
      alert('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (selectedPermissions.length === 0) {
      alert('Selecione pelo menos uma permissão para o usuário.');
      return;
    }

    onCreateUser(newUsername.trim(), newPassword.trim(), newName.trim(), selectedPermissions);
    
    // Limpar formulário
    setNewUsername('');
    setNewPassword('');
    setNewName('');
    setSelectedPermissions([]);
  };

  const handleDeleteUser = (username: string) => {
    if (username === 'admin') {
      alert('❌ Não é possível excluir o usuário Master (admin).');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o usuário "${username}"?`)) {
      onDeleteUser(username);
    }
  };

  const handleStartEdit = (user: User) => {
    if (user.username === 'admin') {
      alert('❌ Não é possível editar o usuário Master (admin).');
      return;
    }
    setEditingUser(user.username);
    setEditUsername(user.username);
    setEditPassword(user.password);
    setEditName(user.name);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditUsername('');
    setEditPassword('');
    setEditName('');
  };

  const handleSaveEdit = (oldUsername: string) => {
    if (!editUsername.trim() || !editPassword.trim() || !editName.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (editPassword.length < 4) {
      alert('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    onEditUser(oldUsername, editUsername.trim(), editPassword.trim(), editName.trim());
    handleCancelEdit();
  };

  const handleStartEditMaster = () => {
    const masterUser = users.find(u => u.isMaster === true);
    if (masterUser) {
      setMasterUsername(masterUser.username);
      setMasterPassword(masterUser.password);
      setMasterName(masterUser.name);
      setEditingMaster(true);
    }
  };

  const handleCancelEditMaster = () => {
    setEditingMaster(false);
    setMasterUsername('');
    setMasterPassword('');
    setMasterName('');
  };

  const handleSaveMasterCredentials = () => {
    if (!masterUsername.trim() || !masterPassword.trim() || !masterName.trim()) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (masterPassword.length < 6) {
      alert('⚠️ Por segurança, a senha do Master deve ter no mínimo 6 caracteres.');
      return;
    }

    if (!confirm('⚠️ ATENÇÃO: Você está prestes a alterar as credenciais do usuário Master.\n\nTenha certeza de anotar as novas credenciais em local seguro!\n\nDeseja continuar?')) {
      return;
    }

    onEditMasterCredentials(masterUsername.trim(), masterPassword.trim(), masterName.trim());
    handleCancelEditMaster();
  };

  const regularUsers = users.filter(u => !u.isMaster);
  const masterUser = users.find(u => u.isMaster === true);

  return (
    <div className="space-y-6">
      {/* Card: Segurança - Credenciais Master */}
      <Card className="border-red-300 shadow-lg bg-gradient-to-r from-red-50 to-orange-50">
        <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            🔐 Segurança: Credenciais do Usuário Master
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {!editingMaster ? (
            <div>
              <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-900">
                    <p className="font-semibold mb-1">⚠️ Importante!</p>
                    <p>Por questões de segurança, recomendamos alterar as credenciais padrão do usuário Master. Anote as novas credenciais em local seguro!</p>
                  </div>
                </div>
              </div>

              {masterUser && (
                <div className="bg-white p-4 rounded-lg border border-orange-200 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-orange-600" />
                    <p className="text-gray-900 font-bold">{masterUser.name}</p>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded border border-amber-300">
                      MASTER
                    </span>
                  </div>
                  <div className="ml-7 space-y-1">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Login:</span> {masterUser.username}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Senha:</span> {'•'.repeat(masterUser.password.length)}
                    </p>
                  </div>
                </div>
              )}

              <Button
                onClick={handleStartEditMaster}
                className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold"
              >
                <Edit className="w-5 h-5 mr-2" />
                Alterar Credenciais Master
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-900">
                    <p className="font-semibold mb-1">🔐 Editando Credenciais Master</p>
                    <p><strong>ATENÇÃO:</strong> Anote as novas credenciais antes de salvar!</p>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <div>
                <Label htmlFor="master-name" className="text-gray-700 font-medium mb-2 block">
                  Nome Completo *
                </Label>
                <Input
                  id="master-name"
                  type="text"
                  value={masterName}
                  onChange={(e) => setMasterName(e.target.value)}
                  placeholder="Nome do administrador"
                  className="border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Login */}
                <div>
                  <Label htmlFor="master-username" className="text-gray-700 font-medium mb-2 block">
                    Novo Login *
                  </Label>
                  <Input
                    id="master-username"
                    type="text"
                    value={masterUsername}
                    onChange={(e) => setMasterUsername(e.target.value)}
                    placeholder="Novo login master"
                    className="border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                {/* Senha */}
                <div>
                  <Label htmlFor="master-password" className="text-gray-700 font-medium mb-2 block">
                    Nova Senha *
                  </Label>
                  <Input
                    id="master-password"
                    type="password"
                    value={masterPassword}
                    onChange={(e) => setMasterPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    className="border-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSaveMasterCredentials}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Salvar Novas Credenciais
                </Button>
                <Button
                  onClick={handleCancelEditMaster}
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-50"
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card: Criar Novo Usuário */}
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Criar Novo Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">Importante:</p>
                <p>Os usuários criados aqui terão apenas as permissões selecionadas. As abas <strong>Estoque</strong> e <strong>Histórico</strong> estão sempre disponíveis para visualização.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-5">
            {/* Nome Completo */}
            <div>
              <Label htmlFor="new-name" className="text-gray-700 font-medium mb-2 block">
                Nome Completo *
              </Label>
              <Input
                id="new-name"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João da Silva"
                required
                className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Login */}
              <div>
                <Label htmlFor="new-username" className="text-gray-700 font-medium mb-2 block">
                  Login (Usuário) *
                </Label>
                <Input
                  id="new-username"
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Ex: joao.silva"
                  required
                  className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="new-password" className="text-gray-700 font-medium mb-2 block">
                  Senha *
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  required
                  minLength={4}
                  className="border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Permissões */}
            <div>
              <Label className="text-gray-700 font-medium mb-3 block">
                Permissões *
              </Label>
              <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {availablePermissions.map(permission => (
                  <div key={permission.id} className="flex items-start gap-3">
                    <Checkbox
                      id={permission.id}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handleTogglePermission(permission.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={permission.id}
                        className="text-gray-800 font-medium cursor-pointer"
                      >
                        {permission.label}
                      </Label>
                      <p className="text-xs text-gray-600 mt-0.5">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-5"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Criar Usuário
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Card: Usuários Cadastrados */}
      <Card className="border-orange-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Usuários Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {regularUsers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Nenhum usuário cadastrado ainda</p>
              <p className="text-gray-400 text-sm mt-1">Crie usuários no formulário acima</p>
            </div>
          ) : (
            <div className="space-y-3">
              {regularUsers.map(user => (
                <div
                  key={user.username}
                  className="rounded-lg border-l-4 border-l-blue-600 p-4 bg-white hover:shadow-md transition-shadow"
                >
                  {editingUser === user.username ? (
                    // Modo Edição
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Edit className="w-4 h-4 text-blue-600" />
                        <p className="text-gray-900 font-bold">Editando Usuário</p>
                      </div>

                      {/* Nome Completo */}
                      <div>
                        <Label htmlFor={`edit-name-${user.username}`} className="text-gray-700 text-sm font-medium mb-1 block">
                          Nome Completo *
                        </Label>
                        <Input
                          id={`edit-name-${user.username}`}
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Nome completo"
                          className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Login */}
                        <div>
                          <Label htmlFor={`edit-username-${user.username}`} className="text-gray-700 text-sm font-medium mb-1 block">
                            Login (Usuário) *
                          </Label>
                          <Input
                            id={`edit-username-${user.username}`}
                            type="text"
                            value={editUsername}
                            onChange={(e) => setEditUsername(e.target.value)}
                            placeholder="Login"
                            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>

                        {/* Senha */}
                        <div>
                          <Label htmlFor={`edit-password-${user.username}`} className="text-gray-700 text-sm font-medium mb-1 block">
                            Nova Senha *
                          </Label>
                          <Input
                            id={`edit-password-${user.username}`}
                            type="password"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            placeholder="Nova senha (mín. 4)"
                            minLength={4}
                            className="border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleSaveEdit(user.username)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Salvar
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          variant="outline"
                          className="flex-1 border-gray-300 hover:bg-gray-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo Visualização
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <p className="text-gray-900 font-bold">{user.name}</p>
                        </div>
                        <div className="ml-6 space-y-1.5">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Login:</span> {user.username}
                          </p>
                          <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Permissões:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {user.permissions.map(permission => (
                                <span
                                  key={permission}
                                  className="inline-block px-2.5 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200"
                                >
                                  {availablePermissions.find(p => p.id === permission)?.label || permission}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(user)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteUser(user.username)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}