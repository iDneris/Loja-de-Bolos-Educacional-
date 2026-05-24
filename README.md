<div align="center">

# 🎂 A&L Cakes

**Plataforma de e-commerce completa para confeitaria artesanal**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Funcionalidades](#-funcionalidades) · [Como rodar](#-como-rodar) · [Deploy](#-deploy) · [Documentação](#-documentação) · [Contribuir](#-contribuindo)

</div>

---

## 📖 Sobre o projeto

A&L Cakes é uma plataforma full-stack de e-commerce desenvolvida para confeitarias artesanais. O sistema conta com um site de vendas responsivo para o cliente final e um painel administrativo completo para gestão do negócio.

> Desenvolvido como projeto prático da disciplina de Desenvolvimento Web — mas estruturado como uma aplicação real e pronta para produção.

### Estrutura do repositório

```
/backend         # API REST (Node.js + TypeScript + Express)
/frontend        # Site de vendas e painel admin (HTML + CSS + JS)
/docs            # Documentação completa do sistema
/scripts         # Scripts utilitários (seed de produtos, etc.)
/tests           # Testes end-to-end e de integração
```

---

## ✨ Funcionalidades

### 🛒 Loja (cliente)
- Landing page com produtos em destaque
- Cardápio com grid de bolos e busca em tempo real
- Página de detalhes do produto com controle de quantidade
- Sistema de login e registro de conta
- Carrinho de compras persistente
- Criação e acompanhamento de pedidos
- Finalização de pedido via WhatsApp

### 🔧 Painel Admin
- Dashboard com gráficos e métricas de vendas
- CRUD completo de produtos, clientes e equipe
- Gestão de pedidos e status
- Configuração de templates de mensagem WhatsApp

---

## 🛠️ Tecnologias

| Camada | Stack |
|---|---|
| **Backend** | Node.js 18+, TypeScript, Express |
| **Banco de dados** | Supabase (PostgreSQL) |
| **Autenticação** | JWT + bcrypt |
| **Documentação API** | Swagger / OpenAPI |
| **Frontend** | HTML5, CSS3, JavaScript ES6+ |
| **Bibliotecas UI** | jQuery 3.7.1, SweetAlert2, Chart.js, Font Awesome |

---

## 🚀 Como rodar

### Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- Conta no [Supabase](https://supabase.com) (gratuito)

### 1. Clone o repositório

```bash
git clone https://github.com/iDneris/al-cakes.git
cd al-cakes
```

### 2. Configure o backend

```bash
cd backend
npm install
cp ../.env.example .env
```

Preencha o arquivo `.env` com suas credenciais (veja a seção [Variáveis de ambiente](#️-variáveis-de-ambiente)):

```bash
npm run setup    # Cria as tabelas e insere dados iniciais
npm run dev      # Inicia o servidor em http://localhost:3000
```

### 3. Inicie o frontend

Abra `frontend/index.html` com a extensão **Live Server** (VS Code) ou via terminal:

```bash
npx serve frontend
# Acesse http://localhost:8080
```

---

## ⚙️ Variáveis de ambiente

Copie `.env.example` para `.env` e preencha os valores:

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão: `3000`) |
| `CORS_ORIGIN` | Origem permitida pelo CORS |
| `NODE_ENV` | Ambiente (`development` / `production`) |
| `SUPABASE_URL` | URL do projeto no Supabase |
| `SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço do Supabase |
| `SUPABASE_DB_PASSWORD` | Senha do banco de dados |
| `JWT_SECRET` | Segredo JWT (mínimo 32 caracteres) |

---

## 🧪 Contas de teste

Após executar `npm run setup`, as seguintes contas estarão disponíveis:

| Perfil | E-mail | Senha |
|---|---|---|
| **Admin** | admin@loja.com | admin123 |
| **Cliente** | dneris@email.com | cliente123 |

---

## 📦 Deploy

### Backend — Vercel

```bash
cd backend
npm install -g vercel
vercel --prod
```

### Frontend — Vercel ou GitHub Pages

```bash
cd frontend
vercel --prod
```

> Lembre-se de configurar as variáveis de ambiente na plataforma de deploy escolhida.

---

## 📚 Documentação

A pasta [`/docs`](./docs) contém documentação detalhada de cada camada do sistema:

| Diretório | Conteúdo |
|---|---|
| [`/docs/api`](./docs/api) | Referência completa dos endpoints REST |
| [`/docs/database`](./docs/database) | Esquema e modelo do banco de dados |
| [`/docs/arquitetura`](./docs/arquitetura) | Visão geral da arquitetura do sistema |
| [`/docs/projeto`](./docs/projeto) | Guia de instalação e deploy |
| [`/docs/frontend`](./docs/frontend) | Documentação do frontend |

A documentação interativa da API (Swagger) fica disponível em `http://localhost:3000/api-docs` com o servidor rodando.

---

## 🤝 Contribuindo

### Fluxo de branches

Este projeto usa um fluxo Git simplificado com três branches principais:

| Branch | Propósito | Quando usar |
|---|---|---|
| **main** | Produção | Código estável e testado |
| **homolog** | Homologação | Pré-produção, testes finais |
| **develop** | Desenvolvimento | Branch principal de trabalho |

### Como contribuir

1. Faça um **fork** do projeto
2. Crie uma branch a partir de `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/minha-feature
   ```
3. Commit suas alterações (`git commit -m 'feat: adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um **Pull Request** para `develop`

> Use o padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/) nas mensagens de commit, **em português**.
>
> Exemplos:
> - `feat: adiciona carrinho de compras`
> - `fix: corrige erro de login`
> - `docs: atualiza README com novo fluxo`

---

## 📄 Licença

Distribuído sob a licença MIT. Veja [`LICENSE`](./LICENSE) para mais informações.

---

<div align="center">

Feito com 🎂 por **[Dneris](https://github.com/iDneris)**

</div>
