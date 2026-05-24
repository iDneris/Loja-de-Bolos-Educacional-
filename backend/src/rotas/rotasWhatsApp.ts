import { Router } from 'express';
import { controladorWhatsApp } from '../controladores/controladorWhatsApp';
import { autenticacao } from '../middlewares/autenticacao';

const router = Router();

// Público - obter config
router.get('/config', controladorWhatsApp.obterConfig);

// Protegido - atualizar config (admin)
router.put('/config', autenticacao, controladorWhatsApp.atualizarConfig);

// Público - mensagem de produto
router.get('/mensagem/produto/:id', controladorWhatsApp.mensagemProduto);

// Protegido - mensagem do carrinho
router.get('/mensagem/carrinho', autenticacao, controladorWhatsApp.mensagemCarrinho);

export default router;
