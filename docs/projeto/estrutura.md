# Estrutura do Projeto

## Organizacao de Pastas

```
loja-bolos/
├── backend/                    # API REST completa
│   ├── src/                   # Codigo fonte TypeScript
│   │   ├── rotas/            # Definicao de endpoints
│   │   ├── controladores/    # Processamento de requisicoes
│   │   ├── servicos/         # Logica de negocio
│   │   ├── middlewares/      # Autenticacao e autorizacao
│   │   ├── tipos/            # Definicoes TypeScript
│   │   ├── configuracao/     # JWT, Supabase, Swagger
│   │   ├── utils/            # Funcoes auxiliares
│   │   ├── app.ts            # Configuracao do Express
│   │   └── servidor.ts       # Entry point
│   ├── dist/                  # Codigo compilado (gerado)
│   ├── node_modules/          # Dependencias (gerado)
│   ├── package.json           # Dependencias e scripts
│   └── tsconfig.json          # Configuracao TypeScript
│
├── docs/                       # Documentacao completa
│   ├── api/                   # Documentacao da API
│   │   ├── endpoints.md      # Lista de endpoints
│   │   ├── exemplos.md       # Exemplos de requisicoes
│   │   └── fluxos.md         # Fluxos principais
│   ├── database/              # Banco de dados
│   │   ├── schema.sql        # Script de criacao das tabelas
│   │   ├── seeds.sql         # Dados iniciais
│   │   ├── tabelas.md        # Explicacao das tabelas
│   │   ├── relacionamentos.md # Relacionamentos e constraints
│   │   └── supabase.md       # Configuracao do Supabase
│   ├── arquitetura/           # Visao geral e decisoes
│   │   ├── visao-geral.md    # Overview do sistema
│   │   └── decisoes-tecnicas.md # Justificativas tecnicas
│   ├── projeto/               # Execucao e deploy
│   │   ├── execucao.md       # Como rodar e fazer deploy
│   │   └── estrutura.md      # Este arquivo
│   └── README.md              # Indice da documentacao
│
├── frontend/                   # Frontend completo
│   ├── index.html              # Landing page
│   ├── components/             # Componentes reutilizaveis
│   │   └── header.html        # Header com navbar e menu mobile
│   ├── pages/                  # Paginas do site
│   │   ├── blog.html          # Blog
│   │   ├── cadastro.html      # Cadastro de usuario
│   │   ├── cadastroBolos.html # Cadastro de bolos (admin)
│   │   ├── cardapio.html      # Listagem de bolos
│   │   ├── login.html         # Login
│   │   ├── meusdados.html     # Edicao de perfil
│   │   ├── painelAdministrativo.html # Painel admin
│   │   ├── pedidos.html       # Historico de pedidos
│   │   ├── produto.html       # Detalhes do produto
│   │   └── sobre.html         # Sobre a loja
│   └── assets/                 # Recursos estaticos
│       ├── css/
│       │   └── style.css      # Estilos globais
│       ├── js/
│       │   ├── carrinho.js    # Logica do carrinho
│       │   ├── controller.js  # Comunicacao com API
│       │   ├── header.js      # Carregamento do header
│       │   ├── produtos.js    # Renderizacao de produtos
│       │   └── script.js      # Scripts gerais
│       └── images/            # Imagens do site
│
├── .env                        # Variaveis de ambiente (nao commitado)
├── .env.example                # Exemplo de configuracao
├── .gitignore                  # Arquivos ignorados pelo Git
├── LICENSE                     # Licenca MIT
├── README.md                   # Documentacao principal
└── vercel.json                 # Configuracao do Vercel
```

## Arquivos na Raiz

Apenas arquivos essenciais permanecem na raiz:

- **README.md** - Documentacao principal com quick start
- **.env.example** - Template de configuracao
- **.gitignore** - Arquivos ignorados pelo Git
- **LICENSE** - Licenca do projeto
- **vercel.json** - Configuracao de deploy no Vercel

## Pastas Principais

### `/backend`
Contem todo o codigo da API REST. Organizado em camadas (rotas, controladores, servicos) para facilitar manutencao e testes.

### `/docs`
Toda a documentacao tecnica do projeto. Dividida em 4 areas:
- **api**: Como usar a API
- **database**: Estrutura do banco de dados
- **arquitetura**: Visao geral e decisoes de design
- **projeto**: Como executar e fazer deploy

### `/frontend`
Reservado para o codigo do frontend desenvolvido pelo grupo. O backend nao interfere nesta pasta.

## Convencoes

### Nomenclatura
- Pastas: kebab-case (ex: `banco-dados`)
- Arquivos: kebab-case (ex: `decisoes-tecnicas.md`)
- Codigo TypeScript: camelCase para variaveis, PascalCase para tipos

### Organizacao de Codigo
- Um arquivo por rota/controlador/servico
- Exports nomeados em vez de default exports
- Tipos TypeScript em arquivos separados na pasta `/tipos`

### Documentacao
- Arquivos .md em portugues
- Linguagem simples e direta
- Exemplos praticos sempre que possivel
- Codigo comentado apenas quando necessario

## Arquivos Gerados

Alguns arquivos sao gerados automaticamente e nao devem ser commitados:

- `/backend/dist/` - Codigo JavaScript compilado
- `/backend/node_modules/` - Dependencias instaladas
- `.env` - Variaveis de ambiente locais

Esses arquivos estao listados no `.gitignore`.
