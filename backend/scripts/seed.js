// Script de seed automatico para popular banco de dados
// Uso: node scripts/seed.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

// Configuracao
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.log('Erro: Variaveis SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nao encontradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Usuarios padrao
const usuarios = [
  {
    nome: 'Admin Sistema',
    email: 'admin@loja.com',
    senha: 'admin123',
    telefone: '11999999999',
    role: 'admin'
  },
  {
    nome: 'João Silva',
    email: 'joao@email.com',
    senha: 'cliente123',
    telefone: '11987654321',
    role: 'cliente'
  },
  {
    nome: 'Maria Santos',
    email: 'maria@email.com',
    senha: 'cliente123',
    telefone: '11976543210',
    role: 'cliente'
  }
];

async function limparUsuarios() {
  console.log('Limpando usuarios antigos...');
  const { error } = await supabase
    .from('usuarios')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  
  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found (ok)
    console.log('Aviso ao limpar usuarios:', error.message);
  } else {
    console.log('Usuarios antigos removidos');
  }
}

async function criarUsuarios() {
  console.log('Criando usuarios...');
  
  for (const usuario of usuarios) {
    // Gerar hash da senha
    const senhaHash = await bcrypt.hash(usuario.senha, 10);
    
    // Inserir usuario
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{
        nome: usuario.nome,
        email: usuario.email,
        senha_hash: senhaHash,
        telefone: usuario.telefone,
        role: usuario.role
      }])
      .select()
      .single();
    
    if (error) {
      console.log(`Erro ao criar ${usuario.email}:`, error.message);
    } else {
      console.log(`Usuario criado: ${usuario.email} (${usuario.role})`);
    }
  }
}

async function verificarUsuarios() {
  console.log('\nVerificando usuarios criados...');
  const { data, error } = await supabase
    .from('usuarios')
    .select('email, role');
  
  if (error) {
    console.log('Erro ao verificar:', error.message);
  } else {
    console.log(`Total de usuarios: ${data.length}`);
    data.forEach(u => console.log(`- ${u.email} (${u.role})`));
  }
}

async function executarSeed() {
  console.log('=== SEED AUTOMATICO ===\n');
  console.log('URL:', SUPABASE_URL);
  console.log('');
  
  try {
    await limparUsuarios();
    await criarUsuarios();
    await verificarUsuarios();
    
    console.log('\n=== SEED CONCLUIDO ===');
    console.log('\nCredenciais de acesso:');
    console.log('Admin: admin@loja.com / admin123');
    console.log('Cliente: joao@email.com / cliente123');
    console.log('');
  } catch (error) {
    console.log('Erro durante seed:', error.message);
    process.exit(1);
  }
}

executarSeed();
