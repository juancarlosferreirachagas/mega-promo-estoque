import { InventoryItem } from '../App';

export const PRODUCTS = [
  {
    name: 'Bota',
    variations: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
  },
  {
    name: 'Calça',
    variations: ['36', '38', '40', '42', '44', '46', '48', '50', '52']
  },
  {
    name: 'Colete',
    variations: ['Único']
  },
  {
    name: 'Moletom',
    variations: ['PP', 'P', 'M', 'G', 'GG', 'XG']
  },
  {
    name: 'Camiseta Polo',
    variations: ['PP', 'P', 'M', 'G', 'GG', 'XG']
  },
  {
    name: 'Camiseta Dryfit Laranja',
    variations: ['PP', 'P', 'M', 'G', 'GG', 'XG']
  },
  {
    name: 'Mochila Saco',
    variations: ['Único']
  },
  {
    name: 'Chocolate',
    variations: ['Unidade']
  },
] as const;

export const MOTIVOS_ENTRADA = [
  'Devolução',
  'Compra',
  'Outros',
] as const;

export const MOTIVOS_SAIDA = [
  'Admissão',
  'Troca',
  'Outros',
] as const;

// Dados iniciais de exemplo
export const INITIAL_INVENTORY_DATA: InventoryItem[] = [
  {
    id: 'bota_40',
    name: 'Bota',
    size: '40',
    quantity: 25,
    lastUpdated: Date.now() - 86400000 * 5,
  },
  {
    id: 'bota_42',
    name: 'Bota',
    size: '42',
    quantity: 18,
    lastUpdated: Date.now() - 86400000 * 5,
  },
  {
    id: 'calca_40',
    name: 'Calça',
    size: '40',
    quantity: 35,
    lastUpdated: Date.now() - 86400000 * 4,
  },
  {
    id: 'calca_42',
    name: 'Calça',
    size: '42',
    quantity: 28,
    lastUpdated: Date.now() - 86400000 * 4,
  },
  {
    id: 'colete_unico',
    name: 'Colete',
    size: 'Único',
    quantity: 45,
    lastUpdated: Date.now() - 86400000 * 3,
  },
  {
    id: 'moletom_m',
    name: 'Moletom',
    size: 'M',
    quantity: 30,
    lastUpdated: Date.now() - 86400000 * 4,
  },
  {
    id: 'moletom_g',
    name: 'Moletom',
    size: 'G',
    quantity: 28,
    lastUpdated: Date.now() - 86400000 * 4,
  },
  {
    id: 'camiseta_polo_m',
    name: 'Camiseta Polo',
    size: 'M',
    quantity: 60,
    lastUpdated: Date.now() - 86400000 * 2,
  },
  {
    id: 'camiseta_polo_g',
    name: 'Camiseta Polo',
    size: 'G',
    quantity: 55,
    lastUpdated: Date.now() - 86400000 * 2,
  },
  {
    id: 'camiseta_dryfit_laranja_m',
    name: 'Camiseta Dryfit Laranja',
    size: 'M',
    quantity: 75,
    lastUpdated: Date.now() - 86400000 * 1,
  },
  {
    id: 'camiseta_dryfit_laranja_g',
    name: 'Camiseta Dryfit Laranja',
    size: 'G',
    quantity: 70,
    lastUpdated: Date.now() - 86400000 * 1,
  },
  {
    id: 'mochila_saco_unica',
    name: 'Mochila Saco',
    size: 'Único',
    quantity: 120,
    lastUpdated: Date.now() - 86400000 * 6,
  },
  {
    id: 'chocolate_unidade',
    name: 'Chocolate',
    size: 'Unidade',
    quantity: 500,
    lastUpdated: Date.now() - 86400000 * 7,
  },
];