// Informações do bolo
export interface Bolo {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  estoque: number;
}

// Dados para cadastrar bolo novo
export interface DadosNovoBolo {
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  estoque: number;
}

// Dados para atualizar bolo
export interface DadosAtualizarBolo {
  nome?: string;
  descricao?: string;
  preco?: number;
  imagem_url?: string;
  estoque?: number;
}
