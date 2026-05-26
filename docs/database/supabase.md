# Configuracao do Supabase

## Passo 1: Criar Conta no Supabase

1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faca login com GitHub ou email
4. Crie uma nova organizacao (se necessario)

## Passo 2: Criar Projeto

1. Clique em "New Project"
2. Preencha:
   - Nome do projeto: loja-bolos
   - Database Password: (escolha uma senha forte)
   - Regiao: South America (sao-paulo)
3. Clique em "Create new project"
4. Aguarde 2-3 minutos para o projeto ser criado

## Passo 3: Obter Credenciais

1. No painel do projeto, va em "Settings" (engrenagem)
2. Clique em "API"
3. Copie:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)

## Passo 4: Configurar .env

Crie arquivo `.env` na raiz do projeto:

```env
PORT=3000
CORS_ORIGIN=*
NODE_ENV=desenvolvimento

# Supabase Configuration
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon-aqui

# JWT Configuration
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres
```

## Passo 5: Executar Schema SQL

1. No painel do Supabase, va em "SQL Editor"
2. Clique em "New query"
3. Copie todo o conteudo de `database/schema.sql`
4. Cole no editor
5. Clique em "Run" (ou pressione Ctrl+Enter)
6. Aguarde mensagem de sucesso

## Passo 6: Executar Seeds SQL

1. No SQL Editor, crie nova query
2. Copie todo o conteudo de `database/seeds.sql`
3. Cole no editor
4. Clique em "Run"
5. Verifique a tabela de resumo no final

## Passo 7: Verificar Tabelas

1. No painel, va em "Table Editor"
2. Verifique se as tabelas foram criadas:
   - usuarios
   - clientes
   - bolos
   - pedidos
   - pedido_itens
   - carrinho_itens

## Passo 8: Verificar Dados Iniciais

1. Clique em cada tabela no Table Editor
2. Verifique se os dados foram inseridos:
   - usuarios: 3 usuarios (1 admin, 2 clientes)
   - clientes: 3 clientes
   - bolos: 6 bolos
   - pedidos: 2 pedidos
   - pedido_itens: 4 itens

## Passo 9: Testar Conexao

1. Inicie o servidor: `npm run dev`
2. Acesse: http://localhost:3000/teste/conexao
3. Deve retornar: `{ "mensagem": "Conexao com Supabase OK!" }`

## Configuracoes de Seguranca (RLS)

O schema ja configura Row Level Security (RLS) com politicas permissivas para desenvolvimento. Para producao, considere:

### Politicas Recomendadas para Producao

#### usuarios
```sql
-- Apenas o proprio usuario pode ler seus dados
CREATE POLICY "Usuarios podem ler proprios dados"
ON usuarios FOR SELECT
USING (auth.uid() = id);

-- Apenas o proprio usuario pode atualizar seus dados
CREATE POLICY "Usuarios podem atualizar proprios dados"
ON usuarios FOR UPDATE
USING (auth.uid() = id);
```

#### carrinho_itens
```sql
-- Usuario so ve seu proprio carrinho
CREATE POLICY "Usuario ve proprio carrinho"
ON carrinho_itens FOR SELECT
USING (auth.uid() = usuario_id);

-- Usuario so modifica seu proprio carrinho
CREATE POLICY "Usuario modifica proprio carrinho"
ON carrinho_itens FOR ALL
USING (auth.uid() = usuario_id);
```

#### pedidos
```sql
-- Usuario so ve seus proprios pedidos
CREATE POLICY "Usuario ve proprios pedidos"
ON pedidos FOR SELECT
USING (
  cliente_id IN (
    SELECT id FROM clientes 
    WHERE telefone = (
      SELECT telefone FROM usuarios WHERE id = auth.uid()
    )
  )
);
```

## Backup e Restauracao

### Fazer Backup

1. No painel, va em "Database"
2. Clique em "Backups"
3. Clique em "Create backup"
4. Aguarde conclusao

### Restaurar Backup

1. Va em "Backups"
2. Encontre o backup desejado
3. Clique em "Restore"
4. Confirme a operacao

## Monitoramento

