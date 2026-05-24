-- Script para corrigir schema do banco
-- Execute este SQL no Supabase SQL Editor

-- Habilitar extensao UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dropar e recriar tabela usuarios
DROP TABLE IF EXISTS carrinho_itens CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Dropar e recriar tabela bolos
DROP TABLE IF EXISTS pedido_itens CASCADE;
DROP TABLE IF EXISTS bolos CASCADE;

CREATE TABLE bolos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
  imagem_url TEXT,
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recriar tabela pedido_itens
CREATE TABLE pedido_itens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario > 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_bolo ON pedido_itens(bolo_id);

-- Recriar tabela carrinho_itens
CREATE TABLE carrinho_itens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, bolo_id)
);

CREATE INDEX idx_carrinho_usuario ON carrinho_itens(usuario_id);
CREATE INDEX idx_carrinho_bolo ON carrinho_itens(bolo_id);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;

-- Politicas de acesso
CREATE POLICY "Permitir leitura publica de usuarios"
ON usuarios FOR SELECT TO public USING (true);

CREATE POLICY "Permitir insercao publica de usuarios"
ON usuarios FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permitir atualizacao propria"
ON usuarios FOR UPDATE TO public USING (true);

CREATE POLICY "Permitir leitura publica de bolos"
ON bolos FOR SELECT TO public USING (true);

CREATE POLICY "Permitir todas operacoes em bolos"
ON bolos FOR ALL TO public USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura publica de pedido_itens"
ON pedido_itens FOR SELECT TO public USING (true);

CREATE POLICY "Permitir insercao publica de pedido_itens"
ON pedido_itens FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Permitir todas operacoes em carrinho_itens"
ON carrinho_itens FOR ALL TO public USING (true) WITH CHECK (true);
