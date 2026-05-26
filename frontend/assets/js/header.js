// Carregar header master em todas as páginas
$(document).ready(function() {
  carregarHeader();
});

function carregarHeader() {
  const EM_SUBPASTA = window.location.pathname.includes("/pages/");
  const PREFIXO = EM_SUBPASTA ? "../" : "";

  if ($('.navbar').length > 0) {
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

function atualizarUsuario() {
  const emSubpasta = window.location.pathname.includes("/pages/");
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
  } else {
    $('#usuario-navbar-container').hide();
    $('#auth-buttons-container').show();
    $('#admin-link').hide();
    $('.carrinho-row').hide();
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
  });
  
  $(document).on('click', function(e) {
    if (!$(e.target).closest('.usuario-navbar').length) {
      $('#dropdown-usuario').removeClass('ativo');
    }
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
