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
