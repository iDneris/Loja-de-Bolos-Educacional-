const API_URL = 'https://loja-de-bolos-educacional.vercel.app';

const produtos = [
  {
    nome: 'Bolo Red Velvet',
    descricao: 'Massa vermelha aveludada com cobertura de cream cheese. Um classico irresistivel.',
    preco: 89.90,
    imagem: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f',
    estoque: 10
  },
  {
    nome: 'Bolo de Chocolate',
    descricao: 'Massa de chocolate belga com recheio de brigadeiro e cobertura de ganache.',
    preco: 75.00,
    imagem: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    estoque: 8
  },
  {
    nome: 'Bolo de Morango',
    descricao: 'Massa branca com recheio de creme e morangos frescos. Decorado com chantilly.',
    preco: 69.90,
    imagem: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
    estoque: 12
  },
  {
    nome: 'Bento Cake',
    descricao: 'Mini bolo personalizado no estilo bento cake coreano. Perfeito para presentear.',
    preco: 49.90,
    imagem: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec',
    estoque: 15
  },
  {
    nome: 'Caixa Gourmet',
    descricao: 'Caixa com 12 doces finos sortidos: brigadeiros, beijinhos e trufas artesanais.',
    preco: 59.90,
    imagem: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f',
    estoque: 20
  },
  {
    nome: 'Torta de Limao',
    descricao: 'Torta de limao siciliano com merengue tostado. Equilibrio perfeito entre doce e acido.',
    preco: 65.00,
    imagem: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13',
    estoque: 6
  },
  {
    nome: 'Bolo de Cenoura',
    descricao: 'Bolo de cenoura tradicional com cobertura de chocolate. Receita da vovo.',
    preco: 45.00,
    imagem: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729',
    estoque: 10
  },
  {
    nome: 'Cupcake Decorado',
    descricao: 'Kit com 6 cupcakes decorados com pasta americana. Sabores variados.',
    preco: 54.90,
    imagem: 'https://images.unsplash.com/photo-1486427944544-d2c246c4df1e',
    estoque: 18
  }
];

async function loginAdmin() {
  // Primeiro registra o admin
  const registroRes = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nome: 'Administrador',
      email: 'admin@alcakes.com',
      senha: 'admin123',
      telefone: '11999999999'
    })
  });
  const registroData = await registroRes.json();
  console.log('Registro admin:', registroData.mensagem || 'OK');

  // Faz login
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@alcakes.com',
      senha: 'admin123'
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.mensagem || 'Erro no login');
  return data.token;
}

async function criarProduto(token, produto) {
  const res = await fetch(`${API_URL}/bolos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(produto)
  });
  const data = await res.json();
  if (!res.ok) {
    console.log(`Erro ao criar "${produto.nome}": ${data.mensagem || 'Erro desconhecido'}`);
    return null;
  }
  return data;
}

async function popularBanco() {
  console.log('Iniciando seed do banco...\n');

  try {
    console.log('Fazendo login como admin...');
    const token = await loginAdmin();
    console.log('Login OK\n');

    for (const produto of produtos) {
      console.log(`Criando: ${produto.nome}...`);
      const result = await criarProduto(token, produto);
      if (result) {
        console.log(`  OK - R$ ${produto.preco.toFixed(2)}`);
      }
    }

    console.log('\nSeed concluido!');
  } catch (error) {
    console.error('Erro no seed:', error.message);
  }
}

popularBanco();
