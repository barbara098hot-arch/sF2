import { useEffect, useState } from 'react';
import { getStorage } from '../../utils/localStorage';
import { Package, ShoppingBag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({ produtos: 0, pedidos: 0, pagamentosAtivos: 0 });

  useEffect(() => {
    const produtos = getStorage<any[]>('fiorella_produtos', []);
    const pedidos = getStorage<any[]>('fiorella_pedidos', []);
    const pagamentos = getStorage<any>('fiorella_pagamentos', {});
    
    let ativos = 0;
    Object.values(pagamentos).forEach((p: any) => {
      if (p.ativo) ativos++;
    });

    setStats({
      produtos: produtos.length,
      pedidos: pedidos.length,
      pagamentosAtivos: ativos
    });
  }, []);

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

      <div className="mt-12">
        <h2 className="font-cormorant text-2xl text-fiorella-light-cream mb-6">Acesso Rápido</h2>
        <div className="flex gap-4">
          <Link to="/admin/produtos" className="btn-secondary">Gerenciar Produtos</Link>
          <Link to="/admin/pedidos" className="btn-secondary">Ver Pedidos</Link>
        </div>
      </div>
    </div>
  );
};
