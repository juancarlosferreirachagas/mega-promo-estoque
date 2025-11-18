import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Cliente Supabase para uso no frontend
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// URL base da API
export const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9694c52b`;

// Headers padrão para requisições
export const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${publicAnonKey}`
});
