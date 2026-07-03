import { X, Info } from 'lucide-react';
import { CONVERSAO_SUTIA, CONVERSAO_GERAL } from '../utils/conversaoTamanhos';

interface Props {
  aberto: boolean;
  onFechar: () => void;
}

// Explicação transparente do motor de compatibilidade — cliente de produto
// íntimo não gosta de "caixa preta", então mostramos o raciocínio em
// linguagem simples, sem prometer um provador virtual.
export const ModalComoCalculamos = ({ aberto, onFechar }: Props) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onFechar}>
      <div
        className="max-w-lg w-full max-h-[85vh] overflow-y-auto bg-fiorella-black-lightest border border-fiorella-gold/30 rounded-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cormorant text-2xl text-fiorella-gold flex items-center gap-2">
            <Info size={20} /> Como calculamos isso?
          </h3>
          <button onClick={onFechar} className="text-[#aaa] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm text-[#ccc]">
          <p>
            Não é um provador virtual: comparamos as medidas que você cadastrou no seu perfil
            com os dados que a loja informou sobre esta peça (numeração, elasticidade do
            tecido e caimento da modelagem).
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-compat-serve font-medium">Serve</span>: seu tamanho bate exatamente com o desta peça.</li>
            <li><span className="text-compat-ajustado font-medium">Pode ajustar</span>: seu tamanho é próximo, e o tecido/modelagem tem alguma tolerância (peças mais elásticas ou de caimento solto toleram mais).</li>
            <li><span className="text-compat-nao-serve font-medium">Não recomendado</span>: a diferença de tamanho é grande demais pra essa peça específica.</li>
          </ul>
          <p className="text-xs text-[#999]">
            O resultado é uma estimativa baseada em regras, não uma garantia — cada corpo se
            relaciona com o tecido de um jeito, e o próprio caimento da peça pode variar um
            pouco entre lotes.
          </p>

          <div>
            <p className="text-fiorella-gold text-xs uppercase tracking-wider mb-2">Numeração de sutiã</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {CONVERSAO_SUTIA.map(l => (
                    <tr key={l.numero} className="border-b border-[#222]">
                      <td className="py-1 pr-3 text-white">{l.numero}</td>
                      <td className="py-1 text-[#999]">{l.equivalencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#666] mt-1 italic">Numeração brasileira — equivalência aproximada, varia entre marcas.</p>
          </div>

          <div>
            <p className="text-fiorella-gold text-xs uppercase tracking-wider mb-2">Calcinha / roupa em geral</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {CONVERSAO_GERAL.map(l => (
                    <tr key={l.tamanho} className="border-b border-[#222]">
                      <td className="py-1 pr-3 text-white">{l.tamanho}</td>
                      <td className="py-1 text-[#999]">{l.equivalencia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[#666] mt-1 italic">Conversão aproximada — varia entre marcas.</p>
          </div>
        </div>

        <button onClick={onFechar} className="btn-secondary w-full mt-6">Entendi</button>
      </div>
    </div>
  );
};
