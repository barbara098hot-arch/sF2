import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-[#0D0D0D] border-b border-[#333] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-[#FAF3E8] hover:text-[#C9A96E]">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <div className="flex-1 flex justify-center md:justify-start items-center">
            <Link to="/" className="text-center">
              <h1 className="font-cormorant font-semibold italic text-3xl tracking-[8px] text-[#FAF3E8]">FIORELLA</h1>
              <p className="font-jost font-light text-xs tracking-widest text-[#C9A96E]">LINGERIE</p>
            </Link>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/" className="text-[#FAF3E8] hover:text-[#C9A96E] transition-colors text-sm uppercase tracking-wide">Início</Link>
            <Link to="/catalogo" className="text-[#FAF3E8] hover:text-[#C9A96E] transition-colors text-sm uppercase tracking-wide">Catálogo</Link>
          </div>

          <div className="flex items-center space-x-6 justify-end flex-1 md:flex-none">
            <button onClick={() => navigate(user ? (user.role === 'adm' ? '/admin' : '/perfil') : '/login')} className="text-[#C9A96E] hover:text-[#FAF3E8] transition-colors">
              <User size={24} />
            </button>
            <Link to="/carrinho" className="text-[#C9A96E] hover:text-[#FAF3E8] transition-colors relative">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8B0000] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#141414] border-t border-[#333]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-[#FAF3E8] hover:text-[#C9A96E] uppercase tracking-wide text-sm">Início</Link>
            <Link to="/catalogo" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-[#FAF3E8] hover:text-[#C9A96E] uppercase tracking-wide text-sm">Catálogo</Link>
            <Link to={user ? (user.role === 'adm' ? '/admin' : '/perfil') : '/login'} onClick={() => setIsOpen(false)} className="block px-3 py-2 text-[#FAF3E8] hover:text-[#C9A96E] uppercase tracking-wide text-sm">Minha Conta</Link>
          </div>
        </div>
      )}
    </nav>
  );
};
