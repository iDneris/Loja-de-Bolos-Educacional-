import { createClient } from '@supabase/supabase-js';

// Pega as credenciais do Supabase das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKeys = process.env.SUPABASE_KEYS || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Se tiver SUPABASE_KEYS (formato: service,anon), faz o split
let supabaseKey = '';
if (supabaseKeys) {
  const [service, anon] = supabaseKeys.split(',');
  supabaseKey = service || anon || '';
} else {
  // Fallback para as variáveis separadas
  supabaseKey = supabaseServiceKey || supabaseAnonKey || '';
}

// Valida se as credenciais foram configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('ERRO: Configure SUPABASE_URL e SUPABASE_KEYS (ou SUPABASE_SERVICE_ROLE_KEY) no arquivo .env');
  process.exit(1);
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
