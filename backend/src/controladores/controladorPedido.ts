import { Request, Response } from 'express';
import { servicoPedido } from '../servicos/servicoPedido';

export const controladorPedido = {
  // POST /pedidos/criar - Cria um pedido a partir do carrinho
  async criar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const { clienteNome, clienteTelefone } = req.body;

    if (!clienteNome || !clienteTelefone) {
      return res.status(400).json({ mensagem: 'Nome e telefone sao obrigatorios' });
    }

    const novoPedido = await servicoPedido.criarDoCarrinho(
      req.usuario.id,
      clienteNome,
      clienteTelefone
    );

    if (!novoPedido) {
      return res.status(400).json({ 
        mensagem: 'Nao foi possivel criar o pedido. Verifique se o carrinho tem itens e se ha estoque' 
      });
    }

    res.status(201).json(novoPedido);
  },

  // GET /pedidos - Lista pedidos (admin ve todos, cliente ve apenas seus)
  async listar(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuario nao autenticado' });
    }

    const isAdmin = req.usuario.role === 'admin';
    const pedidos = await servicoPedido.listarTodos(req.usuario.id, isAdmin);
    
    res.status(200).json(pedidos);
  },

  // GET /pedidos/:id - Busca um pedido especifico
  async buscarPorId(req: Request, res: Response) {
    const { id } = req.params;
    const pedido = await servicoPedido.buscarPorId(id);

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido nao encontrado' });
    }

    res.status(200).json(pedido);
  },

  // GET /pedidos/:id/whatsapp - Gera mensagem para WhatsApp
  async gerarMensagemWhatsApp(req: Request, res: Response) {
    const { id } = req.params;
    const mensagem = await servicoPedido.gerarMensagemWhatsApp(id);

    if (!mensagem) {
      return res.status(404).json({ mensagem: 'Pedido nao encontrado' });
    }

    res.status(200).json({ mensagem });
  },
};
