export interface CarrinhoItem {
  id: string;
  usuario_id: string;
  bolo_id: string;
  quantidade: number;
  criado_em: Date;
  atualizado_em: Date;
}

export interface CarrinhoItemComBolo extends CarrinhoItem {
  bolo_nome: string;
  bolo_preco: number;
  bolo_imagem_url?: string;
  subtotal: number;
}

export interface DadosAdicionarCarrinho {
  bolo_id: string;
  quantidade: number;
}

export interface DadosAtualizarCarrinho {
  quantidade: number;
}
