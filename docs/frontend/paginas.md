# Paginas

## `index.html` - Landing Page
Hero section com CTA, grid de produtos em destaque, info da loja. Carrega header dinamicamente e renderiza produtos da API.

## `pages/cardapio.html` - Cardapio
Grid responsivo de produtos com:
- Card com imagem, nome, preco, descricao
- Botao "Adicionar ao Carrinho" em cada card
- Controle de quantidade inline (+/-)
- Dados via GET /bolos

## `pages/produto.html` - Detalhes do Produto
Pagina de produto unico (query param `?id=`):
- Imagem grande, nome, preco, descricao completa
- Lista de beneficios (mock estatico)
- Controle de quantidade com botoes +/- (limite 1-10)
- Botao "Adicionar ao Carrinho" (outline)
- Botao "Fazer Pedido" com icone SVG do WhatsApp (link wa.me)

## `pages/login.html` - Login
Form com email e senha. POST /auth/login, salva token + usuario no localStorage, redireciona pra index.

## `pages/cadastro.html` - Registro
Form com nome, email, telefone, senha. POST /auth/registro, redireciona pro login.

## `pages/meusdados.html` - Meus Dados
Edicao de perfil do usuario logado. PUT /usuarios/:id. Atualiza localStorage apos save pra header refletir na hora.

## `pages/pedidos.html` - Meus Pedidos
Lista pedidos do usuario via GET /pedidos. Card com status, data, total e link WhatsApp.

## `pages/painelAdministrativo.html` - Painel Admin
Acesso restrito a role `admin`. Single page com modulos via navegacao lateral:

### Dashboard
- 4 cards KPI (total produtos, pedidos, clientes, receita)
- Grafico de barras (vendas/mes) - Chart.js
- Grafico de linha (pedidos/periodo) - Chart.js
- Grafico de donut (categorias) - Chart.js

### Produtos
- Tabela: Imagem (miniatura 50x50), Nome, Preco, Acoes
- Modal de create/edit com validacao
- Delete com confirmacao SweetAlert2
- Sem campo de estoque (removido a pedido do cliente)

### Clientes
- Tabela: Nome, Email, Telefone, Desde, Acoes
- CRUD completo com modal

### Equipe
- Tabela de admins, mesmo padrao de clientes

### WhatsApp
- Input para numero WhatsApp
- Select de templates pre-definidos com placeholders `{PRODUTOS}`, `{TOTAL}`, `{DATA}`
- Preview em tempo real da mensagem montada
- Link de teste `wa.me`

## `pages/sobre.html` - Sobre
Pagina institucional estatica com historia, missao e contato.

## `pages/blog.html` - Blog
Lista estatica de posts com imagem e resumo.
