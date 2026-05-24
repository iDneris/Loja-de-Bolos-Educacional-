import { Request, Response } from 'express';
import { servicoCarrinho } from '../servicos/servicoCarrinho';

export const controladorCarrinho = {
  // GET /carrinho - Lista itens do carrinho
  async listar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const itens = await servicoCarrinho.listar(req.usuario.id);
    
    const total = itens.reduce((acc, item) => acc + item.subtotal, 0);

    return res.json({
      itens,
      total,
      quantidade_itens: itens.length,
    });
  },

  // POST /carrinho/adicionar - Adiciona item ao carrinho
  async adicionar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const { bolo_id, quantidade } = req.body;

    if (!bolo_id || !quantidade || quantidade <= 0) {
      return res.status(400).json({ 
        mensagem: 'bolo_id e quantidade sao obrigatorios' 
      });
    }

    const item = await servicoCarrinho.adicionar(req.usuario.id, {
      bolo_id,
      quantidade,
    });

    if (!item) {
      return res.status(400).json({ 
        mensagem: 'Erro ao adicionar item ao carrinho. Verifique estoque.' 
      });
    }

    return res.status(201).json(item);
  },

  // PUT /carrinho/atualizar/:itemId - Atualiza quantidade
  async atualizar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const { itemId } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({ 
        mensagem: 'Quantidade deve ser maior que zero' 
      });
    }

    const item = await servicoCarrinho.atualizar(itemId, req.usuario.id, quantidade);

    if (!item) {
      return res.status(400).json({ 
        mensagem: 'Erro ao atualizar item. Verifique estoque.' 
      });
    }

    return res.json(item);
  },

  // DELETE /carrinho/remover/:itemId - Remove item
  async remover(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const { itemId } = req.params;

    const sucesso = await servicoCarrinho.remover(itemId, req.usuario.id);

    if (!sucesso) {
      return res.status(404).json({ mensagem: 'Item nao encontrado' });
    }

    return res.json({ mensagem: 'Item removido do carrinho' });
  },

  // DELETE /carrinho/limpar - Limpa carrinho
  async limpar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const sucesso = await servicoCarrinho.limpar(req.usuario.id);

    if (!sucesso) {
      return res.status(500).json({ mensagem: 'Erro ao limpar carrinho' });
    }

    return res.json({ mensagem: 'Carrinho limpo com sucesso' });
  },
};
