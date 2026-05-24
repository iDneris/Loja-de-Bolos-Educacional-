# Endpoints da API

## Autenticacao

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| POST | /auth/registro | Nao | Cria novo usuario |
| POST | /auth/login | Nao | Login e retorna token |

## Bolos

| Metodo | Endpoint | Auth | Role | Descricao |
|--------|----------|------|------|-----------|
| GET | /bolos | Nao | - | Lista bolos |
| GET | /bolos/:id | Nao | - | Busca bolo |
| POST | /bolos | Sim | Admin | Cria bolo |
| PUT | /bolos/:id | Sim | Admin | Atualiza bolo |
| DELETE | /bolos/:id | Sim | Admin | Deleta bolo |

## Carrinho

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /carrinho | Sim | Lista carrinho |
| POST | /carrinho/adicionar | Sim | Adiciona item |
| PUT | /carrinho/atualizar/:itemId | Sim | Muda quantidade |
| DELETE | /carrinho/remover/:itemId | Sim | Remove item |
| DELETE | /carrinho/limpar | Sim | Limpa tudo |

## Pedidos

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| POST | /pedidos/criar | Sim | Cria pedido |
| GET | /pedidos | Sim | Lista pedidos |
| GET | /pedidos/:id | Sim | Busca pedido |
| GET | /pedidos/:id/whatsapp | Sim | Gera mensagem |

## Usuarios

| Metodo | Endpoint | Auth | Role | Descricao |
|--------|----------|------|------|-----------|
| GET | /usuarios | Sim | Admin | Lista usuarios |
| GET | /usuarios/:id | Sim | Admin/proprio | Busca usuario |
| PUT | /usuarios/:id | Sim | Admin/proprio | Atualiza usuario |
| DELETE | /usuarios/:id | Sim | Admin | Deleta usuario |

## Teste

| Metodo | Endpoint | Auth | Descricao |
|--------|----------|------|-----------|
| GET | /teste/conexao | Nao | Testa Supabase |

## Observacoes

- Auth = precisa do token no header: `Authorization: Bearer <token>`
- Admin = so quem tem role admin
- Admin/proprio = admin acessa tudo, cliente so os proprios dados
- Pedidos e carrinho sao filtrados por usuario automaticamente
