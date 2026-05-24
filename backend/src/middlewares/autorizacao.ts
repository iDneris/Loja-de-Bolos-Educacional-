import { Request, Response, NextFunction } from 'express';

// Middleware que verifica se o usuario tem a role necessaria
export function autorizacao(rolesPermitidas: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Nao autenticado' });
    }

    if (!rolesPermitidas.includes(req.usuario.role)) {
      return res.status(403).json({ 
        mensagem: 'Sem permissao para acessar este recurso' 
      });
    }

    next();
  };
}
