import { useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Star, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'adm') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'adm') return null;

  const menu = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Produtos', path: '/admin/produtos', icon: <Package size={20} /> },
    { name: 'Pedidos', path: '/admin/pedidos', icon: <ShoppingBag size={20} /> },
    { name: 'Avaliações', path: '/admin/avaliacoes', icon: <Star size={20} /> },
    { name: 'Pagamentos', path: '/admin/pagamentos', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="admin-panel flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-fiorella-black-lightest border-r border-[#333] flex flex-col min-h-screen">
        <div className="p-6 border-b border-[#333]">
          <h2 className="font-cormorant text-2xl text-fiorella-gold text-center">ADM Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menu.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${
                location.pathname === item.path ? 'bg-fiorella-red text-white' : 'text-fiorella-light-cream hover:bg-[#333]'
              }`}
            >
              {item.icon}
              <span className="font-jost font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-[#333]">
          <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 px-4 py-3 rounded-sm text-fiorella-light-cream hover:bg-[#333] transition-colors">
            <LogOut size={20} />
            <span className="font-jost font-medium">Sair</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-fiorella-black p-6 md:p-10 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
