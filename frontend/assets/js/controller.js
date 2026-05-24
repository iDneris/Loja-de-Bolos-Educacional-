$(document).ready(function(){
    // listar_bolos();
    atualizarAnoRodape();

})

function atualizarAnoRodape() {
  document.querySelectorAll('[data-current-year]').forEach((elemento) => {
    elemento.textContent = new Date().getFullYear();
  });
}

// Funcao master para chamar qualquer endpoint da API
async function apiCall(endpoint, method = 'GET', body = null, needsAuth = false) {
  // Detecta se está em produção ou desenvolvimento
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_URL = isLocalhost ? 'http://localhost:3001' : '';

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
