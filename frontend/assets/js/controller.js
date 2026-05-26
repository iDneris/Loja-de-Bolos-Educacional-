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
let promessaDeteccao = null;

async function detectarPortaAPI() {
  if (API_URL_DETECTADA !== null) return;

  if (promessaDeteccao) {
    await promessaDeteccao;
    return;
  }

  promessaDeteccao = (async () => {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isLocalhost) {
      API_URL_DETECTADA = '';
      return;
    }

    // Checa cache da sessão para não redetectar a cada página
    const cached = sessionStorage.getItem('api_url');
    if (cached !== null) {
      API_URL_DETECTADA = cached;
      return;
    }

    // Testa as portas em paralelo — vence a que responder primeiro
    const portas = [3000, 3001];
    try {
      const portaVencedora = await Promise.any(
        portas.map((porta) =>
          fetch(`http://localhost:${porta}/bolos`, { method: 'HEAD' })
            .then((res) => {
              if (res.ok || res.status === 404 || res.status === 401) return porta;
              throw new Error('status inválido');
            })
        )
      );
      API_URL_DETECTADA = `http://localhost:${portaVencedora}`;
    } catch {
      API_URL_DETECTADA = 'http://localhost:3000';
    }

    sessionStorage.setItem('api_url', API_URL_DETECTADA);
  })();

  await promessaDeteccao;
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
