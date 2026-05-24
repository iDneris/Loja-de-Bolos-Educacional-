# Estrutura do Frontend

```
frontend/
├── index.html                      # Landing page
├── components/
│   └── header.html                # Header + navbar + menu mobile
├── pages/
│   ├── blog.html                  # Blog
│   ├── cadastro.html              # Registro de usuario
│   ├── cadastroBolos.html         # Cadastro de bolos (admin legado)
│   ├── cardapio.html              # Listagem de produtos
│   ├── login.html                 # Login
│   ├── meusdados.html             # Edicao de perfil
│   ├── painelAdministrativo.html  # Painel admin (dashboard, CRUDs, WhatsApp)
│   ├── pedidos.html               # Historico de pedidos
│   ├── produto.html               # Detalhes do produto
│   └── sobre.html                 # Pagina institucional
└── assets/
    ├── css/
    │   └── style.css              # Estilos globais (variaveis CSS, layout, responsivo)
    ├── js/
    │   ├── carrinho.js            # Estado e operacoes do carrinho
    │   ├── controller.js          # Camada de API (fetch wrapper com JWT)
    │   ├── header.js              # Carregamento dinamico do header + atualizacao de usuario
    │   ├── produtos.js            # Renderizacao de cards e pagina de produto
    │   └── script.js              # Scripts gerais
    └── images/
```

## Responsabilidades

### `controller.js`
Wrapper de fetch com tratamento de erro padrao. Adiciona token JWT do localStorage automaticamente nas requisicoes autenticadas. Exporta `apiCall(endpoint, method, body, auth)`.

### `header.js`
- `carregarHeader()`: Faz fetch de `components/header.html` e injeta no DOM
- `atualizarUsuario()`: Le localStorage, atualiza nome, exibe/esconde links por role

### `produtos.js`
- `renderizarCardapio(produtos)`: Monta grid de cards com imagem, preco e botao add carrinho
- `renderizarProdutoUnico(produto)`: Pagina de detalhes com controle de quantidade
- `ajustarQtdCard()` / `ajustarQtdProduto()`: Controle +/- com limite 1-10
- `adicionarAoCarrinhoCard()`: Add direto do cardapio

### `carrinho.js`
- `carregarCarrinho()`: GET /carrinho e renderiza itens
- `adicionarAoCarrinho(boloId, quantidade)`: POST /carrinho/adicionar
- `removerDoCarrinho(itemId)`: DELETE /carrinho/remover/:id
- `atualizarContador()`: Atualiza badge no icone do carrinho

### `style.css`
Folha unica com variaveis CSS no `:root`:
- `--rosa-escuro`, `--rosa-claro`, `--bege`
- `--texto-escuro`, `--texto-claro`, `--cinza-borda`

Responsivo com breakpoints em 860px (menu hamburguer), 768px e 480px.

## Convencoes

- IDs em portugues: `tabela-produtos`, `btn-add-carrinho`
- Funcoes camelCase: `carregarProdutos`, `abrirModalProduto`
- Classes kebab-case: `btn-acao`, `tabela-container`
- Um arquivo JS por dominio
- Header carregado via jQuery `$.get()` em todas as paginas
