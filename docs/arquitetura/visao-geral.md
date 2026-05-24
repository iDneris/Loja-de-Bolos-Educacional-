# Visao Geral

## Sobre o projeto

Sistema de e-commerce para A&L Cakes feito como projeto da faculdade. A ideia e ter um backend completo com autenticacao, carrinho de compras e gestao de pedidos.

O frontend foi feito pelo resto do grupo, esse repositorio e so o backend.

## Tecnologias

Usamos Node.js com TypeScript porque facilita pegar erros antes de rodar o codigo. Express foi escolhido por ser simples e direto. Para banco de dados, optamos pelo Supabase que e PostgreSQL hospedado de graca.

Autenticacao e feita com JWT (tokens) e as senhas sao guardadas com hash bcrypt.

## Como funciona

O sistema tem 3 camadas principais:

**Rotas** - Definem os endpoints da API
**Controladores** - Validam os dados e chamam os servicos
**Servicos** - Fazem a logica de negocio e acessam o banco

Quando chega uma requisicao, ela passa pelos middlewares de autenticacao (se precisar), vai pro controlador que valida os dados, chama o servico que faz a logica e acessa o Supabase, e retorna a resposta.

## Funcionalidades principais

### Autenticacao

Usuario pode se registrar e fazer login. O sistema gera um token JWT que expira em 24 horas. Tem dois tipos de usuario: cliente e admin.

### Catalogo de bolos

Qualquer um pode ver os bolos disponiveis. Mas so admin pode criar, editar ou deletar bolos. Cada bolo tem nome, descricao, preco, imagem e estoque.

### Carrinho de compras

Usuario logado pode adicionar bolos no carrinho, mudar quantidade, remover itens. O sistema valida se tem estoque antes de adicionar.

### Pedidos

Quando o usuario finaliza a compra, o sistema:
- Pega os itens do carrinho
- Valida se tem estoque de tudo
- Cria o pedido
- Reduz o estoque
- Limpa o carrinho

Cliente ve so os proprios pedidos. Admin ve todos.

### Administracao

Admin pode gerenciar usuarios e bolos. Cliente so pode ver e editar os proprios dados.

## Seguranca

Senhas sao guardadas com hash bcrypt (10 rounds). Tokens JWT tem validade de 24h. Todas as rotas protegidas verificam o token antes de executar.

O sistema valida entrada em todos os endpoints e verifica estoque antes de operacoes criticas.

## Banco de dados

Tem 6 tabelas principais:

- **usuarios** - Login e autenticacao
- **clientes** - Dados para pedidos
- **bolos** - Catalogo de produtos
- **carrinho_itens** - Itens no carrinho
- **pedidos** - Pedidos finalizados
- **pedido_itens** - Itens de cada pedido

## Endpoints

A API tem 21 endpoints divididos em:

- Autenticacao (2)
- Bolos (5)
- Carrinho (5)
- Pedidos (4)
- Usuarios (4)
- Teste (1)

## Deploy

Em desenvolvimento roda em http://localhost:3000

Em producao fizemos deploy no Vercel que e serverless e escala automaticamente.

## Documentacao

Tem documentacao completa na pasta `/docs`:

- `/api` - Como usar os endpoints
- `/database` - Estrutura do banco
- `/arquitetura` - Decisoes tecnicas
- `/projeto` - Como rodar e fazer deploy

Tambem tem Swagger UI em `/api-docs` quando o servidor ta rodando.
