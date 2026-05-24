import { createClient } from '@supabase/supabase-js';

// Pega as credenciais do Supabase das variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

// Valida se as credenciais foram configuradas
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env');
  process.exit(1);
}

// Cria e exporta o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
