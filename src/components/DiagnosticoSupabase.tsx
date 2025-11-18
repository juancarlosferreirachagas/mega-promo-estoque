import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle, Database, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export default function DiagnosticoSupabase() {
  const [diagnostico, setDiagnostico] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const executarDiagnostico = async () => {
    setIsLoading(true);
    const resultado: any = {
      timestamp: new Date().toISOString(),
      credenciais: {
        projectId: projectId,
        projectIdParcial: projectId ? `${projectId.substring(0, 8)}...${projectId.substring(projectId.length - 4)}` : 'NÃO DEFINIDO',
        anonKeyParcial: publicAnonKey ? `${publicAnonKey.substring(0, 20)}...${publicAnonKey.substring(publicAnonKey.length - 10)}` : 'NÃO DEFINIDA',
        supabaseUrl: `https://${projectId}.supabase.co`
      },
      testes: []
    };

    try {
      // Teste 1: Verificar conectividade básica
      resultado.testes.push({
        nome: 'Conectividade Básica',
        status: 'testando...'
      });

      const healthCheck = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      resultado.testes[0].status = healthCheck.ok ? '✅ OK' : '❌ FALHOU';
      resultado.testes[0].httpStatus = healthCheck.status;

      // Teste 2: Tentar listar tabelas (vai falhar se não existirem)
      resultado.testes.push({
        nome: 'Buscar Tabela mega_promo_users',
        status: 'testando...'
      });

      const usersCheck = await fetch(`https://${projectId}.supabase.co/rest/v1/mega_promo_users?limit=1`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      const usersData = await usersCheck.json();
      
      if (usersCheck.ok) {
        resultado.testes[1].status = '✅ TABELA ENCONTRADA!';
        resultado.testes[1].dados = usersData;
      } else {
        resultado.testes[1].status = '❌ TABELA NÃO ENCONTRADA';
        resultado.testes[1].erro = usersData;
      }

      // Teste 3: Verificar outras tabelas
      resultado.testes.push({
        nome: 'Buscar Tabela mega_promo_inventory',
        status: 'testando...'
      });

      const inventoryCheck = await fetch(`https://${projectId}.supabase.co/rest/v1/mega_promo_inventory?limit=1`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      resultado.testes[2].status = inventoryCheck.ok ? '✅ ENCONTRADA' : '❌ NÃO ENCONTRADA';

      resultado.testes.push({
        nome: 'Buscar Tabela mega_promo_movements',
        status: 'testando...'
      });

      const movementsCheck = await fetch(`https://${projectId}.supabase.co/rest/v1/mega_promo_movements?limit=1`, {
        headers: {
          'apikey': publicAnonKey,
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      resultado.testes[3].status = movementsCheck.ok ? '✅ ENCONTRADA' : '❌ NÃO ENCONTRADA';

    } catch (error: any) {
      resultado.erro = error.message;
    }

    setIsLoading(false);
    setDiagnostico(resultado);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-orange-200 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6" />
          <CardTitle>🔍 Diagnóstico de Conexão Supabase</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        <div className="flex gap-3">
          <Button
            onClick={executarDiagnostico}
            disabled={isLoading}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando Diagnóstico...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Executar Diagnóstico Completo
              </>
            )}
          </Button>
        </div>

        {diagnostico && (
          <div className="space-y-4">
            {/* Credenciais */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-bold text-blue-900 mb-3">📋 Credenciais em Uso:</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>
                  <span className="text-blue-700">Project ID:</span>{' '}
                  <span className="font-bold">{diagnostico.credenciais.projectId}</span>
                </div>
                <div>
                  <span className="text-blue-700">Supabase URL:</span>{' '}
                  <span className="font-bold">{diagnostico.credenciais.supabaseUrl}</span>
                </div>
                <div>
                  <span className="text-blue-700">Anon Key:</span>{' '}
                  <span className="text-gray-500">{diagnostico.credenciais.anonKeyParcial}</span>
                </div>
              </div>
            </div>

            {/* Testes */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="font-bold text-gray-900 mb-3">🧪 Resultados dos Testes:</h3>
              <div className="space-y-3">
                {diagnostico.testes.map((teste: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-white rounded border">
                    {teste.status.includes('✅') ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold">{teste.nome}</div>
                      <div className="text-sm">{teste.status}</div>
                      {teste.erro && (
                        <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(teste.erro, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnóstico */}
            {diagnostico.testes.some((t: any) => t.status.includes('❌')) && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded">
                <h3 className="font-bold text-yellow-900 mb-3">⚠️ PROBLEMA IDENTIFICADO:</h3>
                <div className="space-y-3 text-sm text-yellow-900">
                  <p className="font-semibold">
                    As tabelas NÃO foram encontradas no projeto: <span className="font-mono">{diagnostico.credenciais.projectId}</span>
                  </p>
                  
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                    <p className="font-bold mb-2">🎯 POSSÍVEIS CAUSAS:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Você executou o SQL em um <strong>projeto DIFERENTE</strong> do Supabase</li>
                      <li>O sistema está usando credenciais de <strong>outro projeto</strong></li>
                      <li>As tabelas foram criadas no schema errado (não em "public")</li>
                    </ol>
                  </div>

                  <div className="bg-green-100 border border-green-300 rounded p-3">
                    <p className="font-bold mb-2">✅ SOLUÇÃO:</p>
                    <ol className="list-decimal list-inside space-y-2 text-xs">
                      <li className="font-semibold">
                        Confirme o Project ID no Supabase:
                        <div className="mt-1 p-2 bg-white rounded border font-mono">
                          Settings → General → Reference ID
                        </div>
                      </li>
                      <li className="font-semibold">
                        Verifique se o Reference ID é: 
                        <div className="mt-1 p-2 bg-white rounded border font-mono text-blue-600">
                          {diagnostico.credenciais.projectId}
                        </div>
                      </li>
                      <li>
                        <strong>SE FOR O MESMO:</strong> Execute o SQL novamente nesse projeto
                      </li>
                      <li>
                        <strong>SE FOR DIFERENTE:</strong> Você precisa atualizar as credenciais do sistema ou executar o SQL no projeto correto
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {diagnostico.testes.every((t: any) => t.status.includes('✅')) && (
              <div className="p-4 bg-green-50 border-2 border-green-400 rounded">
                <h3 className="font-bold text-green-900 mb-2">✅ TUDO CERTO!</h3>
                <p className="text-sm text-green-800">
                  Todas as tabelas foram encontradas! O sistema deve funcionar agora.
                </p>
              </div>
            )}

            {/* Debug completo */}
            <details className="text-xs">
              <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                🔧 Debug Completo (Clique para expandir)
              </summary>
              <pre className="mt-2 bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                {JSON.stringify(diagnostico, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
