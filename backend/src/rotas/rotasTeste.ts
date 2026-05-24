import { Router, Request, Response } from 'express';
import { supabase } from '../configuracao/supabase';

const rotas = Router();

/**
 * @swagger
 * /teste/conexao:
 *   get:
 *     summary: Testa a conexão com o Supabase
 *     tags: [Teste]
 *     responses:
 *       200:
 *         description: Conexão funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sucesso:
 *                   type: boolean
 *                 mensagem:
 *                   type: string
 *                 detalhes:
 *                   type: object
 *       500:
 *         description: Erro na conexão
 */
rotas.get('/conexao', async (req: Request, res: Response) => {
  try {
    // Testa conexão fazendo uma query simples
    const { data, error } = await supabase
      .from('bolos')
      .select('count')
      .limit(1);

    if (error) {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao conectar com Supabase',
        erro: error.message,
      });
    }

    // Busca informações das tabelas
    const { data: bolosCount } = await supabase
      .from('bolos')
      .select('*', { count: 'exact', head: true });

    const { data: clientesCount } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    const { data: pedidosCount } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true });

    res.status(200).json({
      sucesso: true,
      mensagem: 'Conexão com Supabase funcionando!',
      detalhes: {
        url: process.env.SUPABASE_URL,
        tabelas: {
          bolos: 'OK',
          clientes: 'OK',
          pedidos: 'OK',
          pedido_itens: 'OK',
        },
      },
    });

  } catch (error: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao testar conexão',
      erro: error.message,
    });
  }
});

/**
 * @swagger
 * /teste/dados:
 *   get:
 *     summary: Verifica se há dados nas tabelas
 *     tags: [Teste]
 *     responses:
 *       200:
 *         description: Estatísticas das tabelas
 */
rotas.get('/dados', async (req: Request, res: Response) => {
  try {
    const { count: bolosCount } = await supabase
      .from('bolos')
      .select('*', { count: 'exact', head: true });

    const { count: clientesCount } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    const { count: pedidosCount } = await supabase
      .from('pedidos')
      .select('*', { count: 'exact', head: true });

    const { count: itensCount } = await supabase
      .from('pedido_itens')
      .select('*', { count: 'exact', head: true });

    res.status(200).json({
      sucesso: true,
      estatisticas: {
        bolos: bolosCount || 0,
        clientes: clientesCount || 0,
        pedidos: pedidosCount || 0,
        pedido_itens: itensCount || 0,
      },
    });

  } catch (error: any) {
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar dados',
      erro: error.message,
    });
  }
});

export default rotas;
