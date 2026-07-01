import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppNumber } from '../utils/contact';

export const Footer = () => {
  const whatsapp = getWhatsAppNumber();

  return (
    <footer className="bg-fiorella-footer border-t border-[#222] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="mb-4 inline-block">
            <h2 className="font-cormorant font-semibold italic text-2xl tracking-[6px] text-fiorella-light-cream">FIORELLA</h2>
            <p className="font-jost font-light text-[10px] tracking-widest text-fiorella-gold">LINGERIE</p>
          </Link>
          <p className="text-sm text-fiorella-light-cream/70 font-light max-w-xs">
            Desperte o que há de mais íntimo em você com nossa curadoria exclusiva.
          </p>
        </div>
        <div className="flex flex-col items-center text-center">
          <h4 className="font-cormorant text-xl text-fiorella-gold mb-4">Links Rápidos</h4>
          <ul className="space-y-2 text-sm text-fiorella-light-cream/70">
            <li><Link to="/catalogo" className="hover:text-fiorella-gold transition-colors">Catálogo</Link></li>
            <li><Link to="/carrinho" className="hover:text-fiorella-gold transition-colors">Carrinho</Link></li>
            <li><Link to="/login" className="hover:text-fiorella-gold transition-colors">Minha Conta</Link></li>
          </ul>
        </div>
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <h4 className="font-cormorant text-xl text-fiorella-gold mb-4">Atendimento</h4>
          <p className="text-sm text-fiorella-light-cream/70 mb-2">Seg - Sex | 8h às 17h</p>
          <p className="text-sm text-fiorella-light-cream/70 mb-2">Sáb | 8h às 14h</p>
          <div className="flex space-x-4 mt-4">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="text-fiorella-gold hover:text-fiorella-light-cream transition-colors">
              <MessageCircle size={24} />
            </a>

          </div>
        </div>
      </div>
      <div className="mt-12 pt-6 border-t border-[#222] text-center">
        <p className="text-xs text-[#555] font-light">© 2026 Fiorella Lingerie. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};
