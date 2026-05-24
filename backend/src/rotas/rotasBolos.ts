import { Router } from 'express';
import { controladorBolo } from '../controladores/controladorBolo';
import { autenticacao } from '../middlewares/autenticacao';
import { autorizacao } from '../middlewares/autorizacao';

const rotas = Router();

/**
 * @swagger
 * /bolos:
 *   get:
 *     summary: Lista todos os bolos disponíveis
 *     tags: [Bolos]
 *     responses:
 *       200:
 *         description: Lista de bolos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "1"
 *                   nome:
 *                     type: string
 *                     example: "Bolo de Chocolate"
 *                   descricao:
 *                     type: string
 *                     example: "Delicioso bolo de chocolate"
 *                   preco:
 *                     type: number
 *                     example: 45.00
 *                   imagem:
 *                     type: string
 *                     example: "https://exemplo.com/chocolate.jpg"
 *                   estoque:
 *                     type: number
 *                     example: 10
 */
rotas.get('/', controladorBolo.listar);

/**
 * @swagger
 * /bolos/{id}:
 *   get:
 *     summary: Busca um bolo pelo ID
 *     tags: [Bolos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bolo
 *     responses:
 *       200:
 *         description: Bolo encontrado
 *       404:
 *         description: Bolo não encontrado
 */
rotas.get('/:id', controladorBolo.buscarPorId);

/**
 * @swagger
 * /bolos:
 *   post:
 *     summary: Cadastra um bolo novo
 *     tags: [Bolos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - descricao
 *               - preco
 *               - imagem
 *               - estoque
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Bolo de Limão"
 *               descricao:
 *                 type: string
 *                 example: "Bolo refrescante de limão"
 *               preco:
 *                 type: number
 *                 example: 40.00
 *               imagem:
 *                 type: string
 *                 example: "https://exemplo.com/limao.jpg"
 *               estoque:
 *                 type: number
 *                 example: 15
 *     responses:
 *       201:
 *         description: Bolo criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Sem permissao (requer admin)
 */
rotas.post('/', autenticacao, autorizacao(['admin']), controladorBolo.criar);

/**
 * @swagger
 * /bolos/{id}:
 *   put:
 *     summary: Atualiza um bolo existente
 *     tags: [Bolos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bolo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               preco:
 *                 type: number
 *               imagem:
 *                 type: string
 *               estoque:
 *                 type: number
 *     responses:
 *       200:
 *         description: Bolo atualizado
 *       404:
 *         description: Bolo não encontrado
 *       403:
 *         description: Sem permissao (requer admin)
 */
rotas.put('/:id', autenticacao, autorizacao(['admin']), controladorBolo.atualizar);

/**
 * @swagger
 * /bolos/{id}:
 *   delete:
 *     summary: Deleta um bolo
 *     tags: [Bolos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do bolo
 *     responses:
 *       200:
 *         description: Bolo deletado
 *       404:
 *         description: Bolo não encontrado
 *       403:
 *         description: Sem permissao (requer admin)
 */
rotas.delete('/:id', autenticacao, autorizacao(['admin']), controladorBolo.deletar);

export default rotas;
