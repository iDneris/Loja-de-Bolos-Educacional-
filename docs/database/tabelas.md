# Tabelas do Banco de Dados

## usuarios

Armazena dados de autenticacao dos usuarios do sistema.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| nome | TEXT | Nome completo do usuario |
| email | TEXT | Email (UNIQUE) |
| senha_hash | TEXT | Hash bcrypt da senha |
| telefone | TEXT | Telefone do usuario |
| role | TEXT | Papel do usuario (cliente ou admin) |
| criado_em | TIMESTAMP | Data de criacao |

**Indices:**
- idx_usuarios_email (email) - para login rapido

**Restricoes:**
- email UNIQUE
- role CHECK (role IN ('cliente', 'admin'))

**Uso:**
- Autenticacao e autorizacao
- Controle de acesso baseado em roles
- Relacionamento com carrinho_itens

## clientes

Armazena dados de clientes para pedidos (separado de usuarios para flexibilidade).

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| nome | TEXT | Nome do cliente |
| telefone | TEXT | Telefone (UNIQUE) |
| criado_em | TIMESTAMP | Data de criacao |

**Indices:**
- idx_clientes_telefone (telefone) - para busca rapida

**Restricoes:**
- telefone UNIQUE

**Uso:**
- Armazenar dados de clientes para pedidos
- Relacionamento com pedidos
- Permite pedidos sem usuario cadastrado (futuro)

## bolos

Catalogo de produtos (bolos) disponiveis para venda.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| nome | TEXT | Nome do bolo |
| descricao | TEXT | Descricao detalhada |
| preco | NUMERIC(10,2) | Preco unitario |
| imagem_url | TEXT | URL da imagem |
| estoque | INTEGER | Quantidade em estoque |
| criado_em | TIMESTAMP | Data de criacao |

**Restricoes:**
- preco CHECK (preco > 0)
- estoque CHECK (estoque >= 0)

**Uso:**
- Catalogo de produtos
- Controle de estoque
- Relacionamento com carrinho_itens e pedido_itens

## carrinho_itens

Itens no carrinho de compras de cada usuario.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| usuario_id | UUID | ID do usuario (FK) |
| bolo_id | UUID | ID do bolo (FK) |
| quantidade | INTEGER | Quantidade desejada |
| criado_em | TIMESTAMP | Data de adicao |
| atualizado_em | TIMESTAMP | Data de atualizacao |

**Indices:**
- idx_carrinho_usuario (usuario_id) - para listar carrinho
- idx_carrinho_bolo (bolo_id) - para buscar carrinhos com bolo

**Restricoes:**
- quantidade CHECK (quantidade > 0)
- UNIQUE(usuario_id, bolo_id) - um bolo por usuario

**Relacionamentos:**
- usuario_id -> usuarios.id (CASCADE)
- bolo_id -> bolos.id (CASCADE)

**Uso:**
- Armazenar itens antes de finalizar pedido
- Permitir usuario revisar compra
- Limpo apos criar pedido

## pedidos

Pedidos realizados pelos clientes.

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| cliente_id | UUID | ID do cliente (FK) |
| total | NUMERIC(10,2) | Valor total do pedido |
| status | TEXT | Status do pedido |
| criado_em | TIMESTAMP | Data de criacao |

**Indices:**
- idx_pedidos_cliente (cliente_id) - para listar pedidos do cliente

**Restricoes:**
- total CHECK (total > 0)
- status CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado'))

**Relacionamentos:**
- cliente_id -> clientes.id (CASCADE)

**Uso:**
- Registrar pedidos realizados
- Acompanhar status
- Historico de compras

## pedido_itens

Itens de cada pedido (relacionamento N:N entre pedidos e bolos).

| Campo | Tipo | Descricao |
|-------|------|-----------|
| id | UUID | Identificador unico (PK) |
| pedido_id | UUID | ID do pedido (FK) |
| bolo_id | UUID | ID do bolo (FK) |
| quantidade | INTEGER | Quantidade comprada |
| preco_unitario | NUMERIC(10,2) | Preco no momento da compra |
| criado_em | TIMESTAMP | Data de criacao |

**Indices:**
- idx_pedido_itens_pedido (pedido_id) - para buscar itens do pedido
- idx_pedido_itens_bolo (bolo_id) - para buscar pedidos de um bolo

**Restricoes:**
- quantidade CHECK (quantidade > 0)
- preco_unitario CHECK (preco_unitario > 0)

**Relacionamentos:**
- pedido_id -> pedidos.id (CASCADE)
- bolo_id -> bolos.id (CASCADE)

**Uso:**
- Detalhar itens de cada pedido
- Preservar preco no momento da compra
- Permitir relatorios de vendas

## Fluxo de Dados

### Compra Normal

```
1. Usuario adiciona bolos ao carrinho
   -> INSERT em carrinho_itens

2. Usuario finaliza pedido
   -> INSERT em pedidos
   -> INSERT em pedido_itens (varios)
   -> UPDATE em bolos (reduz estoque)
   -> DELETE em carrinho_itens (limpa carrinho)
```

### Consulta de Pedidos

```
1. Cliente consulta seus pedidos
   -> SELECT em pedidos WHERE cliente_id
   -> JOIN com clientes
   -> JOIN com pedido_itens
   -> JOIN com bolos
```

### Admin Gerencia Bolos

```
1. Admin cria bolo
   -> INSERT em bolos

2. Admin atualiza estoque
   -> UPDATE em bolos

3. Admin deleta bolo
   -> DELETE em bolos
   -> CASCADE: remove de carrinho_itens e pedido_itens
```
