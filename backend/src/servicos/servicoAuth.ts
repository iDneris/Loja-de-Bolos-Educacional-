import { supabase } from '../configuracao/supabase';
import { gerarToken } from '../configuracao/jwt';
import { gerarHash, compararSenha } from '../utils/senha';
import { DadosRegistro, DadosLogin, RespostaAuth, Usuario } from '../tipos/Usuario';

export const servicoAuth = {
  // Registra novo usuario
  async registrar(dados: DadosRegistro): Promise<RespostaAuth | null> {
    try {
      // Valida se email ja existe
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', dados.email)
        .single();

      if (usuarioExistente) {
        console.error('Email ja cadastrado');
        return null;
      }

      // Gera hash da senha
      const senhaHash = await gerarHash(dados.senha);

      // Cria usuario no banco
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          nome: dados.nome,
          email: dados.email,
          senha_hash: senhaHash,
          telefone: dados.telefone,
          role: 'cliente'
        }])
        .select('id, nome, email, telefone, role')
        .single();

      if (error) {
        console.error('Erro ao criar usuario:', error);
        return null;
      }

      // Gera token JWT
      const token = gerarToken({
        id: data.id,
        email: data.email,
        role: data.role
      });

      return {
        token,
        usuario: {
          id: data.id,
          nome: data.nome,
          email: data.email,
          telefone: data.telefone,
          role: data.role
        }
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return null;
    }
  },

  // Faz login do usuario
  async login(dados: DadosLogin): Promise<RespostaAuth | null> {
    try {
      // Busca usuario por email
      const { data: usuario, error } = await supabase
        .from('usuarios')
        .select('id, nome, email, senha_hash, telefone, role')
        .eq('email', dados.email)
        .single();

      if (error || !usuario) {
        console.error('Usuario nao encontrado');
        return null;
      }

      // Verifica senha
      const senhaValida = await compararSenha(dados.senha, usuario.senha_hash);

      if (!senhaValida) {
        console.error('Senha invalida');
        return null;
      }

      // Gera token JWT
      const token = gerarToken({
        id: usuario.id,
        email: usuario.email,
        role: usuario.role
      });

      return {
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          telefone: usuario.telefone,
          role: usuario.role
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return null;
    }
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
      criado_em: new Date(data.criado_em)
    };
  }
};
