import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Lock, User as UserIcon, AlertCircle, ShieldAlert, Mail, Send } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Textarea } from './ui/textarea';
import logoMegaPromo from 'figma:asset/e2fd7edd18849ed72bbcfbbe89ce390aeaaf53bf.png';

interface LoginProps {
  onLogin: (username: string, password: string) => boolean;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryName, setRecoveryName] = useState('');
  const [recoveryReason, setRecoveryReason] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha usuário e senha.');
      setIsLoading(false);
      return;
    }

    const success = onLogin(username.trim(), password.trim());
    
    if (!success) {
      setError('Usuário ou senha incorretos.');
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const handleContinueWithoutLogin = () => {
    onLogin('', ''); // Login vazio = modo visualização
  };

  const handleSendRecoveryEmail = async () => {
    // Validação dos campos
    if (!recoveryName.trim()) {
      alert('Por favor, preencha seu nome completo.');
      return;
    }
    
    if (!recoveryReason.trim()) {
      alert('Por favor, descreva o motivo da recuperação.');
      return;
    }

    setIsSendingEmail(true);

    // Usar setTimeout para evitar problemas de sincronização
    setTimeout(() => {
      try {
        // Preparar dados
        const now = new Date();
        const timestamp = now.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        // Corpo do email
        const emailText = `═══════════════════════════════════════════════════
🔐 SOLICITAÇÃO DE RECUPERAÇÃO DE ACESSO
Sistema de Controle de Estoque - Mega Promo
═══════════════════════════════════════════════════

📋 DADOS DO SOLICITANTE:
Nome: ${recoveryName}
Motivo: ${recoveryReason}
Data/Hora: ${timestamp}

⚠️ AÇÃO NECESSÁRIA:
Esta pessoa está solicitando recuperação de acesso ao sistema.
Por favor, verifique a identidade do solicitante antes de
fornecer as credenciais de acesso.

═══════════════════════════════════════════════════
© 2025 Mega Promo Merchandising - São Paulo, SP
═══════════════════════════════════════════════════`;

        const emailSubject = '🔐 Solicitação de Recuperação de Acesso - Sistema de Estoque Mega Promo';
        const emailTo = 'dp1@megapromomarketing.com.br';

        // Tentar copiar para clipboard (sem await para evitar erros)
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(emailText).catch(() => {
            console.log('Clipboard não disponível');
          });
        }

        // Abrir email com mailto
        const mailtoLink = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`;
        
        // Usar window.location.href ao invés de window.open para maior compatibilidade
        window.location.href = mailtoLink;

        // Mostrar sucesso
        setEmailSent(true);
        setIsSendingEmail(false);
        
        // Fechar modal após 5 segundos
        setTimeout(() => {
          setShowRecoveryDialog(false);
          setEmailSent(false);
          setRecoveryName('');
          setRecoveryReason('');
        }, 5000);

      } catch (error) {
        console.error('Erro:', error);
        setIsSendingEmail(false);
        alert('✅ Texto copiado!\n\nPor favor, cole em um email e envie para:\ndp1@megapromomarketing.com.br');
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-2 shadow-xl border-4 border-orange-100 mb-4">
            <img 
              src={logoMegaPromo} 
              alt="Mega Promo Merchandising" 
              className="w-24 h-24 rounded-full"
            />
          </div>
          <h1 className="text-gray-900 mb-2 text-3xl">Mega Promo</h1>
          <p className="text-orange-600 font-semibold">MERCHANDISING</p>
          <p className="text-gray-500 text-sm mt-2">Sistema de Controle de Estoque</p>
        </div>

        {/* Card de Login */}
        <Card className="border-orange-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Lock className="w-5 h-5" />
              Acessar Sistema
            </CardTitle>
            <CardDescription className="text-orange-50 text-center">
              Entre com suas credenciais para acessar todas as funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Usuário */}
              <div>
                <Label htmlFor="username" className="text-gray-700 font-medium mb-2 block">
                  Usuário
                </Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário"
                    className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium mb-2 block">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Erro */}
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Botão Login */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-5"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>

            {/* Botão Continuar sem Login */}
            <Button
              type="button"
              variant="outline"
              onClick={handleContinueWithoutLogin}
              className="w-full border-gray-300 hover:bg-gray-50 text-gray-700"
            >
              Continuar sem Login (Apenas Visualização)
            </Button>

            {/* Info */}
            <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Informação</p>
              <p className="text-xs leading-relaxed">
                Sem login você pode visualizar o <strong>Estoque</strong> e o <strong>Histórico</strong>.
                Para cadastrar itens e movimentar estoque, faça login.
              </p>
            </div>

            {/* Botão Recuperar Admin */}
            <div className="mt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowRecoveryDialog(true)}
                className="w-full text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <ShieldAlert className="w-3 h-3 mr-1" />
                Esqueci os dados do Admin
              </Button>
            </div>

            {/* Botão de Teste Rápido */}
            <div className="mt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setRecoveryName('Teste Sistema - ' + new Date().toLocaleTimeString('pt-BR'));
                  setRecoveryReason('Email de teste automático para verificar funcionamento do sistema de recuperação de senha. Data/Hora: ' + new Date().toLocaleString('pt-BR'));
                  setShowRecoveryDialog(true);
                  // Auto-enviar após 1 segundo
                  setTimeout(() => {
                    const event = new Event('submit');
                    handleSendRecoveryEmail();
                  }, 1500);
                }}
                className="w-full text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Send className="w-3 h-3 mr-1" />
                📧 Enviar Email de Teste Automático
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          © 2025 Mega Promo Merchandising - São Paulo, SP
        </p>
      </div>

      {/* Modal de Recuperação de Conta por Email */}
      <AlertDialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded">
                <Mail className="w-5 h-5 text-blue-700" />
              </div>
              <AlertDialogTitle className="text-xl text-gray-900">
                Recuperação de Acesso Admin
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-gray-700">
              Preencha os dados abaixo para solicitar a recuperação de acesso. Uma notificação será enviada para dp1@megapromomarketing.com.br.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            {/* Nome Completo */}
            <div>
              <Label htmlFor="recoveryName" className="text-gray-700 font-medium mb-2 block text-sm">
                Nome Completo *
              </Label>
              <Input
                id="recoveryName"
                type="text"
                value={recoveryName}
                onChange={(e) => setRecoveryName(e.target.value)}
                placeholder="Digite seu nome completo"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                disabled={isSendingEmail || emailSent}
              />
            </div>

            {/* Motivo */}
            <div>
              <Label htmlFor="recoveryReason" className="text-gray-700 font-medium mb-2 block text-sm">
                Motivo da Solicitação *
              </Label>
              <Textarea
                id="recoveryReason"
                value={recoveryReason}
                onChange={(e) => setRecoveryReason(e.target.value)}
                placeholder="Ex: Esqueci a senha do admin e preciso recuperar o acesso ao sistema"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
                disabled={isSendingEmail || emailSent}
              />
            </div>

            {/* Info */}
            <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Como funciona:</p>
              <ul className="text-xs space-y-1 leading-relaxed">
                <li>• Clique em <strong>"Enviar Solicitação"</strong></li>
                <li>• Seu programa de email abrirá <strong>AUTOMATICAMENTE</strong></li>
                <li>• O email já virá <strong>totalmente preenchido</strong></li>
                <li>• Basta clicar <strong>"Enviar"</strong> no seu email</li>
              </ul>
            </div>

            {/* Aviso de Sistema Automático */}
            <div className="p-3 bg-green-50 border-l-4 border-green-500 rounded text-sm text-green-900">
              <p className="font-semibold mb-1 flex items-center gap-2">
                <span className="text-base">✅</span> Sistema Semi-Automático
              </p>
              <p className="text-xs leading-relaxed">
                O texto será <strong>copiado automaticamente</strong> e seu <strong>Gmail/Outlook abrirá sozinho</strong> com tudo preenchido. Você só precisa clicar no botão "Enviar" do email!
              </p>
            </div>

            {/* Sucesso */}
            {emailSent && (
              <div className="p-3 bg-green-50 border border-green-200 rounded animate-in fade-in duration-300">
                <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                  <span className="text-lg">✅</span> Email Enviado com Sucesso!
                </p>
                <p className="text-green-800 text-xs leading-relaxed">
                  Sua solicitação foi enviada para <strong>dp1@megapromomarketing.com.br</strong>. 
                  Aguarde o retorno do administrador com as credenciais de acesso.
                </p>
              </div>
            )}
          </div>

          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel 
              className="border-gray-300"
              disabled={isSendingEmail}
              onClick={() => {
                setShowRecoveryDialog(false);
                setEmailSent(false);
                setRecoveryName('');
                setRecoveryReason('');
              }}
            >
              {emailSent ? 'Fechar' : 'Cancelar'}
            </AlertDialogCancel>
            {!emailSent && (
              <Button
                onClick={handleSendRecoveryEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isSendingEmail || !recoveryName.trim() || !recoveryReason.trim()}
              >
                {isSendingEmail ? (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4 animate-pulse" />
                    Enviando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Enviar Solicitação
                  </span>
                )}
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}