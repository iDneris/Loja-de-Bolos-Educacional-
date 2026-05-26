import { Pedido, ItemPedido, PedidoStatus } from '../tipos/Pedido';
import { servicoBolo } from './servicoBolo';
import { servicoCliente } from './servicoCliente';
import { servicoCarrinho } from './servicoCarrinho';
import { supabase } from '../configuracao/supabase';
const STATUS_FLOW: Record<PedidoStatus, PedidoStatus[]> = {
  pendente: ['confirmado', 'cancelado'],
  confirmado: ['em_preparo', 'cancelado'],
  em_preparo: ['pronto_retirada', 'saiu_entrega', 'cancelado'],
  pronto_retirada: ['entregue', 'cancelado'],
  saiu_entrega: ['entregue', 'cancelado'],
  entregue: [],
  cancelado: [],
};

const STATUS_ALIAS: Record<string, PedidoStatus> = {
  pendente: 'pendente',
  confirmado: 'confirmado',
  em_preparo: 'em_preparo',
  preparando: 'em_preparo',
  pronto_retirada: 'pronto_retirada',
  pronto: 'pronto_retirada',
  enviado: 'saiu_entrega',
  saiu_entrega: 'saiu_entrega',
  entregue: 'entregue',
  cancelado: 'cancelado',
};

function normalizarStatus(status: string): PedidoStatus | null {
  return STATUS_ALIAS[status] || null;
}

