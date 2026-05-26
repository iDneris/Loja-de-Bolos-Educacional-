import { Router } from 'express';
import { controladorPedido } from '../controladores/controladorPedido';
import { autenticacao } from '../middlewares/autenticacao';

const rotas = Router();

/**
 * @swagger
 * /pedidos/limpar:
 *   delete:
 *     summary: Limpa todos os pedidos (apenas desenvolvimento)
 *     tags: [Pedidos]
 *     responses:
 *       200:
 *         description: Pedidos limpos com sucesso
 */
rotas.delete('/limpar', controladorPedido.limpar);

// Todas as rotas de pedidos requerem autenticacao
rotas.use(autenticacao);

rotas.post('/criar', controladorPedido.criar);
rotas.get('/', controladorPedido.listar);
rotas.get('/:id', controladorPedido.buscarPorId);
rotas.patch('/:id/status', controladorPedido.atualizarStatus);
rotas.delete('/:id', controladorPedido.excluir);
rotas.get('/:id/whatsapp', controladorPedido.gerarMensagemWhatsApp);

export default rotas;
