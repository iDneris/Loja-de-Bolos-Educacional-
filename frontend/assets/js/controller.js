$(document).ready(function(){
    // listar_bolos();
    atualizarAnoRodape();
    detectarPortaAPI();
})

function atualizarAnoRodape() {
  document.querySelectorAll('[data-current-year]').forEach((elemento) => {
    elemento.textContent = new Date().getFullYear();
  });
}

// Detecta qual porta da API está disponível
let API_URL_DETECTADA = null;

async function detectarPortaAPI() {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isLocalhost) {
    API_URL_DETECTADA = '';
    return;
  }

  const portas = [3000, 3001];
  
  for (const porta of portas) {
    try {
      const response = await fetch(`http://localhost:${porta}/bolos`, { method: 'HEAD' });
      if (response.ok || response.status === 404 || response.status === 401) {
        API_URL_DETECTADA = `http://localhost:${porta}`;
        // console.log(`API detectada na porta ${porta}`);
        return;
      }
    } catch (error) {
      // Porta não disponível, tenta a próxima
    }
  }
  
  // Se nenhuma porta respondeu, usa a padrão
  API_URL_DETECTADA = 'http://localhost:3000';
}

// Funcao master para chamar qualquer endpoint da API
async function apiCall(endpoint, method = 'GET', body = null, needsAuth = false) {
  // Aguarda detecção da porta se ainda não foi feita
  if (API_URL_DETECTADA === null) {
    await detectarPortaAPI();
  }

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
    const response = await fetch(`${API_URL_DETECTADA}${endpoint}`, config);
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
