-- Dados iniciais para o banco de dados
-- Execute este SQL apos executar o schema.sql

-- Limpa dados existentes (cuidado em producao!)
TRUNCATE TABLE carrinho_itens, pedido_itens, pedidos, bolos, clientes, usuarios CASCADE;

-- Insere usuario admin
-- Senha: admin123
INSERT INTO usuarios (nome, email, senha_hash, telefone, role) VALUES
('Administrador', 'admin@loja.com', '$2b$10$rGfE7YZ5qJ9xKx.vN8F0/.VqXZJ0qYxQJ5vN8F0/.VqXZJ0qYxQJ5u', '11999999999', 'admin');

-- Insere usuarios clientes
-- Senha: cliente123
INSERT INTO usuarios (nome, email, senha_hash, telefone, role) VALUES
('Joao Silva', 'joao@email.com', '$2b$10$rGfE7YZ5qJ9xKx.vN8F0/.VqXZJ0qYxQJ5vN8F0/.VqXZJ0qYxQJ5u', '11987654321', 'cliente'),
('Maria Santos', 'maria@email.com', '$2b$10$rGfE7YZ5qJ9xKx.vN8F0/.VqXZJ0qYxQJ5vN8F0/.VqXZJ0qYxQJ5u', '11976543210', 'cliente');

-- Insere clientes (para pedidos)
INSERT INTO clientes (nome, telefone) VALUES
('Joao Silva', '11987654321'),
('Maria Santos', '11976543210'),
('Pedro Costa', '11965432109');

-- Insere bolos
INSERT INTO bolos (nome, descricao, preco, imagem_url, estoque) VALUES
('Bolo de Chocolate', 'Delicioso bolo de chocolate com cobertura cremosa', 45.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587', 15),
('Bolo de Morango', 'Bolo leve com recheio de morango fresco', 50.00, 'https://images.unsplash.com/photo-1565958011703-44f9829ba187', 12),
('Bolo de Cenoura', 'Tradicional bolo de cenoura com cobertura de chocolate', 40.00, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729', 20),
('Bolo Red Velvet', 'Bolo aveludado com cream cheese', 55.00, 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e', 10),
('Bolo de Limao', 'Bolo refrescante de limao com cobertura', 42.00, 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e', 18),
('Bolo de Coco', 'Bolo fofinho de coco com cobertura', 38.00, 'https://images.unsplash.com/photo-1557925923-cd4648e211a0', 25);

-- Insere pedidos de exemplo
DO $$
DECLARE
  cliente1_id UUID;
  cliente2_id UUID;
  pedido1_id UUID;
  pedido2_id UUID;
  bolo1_id UUID;
  bolo2_id UUID;
  bolo3_id UUID;
BEGIN
  -- Busca IDs dos clientes
  SELECT id INTO cliente1_id FROM clientes WHERE telefone = '11987654321';
  SELECT id INTO cliente2_id FROM clientes WHERE telefone = '11976543210';
  
  -- Busca IDs dos bolos
  SELECT id INTO bolo1_id FROM bolos WHERE nome = 'Bolo de Chocolate';
  SELECT id INTO bolo2_id FROM bolos WHERE nome = 'Bolo de Morango';
  SELECT id INTO bolo3_id FROM bolos WHERE nome = 'Bolo de Cenoura';
  
  -- Cria pedido 1
  INSERT INTO pedidos (cliente_id, total, status)
  VALUES (cliente1_id, 95.00, 'confirmado')
  RETURNING id INTO pedido1_id;
  
  -- Itens do pedido 1
  INSERT INTO pedido_itens (pedido_id, bolo_id, quantidade, preco_unitario) VALUES
  (pedido1_id, bolo1_id, 1, 45.00),
  (pedido1_id, bolo2_id, 1, 50.00);
  
  -- Cria pedido 2
  INSERT INTO pedidos (cliente_id, total, status)
  VALUES (cliente2_id, 120.00, 'pendente')
  RETURNING id INTO pedido2_id;
  
  -- Itens do pedido 2
  INSERT INTO pedido_itens (pedido_id, bolo_id, quantidade, preco_unitario) VALUES
  (pedido2_id, bolo3_id, 2, 40.00),
  (pedido2_id, bolo1_id, 1, 45.00);
END $$;

-- Verifica dados inseridos
SELECT 'Usuarios:' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'Clientes:', COUNT(*) FROM clientes
UNION ALL
SELECT 'Bolos:', COUNT(*) FROM bolos
UNION ALL
SELECT 'Pedidos:', COUNT(*) FROM pedidos
UNION ALL
SELECT 'Pedido Itens:', COUNT(*) FROM pedido_itens;
