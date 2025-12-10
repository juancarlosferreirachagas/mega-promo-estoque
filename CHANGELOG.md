# 📋 CHANGELOG - Sistema de Estoque Mega Promo

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.0.7] - 2025-01-27

### 🐛 Corrigido
- **Erros TypeScript corrigidos**:
  - Parâmetro `open` em `onOpenChange` do AlertDialog agora tem tipo explícito `boolean`
  - Parâmetro `value` em `onValueChange` do Select agora tem tipo explícito `string`
- **Warnings de código não utilizado removidos**:
  - Removidos imports não utilizados: `Zap` e `Heart` de lucide-react
  - Removido parâmetro não utilizado `size` da função `getSizeColor`
  - Removida função não utilizada `handleEditClick`

### 🧹 Limpeza de Código
- **Reversão de código complexo**: Removida implementação complexa de validação automática de usuários master
- **Código simplificado**: Backend e frontend voltaram ao estado original sem validações automáticas pesadas
- **Solução direta**: Criado script SQL simples (`fix_master_users.sql`) para correção manual de usuários master

### 📝 Documentação
- **Script SQL de correção**: Criado `fix_master_users.sql` para garantir que apenas Giovana seja master
- **Instruções claras**: Documentado processo simples de correção via SQL direto no Supabase
- **Abordagem pragmática**: Escolhida solução simples e direta em vez de validações automáticas complexas

### 🎯 Mudanças de Design
- **Filosofia simplificada**: Decisão consciente de evitar código complexo que pode quebrar
- **Manutenibilidade**: Código mais fácil de manter e entender
- **Risco reduzido**: Menos código = menos pontos de falha

---

## [1.0.6] - 2025-01-26

### ✨ Adicionado
- **Edição inline de nome de produto** diretamente na lista de estoque
  - Componente reutilizável `InlineEditableText` para edição inline profissional
  - Edição clicando no nome do produto no card de estoque
  - Validação de nome (mínimo 2 caracteres, máximo 100 caracteres)
  - Sincronização automática em todas as partes do sistema:
    - Lista de estoque
    - Histórico de movimentações
    - Listas suspensas de cadastro de itens
    - Listas suspensas de registro de movimentações
  - Atualização otimista do estado local para melhor UX
  - Persistência no banco de dados (Supabase)

### 🎨 Melhorias de Interface
- Interface de edição inline intuitiva com botões de salvar/cancelar
- Feedback visual durante o salvamento
- Mensagens de erro claras e diretas

### ⚡ Performance
- Atualização otimista do estado para resposta imediata
- Sem refresh desnecessário após edição
- Componente memoizado para evitar re-renders

### 🛡️ Validações
- Validação de constraint UNIQUE(name, size) no backend
- Validação de tamanho mínimo e máximo no frontend
- Tratamento de erros robusto

## [1.0.5] - 2025-01-26

### 🔄 Versão intermediária
- Melhorias e correções gerais

---

## [1.0.6] - 2025-01-26

### ✨ Adicionado
- **Edição inline de nome de produto** diretamente na lista de estoque
  - Componente reutilizável `InlineEditableText` para edição inline profissional
  - Edição clicando no nome do produto no card de estoque
  - Validação de nome (mínimo 2 caracteres, máximo 100 caracteres)
  - Sincronização automática em todas as partes do sistema:
    - Lista de estoque
    - Histórico de movimentações
    - Listas suspensas de cadastro de itens
    - Listas suspensas de registro de movimentações
  - Atualização otimista do estado local para melhor UX
  - Persistência no banco de dados (Supabase)

### 🎨 Melhorias de Interface
- Interface de edição inline intuitiva com botões de salvar/cancelar
- Feedback visual durante o salvamento
- Mensagens de erro claras e diretas

### ⚡ Performance
- Atualização otimista do estado para resposta imediata
- Sem refresh desnecessário após edição
- Componente memoizado para evitar re-renders

### 🛡️ Validações
- Validação de constraint UNIQUE(name, size) no backend
- Validação de tamanho mínimo e máximo no frontend
- Tratamento de erros robusto

---

## [1.0.5] - 2025-01-26

### 🔄 Versão intermediária
- Melhorias e correções gerais

## [1.0.4] - 2025-11-24

### 🐛 Corrigido
- **CRÍTICO**: Corrigida validação de tamanho no cadastro de itens
  - Resolvido problema onde sistema pedia tamanho mesmo após seleção
  - Corrigida lógica de validação para produtos customizados com seleção múltipla
  - Corrigida validação para tamanho único em produtos customizados
  - Melhorada validação para tamanho customizado em produtos normais

### 🎨 Melhorias de Interface
- **EstoqueAtual.tsx**: Redesign completo dos cards de estoque
  - Removidas todas as animações (motion.div) para melhor performance
  - Cores corretas: Verde para estoque OK (≥10), Vermelho para estoque baixo (<10)
  - Implementada edição inline de quantidade (clicar no número para editar)
  - Badges de tamanho maiores e mais legíveis (`text-sm` com `px-3 py-2`)
  - Tipografia melhorada: textos maiores e mais claros
  - Botões sempre visíveis (não apenas no hover)
  - Melhor espaçamento e hierarquia visual
  - Labels descritivos "TAMANHO:" e "QUANTIDADE:" em maiúsculas
  - Todos os textos em maiúsculas para consistência visual

