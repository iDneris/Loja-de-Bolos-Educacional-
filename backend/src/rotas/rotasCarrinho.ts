import { Router } from 'express';
import { controladorCarrinho } from '../controladores/controladorCarrinho';
import { autenticacao } from '../middlewares/autenticacao';

const router = Router();

// Todas as rotas de carrinho requerem autenticacao
router.use(autenticacao);

// GET /carrinho - Lista itens do carrinho
router.get('/', controladorCarrinho.listar);

// POST /carrinho/adicionar - Adiciona item ao carrinho
router.post('/adicionar', controladorCarrinho.adicionar);

// PUT /carrinho/atualizar/:itemId - Atualiza quantidade
router.put('/atualizar/:itemId', controladorCarrinho.atualizar);

// DELETE /carrinho/remover/:itemId - Remove item
router.delete('/remover/:itemId', controladorCarrinho.remover);

// DELETE /carrinho/limpar - Limpa carrinho
router.delete('/limpar', controladorCarrinho.limpar);

export default router;
