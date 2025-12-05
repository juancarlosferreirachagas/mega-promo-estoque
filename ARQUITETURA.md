# 🏗️ ARQUITETURA PROFISSIONAL - SISTEMA DE ESTOQUE

## 📐 Estrutura Proposta

```
src/
├── api/                           # Cliente API organizado
│   ├── inventory.service.ts      # Service para inventário
│   ├── movements.service.ts      # Service para movimentações
│   ├── users.service.ts          # Service para usuários
│   └── client.ts                 # Configuração base do cliente
│
├── hooks/                         # Hooks customizados React
│   ├── useInventory.ts           # Hook para gerenciar inventário
│   ├── useMovements.ts           # Hook para gerenciar movimentações
│   ├── useAuth.ts                # Hook para autenticação
│   └── useOptimisticUpdate.ts    # Hook para updates otimistas
│
├── services/                      # Lógica de negócio
│   ├── inventory.service.ts      # Regras de negócio inventário
│   ├── movements.service.ts      # Regras de negócio movimentações
│   └── cache.service.ts          # Gerenciamento de cache
│
├── types/                         # TypeScript types centralizados
│   ├── inventory.types.ts
│   ├── movements.types.ts
│   ├── users.types.ts
│   └── index.ts
│
├── utils/                         # Utilitários
│   ├── validators/               # Validações
│   ├── formatters/               # Formatadores
│   ├── constants/                # Constantes
│   └── errors/                   # Tratamento de erros
│
└── supabase/functions/server/     # Backend Edge Function
    ├── controllers/               # Controllers por domínio
    │   ├── inventory.controller.ts
    │   ├── movements.controller.ts
    │   └── users.controller.ts
    ├── services/                  # Services backend
    │   ├── inventory.service.ts
    │   ├── movements.service.ts
    │   └── cache.service.ts
    ├── middleware/                # Middlewares
    │   ├── error-handler.ts
    │   ├── validator.ts
    │   └── logger.ts
    └── index.ts                   # Router principal
```

## 🎯 Princípios

1. **Separação de Responsabilidades**: Cada módulo tem uma responsabilidade clara
2. **DRY (Don't Repeat Yourself)**: Código reutilizável
3. **SOLID**: Princípios de design sólidos
4. **Type Safety**: TypeScript rigoroso
5. **Error Handling**: Tratamento centralizado de erros

## 🚀 Fluxo de Dados

```
Frontend Component
    ↓
Hook (useInventory, useMovements, etc)
    ↓
Service (lógica de negócio)
    ↓
API Service (comunicação HTTP)
    ↓
Backend Edge Function
    ↓
Controller
    ↓
Service (lógica backend)
    ↓
Supabase Database
```

## 💾 Cache Strategy

- **Frontend**: React Query para cache automático de queries
- **Backend**: Cache em memória para queries frequentes
- **Redis**: Opcional para cache distribuído (se escalar)

## 📝 Próximos Passos

1. ✅ Criar estrutura de tipos centralizada
2. ⏳ Refatorar backend em módulos
3. ⏳ Criar services no frontend
4. ⏳ Criar hooks customizados
5. ⏳ Implementar cache

