# 🌿 Como Trabalhar com Branches - Guia Rápido

## ✅ Estado Atual

Seu código local está **limpo** na versão **v1.0.5**.

Suas mudanças anteriores foram salvas no branch:
- `backup/trabalho-em-andamento-20251125-093352`

---

## 🚀 COMO RECOMEÇAR SEU TRABALHO

### **1. Criar um novo branch para suas alterações**

```bash
# Criar e mudar para um novo branch
git checkout -b feature/nome-da-sua-funcionalidade

# Exemplos:
git checkout -b feature/melhorias-interface
git checkout -b feature/correcao-bugs
git checkout -b feature/nova-funcionalidade
```

### **2. Trabalhar normalmente**

Agora você pode fazer suas alterações normalmente:
- Editar arquivos
- Fazer commits
- Testar

```bash
# Fazer suas alterações nos arquivos...

# Quando terminar, adicionar e commitar
git add .
git commit -m "feat: descrição do que foi feito"
```

### **3. Quando estiver pronto, fazer merge no main**

```bash
# Voltar para o main
git checkout main

# Atualizar o main (se houver mudanças remotas)
git pull origin main

# Fazer merge do seu branch
git merge feature/nome-da-sua-funcionalidade

# Enviar para o GitHub
git push origin main
```

---

## 📋 ESTRUTURA DE BRANCHES RECOMENDADA

### **Convenção de nomes:**

- `feature/nome` - Para novas funcionalidades
- `fix/nome` - Para correções de bugs
- `refactor/nome` - Para refatorações
- `docs/nome` - Para documentação
- `test/nome` - Para testes

### **Exemplos:**

```bash
git checkout -b feature/exportar-estoque
git checkout -b fix/correcao-calculo-estoque
git checkout -b refactor/componentes-estoque
```

---

## 🔄 RECUPERAR SEU TRABALHO ANTERIOR

Se quiser ver ou recuperar algo do branch de backup:

```bash
# Ver o que tem no branch de backup
git checkout backup/trabalho-em-andamento-20251125-093352

# Copiar um arquivo específico de lá
git checkout backup/trabalho-em-andamento-20251125-093352 -- caminho/do/arquivo.tsx

# Ver as diferenças
git diff main backup/trabalho-em-andamento-20251125-093352
```

---

## 💡 DICAS

### **Ver todos os branches:**

```bash
git branch -a
```

### **Deletar um branch (quando não precisar mais):**

```bash
# Deletar branch local
git branch -d nome-do-branch

# Deletar branch remoto
git push origin --delete nome-do-branch
```

### **Trabalhar em múltiplos branches:**

```bash
# Criar branch
git checkout -b feature/primeira-funcionalidade
# ... trabalhar e commitar ...

# Mudar para outro branch sem perder nada
git checkout -b feature/segunda-funcionalidade
# ... trabalhar e commitar ...

# Voltar para o primeiro
git checkout feature/primeira-funcionalidade
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Criar um branch novo:**
   ```bash
   git checkout -b feature/minhas-alteracoes
   ```

2. **Começar a trabalhar normalmente!**

3. **Quando estiver pronto, fazer commit e push:**
   ```bash
   git add .
   git commit -m "feat: minhas alterações"
   git push origin feature/minhas-alteracoes
   ```

---

## ✅ VANTAGENS DE TRABALHAR COM BRANCHES

- ✅ Mantém o main sempre estável
- ✅ Pode testar várias coisas ao mesmo tempo
- ✅ Fácil de reverter se algo der errado
- ✅ Permite trabalhar em paralelo com outras pessoas
- ✅ Histórico organizado

---

**Pronto para começar!** 🚀

