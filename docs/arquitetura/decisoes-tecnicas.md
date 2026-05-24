# Decisoes Tecnicas

## Por que TypeScript?

Escolhemos TypeScript em vez de JavaScript puro porque:

- Pega erros de tipo antes de rodar o codigo
- Autocomplete ajuda muito no desenvolvimento
- Fica mais facil de entender o codigo depois
- Facilita refatorar sem quebrar nada

A curva de aprendizado no comeco vale a pena pela reducao de bugs.

## Por que Express?

Express e o framework mais usado para Node.js. E simples, tem muita documentacao e exemplos, e a maioria dos tutoriais usa ele. Consideramos Fastify (mais rapido) e NestJS (mais estruturado), mas optamos pelo Express por ser mais direto e facil de aprender.

## Por que Supabase?

Precisavamos de um banco PostgreSQL hospedado de graca. Supabase oferece isso com uma interface web boa pra gerenciar os dados, backup automatico e facil de configurar.

Outras opcoes eram MongoDB Atlas (mas preferimos SQL) e MySQL (mais chato de hospedar).

## Por que JWT?

JWT e stateless, ou seja, nao precisa guardar sessao no servidor. Isso funciona bem em ambientes serverless como Vercel. E facil de implementar e e o padrao que a maioria usa hoje.

Sessions tradicionais precisam de armazenamento de estado, o que nao funciona bem em serverless.

## Organizacao do codigo

Dividimos o codigo em camadas:

**Rotas** - Definem os endpoints
**Controladores** - Validam entrada e formatam resposta
**Servicos** - Logica de negocio e acesso ao banco

Isso facilita testar e manter o codigo. Cada parte tem uma responsabilidade clara.

## Middlewares

Usamos middlewares para coisas que varias rotas precisam:

- Autenticacao - verifica o token JWT
- Autorizacao - verifica se o usuario tem permissao
- CORS - permite requisicoes do frontend
- Body parser - processa JSON

## Estrutura de pastas

```
backend/src/
├── rotas/           # Endpoints
├── controladores/   # Validacao e resposta
├── servicos/        # Logica de negocio
├── middlewares/     # Autenticacao, autorizacao
├── tipos/           # Tipos TypeScript
├── configuracao/    # JWT, Supabase, Swagger
├── utils/           # Funcoes auxiliares
├── app.ts           # Configuracao do Express
└── servidor.ts      # Entry point
```

## Seguranca

### Senhas

Usamos bcrypt com 10 rounds para fazer hash das senhas. Esse numero de rounds e um bom balanco entre seguranca e performance. Senhas nunca sao guardadas em texto plano.

### Tokens

Tokens JWT tem validade de 24 horas e incluem apenas id, email e role do usuario. O secret fica em variavel de ambiente e nunca e commitado.

### Validacoes

Validamos em varios niveis:

- Entrada: campos obrigatorios, tipos corretos
- Negocio: estoque disponivel, usuario autorizado
- Banco: constraints e foreign keys

## Performance

Criamos indices no banco para acelerar consultas frequentes:

- Login por email
- Listar carrinho do usuario
- Listar pedidos do cliente

Usamos JOINs do Supabase para buscar dados relacionados em uma query so, reduzindo latencia.

## Escalabilidade

A API e stateless - nao guarda estado entre requisicoes. Tudo que precisa ta no token JWT. Isso permite escalar horizontalmente sem problemas.

Deploy no Vercel como funcoes serverless escala automaticamente conforme a demanda. A limitacao e o cold start (primeira requisicao mais lenta) e timeout de 10 segundos no plano gratuito.

## Tratamento de erros

Padronizamos os codigos HTTP:

- 200: Sucesso
- 201: Criado
- 400: Erro do cliente (validacao)
- 401: Nao autenticado
- 403: Nao autorizado
- 404: Nao encontrado
- 500: Erro do servidor

Logs de erro vao pro console e ficam disponiveis no Vercel Dashboard em producao.

## Melhorias futuras

Algumas coisas que daria pra adicionar:

- Testes automatizados
- Rate limiting pra prevenir abuso
- Paginacao nas listagens
- Cache com Redis
- Upload de imagens
- Notificacoes por email
- Integracao com gateway de pagamento