### ⚡ Performance
- Removida dependência de `motion/react` do componente EstoqueAtual
- Redução de re-renders desnecessários
- Build otimizado e validado

### 🧹 Limpeza de Código
- Código de validação refatorado e simplificado
- Melhor organização da lógica de edição inline
- Removidos imports não utilizados

## [1.0.3] - 2025-11-24

### 🐛 Corrigido
- **CRÍTICO**: Corrigida aba "Histórico" que não renderizava (tela em branco)
  - Reorganizada ordem de definição de funções no componente Historico
  - Corrigida referência a `filteredMovements` antes de sua definição
  - Adicionadas validações completas de null/undefined
  - Implementado error boundary para renderização segura
- Corrigidos imports incorretos em múltiplos componentes
  - `src/utils/api.ts`: Corrigido import de `AppWithAuth` para `AppWithSupabase`
  - `src/components/RegistrarMovimentacao.tsx`: Corrigido import de `App` para `AppWithSupabase`
  - `src/components/GerenciarUsuarios.tsx`: Corrigido import de `App` para `AppWithSupabase`
- Corrigida ordem de definição de funções em `AppWithSupabase.tsx`
  - `showMessage` e `loadInitialData` movidos para antes de `checkDatabaseInit`
  - Resolvida dependência circular que causava erros de renderização

### ⚡ Performance
- Componente `Historico.tsx` completamente refatorado
  - `filteredMovements` memoizado com `useMemo`
  - `handleExportExcel` memoizado com `useCallback`
  - `getItemInfo` memoizado com `useCallback`
  - Redução significativa de re-renders desnecessários
- Melhorado tratamento de arrays vazios e dados inválidos
- Otimizado carregamento de logs de auditoria

### 🛡️ Confiabilidade
- Adicionado error boundary no componente Historico
- Validações robustas em todos os pontos críticos
- Tratamento de erros melhorado em `formatTimestamp`
- Proteção contra dados inválidos no localStorage

### 🧹 Limpeza de Código
- Removidos logs de debug desnecessários
- Código reorganizado seguindo princípios de Clean Code
- Separação clara entre estados, constantes, funções auxiliares e renderização
- Removidos try-catch desnecessários que não agregavam valor

### 📝 Documentação
- Criado arquivo `RESUMO_MELHORIAS.md` com explicação detalhada
- Criado `CHANGELOG.md` para versionamento profissional
- Documentação inline melhorada

---

## [1.0.2] - 2025-11-24

### ⚡ Performance
- Implementação completa de `useMemo` e `useCallback` em todos os componentes
- Debounce de 300ms para operações de localStorage
- Otimização de re-renders com memoização adequada
- Functional updates para evitar dependências desnecessárias

### 🛡️ Gerenciamento de Estados
- Uso de functional updates (`prev => ...`) em setState
- Tratamento de erros aprimorado em operações de localStorage
- Validação de dados antes de salvar no localStorage

### 📊 Componentes Otimizados
- `AppWithSupabase.tsx`: Todas as funções memoizadas
- `EstoqueAtual.tsx`: Handlers memoizados
- `Historico.tsx`: Filtros e exportação memoizados
- `RegistrarMovimentacao.tsx`: Submit e motivos customizados memoizados
- `CadastrarItem.tsx`: Submit memoizado

---

## [1.0.1] - 2025-11-24

### ✨ Adicionado
- Filtros dinâmicos na aba Estoque que se atualizam automaticamente
- Funcionalidade de editar quantidade de itens no estoque
- Botão "X" para remover produtos customizados
- Filtros vinculados (produto → tamanho)
- Correção de scroll em listas suspensas (Select components)
- Melhorias visuais nos cards de estoque (formato compacto "quadradinhos")
- Melhorias visuais na seção de filtros

### 🐛 Corrigido
- Filtros agora mostram apenas produtos/tamanhos realmente no estoque
- Valores dos filtros exibidos em maiúsculas
- Scroll funcionando corretamente em dropdowns

---

## [1.0.0] - 2025-11-24

### ✨ Adicionado
- Sistema completo de controle de estoque
- Autenticação de usuários com permissões
- Visualização rápida de estoque sem login
- Cadastro de itens
- Registro de movimentações (entrada/saída)
- Histórico completo de movimentações
- Gerenciamento de usuários
- Exportação para Excel
- Filtros e busca avançada
- Interface moderna e responsiva

---

## Tipos de Mudanças

- **✨ Adicionado**: Novas funcionalidades
- **🔄 Alterado**: Mudanças em funcionalidades existentes
- **🗑️ Removido**: Funcionalidades removidas
- **🐛 Corrigido**: Correções de bugs
- **⚡ Performance**: Melhorias de performance
- **🛡️ Segurança**: Correções de segurança
- **📝 Documentação**: Mudanças na documentação
- **🧹 Limpeza**: Limpeza de código, refatoração

