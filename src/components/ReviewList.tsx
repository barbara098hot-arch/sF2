import { useState } from 'react';
import { Star, X } from 'lucide-react';
import type { Avaliacao } from '../types/compatibilidade';

interface Props {
  avaliacoes: Avaliacao[]; // já filtradas para status === 'aprovada'
}

const RECOMENDA_TEXTO: Record<string, string> = {
  normal: 'Comprou do tamanho normal',
  acima: 'Comprou um tamanho acima',
  abaixo: 'Comprou um tamanho abaixo',
};

export const ReviewList = ({ avaliacoes }: Props) => {
  const [fotoAmpliada, setFotoAmpliada] = useState<string | null>(null);

  if (avaliacoes.length === 0) {
    return <p className="text-sm text-[#888]">Ainda não há avaliações para este produto. Seja a primeira a avaliar!</p>;
  }

  // Avaliações com foto ganham destaque no topo — têm mais peso de prova
  // social num produto que não tem provador.
  const comFoto = avaliacoes.filter(a => a.fotoCliente);
  const semFoto = avaliacoes.filter(a => !a.fotoCliente);
  const notaMedia = avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length;

  const renderEstrelas = (nota: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <Star key={n} size={14} className={n <= nota ? 'fill-fiorella-gold text-fiorella-gold' : 'text-[#555]'} />
      ))}
    </div>
  );

  const renderAvaliacao = (a: Avaliacao, idx: number) => (
    <div key={a.id || idx} className="border border-[#333] rounded-sm p-4 bg-fiorella-black-lightest">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white font-medium">{a.nomeCliente}</span>
        {renderEstrelas(a.nota)}
      </div>
      <p className="text-sm text-[#ccc] mb-2">{a.comentario}</p>
      <div className="flex flex-wrap gap-x-4 text-xs text-[#888]">
        {a.tamanhoComprado && <span>Tamanho comprado: {a.tamanhoComprado}</span>}
        {a.recomendaTamanho && <span>{RECOMENDA_TEXTO[a.recomendaTamanho]}</span>}
      </div>
      {a.fotoCliente && (
        <button type="button" onClick={() => setFotoAmpliada(a.fotoCliente!)} className="mt-3 block">
          <img src={a.fotoCliente} alt={`Foto enviada por ${a.nomeCliente}`} className="w-20 h-20 object-cover rounded-sm border border-[#333] hover:border-fiorella-gold transition-colors" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {renderEstrelas(Math.round(notaMedia))}
        <span className="text-sm text-[#aaa]">{notaMedia.toFixed(1)} de 5 ({avaliacoes.length} avaliação{avaliacoes.length === 1 ? '' : 'ões'})</span>
      </div>

      {comFoto.length > 0 && (
        <div>
          <h5 className="text-xs uppercase tracking-wider text-fiorella-gold mb-3">Fotos de clientes</h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {comFoto.map(renderAvaliacao)}
          </div>
        </div>
      )}

      {semFoto.length > 0 && (
        <div className="space-y-3">
          {semFoto.map(renderAvaliacao)}
        </div>
      )}

      {fotoAmpliada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setFotoAmpliada(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setFotoAmpliada(null)} aria-label="Fechar">
            <X size={28} />
          </button>
          <img src={fotoAmpliada} alt="Foto ampliada" className="max-w-full max-h-full object-contain rounded-sm" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
