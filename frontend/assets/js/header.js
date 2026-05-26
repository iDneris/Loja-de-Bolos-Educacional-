// Carregar header master em todas as páginas
$(document).ready(function() {
  carregarHeader();
});

let monitorNotificacaoIntervalo = null;
const NOTIF_STORAGE_PREFIX = 'al_cakes_notificacoes_pedidos_';

function carregarHeader() {
  const EM_SUBPASTA = window.location.pathname.includes('/pages/');
  const PREFIXO = EM_SUBPASTA ? '../' : '';

  if ($('.navbar').length > 0) {
    inicializarHeader();
    atualizarUsuario();
    return;
  }

  $.get(PREFIXO + 'components/header.html', function(data) {
    // Ajustar caminhos se estiver em subpasta
    if (EM_SUBPASTA) {
      data = data.replace(/src="assets\//g, 'src="../assets/');
      data = data.replace(/href="index.html/g, 'href="../index.html');
      data = data.replace(/href="pages\//g, 'href="');
    }
    $('body').prepend(data);
    inicializarHeader();
    atualizarUsuario();
  }).fail(function(err) {
    console.error('Erro ao carregar header:', err);
  });
}

function chaveNotificacaoUsuario(usuarioId) {
  return `${NOTIF_STORAGE_PREFIX}${usuarioId}`;
}

function lerEstadoNotificacoes(usuarioId) {
  try {
    const bruto = localStorage.getItem(chaveNotificacaoUsuario(usuarioId));
    if (!bruto) return { mapa: {}, pendentes: [] };
    const parsed = JSON.parse(bruto);
    return {
      mapa: parsed.mapa || {},
      pendentes: parsed.pendentes || []
    };
  } catch {
    return { mapa: {}, pendentes: [] };
  }
}

function salvarEstadoNotificacoes(usuarioId, estado) {
  localStorage.setItem(chaveNotificacaoUsuario(usuarioId), JSON.stringify(estado));
}

function labelStatus(status) {
  const labels = {
    pendente: 'Pendente',
    confirmado: 'Confirmado',
    em_preparo: 'Em preparo',
    pronto_retirada: 'Pronto para retirada',
    saiu_entrega: 'Saiu para entrega',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
    enviado: 'Saiu para entrega'
  };
  return labels[status] || status;
}

function mensagemStatusCliente(status) {
  const mensagens = {
    pendente: 'Seu pedido está pendente',
    confirmado: 'Seu pedido foi confirmado',
    em_preparo: 'Seu pedido está em preparo',
    pronto_retirada: 'Seu pedido está pronto para retirada',
    saiu_entrega: 'Seu pedido saiu para entrega',
    entregue: 'Seu pedido foi entregue',
    cancelado: 'Seu pedido foi cancelado',
    enviado: 'Seu pedido saiu para entrega'
  };
  return mensagens[status] || `Seu pedido foi atualizado para ${labelStatus(status)}`;
}

async function atualizarListasPedidosAbertas() {
  const tarefas = [];
  if (typeof window.carregarPedidos === 'function') tarefas.push(window.carregarPedidos());
  if (typeof window.carregarPedidosAdmin === 'function') tarefas.push(window.carregarPedidosAdmin());
  if (typeof window.carregarDashboard === 'function') tarefas.push(window.carregarDashboard());
  await Promise.allSettled(tarefas);
}

function atualizarBadgeNotificacoes(quantidade) {
  const texto = String(quantidade || 0);
  $('#contador-notificacoes').text(texto);
  $('#contador-notificacoes-mobile').text(texto);
}

async function sincronizarNotificacoesPedidos(inicial = false) {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const token = localStorage.getItem('token');

  if (!usuario || !token) {
    atualizarBadgeNotificacoes(0);
    return;
  }

  try {
    const pedidos = await apiCall('/pedidos', 'GET', null, true);
    const estado = lerEstadoNotificacoes(usuario.id);
    const novoMapa = {};

    (pedidos || []).forEach((p) => {
      novoMapa[p.id] = p.status;
    });

    if (inicial && Object.keys(estado.mapa).length === 0) {
      salvarEstadoNotificacoes(usuario.id, { mapa: novoMapa, pendentes: [] });
      atualizarBadgeNotificacoes(0);
      return;
    }

    const novasPendencias = [...estado.pendentes];

    (pedidos || []).forEach((p) => {
      const statusAnterior = estado.mapa[p.id];

      if (usuario.role === 'admin' && !statusAnterior) {
        novasPendencias.unshift({
          tipo: 'novo_pedido',
          pedidoId: p.id,
          numeroPedido: p.numero_pedido,
          status: p.status,
          clienteNome: p.clienteNome,
          total: p.total,
          at: new Date().toISOString()
        });
        return;
      }

      if (statusAnterior && statusAnterior !== p.status) {
        if (usuario.role === 'admin' && p.status === 'cancelado') {
          novasPendencias.unshift({
            tipo: 'pedido_cancelado',
            pedidoId: p.id,
            numeroPedido: p.numero_pedido,
            clienteNome: p.clienteNome,
            de: statusAnterior,
            para: p.status,
            at: new Date().toISOString()
          });
          return;
        }

        if (usuario.role !== 'admin') {
          novasPendencias.unshift({
            tipo: 'status_alterado',
            pedidoId: p.id,
            numeroPedido: p.numero_pedido,
            de: statusAnterior,
            para: p.status,
            at: new Date().toISOString()
          });
        }
      }
    });

    const limitadas = novasPendencias.slice(0, 30);
    salvarEstadoNotificacoes(usuario.id, { mapa: novoMapa, pendentes: limitadas });
    atualizarBadgeNotificacoes(limitadas.length);
  } catch (error) {
    // Mantem silencioso para nao poluir UX
  }
}

async function abrirNotificacoesPedidos() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  if (!usuario) return;

  const estado = lerEstadoNotificacoes(usuario.id);
  const pendentes = estado.pendentes || [];

  if (!pendentes.length) {
    await Swal.fire('Notificações', 'Sem novas atualizações de pedidos.', 'info');
    await atualizarListasPedidosAbertas();
    return;
  }

  const html = pendentes.map((n) => {
    const numero = n.numeroPedido || n.pedidoId?.substring(0, 8) || '---';

    if (n.tipo === 'novo_pedido') {
      const total = Number(n.total || 0).toFixed(2).replace('.', ',');
      return `
        <div style="text-align:left;padding:.6rem .3rem;border-bottom:1px solid #f1e6eb;">
          <strong>Novo pedido #${numero}</strong><br>
          <small>${n.clienteNome || 'Cliente'} &middot; R$ ${total} &middot; ${labelStatus(n.status)}</small>
        </div>
      `;
    }

    if (n.tipo === 'pedido_cancelado') {
      return `
        <div style="text-align:left;padding:.6rem .3rem;border-bottom:1px solid #f1e6eb;">
          <strong>O pedido #${numero} foi cancelado</strong><br>
          <small>${n.clienteNome || 'Cliente'} &middot; ${labelStatus(n.para)}</small>
        </div>
      `;
    }

    return `
      <div style="text-align:left;padding:.6rem .3rem;border-bottom:1px solid #f1e6eb;">
        <strong>${mensagemStatusCliente(n.para)}</strong><br>
        <small>Pedido #${numero} &middot; ${labelStatus(n.para)}</small>
      </div>
    `;
  }).join('');

  await Swal.fire({
    title: usuario.role === 'admin' ? 'Novos pedidos' : 'Atualizações de pedidos',
    html,
    width: 560,
    confirmButtonText: 'Ok, visualizar'
  });

  salvarEstadoNotificacoes(usuario.id, { mapa: estado.mapa || {}, pendentes: [] });
  atualizarBadgeNotificacoes(0);
  await atualizarListasPedidosAbertas();
}

function iniciarMonitorNotificacoes() {
  if (monitorNotificacaoIntervalo) {
    clearInterval(monitorNotificacaoIntervalo);
    monitorNotificacaoIntervalo = null;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const token = localStorage.getItem('token');

  if (!usuario || !token) {
    atualizarBadgeNotificacoes(0);
    return;
  }

  sincronizarNotificacoesPedidos(true);
  monitorNotificacaoIntervalo = setInterval(() => {
    sincronizarNotificacoesPedidos(false);
  }, 5000);
}

function atualizarUsuario() {
  const emSubpasta = window.location.pathname.includes('/pages/');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  if (usuario && token) {
    $('#usuario-nome').text(usuario.nome);
    $('#usuario-navbar-container').show();
    $('#auth-buttons-container').hide();
    $('.carrinho-row').show();

    if (usuario.role === 'admin') {
      $('#admin-link').show();
    } else {
      $('#admin-link').hide();
    }

    const deveMostrarNotificacoes = usuario.role === 'admin' || usuario.role === 'cliente';
    $('.notificacoes-row').toggle(deveMostrarNotificacoes);
    $('#abrir-notificacoes-mobile').toggle(deveMostrarNotificacoes);

    iniciarMonitorNotificacoes();
  } else {
    $('#usuario-navbar-container').hide();
    $('#auth-buttons-container').show();
    $('#admin-link').hide();
    $('.carrinho-row').hide();
    $('.notificacoes-row').hide();
    $('#abrir-notificacoes-mobile').hide();
    if (monitorNotificacaoIntervalo) {
      clearInterval(monitorNotificacaoIntervalo);
      monitorNotificacaoIntervalo = null;
    }
  }

  $('#btn-sair').off('click').on('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = emSubpasta ? 'login.html' : 'pages/login.html';
  });
}

function inicializarHeader() {
  $('.hamburguer').on('click', function() {
    $('.nav-menu').toggleClass('aberto');
  });

  $(document).on('click', '#usuario-btn', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $('#dropdown-usuario').toggleClass('ativo');
    $('#usuario-btn').toggleClass('ativo', $('#dropdown-usuario').hasClass('ativo'));
  });

  $(document).on('click', function(e) {
    if (!$(e.target).closest('.usuario-navbar').length) {
      $('#dropdown-usuario').removeClass('ativo');
      $('#usuario-btn').removeClass('ativo');
    }
  });

  $(document).off('click.alCakesNotifs', '#abrir-notificacoes, #abrir-notificacoes-mobile').on('click.alCakesNotifs', '#abrir-notificacoes, #abrir-notificacoes-mobile', function(e) {
    e.preventDefault();
    abrirNotificacoesPedidos();
  });

  $(document).off('click.alCakesCart', '#abrir-carrinho').on('click.alCakesCart', '#abrir-carrinho', function(e) {
    e.preventDefault();
    $('#overlay-carrinho').addClass('ativo');
    if (typeof carregarCarrinho === 'function') {
      carregarCarrinho();
    }
  });

  $(document).off('click.alCakesCartClose', '#fechar-carrinho').on('click.alCakesCartClose', '#fechar-carrinho', function(e) {
    e.preventDefault();
    $('#overlay-carrinho').removeClass('ativo');
  });

  $(document).off('click.alCakesCartOverlay', '#overlay-carrinho').on('click.alCakesCartOverlay', '#overlay-carrinho', function(e) {
    if (e.target === this) {
      $('#overlay-carrinho').removeClass('ativo');
    }
  });
}
