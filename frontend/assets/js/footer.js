// Carregar footer master em todas as páginas
$(document).ready(function() {
  carregarFooter();
});

function carregarFooter() {
  const EM_SUBPASTA = window.location.pathname.includes("/pages/");
  const PREFIXO = EM_SUBPASTA ? "../" : "";

  // Se o footer já existe, não carrega novamente
  if ($('.rodape').length > 0) {
    return;
  }

  $.get(PREFIXO + 'components/footer.html', function(data) {
    // Ajustar caminhos se estiver em subpasta
    if (EM_SUBPASTA) {
      data = data.replace(/src="assets\//g, 'src="../assets/');
      data = data.replace(/href="index.html/g, 'href="../index.html');
      data = data.replace(/href="pages\//g, 'href="');
    }
    $('body').append(data);
  }).fail(function(err) {
    console.error('Erro ao carregar footer:', err);
  });
}
