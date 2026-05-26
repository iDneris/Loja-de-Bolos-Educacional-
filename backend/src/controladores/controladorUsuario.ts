import { Request, Response } from 'express';
import { servicoUsuario } from '../servicos/servicoUsuario';

export const controladorUsuario = {
  // GET /usuarios - Lista todos os usuarios (admin)
  async listarTodos(req: Request, res: Response) {
    const usuarios = await servicoUsuario.listarTodos();
    return res.json(usuarios);
  },

  // GET /usuarios/:id - Busca usuario por ID
  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;

    // Verifica se usuario pode acessar
    if (req.usuario?.role !== 'admin' && req.usuario?.id !== id) {
      return res.status(403).json({
        mensagem: 'Sem permissao para acessar dados de outro usuario'
      });
    }

    const usuario = await servicoUsuario.buscarPorId(id);

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuario nao encontrado' });
    }

    return res.json(usuario);
  },

  // PUT /usuarios/:id - Atualiza usuario
  async atualizar(req: Request, res: Response) {
    const { id } = req.params;

    // Verifica se usuario pode atualizar
    if (req.usuario?.role !== 'admin' && req.usuario?.id !== id) {
      return res.status(403).json({
        mensagem: 'Sem permissao para atualizar dados de outro usuario'
      });
    }

    const { nome, email, telefone } = req.body;

    const usuario = await servicoUsuario.atualizar(id, {
      nome,
      email,
      telefone,
    });

    if (!usuario) {
      return res.status(400).json({ mensagem: 'Erro ao atualizar usuario' });
    }

    return res.json(usuario);
  },

  // DELETE /usuarios/:id - Deleta usuario (admin ou proprio usuario)
  async deletar(req: Request, res: Response) {
    const { id } = req.params;

    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Nao autenticado' });
    }

    if (req.usuario.role !== 'admin' && req.usuario.id !== id) {
      return res.status(403).json({ mensagem: 'Sem permissao para acessar este recurso' });
    }

    const sucesso = await servicoUsuario.deletar(id);

    if (!sucesso) {
      return res.status(404).json({ mensagem: 'Usuario nao encontrado' });
    }

    return res.json({ mensagem: 'Usuario deletado com sucesso' });
  },
};
