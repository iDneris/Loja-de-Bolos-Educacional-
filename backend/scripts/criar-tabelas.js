// Script para criar tabelas faltantes via API
// Uso: node scripts/criar-tabelas.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('Erro: Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function criarTabelasViaSQL() {
  console.log('=== CRIANDO TABELAS FALTANTES ===\n');
  
  // SQL para criar tabelas
  const sqlCommands = [
    // Extensao UUID
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    
    // Tabela usuarios
    `CREATE TABLE IF NOT EXISTS usuarios (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha_hash TEXT NOT NULL,
      telefone TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);`,
    
    // Tabela carrinho_itens
    `CREATE TABLE IF NOT EXISTS carrinho_itens (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
      quantidade INTEGER NOT NULL CHECK (quantidade > 0),
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(usuario_id, bolo_id)
    );`,
    
    `CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho_itens(usuario_id);`,
    `CREATE INDEX IF NOT EXISTS idx_carrinho_bolo ON carrinho_itens(bolo_id);`,
    
    // RLS
    `ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;`,
    `ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;`,
    
    // Politicas
    `CREATE POLICY IF NOT EXISTS "Permitir leitura publica de usuarios" ON usuarios FOR SELECT TO public USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Permitir insercao publica de usuarios" ON usuarios FOR INSERT TO public WITH CHECK (true);`,
    `CREATE POLICY IF NOT EXISTS "Permitir atualizacao propria" ON usuarios FOR UPDATE TO public USING (true);`,
    `CREATE POLICY IF NOT EXISTS "Permitir todas operacoes em carrinho_itens" ON carrinho_itens FOR ALL TO public USING (true) WITH CHECK (true);`
  ];
  
  // Executar cada comando
  for (const sql of sqlCommands) {
    const descricao = sql.substring(0, 50).replace(/\n/g, ' ');
    process.stdout.write(`Executando: ${descricao}... `);
    
    try {
      // Tentar via RPC
      const { data, error } = await supabase.rpc('exec', { query: sql });
      
      if (error) {
        // Se RPC nao funcionar, tentar via query direta
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/query`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query: sql })
        });
        
        if (response.ok) {
          console.log('OK');
        } else {
          console.log('ERRO');
        }
      } else {
        console.log('OK');
      }
    } catch (e) {
      console.log('ERRO:', e.message);
    }
  }
  
  console.log('\n=== CONCLUIDO ===\n');
  console.log('Execute agora: npm run setup');
}

criarTabelasViaSQL();
