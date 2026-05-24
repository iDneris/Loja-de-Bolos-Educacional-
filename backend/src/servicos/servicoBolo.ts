import { Bolo, DadosNovoBolo, DadosAtualizarBolo } from '../tipos/Bolo';
import { supabase } from '../configuracao/supabase';

export const servicoBolo = {
  // Pega todos os bolos do Supabase
  async listarTodos(): Promise<Bolo[]> {
    const { data, error } = await supabase
      .from('bolos')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Erro ao listar bolos:', error);
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

  // Deleta um bolo do Supabase
  async deletar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('bolos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar bolo:', error);
      return false;
    }

    return true;
  },

  // Reduz o estoque quando faz pedido
  async reduzirEstoque(boloId: string, quantidade: number): Promise<boolean> {
    // Busca o bolo atual
    const bolo = await this.buscarPorId(boloId);
    
    if (!bolo || bolo.estoque < quantidade) {
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
