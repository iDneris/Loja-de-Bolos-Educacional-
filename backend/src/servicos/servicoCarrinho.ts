import { supabase } from '../configuracao/supabase';
import { CarrinhoItemComBolo, DadosAdicionarCarrinho } from '../tipos/Carrinho';
import { servicoBolo } from './servicoBolo';

export const servicoCarrinho = {
  // Lista todos os itens do carrinho do usuario
  async listar(usuarioId: string): Promise<CarrinhoItemComBolo[]> {
    const { data, error } = await supabase
      .from('carrinho_itens')
      .select(`
        *,
        bolos (
          nome,
          preco,
          imagem_url
        )
      `)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao listar carrinho:', error);
      return [];
    }

    return (data || []).map(item => ({
      id: item.id,
      usuario_id: item.usuario_id,
      bolo_id: item.bolo_id,
      quantidade: item.quantidade,
      criado_em: new Date(item.criado_em),
      atualizado_em: new Date(item.atualizado_em),
      bolo_nome: item.bolos?.nome,
      bolo_preco: item.bolos?.preco,
      bolo_imagem_url: item.bolos?.imagem_url,
      subtotal: item.quantidade * item.bolos?.preco,
    }));
  },

  // Adiciona item ao carrinho ou atualiza quantidade se ja existe
  async adicionar(usuarioId: string, dados: DadosAdicionarCarrinho): Promise<CarrinhoItemComBolo | null> {
    try {
      // Valida se o bolo existe e tem estoque
      const bolo = await servicoBolo.buscarPorId(dados.bolo_id);
      
      if (!bolo) {
        console.error('Bolo nao encontrado');
        return null;
      }

      // So valida estoque se tiver valor explicito maior que 0
      if (bolo.estoque !== null && bolo.estoque !== undefined && bolo.estoque > 0) {
        if (bolo.estoque < dados.quantidade) {
          console.error('Estoque insuficiente');
          return null;
        }
      }

      // Verifica se o item ja existe no carrinho
      const { data: itemExistente } = await supabase
        .from('carrinho_itens')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('bolo_id', dados.bolo_id)
        .single();

      if (itemExistente) {
        // Atualiza quantidade
        const novaQuantidade = itemExistente.quantidade + dados.quantidade;
        
        // So valida estoque se tiver valor explicito maior que 0
        if (bolo.estoque !== null && bolo.estoque !== undefined && bolo.estoque > 0) {
          if (bolo.estoque < novaQuantidade) {
            console.error('Estoque insuficiente para quantidade total');
            return null;
          }
        }

        const { data, error } = await supabase
          .from('carrinho_itens')
          .update({ 
            quantidade: novaQuantidade,
            atualizado_em: new Date().toISOString()
          })
          .eq('id', itemExistente.id)
          .select(`
            *,
            bolos (
              nome,
              preco,
              imagem_url
            )
          `)
          .single();

        if (error) {
          console.error('Erro ao atualizar item do carrinho:', error);
          return null;
        }

        return {
          id: data.id,
          usuario_id: data.usuario_id,
          bolo_id: data.bolo_id,
          quantidade: data.quantidade,
          criado_em: new Date(data.criado_em),
          atualizado_em: new Date(data.atualizado_em),
          bolo_nome: data.bolos?.nome,
          bolo_preco: data.bolos?.preco,
          bolo_imagem_url: data.bolos?.imagem_url,
          subtotal: data.quantidade * data.bolos?.preco,
        };
      }

      // Cria novo item no carrinho
      const { data, error } = await supabase
        .from('carrinho_itens')
        .insert([{
          usuario_id: usuarioId,
          bolo_id: dados.bolo_id,
          quantidade: dados.quantidade,
        }])
        .select(`
          *,
          bolos (
            nome,
            preco,
            imagem_url
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao adicionar item ao carrinho:', error);
        return null;
      }

      return {
        id: data.id,
        usuario_id: data.usuario_id,
        bolo_id: data.bolo_id,
        quantidade: data.quantidade,
        criado_em: new Date(data.criado_em),
        atualizado_em: new Date(data.atualizado_em),
        bolo_nome: data.bolos?.nome,
        bolo_preco: data.bolos?.preco,
        bolo_imagem_url: data.bolos?.imagem_url,
        subtotal: data.quantidade * data.bolos?.preco,
      };
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      return null;
    }
  },

  // Atualiza quantidade de um item do carrinho
  async atualizar(itemId: string, usuarioId: string, quantidade: number): Promise<CarrinhoItemComBolo | null> {
    try {
      // Busca o item para validar
      const { data: item } = await supabase
        .from('carrinho_itens')
        .select('*, bolos(*)')
        .eq('id', itemId)
        .eq('usuario_id', usuarioId)
        .single();

      if (!item) {
        console.error('Item nao encontrado no carrinho');
        return null;
      }

      // Valida estoque
      if (item.bolos.estoque < quantidade) {
        console.error('Estoque insuficiente');
        return null;
      }

      // Atualiza quantidade
      const { data, error } = await supabase
        .from('carrinho_itens')
        .update({ 
          quantidade,
          atualizado_em: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('usuario_id', usuarioId)
        .select(`
          *,
          bolos (
            nome,
            preco,
            imagem_url
          )
        `)
        .single();

      if (error) {
        console.error('Erro ao atualizar item:', error);
        return null;
      }

      return {
        id: data.id,
        usuario_id: data.usuario_id,
        bolo_id: data.bolo_id,
        quantidade: data.quantidade,
        criado_em: new Date(data.criado_em),
        atualizado_em: new Date(data.atualizado_em),
        bolo_nome: data.bolos?.nome,
        bolo_preco: data.bolos?.preco,
        bolo_imagem_url: data.bolos?.imagem_url,
        subtotal: data.quantidade * data.bolos?.preco,
      };
    } catch (error) {
      console.error('Erro ao atualizar carrinho:', error);
      return null;
    }
  },

  // Remove um item do carrinho
  async remover(itemId: string, usuarioId: string): Promise<boolean> {
    const { error } = await supabase
      .from('carrinho_itens')
      .delete()
      .eq('id', itemId)
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao remover item do carrinho:', error);
      return false;
    }

    return true;
  },

  // Limpa todo o carrinho do usuario
  async limpar(usuarioId: string): Promise<boolean> {
    const { error } = await supabase
      .from('carrinho_itens')
      .delete()
      .eq('usuario_id', usuarioId);

    if (error) {
      console.error('Erro ao limpar carrinho:', error);
      return false;
    }

    return true;
  },
};
