# 📦 Sistema de Estoque Mega Promo

Sistema completo de controle de estoque com autenticação, movimentações, histórico e exportação para Excel.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (para backend)

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📋 Funcionalidades

### ✨ Principais
- **Controle de Estoque**: Visualização, cadastro e edição de itens
- **Movimentações**: Registro de entradas e saídas com histórico completo
- **Autenticação**: Sistema de usuários com permissões granulares
- **Filtros Avançados**: Busca e filtros em tempo real com debounce
- **Exportação**: Exportação para Excel do estoque e histórico
- **Edição Inline**: Edição direta de nomes e quantidades na lista

### 🎯 Recursos Técnicos
- **Performance Otimizada**: 
  - Debounce de 300ms em buscas
  - Memoização com `useMemo` e `useCallback`
  - Cache de ícones e dados
  - Atualizações otimistas
- **Interface Moderna**: 
  - Design responsivo
  - Feedback visual imediato
  - Filtros dinâmicos
  - Cards visuais com status de estoque

## 🏗️ Arquitetura

### Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── EstoqueAtual.tsx      # Visualização de estoque
│   ├── Historico.tsx         # Histórico de movimentações
│   ├── CadastrarItem.tsx     # Cadastro de itens
│   ├── RegistrarMovimentacao.tsx  # Registro de movimentações
│   └── ui/                    # Componentes UI reutilizáveis
├── utils/               # Utilitários
│   ├── api.ts                 # Cliente API
│   ├── productIcons.tsx       # Utilitário de ícones
│   └── initialData.ts         # Dados iniciais
├── supabase/           # Backend Supabase
│   └── functions/server/      # Edge Functions
└── AppWithSupabase.tsx # Componente principal
```

### Fluxo de Dados

```
Frontend Component
    ↓
API Service (utils/api.ts)
    ↓
Supabase Edge Function
    ↓
Supabase Database
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### Inicialização do Banco de Dados

1. Acesse o Supabase Dashboard
2. Execute o SQL de migração em `src/supabase/migrations/001_initial_schema.sql`
3. Configure as políticas RLS conforme necessário

## 📝 Changelog

### [1.0.6] - 2025-01-26

#### ✨ Adicionado
- Edição inline de nome de produto diretamente na lista
- Componente `InlineEditableText` reutilizável
- Sincronização automática em todas as partes do sistema
- Validação de nome (mínimo 2, máximo 100 caracteres)

#### ⚡ Performance
- Atualização otimista do estado
- Componente memoizado para evitar re-renders
- Debounce melhorado nos filtros

### [1.0.5] - 2025-01-26

#### 🔄 Alterado
- Refatorações de código para melhor manutenibilidade
- Otimizações de componentes
- Melhorias nos filtros com debounce

#### 🧹 Limpeza
- Remoção de código duplicado
- Utilitário compartilhado para ícones de produtos
- Imports não utilizados removidos

### Versões Anteriores
- **v1.0.4**: Correção de validação e redesign de cards
- **v1.0.3**: Correção crítica da aba Histórico
- **v1.0.2**: Otimizações de performance
- **v1.0.1**: Filtros dinâmicos e edição de itens
- **v1.0.0**: Versão inicial

## 🚀 Deploy

### Vercel (Recomendado)

O projeto está configurado para deploy automático no Vercel:

1. **Deploy Automático**: 
   - Push para `main` no GitHub
   - Vercel detecta e faz deploy automaticamente

2. **Deploy Manual**:
   ```bash
   git push origin main
   # Acesse o dashboard do Vercel para verificar
   ```

### Checklist de Deploy

- [ ] Build passando localmente (`npm run build`)
- [ ] Testado localmente em todas as abas
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Banco de dados inicializado
- [ ] Versão tagada no Git

## 🛠️ Desenvolvimento

### Estrutura de Código

- **Componentes**: Funcionais com hooks React
- **Estado**: Gerenciado com `useState` e `useReducer`
- **Performance**: `useMemo` e `useCallback` para otimização
- **API**: Cliente centralizado em `utils/api.ts`

### Melhores Práticas

1. **Memoização**: Use `useMemo` para cálculos pesados
2. **Callbacks**: Use `useCallback` para handlers passados como props
3. **Debounce**: Sempre use debounce em buscas e filtros
4. **Validação**: Valide dados antes de enviar para API
5. **Error Handling**: Trate erros adequadamente

## 🐛 Troubleshooting

### Problemas Comuns

**Erro ao carregar dados:**
- Verifique as variáveis de ambiente
- Confirme que o banco está inicializado
- Verifique as políticas RLS no Supabase

**Filtros não funcionam:**
- Limpe o cache do navegador
- Verifique se há dados no estoque
- Confirme que os filtros estão com debounce

**Build falha:**
- Execute `npm install` novamente
- Verifique versão do Node.js (18+)
- Limpe `node_modules` e reinstale

## 📊 Performance

### Otimizações Implementadas

- ✅ Debounce de 300ms em todas as buscas
- ✅ Memoização de filtros e cálculos
- ✅ Cache de ícones de produtos
- ✅ Atualizações otimistas
- ✅ Lazy loading de componentes
- ✅ Redução de re-renders desnecessários

### Métricas

- Tempo de carregamento inicial: < 2s
- Tempo de resposta de filtros: < 100ms (com debounce)
- Tamanho do bundle: Otimizado com Vite

## 🔒 Segurança

- Autenticação baseada em usuários
- Permissões granulares por funcionalidade
- Validação de dados no frontend e backend
- Políticas RLS no Supabase
- Sanitização de inputs

## 📄 Licença

Este projeto é privado e proprietário.

## 👥 Contribuição

Para contribuir:
1. Crie uma branch para sua feature
2. Faça suas alterações
3. Teste localmente
4. Abra um Pull Request

## 📞 Suporte

Para problemas ou dúvidas:
- Verifique a documentação
- Revise o changelog
- Consulte os logs do console

---

**Última atualização**: 2025-01-26  
**Versão**: 1.0.6
