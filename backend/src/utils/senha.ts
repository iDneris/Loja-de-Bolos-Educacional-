import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Gera hash da senha
export async function gerarHash(senha: string): Promise<string> {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

// Compara senha com hash
export async function compararSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}
