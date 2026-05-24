-- ============================================
-- SCHEMA COMPLETO - LOJA DE BOLOS
-- ============================================
-- Execute este SQL no SQL Editor do Supabase
-- ============================================

-- Limpar tabelas existentes (se necessário)
DROP TABLE IF EXISTS pedido_itens CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS bolos CASCADE;

-- ============================================
-- TABELA: clientes
-- ============================================
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: bolos
-- ============================================
CREATE TABLE bolos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(10,2) NOT NULL CHECK (preco > 0),
  imagem_url TEXT NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0 CHECK (estoque >= 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pedidos
-- ============================================
CREATE TABLE pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'enviado')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: pedido_itens
-- ============================================
CREATE TABLE pedido_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  bolo_id UUID NOT NULL REFERENCES bolos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10,2) NOT NULL CHECK (preco_unitario > 0),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_status ON pedidos(status);
CREATE INDEX idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);
CREATE INDEX idx_pedido_itens_bolo_id ON pedido_itens(bolo_id);
CREATE INDEX idx_clientes_telefone ON clientes(telefone);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bolos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedido_itens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE ACESSO - CLIENTES
-- ============================================

-- Permitir leitura pública de clientes
CREATE POLICY "Permitir leitura pública de clientes"
ON clientes FOR SELECT
TO public
USING (true);

-- Permitir inserção pública de clientes
CREATE POLICY "Permitir inserção pública de clientes"
ON clientes FOR INSERT
TO public
WITH CHECK (true);

-- Permitir atualização pública de clientes
CREATE POLICY "Permitir atualização pública de clientes"
ON clientes FOR UPDATE
TO public
USING (true);

-- ============================================
-- POLÍTICAS DE ACESSO - BOLOS
-- ============================================

-- Permitir leitura pública de bolos
CREATE POLICY "Permitir leitura pública de bolos"
ON bolos FOR SELECT
TO public
USING (true);

-- Permitir inserção pública de bolos
CREATE POLICY "Permitir inserção pública de bolos"
ON bolos FOR INSERT
TO public
WITH CHECK (true);

-- Permitir atualização pública de bolos
CREATE POLICY "Permitir atualização pública de bolos"
ON bolos FOR UPDATE
TO public
USING (true);

-- Permitir exclusão pública de bolos
CREATE POLICY "Permitir exclusão pública de bolos"
ON bolos FOR DELETE
TO public
USING (true);

-- ============================================
-- POLÍTICAS DE ACESSO - PEDIDOS
-- ============================================

-- Permitir leitura pública de pedidos
CREATE POLICY "Permitir leitura pública de pedidos"
ON pedidos FOR SELECT
TO public
USING (true);

-- Permitir inserção pública de pedidos
CREATE POLICY "Permitir inserção pública de pedidos"
ON pedidos FOR INSERT
TO public
WITH CHECK (true);

-- Permitir atualização pública de pedidos
CREATE POLICY "Permitir atualização pública de pedidos"
ON pedidos FOR UPDATE
TO public
USING (true);

-- ============================================
-- POLÍTICAS DE ACESSO - PEDIDO_ITENS
-- ============================================

-- Permitir leitura pública de pedido_itens
CREATE POLICY "Permitir leitura pública de pedido_itens"
ON pedido_itens FOR SELECT
TO public
USING (true);

-- Permitir inserção pública de pedido_itens
CREATE POLICY "Permitir inserção pública de pedido_itens"
ON pedido_itens FOR INSERT
TO public
WITH CHECK (true);

-- Permitir atualização pública de pedido_itens
CREATE POLICY "Permitir atualização pública de pedido_itens"
ON pedido_itens FOR UPDATE
TO public
USING (true);

-- ============================================
-- DADOS INICIAIS - BOLOS
-- ============================================
INSERT INTO bolos (nome, descricao, preco, imagem_url, estoque) VALUES
('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura cremosa', 45.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', 10),
('Bolo de Morango', 'Bolo leve com morangos frescos e chantilly', 50.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', 8),
('Bolo de Cenoura', 'Tradicional bolo de cenoura com cobertura de chocolate', 35.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 12),
('Bolo Red Velvet', 'Bolo vermelho aveludado com cream cheese', 55.00, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400', 6),
('Bolo de Limão', 'Bolo refrescante de limão siciliano', 40.00, 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400', 15);

-- ============================================
-- DADOS INICIAIS - CLIENTES DE TESTE
-- ============================================
INSERT INTO clientes (nome, telefone) VALUES
('Maria Silva', '11999887766'),
('João Santos', '11988776655');

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para pedidos completos com informações do cliente
CREATE OR REPLACE VIEW pedidos_completos AS
SELECT 
  p.id,
  p.cliente_id,
  c.nome as cliente_nome,
  c.telefone as cliente_telefone,
  p.total,
  p.status,
  p.criado_em
FROM pedidos p
JOIN clientes c ON p.cliente_id = c.id;

-- View para itens de pedido com informações do bolo
CREATE OR REPLACE VIEW pedido_itens_completos AS
SELECT 
  pi.id,
  pi.pedido_id,
  pi.bolo_id,
  b.nome as bolo_nome,
  pi.quantidade,
  pi.preco_unitario,
  (pi.quantidade * pi.preco_unitario) as subtotal
FROM pedido_itens pi
JOIN bolos b ON pi.bolo_id = b.id;

-- ============================================
-- FUNÇÕES ÚTEIS
-- ============================================

-- Função para buscar ou criar cliente
CREATE OR REPLACE FUNCTION buscar_ou_criar_cliente(
  p_nome TEXT,
  p_telefone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_cliente_id UUID;
BEGIN
  -- Tenta buscar cliente existente
  SELECT id INTO v_cliente_id
  FROM clientes
  WHERE telefone = p_telefone;
  
  -- Se não encontrou, cria novo
  IF v_cliente_id IS NULL THEN
    INSERT INTO clientes (nome, telefone)
    VALUES (p_nome, p_telefone)
    RETURNING id INTO v_cliente_id;
  END IF;
  
  RETURN v_cliente_id;
END;
$$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se todas as tabelas foram criadas
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_colunas
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN ('clientes', 'bolos', 'pedidos', 'pedido_itens')
ORDER BY table_name;

-- Verificar dados iniciais
SELECT 'Bolos cadastrados:' as info, COUNT(*) as total FROM bolos
UNION ALL
SELECT 'Clientes cadastrados:', COUNT(*) FROM clientes;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
-- Agora o banco está pronto para uso!
-- ============================================
