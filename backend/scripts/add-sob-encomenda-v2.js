// Script para adicionar coluna sob_encomenda via conexao direta PostgreSQL
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function addColumn() {
  // Extrair dados de conexao do Supabase
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
  
  if (!dbUrl) {
    console.log('DATABASE_URL nao encontrada no .env');
    console.log('Tentando montar URL a partir das variaveis do Supabase...');
    
    const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    
    if (projectRef && dbPassword) {
      const encodedPassword = encodeURIComponent(dbPassword);
      // Tentar conexao direta e via pooler
      const urls = [
        `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
        `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
        `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
      ];
      
      for (const url of urls) {
        console.log('Tentando:', url.replace(/:.*@/, ':****@'));
        const result = await executeSQL(url);
        if (result) return;
      }
      
      console.log('Nao foi possivel conectar. Execute manualmente no SQL Editor:');
    } else {
      console.log('Nao foi possivel montar a conexao. Execute manualmente no SQL Editor:');
      console.log('ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;');
    }
  } else {
    await executeSQL(dbUrl);
  }
}

async function executeSQL(connectionString) {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  
  try {
    console.log('Conectando ao PostgreSQL...');
    const client = await pool.connect();
    
    try {
      console.log('Executando ALTER TABLE...');
      await client.query('ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;');
      console.log('Coluna sob_encomenda adicionada com sucesso!');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro:', error.message);
    console.log('\nExecute manualmente no SQL Editor do Supabase:');
    console.log('ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;');
  } finally {
    await pool.end();
  }
}

addColumn();
