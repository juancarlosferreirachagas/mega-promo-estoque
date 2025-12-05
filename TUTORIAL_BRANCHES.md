# 📚 Tutorial Interativo: Trabalhando com Branches Git

Este é um guia prático onde vamos aprender juntos a trabalhar com branches conforme você pedir tarefas!

---

## 🎓 CONCEITOS BÁSICOS (Explicação Rápida)

### O que é um Branch?
- **Branch = Ramo** em português
- É como criar uma **cópia paralela** do seu código
- Permite trabalhar em novas funcionalidades SEM mexer no código principal
- Quando terminar, você "mescla" (merge) as mudanças de volta

### Exemplo Prático:
```
main (código principal)
  │
  ├── feature/nova-tela (você trabalhando em uma nova tela)
  ├── fix/correcao-bug (você corrigindo um bug)
  └── backup/trabalho-antigo (trabalho anterior salvo)
```

---

## 🚀 COMANDOS BÁSICOS QUE VAMOS USAR

### 1. Ver em qual branch estamos
```bash
git branch
# Mostra todos os branches locais
# O asterisco (*) mostra qual está ativo
```

### 2. Criar um novo branch
```bash
git checkout -b nome-do-branch
# Cria um novo branch E muda para ele automaticamente
```

### 3. Mudar de branch
```bash
git checkout nome-do-branch
# Muda para outro branch (suas alterações precisam estar commitadas ou salvas)
```

### 4. Ver o status (o que mudou)
```bash
git status
# Mostra arquivos modificados, adicionados, etc
```

### 5. Adicionar mudanças
```bash
git add nome-do-arquivo.tsx
# ou para adicionar tudo:
git add .
```

### 6. Salvar mudanças (commit)
```bash
git commit -m "Descrição do que foi feito"
```

### 7. Ver histórico
```bash
git log --oneline
# Mostra commits em formato compacto
```

---

## 💡 BOAS PRÁTICAS

### Nomenclatura de Branches:
- `feature/nome` - Para novas funcionalidades
- `fix/nome` - Para correções de bugs  
- `refactor/nome` - Para refatorações
- `docs/nome` - Para documentação

### Mensagens de Commit:
- Seja claro e descritivo
- Exemplos:
  - ✅ "feat: adiciona botão de exportar estoque"
  - ✅ "fix: corrige cálculo de estoque mínimo"
  - ❌ "mudanças"
  - ❌ "fix"

---

## 🎯 VAMOS COMEÇAR!

Quando você pedir para criar um branch ou fazer alguma alteração, eu vou:
1. ✅ Explicar o que vamos fazer e POR QUÊ
2. ✅ Mostrar os comandos que vou executar
3. ✅ Executar passo a passo
4. ✅ Explicar o resultado
5. ✅ Mostrar o estado atual

**Está pronto? Me diga o que você quer fazer primeiro!** 🚀

