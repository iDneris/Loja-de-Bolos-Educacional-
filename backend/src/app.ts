import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import { config } from './configuracao/ambiente';
import { swaggerConfig } from './configuracao/swagger';
import rotasBolos from './rotas/rotasBolos';
import rotasPedidos from './rotas/rotasPedidos';
import rotasTeste from './rotas/rotasTeste';
import rotasAuth from './rotas/rotasAuth';
import rotasCarrinho from './rotas/rotasCarrinho';
import rotasUsuarios from './rotas/rotasUsuarios';
import rotasWhatsApp from './rotas/rotasWhatsApp';

const app = express();

const encontrarDiretorio = (...candidatos: string[]) =>
  candidatos.find((diretorio) => fs.existsSync(diretorio)) || candidatos[0];

const diretorioPublico = encontrarDiretorio(
  path.resolve(process.cwd(), 'backend/public'),
  path.resolve(process.cwd(), 'public')
);
const diretorioFrontend = encontrarDiretorio(
  path.resolve(process.cwd(), 'frontend'),
  path.resolve(process.cwd(), '../frontend')
);

// Configurações básicas
app.use(express.json());
app.use(cors({
  origin: config.corsOrigem,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Servir arquivos estáticos da pasta public
app.use(express.static(diretorioFrontend));
app.use(express.static(diretorioPublico, { index: false }));

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API A&L Cakes',
}));

// Rotas da API
app.use('/auth', rotasAuth);
app.use('/bolos', rotasBolos);
app.use('/pedidos', rotasPedidos);
app.use('/carrinho', rotasCarrinho);
app.use('/usuarios', rotasUsuarios);
app.use('/whatsapp', rotasWhatsApp);
app.use('/teste', rotasTeste);

// Rota inicial
app.get('/api', (req, res) => {
  res.json({
    mensagem: 'API A&L Cakes funcionando!',
    documentacao: '/api-docs',
    teste_conexao: '/teste/conexao',
    teste_endpoints: '/testeEndpoints.html',
  });
});

// Rota para página de teste
app.get('/testeEndpoints.html', (req, res) => {
  res.sendFile('testeEndpoints.html', { root: diretorioPublico });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada' });
});

export default app;
