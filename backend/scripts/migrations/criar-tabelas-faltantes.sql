-- SQL para criar apenas as tabelas faltantes
-- Execute este SQL no Supabase SQL Editor

-- Habilita extensao para UUID (se ainda nao existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuarios para autenticacao
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por email
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabela de itens do carrinho
CREATE TABLE IF NOT EXISTS carrinho_itens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, bolo_id)
);

-- Indices para busca
CREATE INDEX IF NOT EXISTS idx_carrinho_usuario ON carrinho_itens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_carrinho_bolo ON carrinho_itens(bolo_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;

-- Politicas de acesso para usuarios
CREATE POLICY IF NOT EXISTS "Permitir leitura publica de usuarios"
ON usuarios FOR SELECT
TO public
USING (true);

CREATE POLICY IF NOT EXISTS "Permitir insercao publica de usuarios"
ON usuarios FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Permitir atualizacao propria"
ON usuarios FOR UPDATE
TO public
USING (true);

-- Politicas de acesso para carrinho_itens
CREATE POLICY IF NOT EXISTS "Permitir todas operacoes em carrinho_itens"
ON carrinho_itens FOR ALL
TO public
USING (true)
WITH CHECK (true);
