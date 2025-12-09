import {
  Package,
  Shirt,
  ShoppingBag,
  Footprints,
  Watch,
  Glasses,
  Backpack,
  Crown,
  Star,
  Gift,
  Briefcase,
} from 'lucide-react';

/**
 * Retorna o ícone apropriado para um produto baseado no nome
 * Função memoizada para melhor performance
 */
export const getProductIcon = (productName: string) => {
  if (!productName) return Package;
  
  const nameLower = productName.toLowerCase();
  
  // Roupas
  if (nameLower.includes('camisa') || nameLower.includes('blusa') || 
      nameLower.includes('polo') || nameLower.includes('camiseta')) {
    return Shirt;
  }
  if (nameLower.includes('calça') || nameLower.includes('short') || 
      nameLower.includes('bermuda')) {
    return ShoppingBag;
  }
  
  // Calçados
  if (nameLower.includes('tênis') || nameLower.includes('tenis') || 
      nameLower.includes('sapato') || nameLower.includes('chinelo') || 
      nameLower.includes('sandália') || nameLower.includes('sandalia') || 
      nameLower.includes('bota')) {
    return Footprints;
  }
  
  // Acessórios
  if (nameLower.includes('relógio') || nameLower.includes('relogio')) {
    return Watch;
  }
  if (nameLower.includes('óculos') || nameLower.includes('oculos')) {
    return Glasses;
  }
  if (nameLower.includes('mochila') || nameLower.includes('bolsa')) {
    return Backpack;
  }
  if (nameLower.includes('boné') || nameLower.includes('bone') || 
      nameLower.includes('chapéu') || nameLower.includes('chapeu')) {
    return Crown;
  }
  if (nameLower.includes('jóia') || nameLower.includes('joia') || 
      nameLower.includes('colar') || nameLower.includes('pulseira') || 
      nameLower.includes('anel')) {
    return Star;
  }
  if (nameLower.includes('presente') || nameLower.includes('brinde') || 
      nameLower.includes('kit')) {
    return Gift;
  }
  if (nameLower.includes('mala') || nameLower.includes('pasta') || 
      nameLower.includes('case')) {
    return Briefcase;
  }
  
  // Padrão
  return Package;
};

