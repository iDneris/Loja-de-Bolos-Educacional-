// Dados do cliente
export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  criado_em?: Date;
}

// Dados para buscar ou criar cliente
export interface DadosCliente {
  nome: string;
  telefone: string;
}
