# 📚 GUIA DE VERSIONAMENTO E DEPLOY

## 🎯 Qual a Melhor Prática?

Para o seu caso, recomendo usar **TAGS** para versionamento e manter tudo no branch `main`. É mais simples e seguro.

---

## 🌿 BRANCHES vs 🏷️ TAGS

### 🌿 BRANCHES (Ramos)
**O que são**: Cópias paralelas do código onde você pode trabalhar sem afetar o código principal.

**Quando usar**:
- ✅ Para desenvolver novas funcionalidades grandes
- ✅ Para testar mudanças antes de colocar no código principal
- ✅ Quando várias pessoas trabalham no mesmo projeto

**Exemplo**:
```
main (código principal)
  └── feature/nova-funcionalidade (desenvolvimento)
  └── fix/correcao-bug (correção)
```

### 🏷️ TAGS (Etiquetas)
**O que são**: "Marcadores" em pontos específicos do código, como uma foto de um momento importante.

**Quando usar**:
- ✅ Para marcar versões que vão para produção (v1.0.0, v1.0.1, etc.)
- ✅ Para ter um histórico claro de versões
- ✅ Para poder voltar facilmente a uma versão específica

**Exemplo**:
```
v1.0.0 ← Versão inicial
v1.0.1 ← Primeira atualização
v1.0.2 ← Segunda atualização
v1.0.3 ← Versão atual
```

---

## ✅ RECOMENDAÇÃO PARA SEU PROJETO

### Estrutura Recomendada:

```
main (branch principal)
  ├── v1.0.0 (tag) - Versão inicial
  ├── v1.0.1 (tag) - Filtros dinâmicos
  ├── v1.0.2 (tag) - Otimizações
  └── v1.0.3 (tag) - Correção Histórico ← ATUAL
```

**Por quê?**
1. ✅ Mais simples de gerenciar
2. ✅ Vercel faz deploy automático do `main`
3. ✅ Tags permitem voltar facilmente a versões anteriores
4. ✅ Histórico limpo e organizado
5. ✅ Menos chance de confusão

---

## 🚀 PROCESSO RECOMENDADO DE DEPLOY

### Passo 1: Testar Localmente ✅
```bash
npm run dev
# Testar tudo em http://localhost:3000
```

### Passo 2: Verificar Build ✅
```bash
npm run build
# Deve passar sem erros
```

### Passo 3: Commitar Mudanças ✅
```bash
git add -A
git commit -m "fix: descrição das mudanças"
```

### Passo 4: Criar Tag de Versão ✅
```bash
git tag -a v1.0.3 -m "v1.0.3 - Descrição da versão"
```

### Passo 5: Fazer Push ✅
```bash
git push origin main        # Envia código
git push origin v1.0.3      # Envia tag
```

### Passo 6: Vercel Faz Deploy Automático ✅
- O Vercel detecta o push no `main`
- Faz deploy automaticamente
- Você pode acompanhar no dashboard

---

## 🔄 QUANDO USAR BRANCHES?

Use branches apenas se:

1. **Desenvolvimento Paralelo**: Você quer testar algo sem afetar o código principal
2. **Funcionalidades Grandes**: Vai levar vários dias para desenvolver
3. **Testes Extensos**: Precisa testar muito antes de colocar no principal

**Exemplo de uso de branch:**
```bash
# Criar branch para nova funcionalidade
git checkout -b feature/nova-funcionalidade

# Trabalhar na funcionalidade
# ... fazer mudanças ...

# Quando estiver pronto, voltar para main
git checkout main

# Trazer as mudanças da branch
git merge feature/nova-funcionalidade

# Deletar a branch (opcional)
git branch -d feature/nova-funcionalidade
```

---

## 🛡️ ESTRATÉGIA DE SEGURANÇA

### Para Garantir que Não Quebra:

1. **Sempre testar localmente primeiro** ✅
2. **Build deve passar sem erros** ✅
3. **Manter versões anteriores disponíveis** (tags) ✅
4. **Documentar todas as mudanças** (CHANGELOG.md) ✅

### Se Algo Der Errado:

**Opção 1: Reverter no Vercel**
- Dashboard → Deployments → Versão anterior → Redeploy

**Opção 2: Reverter no Git**
```bash
# Voltar para tag anterior
git checkout v1.0.2
git push origin main --force
```

---

## 📊 COMPARAÇÃO RÁPIDA

| Aspecto | Branches | Tags |
|---------|----------|------|
| **Simplicidade** | ⚠️ Mais complexo | ✅ Mais simples |
| **Para Produção** | ⚠️ Requer merge | ✅ Direto |
| **Histórico** | ⚠️ Pode ficar confuso | ✅ Limpo |
| **Reversão** | ⚠️ Mais trabalhoso | ✅ Fácil |
| **Recomendado para você** | ❌ Não necessário | ✅ **SIM** |

---

## ✅ CONCLUSÃO

**Para o seu projeto, use TAGS no branch `main`.**

É a abordagem mais simples, segura e adequada para um projeto onde você trabalha sozinho ou em equipe pequena.

**Estrutura Final:**
```
main (sempre atualizado)
  ├── v1.0.0
  ├── v1.0.1
  ├── v1.0.2
  └── v1.0.3 ← Versão atual, pronta para deploy
```

---

**Última atualização**: 2025-11-24

