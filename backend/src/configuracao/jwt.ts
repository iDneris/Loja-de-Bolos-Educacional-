import jwt from 'jsonwebtoken';
import { PayloadToken } from '../tipos/Usuario';

// Chave secreta do JWT (em producao deve estar no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-loja-bolos-2024';
const JWT_EXPIRATION = '7d'; // 7 dias

// Gera token JWT
export function gerarToken(payload: PayloadToken): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

// Verifica e decodifica token JWT
export function verificarToken(token: string): PayloadToken | null {
  try {
    return jwt.verify(token, JWT_SECRET) as PayloadToken;
  } catch (error) {
    return null;
  }
}
