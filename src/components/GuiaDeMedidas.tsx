import { X, Ruler } from 'lucide-react';

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

// Modal instrucional de "como medir em casa" — reduz abandono de cadastro
// de quem não sabe de cabeça o próprio tamanho de sutiã/roupa.
export const GuiaDeMedidas = ({ aberto, onFechar }: Props) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onFechar}>
      <div
        className="max-w-lg w-full max-h-[85vh] overflow-y-auto bg-fiorella-black-lightest border border-fiorella-gold/30 rounded-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cormorant text-2xl text-fiorella-gold flex items-center gap-2">
            <Ruler size={20} /> Como medir em casa
          </h3>
          <button onClick={onFechar} className="text-[#aaa] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 text-sm text-[#ccc]">
          <div>
            <p className="text-fiorella-gold font-medium mb-1">Numeração do sutiã</p>
            <p>Passe a fita métrica embaixo dos seios, rente ao corpo, mantendo a fita reta e paralela ao chão. O valor em centímetros aproxima a numeração brasileira do seu sutiã (38, 40, 42...). Se ficar entre dois números, cadastre o menor.</p>
          </div>
          <div>
            <p className="text-fiorella-gold font-medium mb-1">Quadril (calcinha/roupa)</p>
            <p>Meça a parte mais larga do quadril, com a fita paralela ao chão. Use esse valor para comparar com a tabela de conversão (P/M/G/GG) disponível no "Como calculamos isso?".</p>
          </div>
          <div className="bg-[#111] border border-[#333] rounded-sm p-3 text-xs text-[#999]">
            Dica: meça sem roupa ou com uma peça bem fina, em pé e relaxada. Se o valor ficar entre dois tamanhos, cadastre o menor — a peça costuma ceder um pouco com o uso.
          </div>
        </div>

        <button onClick={onFechar} className="btn-secondary w-full mt-6">Entendi</button>
      </div>
    </div>
  );
};
