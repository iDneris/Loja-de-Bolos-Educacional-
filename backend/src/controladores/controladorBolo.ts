import { Request, Response } from 'express';
import { servicoBolo } from '../servicos/servicoBolo';
import { DadosNovoBolo, DadosAtualizarBolo } from '../tipos/Bolo';

export const controladorBolo = {
  // GET /bolos - Lista todos os bolos
  async listar(req: Request, res: Response) {
    const bolos = await servicoBolo.listarTodos();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
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

  // DELETE /bolos/:id - Deleta um bolo
  async deletar(req: Request, res: Response) {
    const { id } = req.params;
    const resultado = await servicoBolo.deletar(id);

    if (!resultado.sucesso) {
      if (resultado.motivo === 'pedidos') {
        return res.status(409).json({
          mensagem: 'Não é possível excluir este produto pois ele possui pedidos vinculados.',
        });
      }
      return res.status(500).json({ mensagem: 'Erro interno ao excluir produto.' });
    }

    res.status(200).json({ mensagem: 'Bolo deletado com sucesso' });
  },
};
