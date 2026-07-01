import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStorage } from '../utils/localStorage';
import { LogOut, Package } from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const allPedidos = getStorage<any[]>('fiorella_pedidos', []);
    setPedidos(allPedidos.filter(p => p.cliente?.email === user.email));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 border-b border-[#333] pb-6">
        <div>
          <h1 className="font-cormorant text-4xl text-fiorella-gold mb-2">Minha Conta</h1>
          <p className="text-[#aaa]">Olá, {user.nome}</p>
        </div>
        <button onClick={() => { logout(); navigate('/login'); }} className="mt-4 md:mt-0 flex items-center gap-2 text-fiorella-red hover:text-fiorella-red-hover transition-colors">
          <LogOut size={20} /> Sair
        </button>
      </div>

      <div>
        <h2 className="font-cormorant text-2xl text-white mb-6 flex items-center gap-2">
          <Package className="text-fiorella-gold" /> Meus Pedidos
        </h2>

        {pedidos.length === 0 ? (
          <div className="bg-fiorella-black-light border border-[#333] p-8 text-center rounded-sm">
            <p className="text-[#aaa] mb-4">Você ainda não fez nenhum pedido.</p>
            <button onClick={() => navigate('/catalogo')} className="btn-primary inline-flex">Ir para o Catálogo</button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => (
              <div key={p.id} className="bg-fiorella-black-lightest border border-[#333] p-6 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-white font-medium mb-1">Pedido #{p.numero}</p>
                  <p className="text-sm text-[#aaa]">{new Date(p.dataHora).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-fiorella-gold font-medium">R$ {Number(p.total).toFixed(2)}</p>
                  <p className="text-sm text-[#aaa]">{p.itens?.length} item(ns)</p>
                </div>
                <div>
                  <span className="bg-[#111] border border-fiorella-gold/30 text-fiorella-gold px-3 py-1 text-xs rounded-full uppercase tracking-wider">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
