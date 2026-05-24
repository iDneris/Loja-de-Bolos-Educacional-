import { Request, Response } from 'express';
import { servicoWhatsApp } from '../servicos/servicoWhatsApp';

export const controladorWhatsApp = {
  // GET /whatsapp/config - Obtém configuração atual
  async obterConfig(req: Request, res: Response) {
    try {
      const config = servicoWhatsApp.obterConfig();
      return res.json(config);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao obter configuração' });
    }
  },

  // PUT /whatsapp/config - Atualiza configuração (apenas admin)
  async atualizarConfig(req: Request, res: Response) {
    if (!req.usuario || req.usuario.role !== 'admin') {
      return res.status(403).json({ mensagem: 'Acesso negado' });
    }

    try {
      const { numero, mensagemTemplate } = req.body;
      
      if (!numero || !mensagemTemplate) {
        return res.status(400).json({ mensagem: 'Número e mensagem template são obrigatórios' });
      }

      const config = servicoWhatsApp.atualizarConfig({ numero, mensagemTemplate });
      return res.json(config);
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao atualizar configuração' });
    }
  },

  // GET /whatsapp/mensagem/produto/:id - Gera mensagem para um produto
  async mensagemProduto(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const mensagem = await servicoWhatsApp.gerarMensagemProduto(id);
      
      if (!mensagem) {
        return res.status(404).json({ mensagem: 'Produto não encontrado' });
      }

      const config = servicoWhatsApp.obterConfig();
      const url = `https://wa.me/${config.numero}?text=${mensagem}`;

      return res.json({ 
        url, 
        preview: decodeURIComponent(mensagem),
        numero: config.numero 
      });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao gerar mensagem' });
    }
  },

  // GET /whatsapp/mensagem/carrinho - Gera mensagem do carrinho do usuário logado
  async mensagemCarrinho(req: Request, res: Response) {
    if (!req.usuario) {
      return res.status(401).json({ mensagem: 'Usuário não autenticado' });
    }

    try {
      const resultado = await servicoWhatsApp.gerarMensagemCarrinho(req.usuario.id);
      
      return res.json({
        ...resultado,
        numero: servicoWhatsApp.obterConfig().numero
      });
    } catch (error) {
      return res.status(500).json({ mensagem: 'Erro ao gerar mensagem do carrinho' });
    }
  }
};
