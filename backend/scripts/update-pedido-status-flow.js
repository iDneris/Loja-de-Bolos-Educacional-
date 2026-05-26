// Atualiza a constraint de status da tabela pedidos para fluxo completo de producao
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const NOVOS_STATUS = [
  'pendente',
  'confirmado',
  'em_preparo',
  'pronto_retirada',
  'saiu_entrega',
  'entregue',
  'cancelado',
];

function montarURLs() {
  const dbUrl = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
  if (dbUrl) return [dbUrl];

  const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!projectRef || !dbPassword) return [];

  const encodedPassword = encodeURIComponent(dbPassword);
  return [
    `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres.${projectRef}:${encodedPassword}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
  ];
}

async function executarSQL(connectionString) {
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  const sql = `
  ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;
  ALTER TABLE pedidos
    ADD CONSTRAINT pedidos_status_check
    CHECK (status IN ('${NOVOS_STATUS.join("','")}'));
  `;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Constraint de status atualizada com sucesso.');
      console.log('Status permitidos:', NOVOS_STATUS.join(', '));
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao atualizar status de pedidos:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

async function main() {
  const urls = montarURLs();
  if (!urls.length) {
    console.log('Nao foi possivel montar conexao ao banco.');
    console.log('Execute no SQL Editor do Supabase:');
    console.log(`ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;`);
    console.log(`ALTER TABLE pedidos ADD CONSTRAINT pedidos_status_check CHECK (status IN ('${NOVOS_STATUS.join("','")}'));`);
    process.exit(1);
  }

  for (const url of urls) {
    const safeUrl = url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
    console.log('Tentando conexao:', safeUrl);
    const ok = await executarSQL(url);
    if (ok) process.exit(0);
  }

  console.log('\nFalha em todas as tentativas de conexao.');
  console.log('Execute no SQL Editor do Supabase:');
  console.log(`ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;`);
  console.log(`ALTER TABLE pedidos ADD CONSTRAINT pedidos_status_check CHECK (status IN ('${NOVOS_STATUS.join("','")}'));`);
  process.exit(1);
}

main();
