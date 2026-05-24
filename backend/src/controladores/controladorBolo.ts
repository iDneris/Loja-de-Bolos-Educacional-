import { Request, Response } from 'express';
import { servicoBolo } from '../servicos/servicoBolo';
import { DadosNovoBolo, DadosAtualizarBolo } from '../tipos/Bolo';

export const controladorBolo = {
  // GET /bolos - Lista todos os bolos
  async listar(req: Request, res: Response) {
    const bolos = await servicoBolo.listarTodos();
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

    // Validação básica
    if (!dados.nome || !dados.descricao || dados.preco === undefined || !dados.imagem_url || dados.estoque === undefined) {
      return res.status(400).json({ mensagem: 'Todos os campos são obrigatórios' });
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
    const deletado = await servicoBolo.deletar(id);

    if (!deletado) {
      return res.status(404).json({ mensagem: 'Bolo não encontrado' });
    }

    res.status(200).json({ mensagem: 'Bolo deletado com sucesso' });
  },
};
