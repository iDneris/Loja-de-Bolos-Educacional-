# Componentes

## Header (`components/header.html`)

Carregado via `header.js` com `$.get()` e injetado no inicio do `<body>`. Presente em todas as paginas.

### Estrutura
- `.navbar` > `.nav-container` > `img` (logo) + `a.logo` + `button.hamburguer` + `nav > ul.nav-menu`
- Menu items: Inicio, Cardapio, Blog, Sobre, Painel Admin (condicional), Login/Carrinho

### Estados
- **Desktop (> 860px)**: Menu horizontal, usuario info na direita
- **Mobile (≤ 860px)**: Hamburger menu com overlay, `#mobile-boasvindas` visivel
- **Logado**: Mostra `#usuario-navbar-container` (nome + carrinho + sair), esconde `#btn-login-nav`
- **Admin**: Mostra `#admin-link`
- **Nao logado**: So `#btn-login-nav`

### Classes chave
- `.mobile-only`: `display: none` em desktop, `display: block` em mobile (media query 860px)
- `.nav-menu.ativo`: `right: 0` (abre menu mobile)

---

## Modal de Produto (`painelAdministrativo.html`)

```html
<div id="modal-produto" class="modal-admin">
  <div class="modal-admin-conteudo">
    <div class="modal-admin-header">
      <h3 id="modal-produto-titulo">Novo Produto</h3>
      <button class="modal-admin-fechar" onclick="fecharModalProduto()">✕</button>
    </div>
    <form id="form-produto">
      <!-- nome, descricao, preco, imagem (URL), categoria -->
      <button type="submit" class="btn-salvar">Salvar</button>
    </form>
  </div>
</div>
```

### Comportamento
- `abrirModalProduto(produto?)`: Se receber objeto, preenche campos (modo edicao)
- Submit: POST /bolos (criar) ou PUT /bolos/:id (editar)
- Fecha no ✕, clicando fora do modal, ou apos save

---

## Modal de Cliente/Equipe

Mesmo padrao do modal de produto. Campos: nome, email, telefone, senha. Role fixo (`cliente` ou `admin`).

---

## Tabela Container

Wrapper padrao pra tabelas do painel:

```html
<div class="tabela-container">
  <div class="tabela-header">
    <h3>Titulo</h3>
    <button class="btn-novo" onclick="..."><span>+</span> Novo</button>
  </div>
  <table>
    <thead><tr>...</tr></thead>
    <tbody id="tabela-...">...</tbody>
  </table>
</div>
```

### Classes CSS
- `.tabela-container`: Card com `box-shadow`, `border-radius: 16px`, `overflow: hidden`
- `.tabela-header`: `display: flex; justify-content: space-between`
- `.btn-novo`: Background verde, icone `+`
- `.btn-acao`: Botoes inline na coluna de acoes (sem `display: flex` pra nao quebrar alinhamento vertical)
- `.btn-editar`: Azul
- `.btn-excluir`: Vermelho
