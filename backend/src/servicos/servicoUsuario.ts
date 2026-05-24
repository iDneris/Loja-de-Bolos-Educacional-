import { supabase } from '../configuracao/supabase';
import { Usuario } from '../tipos/Usuario';
import { gerarHash } from '../utils/senha';

export const servicoUsuario = {
  // Lista todos os usuarios (apenas admin)
  async listarTodos(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, telefone, role, criado_em')
      .order('criado_em', { ascending: false });

    if (error) {
      console.error('Erro ao listar usuarios:', error);
      return [];
    }

    return (data || []).map(u => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      telefone: u.telefone,
      role: u.role,
      criado_em: new Date(u.criado_em),
    }));
  },

  // Busca usuario por ID
  async buscarPorId(id: string): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, email, telefone, role, criado_em')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar usuario:', error);
      return null;
    }

    return {
      id: data.id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      role: data.role,
      criado_em: new Date(data.criado_em),
    };
  },

  // Atualiza dados do usuario
  async atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario | null> {
    try {
      const dadosAtualizacao: any = {};

      if (dados.nome) dadosAtualizacao.nome = dados.nome;
      if (dados.email) dadosAtualizacao.email = dados.email;
      if (dados.telefone) dadosAtualizacao.telefone = dados.telefone;

      const { data, error } = await supabase
        .from('usuarios')
        .update(dadosAtualizacao)
        .eq('id', id)
        .select('id, nome, email, telefone, role, criado_em')
        .single();

      if (error) {
        console.error('Erro ao atualizar usuario:', error);
        return null;
      }

      return {
        id: data.id,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        role: data.role,
        criado_em: new Date(data.criado_em),
      };
    } catch (error) {
      console.error('Erro ao atualizar usuario:', error);
      return null;
    }
  },

  // Deleta usuario (apenas admin)
  async deletar(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar usuario:', error);
      return false;
    }

    return true;
  },
};
