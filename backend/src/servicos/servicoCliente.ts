import { Cliente, DadosCliente } from '../tipos/Cliente';
import { supabase } from '../configuracao/supabase';

export const servicoCliente = {
  // Busca cliente por telefone
  async buscarPorTelefone(telefone: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', telefone)
      .single();

    if (error) {
      // Se não encontrou, retorna null (não é erro)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erro ao buscar cliente:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      telefone: data.telefone,
      criado_em: new Date(data.criado_em),
    };
  },

  // Cria um cliente novo
  async criar(dados: DadosCliente): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .insert([dados])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      telefone: data.telefone,
      criado_em: new Date(data.criado_em),
    };
  },

  // Busca ou cria cliente (útil para pedidos)
  async buscarOuCriar(dados: DadosCliente): Promise<Cliente | null> {
    // Tenta buscar primeiro
    let cliente = await this.buscarPorTelefone(dados.telefone);

    // Se não encontrou, cria
    if (!cliente) {
      cliente = await this.criar(dados);
    }

    return cliente;
  },
};
