const API_URL = 'https://loja-de-bolos-educacional.vercel.app';

async function testAPI() {
  console.log('=== TESTANDO INTEGRACOES ===\n');

  // Test 1: Listar produtos
  console.log('1. Testando GET /bolos...');
  try {
    const res = await fetch(`${API_URL}/bolos`);
    const data = await res.json();
    console.log(`   OK - ${data.length} produtos encontrados`);
    console.log(`   Primeiro produto: ${data[0]?.nome}`);
  } catch (error) {
    console.log(`   ERRO - ${error.message}`);
  }

  // Test 2: Registro de usuario
  console.log('\n2. Testando POST /auth/registro...');
  try {
    const res = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Teste Usuario',
        email: `teste${Date.now()}@test.com`,
        senha: '123456',
        telefone: '11999999999'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log(`   OK - Usuario criado: ${data.usuario.nome}`);
      console.log(`   Token: ${data.token.substring(0, 20)}...`);
      
      // Test 3: Login
      console.log('\n3. Testando POST /auth/login...');
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.usuario.email,
          senha: '123456'
        })
      });
      const loginData = await loginRes.json();
      console.log(`   OK - Login realizado`);
      
      // Test 4: Auth/me
      console.log('\n4. Testando GET /auth/me...');
      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${loginData.token}` }
      });
      const meData = await meRes.json();
      console.log(`   OK - Usuario: ${meData.nome}`);
      
      // Test 5: Carrinho (adicionar)
      console.log('\n5. Testando POST /carrinho/adicionar...');
      const carrinhoRes = await fetch(`${API_URL}/carrinho/adicionar`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          bolo_id: '1',
          nome: 'Bolo de Teste',
          preco: 50.00,
          imagem: 'https://via.placeholder.com/300',
          quantidade: 1
        })
      });
      if (carrinhoRes.ok) {
        console.log(`   OK - Item adicionado ao carrinho`);
      } else {
        console.log(`   ERRO - ${carrinhoRes.status}`);
      }
      
    } else {
      console.log(`   ERRO - ${data.mensagem}`);
    }
  } catch (error) {
    console.log(`   ERRO - ${error.message}`);
  }

  console.log('\n=== TESTES CONCLUIDOS ===');
}

testAPI();
