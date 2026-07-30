import { getUserByEmail, addUsuario, getConfig, updateConfig, getPagamentos, updatePagamentos } from '../services/firebaseService';
import { hashPassword } from './passwordHash';

export const initializeData = async () => {
  try {
    // Initialize Users
    const existingAdmin = await getUserByEmail('admin@fiorella.com.br');
    if (!existingAdmin) {
      await addUsuario({
        nome: 'Administrador',
        email: 'admin@fiorella.com.br',
        senha: await hashPassword('Fiorella#2025'),
        role: 'adm'
      });
    }

    // Initialize Config
    const config = await getConfig();
    const defaultConfig = {
      whatsapp: '5588988171421',
      nomeLoja: 'Fiorella Lingerie',
      descricaoLoja: 'Desperte o que há de mais íntimo em você.',
      homeBanners: {
        lingerie: 'https://images.unsplash.com/photo-1582042125584-3c8c6f116dc2?q=80&w=800&auto=format&fit=crop',
        linhaSensual: 'https://images.unsplash.com/photo-1629853381488-81f1d1fc5521?q=80&w=800&auto=format&fit=crop'
      }
    };

    if (!config || (config as any).whatsapp === '5511999999999') {
      await updateConfig(defaultConfig);
    } else if (!config.homeBanners) {
      await updateConfig({ ...config, homeBanners: defaultConfig.homeBanners });
    }

    // Initialize Payments
    const payments = await getPagamentos();
    if (!payments) {
      await updatePagamentos({
        pix: { ativo: true, chave: 'admin@fiorella.com.br', titular: 'Fiorella Lingerie LTDA', banco: 'Nubank', instrucoes: 'Envie o comprovante no WhatsApp.' },
        dinheiro: { ativo: true, mensagem: 'Pagamento na entrega.' },
        cartao: { ativo: true, maquininha: 'Mercado Pago', parcelamento: 'Até 3x sem juros' },
        linkPagamento: { ativo: false, url: '', instrucoes: '' }
      });
    }
  } catch (error) {
    console.error('Erro ao inicializar dados:', error);
  }
};
