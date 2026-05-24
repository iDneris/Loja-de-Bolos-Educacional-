import { Request, Response } from 'express';
import { servicoAuth } from '../servicos/servicoAuth';

export const controladorAuth = {
  // POST /auth/registro
  async registrar(req: Request, res: Response) {
    const { nome, email, senha, telefone } = req.body;

    // Validacoes basicas
    if (!nome || !email || !senha || !telefone) {
      return res.status(400).json({ mensagem: 'Todos os campos sao obrigatorios' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ mensagem: 'Senha deve ter no minimo 6 caracteres' });
    }

    const resultado = await servicoAuth.registrar({ nome, email, senha, telefone });

    if (!resultado) {
      return res.status(400).json({ mensagem: 'Erro ao registrar usuario. Email pode ja estar em uso.' });
    }

    return res.status(201).json(resultado);
  },

  // POST /auth/login
  async login(req: Request, res: Response) {
    const { email, senha } = req.body;

    // Validacoes basicas
    if (!email || !senha) {
      return res.status(400).json({ mensagem: 'Email e senha sao obrigatorios' });
    }

    const resultado = await servicoAuth.login({ email, senha });

    if (!resultado) {
      return res.status(401).json({ mensagem: 'Email ou senha invalidos' });
    }

    return res.status(200).json(resultado);
  },

  // GET /auth/me
  async obterUsuarioLogado(req: Request, res: Response) {
    // O middleware de autenticacao ja validou o token e adicionou req.usuario
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const usuario = await servicoAuth.buscarPorId(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuario nao encontrado' });
    }

    return res.status(200).json(usuario);
  }
};
