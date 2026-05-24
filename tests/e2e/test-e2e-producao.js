// Teste E2E completo da API em producao
// Simula usuarios brasileiros reais usando a loja de bolos

const API_URL = 'https://loja-de-bolos-educacional.vercel.app';

// Dados reais para teste
const usuarios = {
  admin: {
    email: 'admin@loja.com',
    senha: 'admin123'
  },
  cliente1: {
    nome: 'João Silva',
    email: 'joao.silva@gmail.com',
    senha: 'senha123',
    telefone: '11987654321'
  },
  cliente2: {
    nome: 'Maria Oliveira',
    email: 'maria.oliveira@gmail.com',
    senha: 'senha123',
    telefone: '11991234567'
  }
};

const bolosReais = [
  {
    nome: 'Bolo de Chocolate com cobertura',
    descricao: 'Bolo caseiro feito com ingredientes frescos',
    preco: 45.00,
    imagem_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    estoque: 10
  },
  {
    nome: 'Bolo de Cenoura com chocolate',
    descricao: 'Receita tradicional de familia',
    preco: 35.00,
    imagem_url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729',
    estoque: 15
  },
  {
    nome: 'Bolo de Morango com chantilly',
    descricao: 'Bolo fofinho com cobertura cremosa',
    preco: 55.00,
    imagem_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
    estoque: 8
  }
];

let tokens = {};
let bolosCriados = [];
let carrinhoItems = [];
let pedidoCriado = null;

// Funcao auxiliar para fazer requisicoes
async function request(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    return { status: 0, error: error.message };
  }
}

// Relatorio de testes
const relatorio = {
  total: 0,
  sucesso: 0,
  falha: 0,
  testes: []
};

function registrarTeste(nome, status, detalhes) {
  relatorio.total++;
  if (status === 'OK') {
    relatorio.sucesso++;
  } else {
    relatorio.falha++;
  }
  relatorio.testes.push({ nome, status, detalhes });
  console.log(`${status === 'OK' ? '✓' : '✗'} ${nome}`);
  if (detalhes) console.log(`  ${detalhes}`);
}

