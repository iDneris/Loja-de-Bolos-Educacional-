$(document).ready(async function() {
  const token = localStorage.getItem('token');
  if (token) {
    await carregarCarrinho();
    await atualizarContador();
  }

  $('#btn-finalizar').on('click', async function() {
    await finalizarCompra();
  });
});

async function carregarCarrinho() {
  try {
    const response = await apiCall('/carrinho', 'GET', null, true);
    // console.log('Resposta carrinho:', response);
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
    await carregarCarrinho();
    await atualizarContador();
  } catch (error) {
    console.error('Erro ao atualizar quantidade:', error);
    Swal.fire('Erro', 'Erro ao atualizar quantidade', 'error');
  }
}

async function removerItem(itemId) {
  try {
    await apiCall(`/carrinho/remover/${itemId}`, 'DELETE', null, true);
    await carregarCarrinho();
    await atualizarContador();
  } catch (error) {
    console.error('Erro ao remover item:', error);
    Swal.fire('Erro', 'Erro ao remover item', 'error');
  }
}

async function finalizarCompra() {
  const emSubpasta = window.location.pathname.includes("/pages/");
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Verificar se carrinho tem itens
  try {
    const response = await apiCall('/carrinho', 'GET', null, true);
    const carrinho = response.itens || [];
    if (carrinho.length === 0) {
      Swal.fire('Atenção', 'Seu carrinho está vazio', 'warning');
      return;
    }
  } catch (error) {
    Swal.fire('Erro', 'Erro ao verificar carrinho', 'error');
    return;
  }

  if (!usuario || !usuario.nome || !usuario.telefone) {
    const { value: formValues } = await Swal.fire({
      title: 'Finalizar Pedido',
      html:
        '<input id="swal-input1" class="swal2-input" placeholder="Seu Nome">' +
        '<input id="swal-input2" class="swal2-input" placeholder="Seu Telefone">',
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    });

    if (!formValues || !formValues[0] || !formValues[1]) {
      Swal.fire('Atenção', 'Nome e telefone são obrigatórios', 'warning');
      return;
    }

    const [clienteNome, clienteTelefone] = formValues;

    try {
      Swal.fire({
        title: 'Finalizando compra...',
        text: 'Aguarde enquanto criamos seu pedido.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await apiCall('/pedidos/criar', 'POST', { clienteNome, clienteTelefone }, true);
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Pedido realizado com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      window.location.href = emSubpasta ? 'pedidos.html' : 'pages/pedidos.html';
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao finalizar compra: ' + error.message,
        icon: 'error'
      });
    }
  } else {
    try {
      Swal.fire({
        title: 'Finalizando compra...',
        text: 'Aguarde enquanto criamos seu pedido.',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await apiCall('/pedidos/criar', 'POST', { clienteNome: usuario.nome, clienteTelefone: usuario.telefone }, true);
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Pedido realizado com sucesso!',
        icon: 'success',
        confirmButtonText: 'OK'
      });
      window.location.href = emSubpasta ? 'pedidos.html' : 'pages/pedidos.html';
    } catch (error) {
      console.error('Erro ao finalizar:', error);
      Swal.fire({
        title: 'Erro',
        text: 'Erro ao finalizar compra: ' + error.message,
        icon: 'error'
      });
    }
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

async function adicionarAoCarrinho(boloId, quantidade = 1, botaoElemento = null) {
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

  // Feedback visual imediato
  if (botaoElemento) {
    botaoElemento.innerHTML = 'Adicionado';
    botaoElemento.style.backgroundColor = '#22c55e';
    botaoElemento.style.color = 'white';
  }

  try {
    await apiCall('/carrinho/adicionar', 'POST', {
      bolo_id: boloId,
      quantidade: quantidade
    }, true);

    // Atualiza imediatamente contador e lista (sem precisar F5)
    await atualizarContador();
    if ($("#overlay-carrinho").hasClass('ativo')) {
      await carregarCarrinho();
    }
  } catch (error) {
    console.error('Erro ao adicionar:', error);
    Swal.fire('Erro', 'Erro ao adicionar ao carrinho', 'error');
    
    // Reverter feedback visual em caso de erro
    if (botaoElemento) {
      botaoElemento.innerHTML = 'Adicionar';
      botaoElemento.style.backgroundColor = '';
      botaoElemento.style.color = '';
    }
  } finally {
    // Voltar ao normal após 2 segundos
    if (botaoElemento) {
      setTimeout(() => {
        botaoElemento.innerHTML = 'Adicionar';
        botaoElemento.style.backgroundColor = '';
        botaoElemento.style.color = '';
      }, 2000);
    }
  }
}


window.carregarCarrinho = carregarCarrinho;
window.atualizarQuantidade = atualizarQuantidade;
window.removerItem = removerItem;
window.finalizarCompra = finalizarCompra;
window.atualizarContador = atualizarContador;
window.adicionarAoCarrinho = adicionarAoCarrinho;
