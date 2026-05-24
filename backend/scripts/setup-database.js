// Script para criar todas as tabelas no Supabase automaticamente
// Uso: node scripts/setup-database.js

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

// Comandos SQL para criar as tabelas
const sqlCommands = [
  // Extensao UUID
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
  
  // Tabela usuarios
  `CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha_hash TEXT NOT NULL,
    telefone TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)`,
  
  // Tabela clientes
  `CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL UNIQUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone)`,
  
  // Tabela bolos
  `CREATE TABLE IF NOT EXISTS bolos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome TEXT NOT NULL,
    descricao TEXT NOT NULL,
    preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
    imagem_url TEXT,
    estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  // Tabela pedidos
  `CREATE TABLE IF NOT EXISTS pedidos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL CHECK (total > 0),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id)`,
  
  // Tabela pedido_itens
  `CREATE TABLE IF NOT EXISTS pedido_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario > 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id)`,
  `CREATE INDEX IF NOT EXISTS idx_pedido_itens_bolo ON pedido_itens(bolo_id)`,
  
  // Tabela carrinho_itens
  `CREATE TABLE IF NOT EXISTS carrinho_itens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, bolo_id)
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho_itens(usuario_id)`,
  `CREATE INDEX IF NOT EXISTS idx_carrinho_bolo ON carrinho_itens(bolo_id)`
];

async function executarSQL(sql) {
  // Usar fetch direto para executar SQL via API REST do Supabase
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    },
    body: JSON.stringify({ query: sql })
  });
  
  if (!response.ok) {
    // Se a funcao exec nao existe, tentar criar tabelas via client direto
    // Supabase nao permite DDL via REST API, entao vamos usar uma abordagem diferente
    return { error: { message: 'DDL via API nao suportado' } };
  }
  
  const data = await response.json();
  return { data, error: null };
}

async function criarTabelas() {
  console.log('=== SETUP DO BANCO DE DADOS ===\n');
  console.log('URL:', SUPABASE_URL);
  console.log('');
  console.log('AVISO: Supabase nao permite criar tabelas via API.');
  console.log('Voce precisa executar o SQL manualmente no painel do Supabase.\n');
  console.log('Passos:');
  console.log('1. Acesse https://supabase.com/dashboard');
  console.log('2. Selecione seu projeto');
  console.log('3. Va em SQL Editor');
  console.log('4. Execute o arquivo: docs/database/schema.sql');
  console.log('');
  console.log('Verificando se as tabelas ja existem...\n');
  
  // Verificar se as tabelas existem
  const tabelas = ['usuarios', 'clientes', 'bolos', 'pedidos', 'pedido_itens', 'carrinho_itens'];
  let existentes = 0;
  
  for (const tabela of tabelas) {
    process.stdout.write(`Verificando tabela ${tabela}... `);
    
    const { data, error } = await supabase
      .from(tabela)
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('NAO EXISTE');
      } else {
        console.log(`ERRO: ${error.message}`);
      }
    } else {
      console.log('OK');
      existentes++;
    }
  }
  
  console.log('');
  console.log('=== RESULTADO ===');
  console.log(`Tabelas existentes: ${existentes}/${tabelas.length}`);
  
  if (existentes === tabelas.length) {
    console.log('\nTodas as tabelas existem!');
    console.log('Execute agora: npm run seed');
  } else {
    console.log('\nAlgumas tabelas estao faltando.');
    console.log('Execute o SQL manualmente no painel do Supabase.');
  }
}

criarTabelas().catch(error => {
  console.log('Erro fatal:', error.message);
  process.exit(1);
});
