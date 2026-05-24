// Setup automatico completo do sistema
// Uso: npm run setup

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('Erro: Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao encontradas no .env');
  console.log('Configure o arquivo .env antes de continuar');
  process.exit(1);
}

// Extrair project ref da URL do Supabase
const projectRef = SUPABASE_URL.replace('https://', '').split('.')[0];
const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_KEY.split('.')[2]}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

// ============================================
// ETAPA 1: VALIDAR CONEXAO
// ============================================
async function validarConexao() {
  console.log('=== VALIDANDO CONEXAO COM SUPABASE ===\n');
  console.log('URL:', SUPABASE_URL);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    console.log('Conexao OK\n');
    return true;
  } catch (error) {
    console.log('Erro ao conectar:', error.message);
    return false;
  }
}

// ============================================
// ETAPA 2: CRIAR TABELAS VIA POSTGRESQL
// ============================================
async function criarTabelas() {
  console.log('=== CRIANDO TABELAS NO BANCO ===\n');
  
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  
  if (!dbPassword) {
    console.log('AVISO: SUPABASE_DB_PASSWORD nao encontrada no .env');
    console.log('Pulando criacao de tabelas via PostgreSQL\n');
    return false;
  }
  
  // URL encode da senha para lidar com caracteres especiais
  const encodedPassword = encodeURIComponent(dbPassword);
  
  const client = new Client({
    connectionString: `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Conectado ao PostgreSQL via conexao direta\n');
    
    // SQL para criar tabelas
    const sqlCommands = [
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
      
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
      
      `ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;`,
      `ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;`,
      
      `DROP POLICY IF EXISTS "Permitir leitura publica de usuarios" ON usuarios;`,
      `CREATE POLICY "Permitir leitura publica de usuarios" ON usuarios FOR SELECT TO public USING (true);`,
      
      `DROP POLICY IF EXISTS "Permitir insercao publica de usuarios" ON usuarios;`,
      `CREATE POLICY "Permitir insercao publica de usuarios" ON usuarios FOR INSERT TO public WITH CHECK (true);`,
      
      `DROP POLICY IF EXISTS "Permitir atualizacao propria" ON usuarios;`,
      `CREATE POLICY "Permitir atualizacao propria" ON usuarios FOR UPDATE TO public USING (true);`,
      
      `DROP POLICY IF EXISTS "Permitir todas operacoes em carrinho_itens" ON carrinho_itens;`,
      `CREATE POLICY "Permitir todas operacoes em carrinho_itens" ON carrinho_itens FOR ALL TO public USING (true) WITH CHECK (true);`
    ];
    
    for (const sql of sqlCommands) {
      const desc = sql.substring(0, 50).replace(/\n/g, ' ').trim();
      process.stdout.write(`${desc}... `);
      
      try {
        await client.query(sql);
        console.log('OK');
      } catch (error) {
        if (error.code === '42P07' || error.code === '42710') {
          console.log('OK (ja existe)');
        } else {
          console.log(`AVISO: ${error.message.substring(0, 50)}`);
        }
      }
    }
    
    await client.end();
    console.log('\nTabelas criadas com sucesso\n');
    return true;
    
  } catch (error) {
    console.log('Erro ao conectar via PostgreSQL:', error.message);
    console.log('');
    return false;
  }
}

// ============================================
// ETAPA 3: VERIFICAR TABELAS
// ============================================
async function verificarTabelas() {
  console.log('=== VERIFICANDO TABELAS ===\n');
  
  const tabelas = ['usuarios', 'clientes', 'bolos', 'pedidos', 'pedido_itens', 'carrinho_itens'];
  let todasExistem = true;
  
  for (const tabela of tabelas) {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${tabela}?limit=1`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        }
      });
      
      if (response.status === 200) {
        console.log(`${tabela}: OK`);
      } else {
        console.log(`${tabela}: NAO EXISTE`);
        todasExistem = false;
      }
    } catch (error) {
      console.log(`${tabela}: ERRO`);
      todasExistem = false;
    }
  }
  
  console.log('');
  return todasExistem;
}

