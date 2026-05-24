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

/**
 * @swagger
 * /pedidos/criar:
 *   post:
 *     summary: Cria um pedido a partir do carrinho
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Erro ao criar pedido
 */
rotas.post('/criar', controladorPedido.criar);

/**
 * @swagger
 * /pedidos:
 *   get:
 *     summary: Lista pedidos (admin ve todos, cliente ve apenas seus)
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */
rotas.get('/', controladorPedido.listar);

/**
 * @swagger
 * /pedidos/{id}:
 *   get:
 *     summary: Busca um pedido pelo ID
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */
rotas.get('/:id', controladorPedido.buscarPorId);

/**
 * @swagger
 * /pedidos/{id}:
 *   delete:
 *     summary: Exclui um pedido pendente
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Pedido excluido
 *       400:
 *         description: Pedido nao pode ser excluido
 *       404:
 *         description: Pedido nao encontrado
 */
rotas.delete('/:id', controladorPedido.excluir);

/**
 * @swagger
 * /pedidos/{id}/whatsapp:
 *   get:
 *     summary: Gera mensagem do pedido para enviar no WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do pedido
 *     responses:
 *       200:
 *         description: Mensagem gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *       404:
 *         description: Pedido não encontrado
 */
rotas.get('/:id/whatsapp', controladorPedido.gerarMensagemWhatsApp);

export default rotas;
