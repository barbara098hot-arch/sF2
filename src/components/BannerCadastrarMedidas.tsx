import { Link } from 'react-router-dom';
import { Ruler } from 'lucide-react';

// Banner discreto exibido quando a cliente não tem medidas cadastradas
// (ou não está logada) — CTA direto pro perfil, sem bloquear a compra.
export const BannerCadastrarMedidas = () => (
  <div className="rounded-sm border border-fiorella-gold/30 bg-fiorella-gold/5 p-4 mb-6 flex items-start gap-3">
    <Ruler size={18} className="text-fiorella-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
    <p className="text-sm text-[#ccc]">
      Cadastre suas medidas e veja se essa peça serve em você.{' '}
      <Link to="/perfil" className="text-fiorella-gold underline underline-offset-2 hover:text-white">
        Ir para o perfil
      </Link>
    </p>
  </div>
);
