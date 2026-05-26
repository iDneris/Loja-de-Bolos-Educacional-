$(document).ready(function(){
    const token = localStorage.getItem('token');
    const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || 'null');

    if (token && usuarioLogado) {
      window.location.href = usuarioLogado.role === 'admin' ? 'painelAdministrativo.html' : '../index.html';
      return;
    }
    document.getElementById('btn_login').addEventListener('click', async function() {
    try {
        const resultado = await auth();
        const redirectUrl = resultado.usuario.role === 'admin' 
          ? 'painelAdministrativo.html' 
          : '../index.html';
          
        Swal.fire({
          title: 'Login realizado!',
          text: 'Bem-vindo de volta.',
          icon: 'success',
          confirmButtonText: resultado.usuario.role === 'admin' ? 'Ir ao Painel' : 'Ir para Home'
        }).then(() => {
          window.location.href = redirectUrl;
        });
    } catch (error) {
        Swal.fire('Erro', 'Erro no login: ' + error.message, 'error');
    }
    });

})

async function auth(){

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const resultado = await apiCall('/auth/login', 'POST', { email: email, senha: senha });
    localStorage.setItem('token', resultado.token);
    localStorage.setItem('usuario', JSON.stringify(resultado.usuario));

  return resultado;
}


