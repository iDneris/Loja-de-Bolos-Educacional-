# Exemplos de Requisicoes

## Autenticacao

### Registro

```bash
curl -X POST http://localhost:3000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Joao Silva",
    "email": "joao@email.com",
    "senha": "senha123",
    "telefone": "11987654321"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "nome": "Joao Silva",
    "email": "joao@email.com",
    "telefone": "11987654321",
    "role": "cliente"
  }
}
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@loja.com",
    "senha": "admin123"
  }'
```

Resposta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "nome": "Administrador",
    "email": "admin@loja.com",
    "telefone": "11999999999",
    "role": "admin"
  }
}
```

## Bolos

### Listar Bolos

```bash
curl http://localhost:3000/bolos
```

### Criar Bolo (Admin)

```bash
curl -X POST http://localhost:3000/bolos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "nome": "Bolo de Chocolate",
    "descricao": "Delicioso bolo de chocolate",
    "preco": 45.00,
    "imagem_url": "https://exemplo.com/chocolate.jpg",
    "estoque": 10
  }'
```

### Atualizar Bolo (Admin)

```bash
curl -X PUT http://localhost:3000/bolos/UUID_DO_BOLO \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{
    "preco": 50.00,
    "estoque": 15
  }'
```

### Deletar Bolo (Admin)

```bash
curl -X DELETE http://localhost:3000/bolos/UUID_DO_BOLO \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

## Carrinho

### Listar Carrinho

```bash
curl http://localhost:3000/carrinho \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resposta:
```json
{
  "itens": [
    {
      "id": "uuid",
      "usuario_id": "uuid",
      "bolo_id": "uuid",
      "quantidade": 2,
      "bolo_nome": "Bolo de Chocolate",
      "bolo_preco": 45.00,
      "subtotal": 90.00
    }
  ],
  "total": 90.00,
  "quantidade_itens": 1
}
```

### Adicionar ao Carrinho

```bash
curl -X POST http://localhost:3000/carrinho/adicionar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "bolo_id": "UUID_DO_BOLO",
    "quantidade": 2
  }'
```

### Atualizar Quantidade

```bash
curl -X PUT http://localhost:3000/carrinho/atualizar/UUID_DO_ITEM \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "quantidade": 3
  }'
```

### Remover Item

```bash
curl -X DELETE http://localhost:3000/carrinho/remover/UUID_DO_ITEM \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Limpar Carrinho

```bash
curl -X DELETE http://localhost:3000/carrinho/limpar \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Pedidos

### Criar Pedido do Carrinho

```bash
curl -X POST http://localhost:3000/pedidos/criar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "clienteNome": "Joao Silva",
    "clienteTelefone": "11987654321"
  }'
```

Resposta:
```json
{
  "id": "uuid",
  "clienteId": "uuid",
  "clienteNome": "Joao Silva",
  "clienteTelefone": "11987654321",
  "itens": [
    {
      "boloId": "uuid",
      "nomeBolo": "Bolo de Chocolate",
      "quantidade": 2,
      "precoUnitario": 45.00
    }
  ],
  "total": 90.00,
  "status": "pendente",
  "data": "2024-01-15T10:30:00.000Z"
}
```

### Listar Pedidos

```bash
curl http://localhost:3000/pedidos \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Buscar Pedido

```bash
curl http://localhost:3000/pedidos/UUID_DO_PEDIDO \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Gerar Mensagem WhatsApp

```bash
curl http://localhost:3000/pedidos/UUID_DO_PEDIDO/whatsapp \
  -H "Authorization: Bearer SEU_TOKEN"
```

Resposta:
```json
{
  "mensagem": "Novo Pedido - Loja de Bolos\n\nCliente: Joao Silva\nTelefone: 11987654321\n\nItens do Pedido:\n- 2x Bolo de Chocolate - R$ 45.00 = R$ 90.00\n\nTotal: R$ 90.00\n\nPedido realizado em: 15/01/2024 10:30:00"
}
```

## Usuarios

### Listar Usuarios (Admin)

```bash
curl http://localhost:3000/usuarios \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

### Buscar Usuario

```bash
curl http://localhost:3000/usuarios/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Atualizar Usuario

```bash
curl -X PUT http://localhost:3000/usuarios/UUID_DO_USUARIO \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "nome": "Joao Silva Santos",
    "telefone": "11987654322"
  }'
```

### Deletar Usuario (Admin)

```bash
curl -X DELETE http://localhost:3000/usuarios/UUID_DO_USUARIO \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN"
```

## Exemplos com JavaScript (Fetch)

### Login

```javascript
const login = async () => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'joao@email.com',
      senha: 'senha123'
    })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};
```

### Adicionar ao Carrinho

```javascript
const adicionarAoCarrinho = async (boloId, quantidade) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/carrinho/adicionar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      bolo_id: boloId,
      quantidade: quantidade
    })
  });
  
  return await response.json();
};
```

### Criar Pedido

```javascript
const criarPedido = async (nome, telefone) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:3000/pedidos/criar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      clienteNome: nome,
      clienteTelefone: telefone
    })
  });
  
  return await response.json();
};
```
