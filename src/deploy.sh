#!/bin/bash

echo "🚀 MEGA PROMO - DEPLOY AUTOMÁTICO"
echo "=================================="
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null
then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI instalado!"
echo ""

# Fazer deploy
echo "🚀 Iniciando deploy..."
echo ""
vercel --prod --yes

echo ""
echo "✅ DEPLOY CONCLUÍDO!"
echo ""
echo "🌐 Seu sistema está no ar!"
echo "📋 Agora execute o SQL no Supabase (apenas 1 vez):"
echo ""
echo "Link: https://supabase.com/dashboard/project/dgqojbdipxpblxldgkxv/sql/new"
echo ""
