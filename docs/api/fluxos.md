# Fluxos da Aplicacao

## Autenticacao

### Registro

Usuario preenche nome, email, senha e telefone no formulario. O frontend manda esses dados pro endpoint `POST /auth/registro`.

O backend valida os dados, gera o hash da senha com bcrypt, cria o usuario no Supabase com role 'cliente', gera um token JWT e retorna o token junto com os dados do usuario.

O frontend guarda o token no localStorage e redireciona o usuario pra pagina principal.

### Login

Usuario preenche email e senha. Frontend manda pro `POST /auth/login`.

Backend busca o usuario por email, compara a senha com o hash usando bcrypt. Se tiver certo, gera um token JWT e retorna com os dados do usuario.

Frontend guarda o token no localStorage e redireciona pra pagina principal.

## Fluxo de compra

### Navegacao e carrinho

Usuario ve os bolos disponiveis com `GET /bolos`. Quando escolhe um bolo, clica em "Adicionar ao Carrinho" e o frontend manda `POST /carrinho/adicionar` com o ID do bolo e quantidade.

Backend verifica se o usuario ta logado, se o bolo existe e se tem estoque. Se tiver tudo certo, adiciona no carrinho ou atualiza a quantidade se o bolo ja tiver la.

### Gerenciando o carrinho

Usuario pode ver o carrinho com `GET /carrinho`, que retorna todos os itens com nome do bolo, preco e total.

Pode mudar quantidades com `PUT /carrinho/atualizar/:itemId` ou remover itens com `DELETE /carrinho/remover/:itemId`.

### Finalizando o pedido

Quando decide comprar, frontend manda `POST /pedidos/criar` com nome e telefone do cliente.

Backend faz o seguinte:
1. Busca os itens do carrinho
2. Valida se tem estoque de tudo
3. Cria ou busca o cliente no banco
4. Cria o pedido com status 'pendente'
5. Cria os registros de pedido_itens
6. Reduz o estoque dos bolos
7. Limpa o carrinho

Se faltar estoque ou der erro, cancela tudo e retorna erro.

### Mensagem WhatsApp

Depois de criar o pedido, usuario pode gerar uma mensagem formatada pra enviar no WhatsApp usando `GET /pedidos/:id/whatsapp`. A mensagem tem nome do cliente, telefone, lista de itens com quantidades e precos, total e data/hora.

## Administracao

### Gestao de bolos

So admin pode criar, editar ou deletar bolos. Pra criar, manda `POST /bolos` com nome, descricao, preco, imagem_url e estoque. O middleware de autorizacao verifica a role antes de permitir.

Pra atualizar usa `PUT /bolos/:id` com os campos que quer mudar. Pra deletar usa `DELETE /bolos/:id`.

Listar bolos (`GET /bolos`) e publico, nao precisa estar logado.

### Gestao de usuarios

Admin pode listar todos os usuarios com `GET /usuarios`, ver detalhes de qualquer usuario com `GET /usuarios/:id`, atualizar com `PUT /usuarios/:id` ou deletar com `DELETE /usuarios/:id`.

Usuarios normais (role 'cliente') so podem ver e atualizar os proprios dados. O middleware de autorizacao garante isso.

### Visualizacao de pedidos

Quando um cliente acessa `GET /pedidos`, o backend filtra e retorna so os pedidos do telefone daquele usuario.

Quando um admin acessa o mesmo endpoint, recebe todos os pedidos do sistema.

Isso permite que clientes acompanhem suas compras e admins tenham visao completa das vendas.

## Autenticacao e autorizacao

Todas as requisicoes protegidas precisam incluir o token JWT no header Authorization: `Bearer <token>`.

O middleware de autenticacao pega o token, verifica se e valido, decodifica o payload (que tem id, email e role do usuario) e adiciona essas informacoes em `req.usuario`.

O middleware de autorizacao verifica se a role do usuario ta na lista de roles permitidas pro endpoint. Se nao tiver, retorna erro 403.

## Tratamento de erros

### Estoque insuficiente

Quando usuario tenta adicionar mais itens do que tem em estoque, backend retorna status 400 com mensagem "Estoque insuficiente". Mesmo ao tentar finalizar pedido com itens sem estoque.

### Token expirado

Tokens JWT tem validade de 24 horas. Quando expira, qualquer requisicao protegida retorna status 401. Frontend deve redirecionar pro login.

### Acesso negado

Quando usuario tenta acessar algo que nao tem permissao (tipo cliente tentando criar bolo), backend retorna status 403 com mensagem "Sem permissao para acessar este recurso".