export const servicoPedido = {
  // Cria um pedido a partir do carrinho do usuario
  async criarDoCarrinho(usuarioId: string, clienteNome: string, clienteTelefone: string): Promise<Pedido | null> {
    try {
      // 1. Busca itens do carrinho
      const itensCarrinho = await servicoCarrinho.listar(usuarioId);
      console.log('Itens do carrinho:', itensCarrinho.length, 'usuario:', usuarioId);

      if (itensCarrinho.length === 0) {
        console.error('Carrinho vazio');
        return null;
      }

      // 2. Busca ou cria o cliente
      const cliente = await servicoCliente.buscarOuCriar({
        nome: clienteNome,
        telefone: clienteTelefone,
      });
      console.log('Cliente:', cliente?.id, cliente?.nome);

      if (!cliente) {
        console.error('Erro ao buscar/criar cliente');
        return null;
      }

      // 3. Valida estoque de todos os itens (pula se sob_encomenda)
      for (const item of itensCarrinho) {
        const bolo = await servicoBolo.buscarPorId(item.bolo_id);
        
        if (!bolo) {
          console.error(`Bolo ${item.bolo_id} nao encontrado`);
          return null;
        }

        // So valida estoque se NAO for sob encomenda
        if (!bolo.sob_encomenda && bolo.estoque < item.quantidade) {
          console.error(`Estoque insuficiente para ${bolo.nome}`);
          return null;
        }
      }

      // 4. Calcula total
      const valorTotal = itensCarrinho.reduce((acc, item) => acc + item.subtotal, 0);

      // 5. Gera numero_pedido incremental
      const { data: ultimoPedido } = await supabase
        .from('pedidos')
        .select('numero_pedido')
        .order('numero_pedido', { ascending: false })
        .limit(1)
        .single();
      
      const numeroPedido = (ultimoPedido?.numero_pedido || 0) + 1;

      // 6. Cria o pedido no Supabase
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .insert([{
          cliente_id: cliente.id,
          total: valorTotal,
          status: 'pendente',
          numero_pedido: numeroPedido,
        }])
        .select()
        .single();

      if (pedidoError) {
        console.error('Erro ao criar pedido:', pedidoError);
        return null;
      }

      // 7. Cria os itens do pedido
      const itensParaInserir = itensCarrinho.map(item => ({
        pedido_id: pedidoData.id,
        bolo_id: item.bolo_id,
        quantidade: item.quantidade,
        preco_unitario: item.bolo_preco,
      }));

      const { error: itensError } = await supabase
        .from('pedido_itens')
        .insert(itensParaInserir);

      if (itensError) {
        console.error('Erro ao criar itens do pedido:', itensError);
        await supabase.from('pedidos').delete().eq('id', pedidoData.id);
        return null;
      }

      // 8. Reduz o estoque dos bolos
      for (const item of itensCarrinho) {
        const sucesso = await servicoBolo.reduzirEstoque(item.bolo_id, item.quantidade);
        if (!sucesso) {
          console.error(`Erro ao reduzir estoque do bolo ${item.bolo_id}`);
        }
      }

      // 9. Limpa o carrinho
      await servicoCarrinho.limpar(usuarioId);

      // 10. Monta itens do pedido para retorno
      const itensPedido: ItemPedido[] = itensCarrinho.map(item => ({
        boloId: item.bolo_id,
        nomeBolo: item.bolo_nome,
        quantidade: item.quantidade,
        precoUnitario: item.bolo_preco,
      }));

      // 11. Retorna o pedido completo
      return {
        id: pedidoData.id,
        numero_pedido: pedidoData.numero_pedido,
        clienteId: cliente.id,
        clienteNome: cliente.nome,
        clienteTelefone: cliente.telefone,
        itens: itensPedido,
        total: valorTotal,
        status: normalizarStatus(pedidoData.status) || 'pendente',
        data: new Date(pedidoData.criado_em),
      };

    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      return null;
    }
  },

  // Lista todos os pedidos com informacoes do cliente E ITENS
  async listarTodos(usuarioId?: string, isAdmin?: boolean): Promise<Pedido[]> {
    let query = supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nome,
          telefone
        )
      `)
      .order('criado_em', { ascending: false });

    // Se nao for admin, filtra apenas pedidos do usuario
    if (!isAdmin && usuarioId) {
      // Busca pedidos onde o cliente_id corresponde ao usuario
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('telefone')
        .eq('id', usuarioId)
        .single();

      if (usuario) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id')
          .eq('telefone', usuario.telefone)
          .single();

        if (cliente) {
          query = query.eq('cliente_id', cliente.id);
        }
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar pedidos:', error);
      return [];
    }

    // Para cada pedido, busca os itens
    const pedidosCompletos = await Promise.all(
      (data || []).map(async (p) => {
        // Busca os itens do pedido
        const { data: itensData } = await supabase
          .from('pedido_itens')
          .select(`
            *,
            bolos (
              nome
            )
          `)
          .eq('pedido_id', p.id);

        const itens: ItemPedido[] = (itensData || []).map(item => ({
          id: item.id,
          pedidoId: item.pedido_id,
          boloId: item.bolo_id,
          nomeBolo: item.bolos?.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
        }));

        return {
          id: p.id,
          numero_pedido: p.numero_pedido,
          clienteId: p.cliente_id,
          clienteNome: p.clientes?.nome,
          clienteTelefone: p.clientes?.telefone,
          itens,
          total: p.total,
          status: normalizarStatus(p.status) || 'pendente',
          data: new Date(p.criado_em),
          criado_em: p.criado_em,
        };
      })
    );

    // Gera numero_pedido sequencial baseado na ordem de criacao
    const ordenados = pedidosCompletos.sort((a, b) => 
      new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
    );
    
    ordenados.forEach((pedido, index) => {
      pedido.numero_pedido = index + 1;
    });

    // Retorna em ordem decrescente (mais recente primeiro)
    return ordenados.reverse();
  },

  // Busca pedido por ID com todos os detalhes
  async buscarPorId(id: string): Promise<Pedido | null> {
    // Busca o pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nome,
          telefone
        )
      `)
      .eq('id', id)
      .single();

    if (pedidoError) {
      console.error('Erro ao buscar pedido:', pedidoError);
      return null;
    }

    // Busca os itens do pedido
    const { data: itensData, error: itensError } = await supabase
      .from('pedido_itens')
      .select(`
        *,
        bolos (
          nome
        )
      `)
      .eq('pedido_id', id);

    if (itensError) {
      console.error('Erro ao buscar itens do pedido:', itensError);
      return null;
    }

    const itens: ItemPedido[] = (itensData || []).map(item => ({
      id: item.id,
      pedidoId: item.pedido_id,
      boloId: item.bolo_id,
      nomeBolo: item.bolos?.nome,
      quantidade: item.quantidade,
      precoUnitario: item.preco_unitario,
    }));

    return {
      id: pedidoData.id,
      numero_pedido: pedidoData.numero_pedido,
      clienteId: pedidoData.cliente_id,
      clienteNome: pedidoData.clientes?.nome,
      clienteTelefone: pedidoData.clientes?.telefone,
      itens,
      total: pedidoData.total,
      status: normalizarStatus(pedidoData.status) || 'pendente',
      data: new Date(pedidoData.criado_em),
    };
  },

  // Busca pedidos de um cliente pelo telefone COM ITENS
  async buscarPorCliente(telefone: string): Promise<Pedido[]> {
    // Primeiro busca o cliente
    const cliente = await servicoCliente.buscarPorTelefone(telefone);

    if (!cliente) {
      return [];
    }

    // Busca os pedidos do cliente
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        clientes (
          nome,
          telefone
        )
      `)
      .eq('cliente_id', cliente.id)
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar pedidos do cliente:', error);
      return [];
    }

    // Para cada pedido, busca os itens
    const pedidosCompletos = await Promise.all(
      (data || []).map(async (p) => {
        // Busca os itens do pedido
        const { data: itensData } = await supabase
          .from('pedido_itens')
          .select(`
            *,
            bolos (
              nome
            )
          `)
          .eq('pedido_id', p.id);

        const itens: ItemPedido[] = (itensData || []).map(item => ({
          id: item.id,
          pedidoId: item.pedido_id,
          boloId: item.bolo_id,
          nomeBolo: item.bolos?.nome,
          quantidade: item.quantidade,
          precoUnitario: item.preco_unitario,
        }));

        return {
          id: p.id,
          numero_pedido: p.numero_pedido,
          clienteId: p.cliente_id,
          clienteNome: p.clientes?.nome,
          clienteTelefone: p.clientes?.telefone,
          itens,
          total: p.total,
          status: normalizarStatus(p.status) || 'pendente',
          data: new Date(p.criado_em),
          criado_em: p.criado_em,
        };
      })
    );

    // Gera numero_pedido sequencial baseado na ordem de criacao
    const ordenados = pedidosCompletos.sort((a, b) => 
      new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime()
    );
    
    ordenados.forEach((pedido, index) => {
      pedido.numero_pedido = index + 1;
    });

    // Retorna em ordem decrescente (mais recente primeiro)
    return ordenados.reverse();
  },

  // Gera mensagem para WhatsApp
  async gerarMensagemWhatsApp(pedidoId: string): Promise<string | null> {
    const pedido = await this.buscarPorId(pedidoId);

    if (!pedido || !pedido.itens) {
      return null;
    }

    // Monta a mensagem sem emojis
    let mensagem = `Novo Pedido - A&L Cakes\n\n`;
    mensagem += `Cliente: ${pedido.clienteNome}\n`;
    mensagem += `Telefone: ${pedido.clienteTelefone}\n\n`;
    mensagem += `Itens do Pedido:\n`;

    pedido.itens.forEach(item => {
      const subtotal = item.precoUnitario * item.quantidade;
      mensagem += `- ${item.quantidade}x ${item.nomeBolo} - R$ ${item.precoUnitario.toFixed(2)} = R$ ${subtotal.toFixed(2)}\n`;
    });

    mensagem += `\nTotal: R$ ${pedido.total.toFixed(2)}\n\n`;
    mensagem += `Pedido realizado em: ${pedido.data.toLocaleString('pt-BR')}`;

    return mensagem;
  },


  async atualizarStatus(id: string, novoStatusRaw: string): Promise<Pedido | null> {
    const novoStatus = normalizarStatus(String(novoStatusRaw || '').trim());
    if (!novoStatus) return null;

    const pedido = await this.buscarPorId(id);
    if (!pedido) return null;

    const atual = normalizarStatus(pedido.status);
    if (!atual) return null;

    if (atual === novoStatus) return pedido;

    if (!STATUS_FLOW[atual].includes(novoStatus)) {
      return null;
    }

    const { error } = await supabase
      .from('pedidos')
      .update({ status: novoStatus })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      return null;
    }

    return this.buscarPorId(id);
  },
  // Limpa todos os pedidos (apenas para desenvolvimento)
  async limparTodos(): Promise<boolean> {
    try {
      // Primeiro deleta os itens dos pedidos
      const { error: itensError } = await supabase
        .from('pedido_itens')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos

      if (itensError) {
        console.error('Erro ao deletar itens:', itensError);
        return false;
      }

      // Depois deleta os pedidos
      const { error: pedidosError } = await supabase
        .from('pedidos')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta todos

      if (pedidosError) {
        console.error('Erro ao deletar pedidos:', pedidosError);
        return false;
      }

      console.log('Pedidos e itens deletados com sucesso');
      return true;
    } catch (error) {
      console.error('Erro ao limpar pedidos:', error);
      return false;
    }
  },

  // Cancela um pedido pendente sem apagar o historico
  async excluir(id: string): Promise<boolean> {
    try {
      const pedido = await this.buscarPorId(id);
      if (!pedido || pedido.status !== 'pendente') {
        return false;
      }

      const { error } = await supabase
        .from('pedidos')
        .update({ status: 'cancelado' })
        .eq('id', id);

      if (error) {
        console.error('Erro ao cancelar pedido:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      return false;
    }
  },
};
