// Script para adicionar coluna sob_encomenda na tabela bolos
// Uso: node backend/scripts/add-sob-encomenda.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('Erro: Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function adicionarColuna() {
  console.log('=== ADICIONAR COLUNA SOB_ENCOMENDA ===\n');
  console.log('URL:', SUPABASE_URL);
  console.log('');

  // Primeiro verificar se a coluna ja existe
  console.log('Verificando se coluna sob_encomenda existe...');
  const { data, error } = await supabase
    .from('bolos')
    .select('sob_encomenda')
    .limit(1);

  if (error && error.code === 'PGRST116') {
    // Coluna nao existe, continuar
  } else if (!error) {
    console.log('Coluna sob_encomenda ja existe!');
    process.exit(0);
  } else {
    console.log('Erro ao verificar coluna:', error.message, 'code:', error.code);
    // Se o erro for relacionado a coluna nao existir, continuar
    if (error.message && error.message.includes('does not exist')) {
      // Coluna nao existe, continuar
    } else {
      process.exit(1);
    }
  }

  console.log('Coluna nao existe. Adicionando via SQL...\n');

  // Tentar endpoint SQL do Supabase com Content-Profile sql
  const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sql',
      'Content-Profile': 'sql',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: 'ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;'
  });

  if (sqlResponse.ok) {
    console.log('Coluna sob_encomenda adicionada com sucesso!');
    process.exit(0);
  }

  console.log('\nExecute manualmente no SQL Editor do Supabase:');
  console.log('ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;');
}

adicionarColuna().catch(error => {
  console.log('Erro fatal:', error.message);
  process.exit(1);
});
