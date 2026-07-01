import { getStorage, setStorage } from './localStorage';

export const initializeData = () => {
  // Initialize Users
  const users: any[] = getStorage('fiorella_usuarios', []);
  if (!users.find((u: any) => u.email === 'admin@fiorella.com.br')) {
    users.push({
      id: 'admin-1',
      nome: 'Administrador',
      email: 'admin@fiorella.com.br',
      senha: btoa('Fiorella#2025' + 'fiorella_salt'), 
      role: 'adm',
      dataCadastro: new Date().toISOString()
    });
    setStorage('fiorella_usuarios', users);
  }

  // Initialize Config
  const config = getStorage('fiorella_config', null);
  const defaultConfig = {
    whatsapp: '5588996849367',
    nomeLoja: 'Fiorella Lingerie',
    descricaoLoja: 'Desperte o que há de mais íntimo em você.',
    homeBanners: {
      lingerie: 'https://images.unsplash.com/photo-1582042125584-3c8c6f116dc2?q=80&w=800&auto=format&fit=crop',
      linhaSensual: 'https://images.unsplash.com/photo-1629853381488-81f1d1fc5521?q=80&w=800&auto=format&fit=crop'
    }
  };

  if (!config || config.whatsapp === '5511999999999') {
    setStorage('fiorella_config', defaultConfig);
  } else if (!config.homeBanners) {
    setStorage('fiorella_config', { ...config, homeBanners: defaultConfig.homeBanners });
  }

  // Initialize Payments
  const payments = getStorage('fiorella_pagamentos', null);
  if (!payments) {
    setStorage('fiorella_pagamentos', {
      pix: { ativo: true, chave: 'admin@fiorella.com.br', titular: 'Fiorella Lingerie LTDA', banco: 'Nubank', instrucoes: 'Envie o comprovante no WhatsApp.' },
      dinheiro: { ativo: true, mensagem: 'Pagamento na entrega.' },
      cartao: { ativo: true, maquininha: 'Mercado Pago', parcelamento: 'Até 3x sem juros' },
      linkPagamento: { ativo: false, url: '', instrucoes: '' }
    });
  }

  // Initialize Products if empty
  const products = getStorage('fiorella_produtos', null);
  if (!products) {
    setStorage('fiorella_produtos', []);
  }
};
