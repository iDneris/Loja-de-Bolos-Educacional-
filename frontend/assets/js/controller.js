$(document).ready(function(){
    // listar_bolos();

})

// Função master para chamar qualquer endpoint da API
async function apiCall(endpoint, method = 'GET', body = null, needsAuth = false) {
  const API_URL = '';

  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Adiciona token se necessário
  if (needsAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Adiciona body se tiver
  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.mensagem,  data.erro, 'Erro na requisição');
    }

    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

// Obter usuário logado
async function obterUsuarioLogado() {
  return await apiCall('auth/me', 'GET', null, true);
}