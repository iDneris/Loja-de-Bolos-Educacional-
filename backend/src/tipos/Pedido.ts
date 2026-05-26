// Item do pedido (relacionamento com bolo)
export interface ItemPedido {
  id?: string;
  pedidoId?: string;
  boloId: string;
  nomeBolo?: string;
  quantidade: number;
  precoUnitario: number;
}

export type PedidoStatus =
  | 'pendente'
  | 'confirmado'
  | 'em_preparo'
  | 'pronto_retirada'
  | 'saiu_entrega'
  | 'entregue'
  | 'cancelado';

// Dados do pedido completo
export interface Pedido {
  id: string;
  numero_pedido?: number;
  clienteId: string;
  clienteNome?: string;
  clienteTelefone?: string;
  total: number;
  status: PedidoStatus;
  itens?: ItemPedido[];
  data: Date;
}

// Dados para criar pedido novo
export interface DadosNovoPedido {
  clienteNome: string;
  clienteTelefone: string;
  itens: {
    boloId: string;
    quantidade: number;
  }[];
}
