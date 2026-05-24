import dotenv from 'dotenv';

// Carrega as variáveis do arquivo .env
dotenv.config();

// Configurações do sistema
export const config = {
  porta: process.env.PORT || 3000,
  corsOrigem: process.env.CORS_ORIGIN || '*',
  ambiente: process.env.NODE_ENV || 'desenvolvimento',
};
