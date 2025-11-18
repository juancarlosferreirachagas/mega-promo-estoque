import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Database, Loader2, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import { initDatabase } from '../utils/api';
import DiagnosticoSupabase from './DiagnosticoSupabase';

interface DatabaseInitProps {
  onComplete: () => void;
}

export default function DatabaseInit({ onComplete }: DatabaseInitProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showManualSetup, setShowManualSetup] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const migrationSQL = `-- MEGA PROMO - Criar Tabelas
CREATE TABLE IF NOT EXISTS public.mega_promo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '{}'::jsonb,
  is_master BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mega_promo_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_item UNIQUE(name, size)
);

CREATE TABLE IF NOT EXISTS public.mega_promo_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES public.mega_promo_inventory(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  person_name TEXT NOT NULL,
  responsible TEXT NOT NULL,
  observations TEXT DEFAULT '',
  created_by TEXT NOT NULL,
  edited_by TEXT,
  edited_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico de auditoria
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

-- Adicionar colunas de auditoria se não existirem (para bancos já criados)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'mega_promo_movements' 
                 AND column_name = 'edited_by') THEN
    ALTER TABLE public.mega_promo_movements ADD COLUMN edited_by TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'mega_promo_movements' 
                 AND column_name = 'edited_at') THEN
    ALTER TABLE public.mega_promo_movements ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Criar usuário master
INSERT INTO public.mega_promo_users (username, password_hash, permissions, is_master)
VALUES (
  'admin',
  'YWRtaW4xMjM=',
  '{"canAddItem": true, "canRegisterMovement": true, "canEditMovement": true, "canDeleteMovement": true}'::jsonb,
  true
)
ON CONFLICT (username) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.mega_promo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mega_promo_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mega_promo_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mega_promo_audit_log ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (nomes únicos)
DROP POLICY IF EXISTS "Allow service role users" ON public.mega_promo_users;
DROP POLICY IF EXISTS "Allow service role inventory" ON public.mega_promo_inventory;
DROP POLICY IF EXISTS "Allow service role movements" ON public.mega_promo_movements;
DROP POLICY IF EXISTS "Allow service role audit" ON public.mega_promo_audit_log;

CREATE POLICY "Allow service role users" ON public.mega_promo_users FOR ALL USING (true);
CREATE POLICY "Allow service role inventory" ON public.mega_promo_inventory FOR ALL USING (true);
CREATE POLICY "Allow service role movements" ON public.mega_promo_movements FOR ALL USING (true);
CREATE POLICY "Allow service role audit" ON public.mega_promo_audit_log FOR ALL USING (true);`;

  const handleInit = async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // Tentar inicializar (criar usuário master)
      const result = await initDatabase();
      
      if (result.success) {
        setIsComplete(true);
        
        // Aguardar 2 segundos e continuar
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        // Se falhar, mostrar instruções manuais
        setError(result.error || 'As tabelas precisam ser criadas manualmente.');
        setShowManualSetup(true);
      }
    } catch (err) {
      console.error('Erro ao inicializar:', err);
      setError('As tabelas não existem. Execute o SQL manualmente no Supabase.');
      setShowManualSetup(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const copySQL = () => {
    try {
      // Método 1: Tentar usar Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(migrationSQL)
          .then(() => {
            setSqlCopied(true);
            setTimeout(() => setSqlCopied(false), 2000);
          })
          .catch(() => {
            // Se falhar, usar método alternativo
            fallbackCopySQL();
          });
      } else {
        // Clipboard API não disponível, usar método alternativo
        fallbackCopySQL();
      }
    } catch (error) {
      console.error('Erro ao copiar:', error);
      fallbackCopySQL();
    }
  };

  const fallbackCopySQL = () => {
    try {
      // Criar textarea temporário
      const textarea = document.createElement('textarea');
      textarea.value = migrationSQL;
      textarea.style.position = 'fixed';
      textarea.style.top = '0';
      textarea.style.left = '0';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      // Copiar
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      if (successful) {
        setSqlCopied(true);
        setTimeout(() => setSqlCopied(false), 2000);
      } else {
        alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o SQL manualmente (Ctrl+C).');
      }
    } catch (error) {
      console.error('Erro no fallback:', error);
      alert('Não foi possível copiar automaticamente. Por favor, selecione e copie o SQL manualmente (Ctrl+C).');
    }
  };

  // Auto-inicializar ao montar o componente
  useEffect(() => {
    handleInit();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="space-y-6 w-full max-w-4xl">
        <Card className="w-full border-orange-200 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Configuração do Banco de Dados</CardTitle>
                <CardDescription className="text-orange-50">
                  Mega Promo - Sistema de Estoque
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Inicializando */}
            {isInitializing && !showManualSetup && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium">Verificando banco de dados...</span>
                </div>
              </div>
            )}

            {/* Sucesso */}
            {isComplete && (
              <div className="text-center space-y-4">
                <div className="inline-block p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    ✅ Banco de Dados Pronto!
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Sistema inicializado. Redirecionando para login...
                  </p>
                </div>
              </div>
            )}

            {/* Setup Manual */}
            {showManualSetup && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-green-50 border-2 border-green-500 rounded-lg text-green-800">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-bold mb-2 text-lg">⚠️ VOCÊ JÁ EXECUTOU O SQL NO SUPABASE?</p>
                    <p className="text-sm mb-2">
                      Esses erros significam que <strong>AS TABELAS AINDA NÃO EXISTEM</strong> no banco de dados.
                    </p>
                    <div className="bg-yellow-100 border border-yellow-400 rounded p-3 mt-2 text-yellow-900">
                      <p className="font-bold text-sm mb-1">🚨 IMPORTANTE:</p>
                      <p className="text-xs">
                        Se você VIU o erro de sintaxe antes (linha 54), você executou o SQL ANTIGO que tinha bug.
                        Agora o SQL foi CORRIGIDO. Você precisa executar o SQL NOVO.
                      </p>
                    </div>
                    <div className="bg-blue-100 border border-blue-400 rounded p-3 mt-2 text-blue-900">
                      <p className="font-bold text-sm mb-1">✅ O QUE FAZER:</p>
                      <ul className="text-xs list-disc list-inside space-y-1">
                        <li>Atualize esta página (F5)</li>
                        <li>Copie o SQL corrigido abaixo</li>
                        <li>Volte ao Supabase SQL Editor</li>
                        <li>Delete o SQL antigo (se houver)</li>
                        <li>Cole o SQL NOVO</li>
                        <li>Execute com Ctrl + Enter</li>
                        <li>Aguarde "Success. No rows returned"</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-orange-100 border-2 border-orange-500 rounded-lg">
                  <p className="font-bold text-orange-900 mb-2 text-center text-lg">
                    ⏱️ AS TABELAS PRECISAM SER CRIADAS MANUALMENTE
                  </p>
                  <p className="text-orange-800 text-center text-sm">
                    O Figma Make não permite executar SQL automaticamente.
                    Você DEVE executar o SQL no painel do Supabase.
                  </p>
                </div>

                {/* Instruções Passo a Passo */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">📋 Passos para Configurar:</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="font-bold text-blue-600 text-lg">1.</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Abra o Painel do Supabase</p>
                        <a
                          href="https://supabase.com/dashboard"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm flex items-center gap-1 mt-1"
                        >
                          https://supabase.com/dashboard
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="font-bold text-blue-600 text-lg">2.</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Vá em SQL Editor</p>
                        <p className="text-sm text-gray-600 mt-1">
                          No menu lateral: <strong>SQL Editor</strong> → <strong>New query</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="font-bold text-blue-600 text-lg">3.</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">Copie e Cole este SQL:</p>
                        
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-x-auto max-h-64">
{migrationSQL}
                          </pre>
                          <Button
                            onClick={copySQL}
                            size="sm"
                            className="absolute top-2 right-2 bg-orange-600 hover:bg-orange-700"
                          >
                            {sqlCopied ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 mr-1" />
                                Copiar SQL
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                      <span className="font-bold text-blue-600 text-lg">4.</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Execute o SQL</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Clique em <strong>Run</strong> ou pressione <strong>Ctrl + Enter</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <span className="font-bold text-green-600 text-lg">5.</span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Volte e Teste</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Após executar o SQL, clique no botão abaixo para testar a conexão
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleInit}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Já Executei o SQL - Testar Conexão
                  </Button>
                </div>

                {/* Informações Adicionais */}
                <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded text-sm text-purple-800">
                  <p className="font-semibold mb-1">ℹ️ Informação Importante</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Este processo cria 3 tabelas no seu banco Supabase</li>
                    <li>Cria um usuário master: <strong>admin / admin123</strong></li>
                    <li>É necessário fazer apenas UMA vez</li>
                    <li>Suas tabelas ficarão no schema <strong>public</strong></li>
                  </ul>
                </div>
              </div>
            )}

            {/* Erro Geral */}
            {error && !showManualSetup && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded text-red-800">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold mb-1">Erro na Inicialização</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>

                <Button
                  onClick={handleInit}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                >
                  Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnóstico Supabase */}
        {showManualSetup && <DiagnosticoSupabase />}
      </div>
    </div>
  );
}