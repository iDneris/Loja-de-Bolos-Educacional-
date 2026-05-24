# Relacionamentos do Banco

## Estrutura geral

O banco tem 6 tabelas principais:

- **usuarios** - Credenciais e autenticacao
- **clientes** - Dados de clientes pros pedidos
- **bolos** - Catalogo de produtos
- **carrinho_itens** - Itens temporarios no carrinho
- **pedidos** - Pedidos finalizados
- **pedido_itens** - Itens de cada pedido

## Como as tabelas se relacionam

### usuarios e carrinho_itens

Um usuario pode ter varios itens no carrinho. A chave estrangeira `carrinho_itens.usuario_id` aponta pra `usuarios.id` com `ON DELETE CASCADE`, ou seja, se deletar o usuario, o carrinho dele e limpo automaticamente.

### usuarios e pedidos

A relacao entre usuarios e pedidos e indireta, feita pelo telefone. Quando cria um pedido, o sistema busca ou cria um cliente com o telefone do usuario. Isso da flexibilidade pra ter pedidos de nao-usuarios no futuro.

### clientes e pedidos

Um cliente pode ter varios pedidos. A chave `pedidos.cliente_id` aponta pra `clientes.id` com `ON DELETE CASCADE`.

### bolos e carrinho_itens

Um bolo pode estar em varios carrinhos ao mesmo tempo. Se deletar um bolo, ele e removido automaticamente de todos os carrinhos.

### bolos e pedido_itens

Um bolo pode aparecer em varios pedidos. A chave estrangeira preserva o historico mesmo se o bolo for deletado depois.

### pedidos e pedido_itens

Um pedido tem varios itens. Se deletar o pedido, todos os itens sao deletados em cascata.

## Restricoes importantes

### usuarios
- Email tem que ser unico
- Role so pode ser 'cliente' ou 'admin'

### clientes
- Telefone tem que ser unico

### bolos
- Preco tem que ser maior que zero
- Estoque tem que ser maior ou igual a zero

### pedidos
- Total tem que ser maior que zero
- Status so pode ser: 'pendente', 'confirmado', 'entregue', 'cancelado'

### pedido_itens
- Quantidade tem que ser maior que zero
- Preco unitario tem que ser maior que zero

### carrinho_itens
- Quantidade tem que ser maior que zero
- Constraint `UNIQUE(usuario_id, bolo_id)` impede adicionar o mesmo bolo duas vezes no carrinho

## Indices

Criamos indices pra acelerar consultas frequentes:

- `idx_usuarios_email` - Login por email
- `idx_clientes_telefone` - Busca de clientes
- `idx_pedidos_cliente` - Pedidos de um cliente
- `idx_pedido_itens_pedido` - Itens de um pedido
- `idx_pedido_itens_bolo` - Pedidos que tem um bolo
- `idx_carrinho_usuario` - Carrinho de um usuario
- `idx_carrinho_bolo` - Carrinhos que tem um bolo
