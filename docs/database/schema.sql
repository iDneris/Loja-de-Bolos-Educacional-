-- Schema completo do banco de dados
-- Execute este SQL no Supabase SQL Editor

-- Habilita extensao para UUID
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

-- Tabela de clientes (para pedidos)
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por telefone
CREATE INDEX IF NOT EXISTS idx_clientes_telefone ON clientes(telefone);

-- Tabela de bolos
CREATE TABLE IF NOT EXISTS bolos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco NUMERIC(10, 2) NOT NULL CHECK (preco > 0),
  imagem_url TEXT,
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  total NUMERIC(10, 2) NOT NULL CHECK (total > 0),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por cliente
CREATE INDEX IF NOT EXISTS idx_pedidos_cliente ON pedidos(cliente_id);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC(10, 2) NOT NULL CHECK (preco_unitario > 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para busca
CREATE INDEX IF NOT EXISTS idx_pedido_itens_pedido ON pedido_itens(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pedido_itens_bolo ON pedido_itens(bolo_id);

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
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinho_itens ENABLE ROW LEVEL SECURITY;

-- Politicas de acesso para usuarios
CREATE POLICY "Permitir leitura publica de usuarios"
ON usuarios FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir insercao publica de usuarios"
ON usuarios FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir atualizacao propria"
ON usuarios FOR UPDATE
TO public
USING (true);

-- Politicas de acesso para clientes
CREATE POLICY "Permitir leitura publica de clientes"
ON clientes FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir insercao publica de clientes"
ON clientes FOR INSERT
TO public
WITH CHECK (true);

-- Politicas de acesso para bolos
CREATE POLICY "Permitir leitura publica de bolos"
ON bolos FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir todas operacoes em bolos"
ON bolos FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Politicas de acesso para pedidos
CREATE POLICY "Permitir leitura publica de pedidos"
ON pedidos FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir insercao publica de pedidos"
ON pedidos FOR INSERT
TO public
WITH CHECK (true);

-- Politicas de acesso para pedido_itens
CREATE POLICY "Permitir leitura publica de pedido_itens"
ON pedido_itens FOR SELECT
TO public
USING (true);

CREATE POLICY "Permitir insercao publica de pedido_itens"
ON pedido_itens FOR INSERT
TO public
WITH CHECK (true);

-- Politicas de acesso para carrinho_itens
CREATE POLICY "Permitir todas operacoes em carrinho_itens"
ON carrinho_itens FOR ALL
TO public
USING (true)
WITH CHECK (true);