// ============================================
// ETAPA 4: POPULAR DADOS (SEED)
// ============================================
async function popularDados() {
  console.log('=== POPULANDO DADOS INICIAIS ===\n');
  
  // Limpar usuarios antigos
  console.log('Limpando usuarios antigos...');
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/usuarios?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
  } catch (e) {}
  
  // Criar usuarios
  const usuarios = [
    { nome: 'Admin Sistema', email: 'admin@loja.com', senha: 'admin123', telefone: '11999999999', role: 'admin' },
    { nome: 'João Silva', email: 'joao@email.com', senha: 'cliente123', telefone: '11987654321', role: 'cliente' },
    { nome: 'Maria Santos', email: 'maria@email.com', senha: 'cliente123', telefone: '11976543210', role: 'cliente' }
  ];
  
  console.log('Criando usuarios...');
  let usuariosCriados = 0;
  
  for (const usuario of usuarios) {
    const senhaHash = await bcrypt.hash(usuario.senha, 10);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/usuarios`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: senhaHash,
        telefone: usuario.telefone,
        role: usuario.role
      })
    });
    
    if (response.ok) {
      console.log(`  ${usuario.email}: OK`);
      usuariosCriados++;
    } else {
      const error = await response.json();
      if (error.code === '23505') {
        console.log(`  ${usuario.email}: OK (ja existe)`);
        usuariosCriados++;
      } else {
        console.log(`  ${usuario.email}: ERRO`);
      }
    }
  }
  
  // Limpar bolos antigos
  console.log('\nLimpando bolos antigos...');
  
  // Usar PostgreSQL direto para inserir bolos
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  
  if (dbPassword) {
    const encodedPassword = encodeURIComponent(dbPassword);
    const client = new Client({
      connectionString: `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await client.connect();
      
      // Limpar pedidos e itens primeiro (por causa de foreign keys)
      await client.query(`DELETE FROM pedido_itens WHERE id != '00000000-0000-0000-0000-000000000000'`);
      await client.query(`DELETE FROM pedidos WHERE id != '00000000-0000-0000-0000-000000000000'`);
      
      // Limpar bolos
      await client.query(`DELETE FROM bolos WHERE id != '00000000-0000-0000-0000-000000000000'`);
      
      // Criar bolos
      const bolos = [
        { nome: 'Bolo de Chocolate', descricao: 'Delicioso bolo de chocolate com cobertura', preco: 45.00, imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', estoque: 10 },
        { nome: 'Bolo de Cenoura', descricao: 'Bolo de cenoura tradicional com chocolate', preco: 35.00, imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729', estoque: 15 },
        { nome: 'Bolo de Morango', descricao: 'Bolo de morango com chantilly', preco: 55.00, imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187', estoque: 8 }
      ];
      
      console.log('Criando bolos iniciais...');
      let bolosCriados = 0;
      
      for (const bolo of bolos) {
        try {
          await client.query(
            `INSERT INTO bolos (nome, descricao, preco, imagem, estoque) VALUES ($1, $2, $3, $4, $5)`,
            [bolo.nome, bolo.descricao, bolo.preco, bolo.imagem, bolo.estoque]
          );
          console.log(`  ${bolo.nome}: OK`);
          bolosCriados++;
        } catch (error) {
          console.log(`  ${bolo.nome}: ERRO - ${error.message}`);
        }
      }
      
      await client.end();
      console.log('');
      return { usuariosCriados, bolosCriados };
      
    } catch (error) {
      console.log('Erro ao inserir bolos via PostgreSQL:', error.message);
      await client.end();
    }
  }
  
  // Fallback: tentar via API REST
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/bolos?id=neq.00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal'
      }
    });
  } catch (e) {}
  
  // Criar bolos
  const bolos = [
    { nome: 'Bolo de Chocolate', descricao: 'Delicioso bolo de chocolate com cobertura', preco: 45.00, estoque: 10 },
    { nome: 'Bolo de Cenoura', descricao: 'Bolo de cenoura tradicional com chocolate', preco: 35.00, estoque: 15 },
    { nome: 'Bolo de Morango', descricao: 'Bolo de morango com chantilly', preco: 55.00, estoque: 8 }
  ];
  
  console.log('Criando bolos iniciais...');
  let bolosCriados = 0;
  
  for (const bolo of bolos) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bolos`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(bolo)
    });
    
    if (response.ok) {
      console.log(`  ${bolo.nome}: OK`);
      bolosCriados++;
    } else {
      const error = await response.json();
      console.log(`  ${bolo.nome}: ERRO - ${error.message || error.hint || JSON.stringify(error)}`);
    }
  }
  
  console.log('');
  return { usuariosCriados, bolosCriados };
}

// ============================================
// EXECUTAR SETUP COMPLETO
// ============================================
async function executarSetup() {
  console.log('\n');
  console.log('================================================');
  console.log('  SETUP AUTOMATICO - LOJA DE BOLOS');
  console.log('================================================');
  console.log('\n');
  
  try {
    // Etapa 1: Validar conexao
    const conexaoOk = await validarConexao();
    if (!conexaoOk) {
      console.log('Erro: Nao foi possivel conectar ao Supabase');
      process.exit(1);
    }
    
    // Etapa 2: Criar tabelas
    await criarTabelas();
    
    // Etapa 3: Verificar tabelas
    const tabelasOk = await verificarTabelas();
    if (!tabelasOk) {
      console.log('AVISO: Algumas tabelas nao existem.');
      console.log('Execute o SQL manualmente no Supabase SQL Editor.');
      console.log('Arquivo: docs/database/schema.sql\n');
    }
    
    // Etapa 4: Popular dados
    const { usuariosCriados, bolosCriados } = await popularDados();
    
    // Resultado
    console.log('=== RESULTADO ===\n');
    console.log(`Usuarios: ${usuariosCriados}/3`);
    console.log(`Bolos: ${bolosCriados}/3`);
    console.log('');
    
    console.log('================================================');
    console.log('  SISTEMA PRONTO PARA USO');
    console.log('================================================');
    console.log('\nCredenciais de acesso:');
    console.log('  Admin: admin@loja.com / admin123');
    console.log('  Cliente: joao@email.com / cliente123');
    console.log('\nPara iniciar o servidor:');
    console.log('  npm run dev');
    console.log('\n');
    
  } catch (error) {
    console.log('\nErro durante setup:', error.message);
    process.exit(1);
  }
}

// Executar
executarSetup();
