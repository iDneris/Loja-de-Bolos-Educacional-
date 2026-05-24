# Documentacao

Aqui tem toda a documentacao tecnica do projeto.

## O que tem em cada pasta

### `/api`
Como usar a API.

- **endpoints.md** - Lista de todos os endpoints
- **exemplos.md** - Exemplos de requisicoes com curl e JavaScript
- **fluxos.md** - Como funcionam os fluxos principais

### `/database`
Estrutura do banco de dados.

- **schema.sql** - Script pra criar as tabelas
- **seeds.sql** - Dados iniciais de teste
- **tabelas.md** - Explicacao de cada tabela
- **relacionamentos.md** - Como as tabelas se relacionam
- **supabase.md** - Como configurar o Supabase

### `/arquitetura`
Visao geral do sistema.

- **visao-geral.md** - O que o sistema faz
- **decisoes-tecnicas.md** - Por que escolhemos cada tecnologia

### `/projeto`
Como rodar e fazer deploy.

- **execucao.md** - Instrucoes pra rodar local e fazer deploy
- **estrutura.md** - Organizacao das pastas

### `/frontend`
Documentacao do frontend.

- **estrutura.md** - Organizacao de pastas e responsabilidades
- **paginas.md** - Funcionalidade de cada pagina
- **componentes.md** - Componentes reutilizaveis
- **execucao.md** - Setup e configuracao local

## Por onde comecar

Se voce e novo no projeto, recomendo ler nessa ordem:

1. `/arquitetura/visao-geral.md` - Entenda o que o sistema faz
2. `/projeto/execucao.md` - Configure e rode o projeto
3. `/api/endpoints.md` - Veja os endpoints disponiveis
4. `/api/exemplos.md` - Exemplos praticos
5. `/database/tabelas.md` - Estrutura dos dados

## Swagger

Alem dessa documentacao, tem Swagger UI em `/api-docs` quando o servidor ta rodando. Acesse http://localhost:3000/api-docs pra testar os endpoints direto no navegador.
