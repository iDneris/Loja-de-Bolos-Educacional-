import { Router } from 'express';
import { controladorAuth } from '../controladores/controladorAuth';
import { autenticacao } from '../middlewares/autenticacao';

const rotas = Router();

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     summary: Registra novo usuario
 *     tags: [Autenticacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *               telefone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado com sucesso
 *       400:
 *         description: Dados invalidos
 */
rotas.post('/registro', controladorAuth.registrar);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Faz login do usuario
 *     tags: [Autenticacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               senha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais invalidas
 */
rotas.post('/login', controladorAuth.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna dados do usuario logado
 *     tags: [Autenticacao]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuario
 *       401:
 *         description: Nao autenticado
 */
rotas.get('/me', autenticacao, controladorAuth.obterUsuarioLogado);

export default rotas;
