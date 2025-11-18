#!/bin/bash

echo "╔══════════════════════════════════════════════╗"
echo "║   🚀 MEGA PROMO - DEPLOY AUTOMÁTICO         ║"
echo "║   Sistema de Estoque - São Paulo             ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta do projeto!"
    exit 1
fi

echo "📦 Passo 1: Instalando dependências..."
echo ""
npm install

echo ""
echo "🔧 Passo 2: Verificando Vercel CLI..."
echo ""

if ! command -v vercel &> /dev/null
then
    echo "📥 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI instalado!"
echo ""

echo "🚀 Passo 3: Fazendo deploy em produção..."
echo ""
vercel --prod --yes

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   ✅ DEPLOY CONCLUÍDO COM SUCESSO!          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "🌐 Seu sistema está no ar!"
echo ""
echo "📋 ÚLTIMO PASSO (apenas 1 vez):"
echo ""
echo "Opção A - Automático:"
echo "  1. Acesse sua URL e adicione /setup-database.html"
echo "  2. Clique no botão 'Configurar Database'"
echo ""
echo "Opção B - Manual:"
echo "  1. Acesse: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new"
echo "  2. Execute o SQL que está no arquivo COLOCAR_NO_AR.md"
echo ""
echo "🎉 Login: admin / admin123"
echo ""
