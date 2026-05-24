export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  role: 'cliente' | 'admin';
  criado_em: Date;
}

export interface DadosRegistro {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
}

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface RespostaAuth {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    telefone: string;
    role: string;
  };
}

export interface PayloadToken {
  id: string;
  email: string;
  role: string;
}
