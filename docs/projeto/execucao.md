# Como Executar o Projeto

## Requisitos

- Node.js 18 ou superior
- npm ou yarn
- Conta no Supabase (gratuita)

## Setup Automatico (Recomendado)

### Passo 1: Clonar o Repositorio

```bash
git clone <url-do-repositorio>
cd loja-bolos/backend
npm install
```

### Passo 2: Configurar Supabase

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Va em Settings > API e copie:
   - Project URL
   - anon public key
   - service_role key (em "Service role")

### Passo 3: Configurar Variaveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```env
PORT=3000
CORS_ORIGIN=*
NODE_ENV=desenvolvimento

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui

JWT_SECRET=sua-chave-secreta-minimo-32-caracteres
```

Para gerar o JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Passo 4: Executar Setup Automatico

Execute o SQL no Supabase primeiro (apenas uma vez):

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Va em SQL Editor
4. Clique em "New Query"
5. Copie e cole o conteudo de `docs/database/schema.sql`
6. Clique em "Run"

Depois execute o setup:

```bash
npm run setup
```

Este comando vai:
- Validar conexao com Supabase
- Verificar se as tabelas existem
- Popular dados iniciais (usuarios e bolos)
- Validar integridade do sistema

### Passo 5: Iniciar o Servidor

```bash
npm run dev
```

O servidor inicia em http://localhost:3000

Acesse http://localhost:3000/api-docs para a documentacao Swagger interativa.

## Setup Completo em Um Comando

Se preferir fazer tudo de uma vez:

```bash
npm run start:full
```

Este comando executa o setup e inicia o servidor automaticamente.

## Scripts Disponiveis

```bash
npm run setup       # Setup automatico (migrations + seed)
npm run dev         # Desenvolvimento com hot-reload
npm run start:full  # Setup + dev em um comando
npm run build       # Compila TypeScript para JavaScript
npm start           # Executa codigo compilado
npm run seed        # Apenas popular dados (sem migrations)
```

## Deploy no Vercel

### Configuracao Inicial

```bash
npm install -g vercel
vercel login
vercel
```

Siga as instrucoes do CLI para configurar o projeto.

### Variaveis de Ambiente

No dashboard do Vercel (Settings > Environment Variables), adicione:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `CORS_ORIGIN` (URL do frontend)

### Deploy

```bash
vercel --prod
```

A API estara disponivel em https://seu-projeto.vercel.app

## Usuarios Padrao

Apos executar seeds.sql, os seguintes usuarios estarao disponiveis:

**Admin:**
- Email: admin@loja.com
- Senha: admin123

**Cliente:**
- Email: joao@email.com
- Senha: cliente123

## Testando a API

### Com curl

```bash
# Listar bolos
curl http://localhost:3000/bolos

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@email.com","senha":"cliente123"}'

# Adicionar ao carrinho (substitua TOKEN)
curl -X POST http://localhost:3000/carrinho/adicionar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"bolo_id":"UUID_DO_BOLO","quantidade":2}'
```

### Com JavaScript

```javascript
// Login
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@email.com',
    senha: 'cliente123'
  })
});

const { token } = await response.json();
localStorage.setItem('token', token);

// Listar carrinho
const carrinho = await fetch('http://localhost:3000/carrinho', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Troubleshooting

### Porta 3000 ja esta em uso

Mude a porta no arquivo `.env`:
```env
PORT=3001
```

### Erro de conexao com Supabase

Verifique se:
- SUPABASE_URL e SUPABASE_ANON_KEY estao corretos no .env
- O projeto Supabase esta ativo
- Voce executou os arquivos schema.sql e seeds.sql

### Token JWT invalido

Tokens expiram em 24 horas. Faca login novamente para obter um novo token.

### Erro de CORS

Configure CORS_ORIGIN no .env com a URL do seu frontend:
```env
CORS_ORIGIN=http://localhost:5500
```

Para desenvolvimento, pode usar `*` para permitir todas as origens.

## Integracao com Frontend

Configure a URL base da API no seu frontend:

```javascript
// Desenvolvimento
const API_URL = 'http://localhost:3000';

// Producao
const API_URL = 'https://seu-projeto.vercel.app';
```

Armazene o token JWT no localStorage apos login e inclua em todas as requisicoes protegidas:

```javascript
const token = localStorage.getItem('token');

fetch(`${API_URL}/carrinho`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```
