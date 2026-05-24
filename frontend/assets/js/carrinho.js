$(document).ready(function() {
  const token = localStorage.getItem('token');
  if (token) {
    carregarCarrinho();
    atualizarContador();
  }

  $('#btn-finalizar').on('click', async function() {
    await finalizarCompra();
  });
});

async function carregarCarrinho() {
  try {
    const response = await apiCall('/carrinho', 'GET', null, true);
    const carrinho = response.itens || [];
    renderizarCarrinho(carrinho);
  } catch (error) {
    console.error('Erro ao carregar carrinho:', error);
  }
}

function renderizarCarrinho(carrinho) {
  if (!carrinho || carrinho.length === 0) {
    $('.carrinho-itens').html('<p style="text-align:center;color:var(--texto-claro);">Carrinho vazio</p>');
    $('.total-carrinho span').text('R$ 0,00');
    return;
  }

  let total = 0;
  const itensHtml = carrinho.map(item => {
    total += item.subtotal || 0;
    return `
      <div class="item-carrinho" data-id="${item.id}">
        <img src="${item.bolo_imagem_url || '../assets/images/BoloRedVelvet.jpg'}" alt="${item.bolo_nome}">
        <div class="info-item">
          <h3>${item.bolo_nome}</h3>
          <p>R$ ${Number(item.bolo_preco).toFixed(2).replace('.', ',')}</p>
          <div class="quantidade-controle">
            <button class="btn-quantidade" onclick="atualizarQuantidade('${item.id}', ${item.quantidade - 1})">-</button>
            <span>${item.quantidade}</span>
            <button class="btn-quantidade" onclick="atualizarQuantidade('${item.id}', ${item.quantidade + 1})">+</button>
          </div>
        </div>
        <button class="remover-item" onclick="removerItem('${item.id}')">Remover</button>
      </div>
    `;
  }).join('');

  $('.carrinho-itens').html(itensHtml);
  $('.total-carrinho span').text('R$ ' + total.toFixed(2).replace('.', ','));
}

async function atualizarQuantidade(itemId, novaQuantidade) {
  if (novaQuantidade < 1) {
    await removerItem(itemId);
    return;
  }

  try {
    await apiCall(`/carrinho/atualizar/${itemId}`, 'PUT', { quantidade: novaQuantidade }, true);
    carregarCarrinho();
    atualizarContador();
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    Swal.fire('Erro', 'Erro ao atualizar quantidade', 'error');
  }
}

async function removerItem(itemId) {
  try {
    await apiCall(`/carrinho/remover/${itemId}`, 'DELETE', null, true);
    carregarCarrinho();
    atualizarContador();
  } catch (error) {
    console.error('Erro ao remover item:', error);
    Swal.fire('Erro', 'Erro ao remover item', 'error');
  }
}

async function finalizarCompra() {
  try {
    await apiCall('/pedidos/criar', 'POST', null, true);
    Swal.fire({
      title: 'Sucesso!',
      text: 'Pedido realizado com sucesso!',
      icon: 'success',
      confirmButtonText: 'OK'
    }).then(() => {
      window.location.href = 'pedidos.html';
    });
  } catch (error) {
    console.error('Erro ao finalizar:', error);
    Swal.fire('Erro', 'Erro ao finalizar compra: ' + error.message, 'error');
  }
}

async function atualizarContador() {
  try {
    const response = await apiCall('/carrinho', 'GET', null, true);
    const carrinho = response.itens || [];
    const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0);
    $('.contador-carrinho').text(totalItens);
  } catch (error) {
    $('.contador-carrinho').text('0');
  }
}

async function adicionarAoCarrinho(boloId, quantidade = 1) {
  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire({
      title: 'Atenção',
      text: 'Você precisa fazer login para adicionar itens ao carrinho.',
      icon: 'warning',
      confirmButtonText: 'Fazer Login'
    }).then(() => {
      window.location.href = 'login.html';
    });
    return;
  }

  try {
    await apiCall('/carrinho/adicionar', 'POST', {
      bolo_id: boloId,
      quantidade: quantidade
    }, true);
    
    Swal.fire({
      title: 'Adicionado!',
      text: 'Produto adicionado ao carrinho',
      icon: 'success',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
    
    atualizarContador();
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    Swal.fire('Erro', 'Erro ao adicionar ao carrinho', 'error');
  }
}
