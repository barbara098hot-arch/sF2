import { useEffect, useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import { getAvaliacoes, updateAvaliacao, getProdutos } from '../../services/firebaseService';

const STATUS_LABEL: Record<string, string> = {
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada',
};

const STATUS_STYLE: Record<string, string> = {
  pendente: 'bg-yellow-900/50 text-yellow-300',
  aprovada: 'bg-green-900/50 text-green-300',
  rejeitada: 'bg-red-900/50 text-red-300',
};

export const AdminReviews = () => {
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<'todas' | 'pendente' | 'aprovada' | 'rejeitada'>('pendente');

  const carregar = async () => {
    const [av, prods] = await Promise.all([getAvaliacoes(), getProdutos()]);
    // Pendentes primeiro (são as que precisam de ação), depois mais recentes.
    av.sort((a: any, b: any) => {
      if (a.status !== b.status) return a.status === 'pendente' ? -1 : 1;
      return (b.dataCriacao || '').localeCompare(a.dataCriacao || '');
    });
    setAvaliacoes(av);
    setProdutos(prods);
  };

  useEffect(() => {
    carregar();
  }, []);

  const nomeProduto = (produtoId: string) => produtos.find(p => p.id === produtoId)?.nome || produtoId;

  const moderar = async (id: string, status: 'aprovada' | 'rejeitada') => {
    await updateAvaliacao(id, { status });
    carregar();
  };

  const listaFiltrada = filtroStatus === 'todas' ? avaliacoes : avaliacoes.filter(a => a.status === filtroStatus);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-cormorant text-3xl text-fiorella-gold">Avaliações</h1>
        <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value as any)} className="input-field w-48">
          <option value="pendente">Pendentes</option>
          <option value="aprovada">Aprovadas</option>
          <option value="rejeitada">Rejeitadas</option>
          <option value="todas">Todas</option>
        </select>
      </div>

      <div className="space-y-4">
        {listaFiltrada.map(a => (
          <div key={a.id} className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-4">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-3">
              <div>
                <p className="text-white font-medium">{nomeProduto(a.produtoId)}</p>
                <p className="text-xs text-[#888]">{a.nomeCliente} — {a.dataCriacao ? new Date(a.dataCriacao).toLocaleString('pt-BR') : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-sm ${STATUS_STYLE[a.status]}`}>
                  {STATUS_LABEL[a.status] || a.status}
                </span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star key={n} size={14} className={n <= a.nota ? 'fill-fiorella-gold text-fiorella-gold' : 'text-[#555]'} />
                  ))}
                </div>
              </div>
            </div>

            <p className="text-sm text-[#ccc] mb-2">{a.comentario}</p>
            <div className="flex flex-wrap gap-x-4 text-xs text-[#888] mb-3">
              {a.tamanhoComprado && <span>Tamanho: {a.tamanhoComprado}</span>}
              {a.recomendaTamanho && <span>Recomendação: {a.recomendaTamanho}</span>}
            </div>

            {a.fotoCliente && (
              <div className="mb-3">
                <img src={a.fotoCliente} alt={`Foto de ${a.nomeCliente}`} className="w-24 h-24 object-cover rounded-sm border border-[#333]" />
                {!a.consentimentoFoto && (
                  <p className="text-xs text-red-400 mt-1">⚠ Sem registro de consentimento para esta foto.</p>
                )}
              </div>
            )}

            {a.status === 'pendente' && (
              <div className="flex gap-3">
                <button onClick={() => moderar(a.id, 'aprovada')} className="flex items-center gap-1 px-3 py-1.5 bg-green-900/50 text-green-300 text-sm rounded-sm hover:bg-green-900">
                  <Check size={14} /> Aprovar
                </button>
                <button onClick={() => moderar(a.id, 'rejeitada')} className="flex items-center gap-1 px-3 py-1.5 bg-red-900/50 text-red-300 text-sm rounded-sm hover:bg-red-900">
                  <X size={14} /> Rejeitar
                </button>
              </div>
            )}
          </div>
        ))}

        {listaFiltrada.length === 0 && (
          <div className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-8 text-center text-[#666]">
            Nenhuma avaliação encontrada.
          </div>
        )}
      </div>
    </div>
  );
};
