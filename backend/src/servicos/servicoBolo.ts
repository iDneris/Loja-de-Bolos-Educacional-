import { Bolo, DadosNovoBolo, DadosAtualizarBolo } from '../tipos/Bolo';
import { supabase } from '../configuracao/supabase';

export const servicoBolo = {
  // Lista apenas bolos ATIVOS (usado na loja pública)
  async listarTodos(): Promise<Bolo[]> {
    const { data, error } = await supabase
      .from('bolos')
      .select('*')
      .eq('ativo', true)
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao listar bolos:', error);
      return [];
    }

    return data || [];
  },

  // Lista TODOS os bolos (ativos + inativos) — painel admin
  async listarTodosAdmin(): Promise<Bolo[]> {
    const { data, error } = await supabase
      .from('bolos')
      .select('*')
      .order('ativo', { ascending: false })
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao listar bolos (admin):', error);
      return [];
    }

    return data || [];
  },

  // Busca um bolo pelo ID no Supabase
  async buscarPorId(id: string): Promise<Bolo | null> {
    const { data, error } = await supabase
      .from('bolos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar bolo:', error);
      return null;
    }

    return data;
  },

  // Cria um bolo novo no Supabase
  async criar(dados: DadosNovoBolo): Promise<Bolo | null> {
    const { data, error } = await supabase
      .from('bolos')
      .insert([dados])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar bolo:', error);
      return null;
    }

    return data;
  },

  // Atualiza um bolo existente no Supabase
  async atualizar(id: string, dados: DadosAtualizarBolo): Promise<Bolo | null> {
    const { data, error } = await supabase
      .from('bolos')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar bolo:', error);
      return null;
    }

    return data;
  },

  // Deleta ou desativa um bolo
  // - Sem pedidos vinculados → exclusão física
  // - Com pedidos vinculados → soft delete (ativo = false)
  async deletar(id: string): Promise<{ sucesso: boolean; motivo?: string; softDelete?: boolean }> {
    // Passo 1: remove do carrinho (seguro remover sempre)
    await supabase.from('carrinho_itens').delete().eq('bolo_id', id);

    // Passo 2: verifica se há pedidos vinculados
    const { data: itensPedido } = await supabase
      .from('pedido_itens')
      .select('id')
      .eq('bolo_id', id)
      .limit(1);

    if (itensPedido && itensPedido.length > 0) {
      // Soft delete: apenas desativa o produto
      const { error } = await supabase
        .from('bolos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) {
        console.error('Erro ao desativar bolo:', error);
        return { sucesso: false, motivo: 'erro' };
      }

      console.info(`Bolo ${id} desativado (soft delete) — possui pedidos vinculados.`);
      return { sucesso: true, softDelete: true };
    }

    // Passo 3: sem pedidos → exclusão física
    const { error } = await supabase
      .from('bolos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar bolo:', error);
      return { sucesso: false, motivo: 'erro' };
    }

    return { sucesso: true, softDelete: false };
  },

  // Reativa um bolo desativado
  async reativar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bolos')
      .update({ ativo: true })
      .eq('id', id);

    if (error) {
      console.error('Erro ao reativar bolo:', error);
      return false;
    }

    return true;
  },

  // Reduz o estoque quando faz pedido (pula se sob_encomenda)
  async reduzirEstoque(boloId: string, quantidade: number): Promise<boolean> {
    // Busca o bolo atual
    const bolo = await this.buscarPorId(boloId);
    
    if (!bolo) {
      return false;
    }

    // Se for sob encomenda, nao controla estoque
    if (bolo.sob_encomenda) {
      return true;
    }

    if (bolo.estoque < quantidade) {
      return false;
    }

    // Atualiza o estoque
    const novoEstoque = bolo.estoque - quantidade;
    const { error } = await supabase
      .from('bolos')
      .update({ estoque: novoEstoque })
      .eq('id', boloId);

    if (error) {
      console.error('Erro ao reduzir estoque:', error);
      return false;
    }

    return true;
  },
};