// Testes
async function executarTestes() {
  console.log('=== TESTE E2E - API EM PRODUCAO ===\n');
  console.log(`URL: ${API_URL}\n`);
  
  // 1. TESTE DE CONEXAO
  console.log('1. TESTE DE SISTEMA');
  const conexao = await request('GET', '/teste/conexao');
  registrarTeste(
    'GET /teste/conexao',
    conexao.status === 200 ? 'OK' : 'FAIL',
    `Status: ${conexao.status}`
  );
  
  // 2. AUTENTICACAO - LOGIN ADMIN
  console.log('\n2. AUTENTICACAO - ADMIN');
  const loginAdmin = await request('POST', '/auth/login', usuarios.admin);
  if (loginAdmin.status === 200 && loginAdmin.data.token) {
    tokens.admin = loginAdmin.data.token;
    registrarTeste('POST /auth/login (admin)', 'OK', `Token recebido`);
  } else {
    registrarTeste('POST /auth/login (admin)', 'FAIL', `Status: ${loginAdmin.status}`);
  }
  
  // 3. REGISTRO DE CLIENTE
  console.log('\n3. REGISTRO DE CLIENTE');
  const registro = await request('POST', '/auth/registro', {
    ...usuarios.cliente1,
    senha: usuarios.cliente1.senha
  });
  if (registro.status === 200 || registro.status === 201) {
    if (registro.data.token) {
      tokens.cliente1 = registro.data.token;
    }
    registrarTeste('POST /auth/registro', 'OK', `Cliente criado`);
  } else {
    registrarTeste('POST /auth/registro', 'FAIL', `Status: ${registro.status} - ${JSON.stringify(registro.data)}`);
  }
  
  // 4. LOGIN CLIENTE
  console.log('\n4. LOGIN CLIENTE');
  const loginCliente = await request('POST', '/auth/login', {
    email: usuarios.cliente1.email,
    senha: usuarios.cliente1.senha
  });
  if (loginCliente.status === 200 && loginCliente.data.token) {
    tokens.cliente1 = loginCliente.data.token;
    registrarTeste('POST /auth/login (cliente)', 'OK', `Token recebido`);
  } else {
    registrarTeste('POST /auth/login (cliente)', 'FAIL', `Status: ${loginCliente.status}`);
  }
  
  // 5. LISTAR BOLOS (PUBLICO)
  console.log('\n5. BOLOS - LISTAGEM PUBLICA');
  const listarBolos = await request('GET', '/bolos');
  registrarTeste(
    'GET /bolos (publico)',
    listarBolos.status === 200 ? 'OK' : 'FAIL',
    `${listarBolos.data?.length || 0} bolos encontrados`
  );
  
  // 6. CRIAR BOLOS (ADMIN)
  console.log('\n6. CRIAR BOLOS (ADMIN)');
  for (const bolo of bolosReais) {
    const criar = await request('POST', '/bolos', bolo, tokens.admin);
    if (criar.status === 201 && criar.data.id) {
      bolosCriados.push(criar.data);
      registrarTeste(`POST /bolos (${bolo.nome})`, 'OK', `ID: ${criar.data.id}`);
    } else {
      registrarTeste(`POST /bolos (${bolo.nome})`, 'FAIL', `Status: ${criar.status}`);
    }
  }
  
  // 7. ADICIONAR AO CARRINHO
  console.log('\n7. CARRINHO - ADICIONAR ITENS');
  if (bolosCriados.length > 0) {
    const adicionar1 = await request('POST', '/carrinho/adicionar', {
      bolo_id: bolosCriados[0].id,
      quantidade: 2
    }, tokens.cliente1);
    registrarTeste(
      'POST /carrinho/adicionar (item 1)',
      adicionar1.status === 201 ? 'OK' : 'FAIL',
      `Status: ${adicionar1.status}`
    );
    
    const adicionar2 = await request('POST', '/carrinho/adicionar', {
      bolo_id: bolosCriados[1].id,
      quantidade: 1
    }, tokens.cliente1);
    registrarTeste(
      'POST /carrinho/adicionar (item 2)',
      adicionar2.status === 201 ? 'OK' : 'FAIL',
      `Status: ${adicionar2.status}`
    );
  }
  
  // 8. LISTAR CARRINHO
  console.log('\n8. CARRINHO - LISTAR');
  const listarCarrinho = await request('GET', '/carrinho', null, tokens.cliente1);
  if (listarCarrinho.status === 200) {
    carrinhoItems = listarCarrinho.data.itens || [];
    registrarTeste(
      'GET /carrinho',
      'OK',
      `${carrinhoItems.length} itens, Total: R$ ${listarCarrinho.data.total}`
    );
  } else {
    registrarTeste('GET /carrinho', 'FAIL', `Status: ${listarCarrinho.status}`);
  }
  
  // 9. ATUALIZAR QUANTIDADE NO CARRINHO
  console.log('\n9. CARRINHO - ATUALIZAR QUANTIDADE');
  if (carrinhoItems.length > 0) {
    const atualizar = await request('PUT', `/carrinho/atualizar/${carrinhoItems[0].id}`, {
      quantidade: 3
    }, tokens.cliente1);
    registrarTeste(
      'PUT /carrinho/atualizar/:itemId',
      atualizar.status === 200 ? 'OK' : 'FAIL',
      `Status: ${atualizar.status}`
    );
  }
  
  // 10. CRIAR PEDIDO
  console.log('\n10. PEDIDOS - CRIAR DO CARRINHO');
  const criarPedido = await request('POST', '/pedidos/criar', {
    clienteNome: usuarios.cliente1.nome,
    clienteTelefone: usuarios.cliente1.telefone
  }, tokens.cliente1);
  if (criarPedido.status === 201 && criarPedido.data.id) {
    pedidoCriado = criarPedido.data;
    registrarTeste(
      'POST /pedidos/criar',
      'OK',
      `Pedido ID: ${pedidoCriado.id}, Total: R$ ${pedidoCriado.total}`
    );
  } else {
    registrarTeste('POST /pedidos/criar', 'FAIL', `Status: ${criarPedido.status}`);
  }
  
  // 11. LISTAR PEDIDOS
  console.log('\n11. PEDIDOS - LISTAR');
  const listarPedidos = await request('GET', '/pedidos', null, tokens.cliente1);
  registrarTeste(
    'GET /pedidos',
    listarPedidos.status === 200 ? 'OK' : 'FAIL',
    `${listarPedidos.data?.length || 0} pedidos encontrados`
  );
  
  // 12. BUSCAR PEDIDO
  console.log('\n12. PEDIDOS - BUSCAR POR ID');
  if (pedidoCriado) {
    const buscarPedido = await request('GET', `/pedidos/${pedidoCriado.id}`, null, tokens.cliente1);
    registrarTeste(
      'GET /pedidos/:id',
      buscarPedido.status === 200 ? 'OK' : 'FAIL',
      `Status: ${buscarPedido.status}`
    );
  }
  
  // 13. GERAR MENSAGEM WHATSAPP
  console.log('\n13. PEDIDOS - MENSAGEM WHATSAPP');
  if (pedidoCriado) {
    const whatsapp = await request('GET', `/pedidos/${pedidoCriado.id}/whatsapp`, null, tokens.cliente1);
    registrarTeste(
      'GET /pedidos/:id/whatsapp',
      whatsapp.status === 200 ? 'OK' : 'FAIL',
      whatsapp.data?.mensagem ? 'Mensagem gerada' : `Status: ${whatsapp.status}`
    );
  }
  
  // 14. LISTAR USUARIOS (ADMIN)
  console.log('\n14. USUARIOS - LISTAR (ADMIN)');
  const listarUsuarios = await request('GET', '/usuarios', null, tokens.admin);
  registrarTeste(
    'GET /usuarios (admin)',
    listarUsuarios.status === 200 ? 'OK' : 'FAIL',
    `${listarUsuarios.data?.length || 0} usuarios encontrados`
  );
  
  // 15. VERIFICAR CARRINHO LIMPO
  console.log('\n15. VERIFICAR CARRINHO LIMPO APOS PEDIDO');
  const carrinhoDepois = await request('GET', '/carrinho', null, tokens.cliente1);
  registrarTeste(
    'Carrinho limpo apos pedido',
    carrinhoDepois.data?.itens?.length === 0 ? 'OK' : 'FAIL',
    `${carrinhoDepois.data?.itens?.length || 0} itens no carrinho`
  );
  
  // RELATORIO FINAL
  console.log('\n=== RELATORIO FINAL ===');
  console.log(`Total de testes: ${relatorio.total}`);
  console.log(`Sucesso: ${relatorio.sucesso} (${Math.round(relatorio.sucesso/relatorio.total*100)}%)`);
  console.log(`Falha: ${relatorio.falha} (${Math.round(relatorio.falha/relatorio.total*100)}%)`);
  
  if (relatorio.falha > 0) {
    console.log('\n=== TESTES QUE FALHARAM ===');
    relatorio.testes
      .filter(t => t.status === 'FAIL')
      .forEach(t => console.log(`✗ ${t.nome}: ${t.detalhes}`));
  }
  
  console.log('\n=== FIM DOS TESTES ===');
}

// Executar testes
executarTestes().catch(console.error);
