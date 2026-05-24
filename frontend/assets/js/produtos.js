$(document).ready(function(){
  // Se estiver na página de produto, carrega apenas o produto específico
  const container = document.querySelector("#detalhe-produto");
  if (container) {
    carregarProdutoEspecifico();
  } else {
    // Nas outras páginas, carrega todos os produtos
    listar_bolos();
  }
})

async function carregarProdutoEspecifico() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    console.error('ID do produto não fornecido');
    return;
  }

  try {
    const produto = await apiCall(`/bolos/${id}`, 'GET');
    renderizarProdutoUnico(produto);
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
  }
}

function renderizarProdutoUnico(produto) {
  const container = document.querySelector("#detalhe-produto");
  if (!container) return;

  const msgWhats = encodeURIComponent(
    `Olá A&L Cakes! Tenho interesse no produto "${produto.nome}" (R$ ${produto.preco.toFixed(2).replace(".", ",")}). Pode me passar mais informações?`
  );

  document.title = `${produto.nome} - A&L Cakes`;

  container.innerHTML = `
    <div class="produto-layout">
      <div class="produto-detalhe-img" data-animar>
        <img src="${produto.imagem_url}" alt="${produto.nome}">
      </div>
      <div class="produto-detalhe-info" data-animar>
        <span class="tag-produto">Artesanal</span>
        <h1>${produto.nome}</h1>
        <span class="preco">
          R$ ${produto.preco.toFixed(2).replace(".", ",")}
        </span>
        <p class="descricao-produto">
          ${produto.descricao}
        </p>
        <div class="beneficios-produto">
          <div class="beneficio-item">
            <span class="bullet"></span> Feito sob encomenda, fresquinho
          </div>
          <div class="beneficio-item">
            <span class="bullet"></span> Ingredientes selecionados
          </div>
          <div class="beneficio-item">
            <span class="bullet"></span> Entrega segura em toda a região
          </div>
        </div>
        <div class="produto-acoes">
          <!-- ROW 1: Quantidade + Adicionar ao Carrinho -->
          <div class="acoes-carrinho">
            <div class="quantidade-wrapper-inline">
              <label>Quantidade:</label>
              <div class="quantidade-controle">
                <button type="button" class="btn-qtd" onclick="ajustarQtdProduto(-1);">−</button>
                <input type="number" id="produto-quantidade" min="1" max="10" value="1" readonly>
                <button type="button" class="btn-qtd" onclick="ajustarQtdProduto(1);">+</button>
              </div>
            </div>
            <button class="btn-add-carrinho" id="btn-add-carrinho-produto">
              🛒 Adicionar
            </button>
          </div>
          
          <!-- ROW 2: Fazer Pedido (WhatsApp) -->
          <a
            href="https://wa.me/5511963216219?text=${msgWhats}"
            target="_blank"
            rel="noopener"
            class="btn-whatsapp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" style="margin-right: 8px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.13 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Fazer Pedido
          </a>
        </div>
      </div>
    </div>
  `;

  // Adicionar evento usando delegação
  $(document).on('click', '#btn-add-carrinho-produto', function() {
    const quantidade = parseInt($('#produto-quantidade').val()) || 1;
    adicionarAoCarrinho(produto.id, quantidade);
  });
}

async function listar_bolos() {
  const bolos = await apiCall('/bolos', 'GET');
  
  renderizarCardapio(bolos);
  renderizarDestaques(bolos);
  
  return bolos;
}

/* ---------------------------------------------------------
   Detecta se a página atual está dentro da pasta /pages/
   para ajustar caminhos relativos de imagens e links.
   --------------------------------------------------------- */
const EM_SUBPASTA = window.location.pathname.includes("/pages/");
const PREFIXO = EM_SUBPASTA ? "../" : "";
const LINK_PRODUTO = EM_SUBPASTA ? "produto.html" : "pages/produto.html";

// Função para ajustar quantidade na página de produto
function ajustarQtdProduto(delta) {
  const input = document.getElementById('produto-quantidade');
  if (!input) return;
  
  let novaQtd = parseInt(input.value) + delta;
  if (novaQtd < 1) novaQtd = 1;
  if (novaQtd > 10) novaQtd = 10;
  
  input.value = novaQtd;
}

// Funções para o cardápio
function ajustarQtdCard(produtoId, delta) {
  const input = document.getElementById(`qtd-card-${produtoId}`);
  if (!input) return;
  
  let novaQtd = parseInt(input.value) + delta;
  if (novaQtd < 1) novaQtd = 1;
  if (novaQtd > 10) novaQtd = 10;
  
  input.value = novaQtd;
}

function adicionarAoCarrinhoCard(produtoId) {
  const input = document.getElementById(`qtd-card-${produtoId}`);
  const quantidade = input ? parseInt(input.value) : 1;
  adicionarAoCarrinho(produtoId, quantidade);
}

/* ---------------------------------------------------------
   Renderiza a grade de produtos no cardápio
   --------------------------------------------------------- */
function renderizarCardapio(produtos) {
  const grid = document.querySelector("#grid-produtos");
  if (!grid) return;

  grid.innerHTML = produtos.map((p) => `
    <article class="produto-card" data-animar data-produto-id="${p.id}">
      <a href="${LINK_PRODUTO}?id=${p.id}" class="produto-link">
        <img src="${p.imagem_url}" alt="${p.nome}" loading="lazy">
        <div class="produto-info">
          <h3>${p.nome}</h3>
          <p>${p.descricao}</p>
          <span class="preco">R$ ${p.preco.toFixed(2).replace(".", ",")}</span>
        </div>
      </a>
      <div class="card-acoes">
        <div class="quantidade-card">
          <button type="button" class="btn-qtd-menos" onclick="event.stopPropagation(); ajustarQtdCard('${p.id}', -1);">−</button>
          <input type="number" id="qtd-card-${p.id}" value="1" min="1" max="10" readonly>
          <button type="button" class="btn-qtd-mais" onclick="event.stopPropagation(); ajustarQtdCard('${p.id}', 1);">+</button>
        </div>
        <button class="btn-add-carrinho-card" onclick="event.stopPropagation(); adicionarAoCarrinhoCard('${p.id}');">
          🛒 Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

/* ---------------------------------------------------------
   Renderiza destaques na home (4 produtos)
   --------------------------------------------------------- */
function renderizarDestaques(produtos) {
  const grid = document.querySelector("#grid-destaques");
  if (!grid) return;

  const destaques = produtos.slice(0, 4);
  grid.innerHTML = destaques.map((p) => `
    <article class="produto-card" data-animar onclick="window.location.href='${LINK_PRODUTO}?id=${p.id}'">
      <img src="${p.imagem_url}" alt="${p.nome}" loading="lazy">
      <div class="produto-info">
        <h3>${p.nome}</h3>
        <p>${p.descricao}</p>
        <span class="preco">R$ ${p.preco.toFixed(2).replace(".", ",")}</span>
      </div>
    </article>
  `).join("");
}

/* ---------------------------------------------------------
   Renderiza a página individual do produto
   Lê o ?id=... da URL
   --------------------------------------------------------- */
