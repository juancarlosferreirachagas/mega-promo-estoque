/**
 * Types e Interfaces Centralizadas
 * Todas as definições de tipos do sistema em um só lugar
 */

// ============================================
// INVENTORY
// ============================================

export interface InventoryItem {
  id: string;
  name: string;
  size: string;
  quantity: number;
  lastUpdated: number;
}

export interface InventoryItemCreate {
  name: string;
  size: string;
  quantity: number;
}

export interface InventoryItemUpdate {
  quantity?: number;
  name?: string;
}

// ============================================
// MOVEMENTS
// ============================================

export interface Movement {
  id: string;
  item_id: string;
  name: string;
  size: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  person_name: string;
  responsible: string;
  observations?: string;
  timestamp: number;
  created_by?: string;
  edited_by?: string;
  edited_at?: number;
}

export interface MovementCreate {
  itemId: string;
  name: string;
  size: string;
  type: 'entrada' | 'saida';
  quantity: number;
  reason: string;
  personName: string;
  responsible: string;
  observations?: string;
  createdBy: string;
}

export interface MovementUpdate {
  type?: 'entrada' | 'saida';
  quantity?: number;
  reason?: string;
  personName?: string;
  responsible?: string;
  observations?: string;
  name?: string;
  size?: string;
  editedBy?: string;
}

// ============================================
// USERS
// ============================================

export interface User {
  id?: string;
  username: string;
  password?: string;
  permissions: {
    canAddItem?: boolean;
    canRegisterMovement?: boolean;
    canEditMovement?: boolean;
    canDeleteMovement?: boolean;
  };
  isMaster?: boolean;
  created_at?: string;
}

export interface UserCreate {
  username: string;
  password: string;
  permissions: User['permissions'];
  isMaster?: boolean;
}

export interface UserUpdate {
  username?: string;
  password?: string;
  permissions?: User['permissions'];
}

// ============================================
// PRODUCTS
// ============================================

export interface ProductWithVariations {
  name: string;
  variations: string[];
}

// ============================================
// UI STATE
// ============================================

export interface ModalState {
  isOpen: boolean;
  title: string;
  body: string;
}

export interface EditModalState {
  isOpen: boolean;
  movement: Movement | null;
}

// ============================================
// API RESPONSES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page?: number;
  limit?: number;
  total?: number;
}

