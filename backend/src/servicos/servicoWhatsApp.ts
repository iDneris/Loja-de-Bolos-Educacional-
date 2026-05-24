import { servicoCarrinho } from './servicoCarrinho';
import { servicoBolo } from './servicoBolo';

interface ConfigWhatsApp {
  numero: string;
  mensagemTemplate: string;
}

// Configuração padrão
let config: ConfigWhatsApp = {
  numero: '5511963216219',
  mensagemTemplate: `Olá A&L Cakes! 🎂

Gostaria de fazer um pedido:

{PRODUTOS}

Total: R$ {TOTAL}

Aguardo confirmação!`
};

export const servicoWhatsApp = {
  // Atualizar configuração
  atualizarConfig(novaConfig: ConfigWhatsApp) {
    config = { ...config, ...novaConfig };
    return config;
  },

  // Obter configuração atual
  obterConfig() {
    return config;
  },

  // Gerar mensagem para um produto específico
  async gerarMensagemProduto(produtoId: string): Promise<string | null> {
    try {
      const produto = await servicoBolo.buscarPorId(produtoId);
      
      if (!produto) {
        return null;
      }

      const mensagem = `Olá A&L Cakes! Tenho interesse no produto "${produto.nome}" (R$ ${produto.preco.toFixed(2).replace(".", ",")}). Pode me passar mais informações?`;

      return encodeURIComponent(mensagem);
    } catch (error) {
      console.error('Erro ao gerar mensagem:', error);
      return null;
    }
  },

  // Gerar mensagem do carrinho do usuário
  async gerarMensagemCarrinho(usuarioId: string): Promise<{ url: string | null; preview: string }> {
    try {
      const itens = await servicoCarrinho.listar(usuarioId);
      
      if (itens.length === 0) {
        return { 
          url: null, 
          preview: 'Carrinho vazio. Adicione produtos primeiro.' 
        };
      }

      let produtosTexto = '';
      let total = 0;

      itens.forEach((item, index) => {
        produtosTexto += `${index + 1}. ${item.bolo_nome} - ${item.quantidade}x R$ ${item.bolo_preco.toFixed(2).replace('.', ',')}\n`;
        total += item.subtotal;
      });

      const mensagem = config.mensagemTemplate
        .replace('{PRODUTOS}', produtosTexto.trim())
        .replace('{TOTAL}', total.toFixed(2).replace('.', ','));

      const url = `https://wa.me/${config.numero}?text=${encodeURIComponent(mensagem)}`;

      return {
        url,
        preview: mensagem
      };
    } catch (error) {
      console.error('Erro ao gerar mensagem do carrinho:', error);
      return { 
        url: null, 
        preview: 'Erro ao gerar mensagem' 
      };
    }
  }
};