### Logs

1. Va em "Logs"
2. Selecione tipo de log:
   - API Logs: requisicoes HTTP
   - Database Logs: queries SQL
   - Auth Logs: autenticacao

### Metricas

1. Va em "Reports"
2. Visualize:
   - Requisicoes por hora
   - Uso de banda
   - Tamanho do banco

## Limites do Plano Gratuito

- 500 MB de banco de dados
- 1 GB de transferencia
- 50 MB de armazenamento de arquivos
- 2 GB de largura de banda

Para projeto academico, e mais que suficiente.

## Executando DDL (ALTER TABLE, CREATE COLUMN, etc.) via Codigo

### Limitacao da REST API

**O Supabase NAO permite comandos DDL** (ALTER TABLE, CREATE FUNCTION, DROP COLUMN, etc.) via REST API ou `supabase.rpc()`. Qualquer tentativa resultara em erros como:
- `Could not find the function public.exec_sql(sql) in the schema cache`
- `Could not find the table 'public.sql' in the schema cache`

Isso e uma limitacao de seguranca da plataforma.

### Solucao: Conexao Direta PostgreSQL

Use o pacote `pg` para conectar diretamente ao banco e executar SQL arbitario.

#### 1. Verificar se o pacote `pg` esta instalado

```bash
cd backend
npm ls pg
```

Se nao estiver, instale:
```bash
npm install pg
```

#### 2. Montar a URL de Conexao

A URL de conexao usa as variaveis do `.env`:

```javascript
const projectRef = process.env.SUPABASE_URL.match(/https:\/\/([^.]+)/)[1];
const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const encodedPassword = encodeURIComponent(dbPassword);

// URL de conexao direta (sempre funciona)
const connectionString = `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`;
```

#### 3. Executar SQL

```javascript
const { Pool } = require('pg');

async function executarSQL(sql) {
  const pool = new Pool({ 
    connectionString, 
    ssl: { rejectUnauthorized: false } 
  });
  
  try {
    const client = await pool.connect();
    try {
      await client.query(sql);
      console.log('SQL executado com sucesso!');
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

// Exemplo: adicionar coluna
executarSQL('ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;');
```

### Script de Exemplo Real

Veja o script funcional em:
- `backend/scripts/add-sob-encomenda-v2.js` - Adiciona coluna `sob_encomenda` na tabela `bolos`

Este script:
1. Le as variaveis do `.env`
2. Monta a URL de conexao PostgreSQL
3. Conecta via `pg.Pool` com SSL
4. Executa o SQL e verifica o resultado

### Alternativa Manual

Se a conexao direta falhar, execute o SQL manualmente no painel do Supabase:
1. Acesse https://supabase.com/dashboard
2. Selecione o projeto
3. Va em **SQL Editor**
4. Cole e execute o SQL

### Comandos DDL Comuns

```sql
-- Adicionar coluna
ALTER TABLE bolos ADD COLUMN IF NOT EXISTS sob_encomenda BOOLEAN DEFAULT TRUE;

-- Renomear coluna
ALTER TABLE bolos RENAME COLUMN nome_antigo TO nome_novo;

-- Remover coluna
ALTER TABLE bolos DROP COLUMN IF EXISTS coluna_obsoleta;

-- Alterar tipo da coluna
ALTER TABLE bolos ALTER COLUMN preco TYPE NUMERIC(12, 2);

-- Adicionar constraint
ALTER TABLE bolos ADD CONSTRAINT preco_positivo CHECK (preco > 0);

-- Criar indice
CREATE INDEX IF NOT EXISTS idx_bolos_nome ON bolos(nome);
```

## Troubleshooting

### Erro: "relation does not exist"
- Verifique se executou o schema.sql
- Verifique se esta conectando ao projeto correto

### Erro: "JWT expired"
- Token JWT expirou (padrao: 24h)
- Usuario precisa fazer login novamente

### Erro: "permission denied"
- Verifique politicas RLS
- Para desenvolvimento, use politicas permissivas

### Erro: "connection refused"
- Verifique SUPABASE_URL no .env
- Verifique se projeto esta ativo no Supabase
