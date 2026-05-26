// Função para validar email
function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  return regex.test(email);
}

// Função para exibir mensagem
function exibirMensagem(form, mensagem, tipo) {
  alert(mensagem);
}

// Função de cadastro de conta
async function cadastrarCliente() {
  const nome = $('#nome').val().trim();
  const email = $('#email').val().trim();
  const senha = $('#senha').val().trim();
  const telefone = $('#telefone').val();

  if (nome.length < 3) {
    Swal.fire('Atenção', 'Informe seu nome completo.', 'warning');
    return;
  }
  if (!validarEmail(email)) {
    Swal.fire('Atenção', 'Email inválido.', 'warning');
    return;
  }
  if (senha.length < 6) {
    Swal.fire('Atenção', 'A senha deve ter pelo menos 6 caracteres.', 'warning');
    return;
  }

  $('#btn_cadastrar_cliente').prop('disabled', true).text('Cadastrando...');

  try {
    const resultado = await apiCall('/auth/registro', 'POST', {
      nome: nome,
      email: email,
      senha: senha,
      telefone: telefone
    }, false);

    if (resultado) {
      localStorage.setItem('token', resultado.token);
      localStorage.setItem('usuario', JSON.stringify(resultado.usuario));
      Swal.fire({
        title: 'Bem-vindo(a), ' + nome + '!',
        text: 'Cadastro realizado com sucesso.',
        icon: 'success',
        confirmButtonText: 'Ir para Home'
      }).then(() => {
        $('#nome, #email, #senha, #telefone').val('');
        window.location.href = '../index.html';
      });
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
    Swal.fire('Erro', 'Erro ao criar conta: ' + error.message, 'error');
  } finally {
    $('#btn_cadastrar_cliente').prop('disabled', false).text('Cadastrar');
  }
}

// Inicializar
$(document).ready(function() {
  $('#form-cadastro').on('submit', async function(e) {
    e.preventDefault();
    cadastrarCliente();
  });
});
