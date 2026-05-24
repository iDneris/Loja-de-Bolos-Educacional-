import app from './app';
import { config } from './configuracao/ambiente';

const PORTA = config.porta;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
  console.log(`Documentacao: http://localhost:${PORTA}/api-docs`);
  console.log(`Sistema pronto para uso!`);
});
