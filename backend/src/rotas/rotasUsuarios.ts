import { Router } from 'express';
import { controladorUsuario } from '../controladores/controladorUsuario';
import { autenticacao } from '../middlewares/autenticacao';
import { autorizacao } from '../middlewares/autorizacao';

const router = Router();

// Todas as rotas requerem autenticacao
router.use(autenticacao);

// GET /usuarios - Lista todos (admin)
router.get('/', autorizacao(['admin']), controladorUsuario.listarTodos);

// GET /usuarios/:id - Busca por ID (admin ou proprio usuario)
router.get('/:id', controladorUsuario.buscarPorId);

// PUT /usuarios/:id - Atualiza (admin ou proprio usuario)
router.put('/:id', controladorUsuario.atualizar);

// DELETE /usuarios/:id - Deleta (admin ou proprio usuario)
router.delete('/:id', controladorUsuario.deletar);

export default router;
