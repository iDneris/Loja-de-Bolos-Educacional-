import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../configuracao/jwt';
import { PayloadToken } from '../tipos/Usuario';

// Extende o tipo Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: PayloadToken;
    }
  }
}

// Middleware que verifica se o usuario esta autenticado
export function autenticacao(req: Request, res: Response, next: NextFunction) {
  try {
    // Pega o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ mensagem: 'Token nao fornecido' });
    }

    // Formato esperado: "Bearer TOKEN"
    const partes = authHeader.split(' ');

    if (partes.length !== 2 || partes[0] !== 'Bearer') {
      return res.status(401).json({ mensagem: 'Formato de token invalido' });
    }

    const token = partes[1];

    // Verifica o token
    const payload = verificarToken(token);

    if (!payload) {
      return res.status(401).json({ mensagem: 'Token invalido ou expirado' });
    }

    // Adiciona os dados do usuario na requisicao
    req.usuario = payload;

    next();
  } catch (error) {
    return res.status(401).json({ mensagem: 'Erro na autenticacao' });
  }
}
