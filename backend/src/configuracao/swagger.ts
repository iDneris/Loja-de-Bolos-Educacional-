import swaggerJsdoc from 'swagger-jsdoc';

const opcoes: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API A&L Cakes',
      version: '1.0.0',
      description: 'Sistema para gerenciar pedidos de bolos com envio via WhatsApp',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
      {
        url: 'https://alcakes.vercel.app',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido no login',
        },
      },
    },
    tags: [
      {
        name: 'Autenticacao',
        description: 'Login e registro de usuarios',
      },
      {
        name: 'Bolos',
        description: 'Gerenciamento do catálogo de bolos',
      },
      {
        name: 'Carrinho',
        description: 'Gerenciamento do carrinho de compras',
      },
      {
        name: 'Pedidos',
        description: 'Criação e consulta de pedidos',
      },
      {
        name: 'Usuarios',
        description: 'Gerenciamento de usuarios (admin)',
      },
      {
        name: 'WhatsApp',
        description: 'Geração de mensagem para WhatsApp',
      },
    ],
  },
  apis: ['./src/rotas/*.ts'],
};

export const swaggerConfig = swaggerJsdoc(opcoes);
