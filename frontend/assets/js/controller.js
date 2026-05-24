$(document).ready(function(){
    // listar_bolos();

})

// Funcao master para chamar qualquer endpoint da API
async function apiCall(endpoint, method = 'GET', body = null, needsAuth = false) {
  const API_URL = '';

  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Adiciona token se necessario
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
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : null;

    if (!response.ok) {
      throw new Error(data?.mensagem || data?.erro || 'Erro na requisicao');
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Obter usuario logado
async function obterUsuarioLogado() {
  return await apiCall('/auth/me', 'GET', null, true);
}
