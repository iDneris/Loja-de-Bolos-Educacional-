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
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const token = localStorage.getItem('token');

  if (usuario && token) {
    $('#usuario-nome').text(usuario.nome);
    $('#mobile-usuario-nome').text(usuario.nome);
    $('#usuario-navbar-container').show();
    $('#mobile-boasvindas').show();
    $('#btn-login-nav').hide();

    if (usuario.role === 'admin') {
      $('#admin-link').show();
    } else {
      $('#admin-link').hide();
    }
  } else {
    $('#usuario-navbar-container').hide();
    $('#mobile-boasvindas').hide();
    $('#btn-login-nav').show();
    $('#admin-link').hide();
  }

  $('#btn-sair').on('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = EM_SUBPASTA ? '../index.html' : 'index.html';
  });
}

function inicializarHeader() {
  $('.hamburguer').on('click', function() {
    $('.nav-menu').toggleClass('active');
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
}
