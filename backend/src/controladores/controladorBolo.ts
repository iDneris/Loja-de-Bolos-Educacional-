import { Request, Response } from 'express';
import { servicoBolo } from '../servicos/servicoBolo';
import { DadosNovoBolo, DadosAtualizarBolo } from '../tipos/Bolo';

export const controladorBolo = {
  // GET /bolos - Lista apenas bolos ativos (loja pública)
  async listar(req: Request, res: Response) {
    const bolos = await servicoBolo.listarTodos();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(bolos);
  },

  // GET /bolos/admin - Lista TODOS os bolos incluindo inativos (painel admin)
  async listarAdmin(req: Request, res: Response) {
    const bolos = await servicoBolo.listarTodosAdmin();
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(bolos);
  },

  // GET /bolos/:id - Busca um bolo específico
  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;
    const bolo = await servicoBolo.buscarPorId(id);

    if (!bolo) {
      return res.status(404).json({ mensagem: 'Bolo não encontrado' });
    }

    res.status(200).json(bolo);
  },

  // POST /bolos - Cria um bolo novo
  async criar(req: Request, res: Response) {
    const dados: DadosNovoBolo = req.body;

    // Validação básica (estoque é opcional, padrão 0 para venda sob encomenda)
    if (!dados.nome || !dados.descricao || dados.preco === undefined || !dados.imagem_url) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
    }

    // Define estoque padrão como 0 se não fornecido (venda sob encomenda)
    if (dados.estoque === undefined) {
      dados.estoque = 0;
    }

    const novoBolo = await servicoBolo.criar(dados);

    if (!novoBolo) {
      return res.status(500).json({ mensagem: 'Erro ao criar bolo' });
    }

    res.status(201).json(novoBolo);
  },

  // PUT /bolos/:id - Atualiza um bolo
  async atualizar(req: Request, res: Response) {
    const { id } = req.params;
    const dados: DadosAtualizarBolo = req.body;

    const boloAtualizado = await servicoBolo.atualizar(id, dados);

    if (!boloAtualizado) {
      return res.status(404).json({ mensagem: 'Bolo não encontrado' });
    }

    res.status(200).json(boloAtualizado);
  },

  // DELETE /bolos/:id - Deleta fisicamente (sem pedidos) ou desativa via soft delete (com pedidos)
  async deletar(req: Request, res: Response) {
    const { id } = req.params;
    const resultado = await servicoBolo.deletar(id);

    if (!resultado.sucesso) {
      return res.status(500).json({ mensagem: 'Erro interno ao excluir produto.' });
    }

    if (resultado.softDelete) {
      return res.status(200).json({
        mensagem: 'Produto desativado. Ele possui pedidos vinculados e foi ocultado da loja, mas pode ser reativado.',
        softDelete: true,
      });
    }

    res.status(200).json({ mensagem: 'Produto excluído com sucesso.', softDelete: false });
  },

  // PATCH /bolos/:id/reativar - Reativa um bolo desativado
  async reativar(req: Request, res: Response) {
    const { id } = req.params;
    const sucesso = await servicoBolo.reativar(id);

    if (!sucesso) {
      return res.status(500).json({ mensagem: 'Erro ao reativar produto.' });
    }

    res.status(200).json({ mensagem: 'Produto reativado com sucesso!' });
  },
};
