import { Check, AlertTriangle, X, HelpCircle } from 'lucide-react';
import type { ResultadoCompatibilidade, StatusCompatibilidade } from '../types/compatibilidade';

interface Props {
  resultado: ResultadoCompatibilidade;
  onAbrirExplicacao: () => void;
}

// Aparência por status — nunca depende só da cor (ícone + texto sempre
// presentes, pra não excluir quem não distingue as cores do selo).
const APARENCIA: Record<StatusCompatibilidade, { texto: string; bg: string; cor: string; Icone: typeof Check }> = {
  serve: { texto: 'Serve no seu tamanho', bg: 'bg-compat-serve-bg', cor: 'text-compat-serve', Icone: Check },
  ajustado: { texto: 'Pode ajustar', bg: 'bg-compat-ajustado-bg', cor: 'text-compat-ajustado', Icone: AlertTriangle },
  nao_serve: { texto: 'Não recomendado no seu tamanho', bg: 'bg-compat-nao-serve-bg', cor: 'text-compat-nao-serve', Icone: X },
  parcial: { texto: 'Compatibilidade parcial', bg: 'bg-compat-ajustado-bg', cor: 'text-compat-ajustado', Icone: AlertTriangle },
};

export const SeloCompatibilidade = ({ resultado, onAbrirExplicacao }: Props) => {
  const { texto, bg, cor, Icone } = APARENCIA[resultado.status];

  return (
    <div className={`rounded-sm border border-current/20 p-4 mb-6 ${bg} ${cor}`}>
      <div className="flex items-start gap-3">
        <Icone size={20} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
        <div className="flex-1">
          <p className="font-jost font-medium text-sm uppercase tracking-wider">{texto}</p>
          <p className="text-sm mt-1 opacity-90">{resultado.mensagem}</p>

          {resultado.detalhes && (resultado.detalhes.sutia || resultado.detalhes.calcinha) && (
            <ul className="text-xs mt-2 space-y-0.5 opacity-90">
              {resultado.detalhes.sutia && <li>Sutiã: {resultado.detalhes.sutia.mensagem}</li>}
              {resultado.detalhes.calcinha && <li>Calcinha: {resultado.detalhes.calcinha.mensagem}</li>}
            </ul>
          )}

          <button
            type="button"
            onClick={onAbrirExplicacao}
            className="mt-2 inline-flex items-center gap-1 text-xs underline underline-offset-2 opacity-80 hover:opacity-100"
          >
            <HelpCircle size={12} /> Como calculamos isso?
          </button>
        </div>
      </div>
    </div>
  );
};
