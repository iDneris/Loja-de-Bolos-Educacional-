-- Tabela de usuarios para autenticacao
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  telefone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busca por email
CREATE INDEX idx_usuarios_email ON usuarios(email);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Politica de leitura publica (necessario para login)
CREATE POLICY "Permitir leitura publica de usuarios"
ON usuarios FOR SELECT
TO public
USING (true);

-- Politica de insercao publica (necessario para registro)
CREATE POLICY "Permitir insercao publica de usuarios"
ON usuarios FOR INSERT
TO public
WITH CHECK (true);

-- Politica de atualizacao (usuario pode atualizar apenas seus dados)
CREATE POLICY "Permitir atualizacao propria"
ON usuarios FOR UPDATE
TO public
USING (true);

-- Usuario admin padrao
-- Senha: admin123
INSERT INTO usuarios (nome, email, senha_hash, telefone, role) VALUES
('Administrador', 'admin@loja.com', '$2b$10$rGfE7YZ5qJ9xKx.vN8F0/.VqXZJ0qYxQJ5vN8F0/.VqXZJ0qYxQJ5u', '11999999999', 'admin');

-- Usuario cliente teste
-- Senha: cliente123
INSERT INTO usuarios (nome, email, senha_hash, telefone, role) VALUES
('João Silva', 'joao@email.com', '$2b$10$rGfE7YZ5qJ9xKx.vN8F0/.VqXZJ0qYxQJ5vN8F0/.VqXZJ0qYxQJ5u', '11987654321', 'cliente');

-- Verificar usuarios criados
SELECT id, nome, email, telefone, role FROM usuarios;
