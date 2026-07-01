import { useEffect, useState } from 'react';
import { getStorage, setStorage } from '../../utils/localStorage';
import { Package, ShoppingBag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultHomeBanners = {
  lingerie: 'https://images.unsplash.com/photo-1582042125584-3c8c6f116dc2?q=80&w=800&auto=format&fit=crop',
  linhaSensual: 'https://images.unsplash.com/photo-1629853381488-81f1d1fc5521?q=80&w=800&auto=format&fit=crop'
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ produtos: 0, pedidos: 0, pagamentosAtivos: 0 });
  const [homeBanners, setHomeBanners] = useState(defaultHomeBanners);

  useEffect(() => {
    const produtos = getStorage<any[]>('fiorella_produtos', []);
    const pedidos = getStorage<any[]>('fiorella_pedidos', []);
    const pagamentos = getStorage<any>('fiorella_pagamentos', {});
    const config = getStorage<any>('fiorella_config', null);

    let ativos = 0;
    Object.values(pagamentos).forEach((p: any) => {
      if (p.ativo) ativos++;
    });

    setStats({
      produtos: produtos.length,
      pedidos: pedidos.length,
      pagamentosAtivos: ativos
    });

    if (config?.homeBanners) {
      setHomeBanners({
        lingerie: config.homeBanners.lingerie || defaultHomeBanners.lingerie,
        linhaSensual: config.homeBanners.linhaSensual || defaultHomeBanners.linhaSensual
      });
    }
  }, []);

  const saveHomeBanners = () => {
    const config = getStorage<any>('fiorella_config', {});
    setStorage('fiorella_config', {
      ...config,
      homeBanners
    });
    alert('Imagens da home atualizadas com sucesso.');
  };

  return (
    <div>
      <h1 className="font-cormorant text-3xl text-fiorella-gold mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-fiorella-black-light border border-[#333] p-6 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-fiorella-light-cream/70 text-sm font-medium uppercase tracking-wider mb-1">Total Produtos</p>
            <p className="text-3xl text-white font-light">{stats.produtos}</p>
          </div>
          <div className="h-12 w-12 bg-fiorella-red/20 rounded-full flex items-center justify-center text-fiorella-red">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-fiorella-black-light border border-[#333] p-6 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-fiorella-light-cream/70 text-sm font-medium uppercase tracking-wider mb-1">Pedidos Recebidos</p>
            <p className="text-3xl text-white font-light">{stats.pedidos}</p>
          </div>
          <div className="h-12 w-12 bg-fiorella-gold/20 rounded-full flex items-center justify-center text-fiorella-gold">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-fiorella-black-light border border-[#333] p-6 rounded-sm flex items-center justify-between">
          <div>
            <p className="text-fiorella-light-cream/70 text-sm font-medium uppercase tracking-wider mb-1">Formas Pagto Ativas</p>
            <p className="text-3xl text-white font-light">{stats.pagamentosAtivos}</p>
          </div>
          <div className="h-12 w-12 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366]">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-6">
        <div className="bg-fiorella-black-light border border-[#333] p-6 rounded-sm">
          <h2 className="font-cormorant text-2xl text-fiorella-light-cream mb-6">Imagens da Home</h2>
          <div className="grid gap-6">
            <div>
              <label className="block text-sm text-fiorella-gold mb-2">Imagem Lingerie</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setHomeBanners(prev => ({ ...prev, lingerie: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="input-field w-full"
              />
              {homeBanners.lingerie && (
                <img src={homeBanners.lingerie} alt="Lingerie Banner" className="mt-3 w-full h-40 object-cover rounded-sm border border-[#333]" />
              )}
            </div>
            <div>
              <label className="block text-sm text-fiorella-gold mb-2">Imagem Linha Sensual</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    setHomeBanners(prev => ({ ...prev, linhaSensual: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }}
                className="input-field w-full"
              />
              {homeBanners.linhaSensual && (
                <img src={homeBanners.linhaSensual} alt="Linha Sensual Banner" className="mt-3 w-full h-40 object-cover rounded-sm border border-[#333]" />
              )}
            </div>
          </div>
          <button type="button" onClick={saveHomeBanners} className="btn-primary mt-6">
            Salvar imagens da home
          </button>
        </div>

        <div>
          <h2 className="font-cormorant text-2xl text-fiorella-light-cream mb-6">Acesso Rápido</h2>
          <div className="flex gap-4">
            <Link to="/admin/produtos" className="btn-secondary">Gerenciar Produtos</Link>
            <Link to="/admin/pedidos" className="btn-secondary">Ver Pedidos</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
