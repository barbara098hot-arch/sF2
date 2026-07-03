import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addAvaliacao } from '../services/firebaseService';
import { uploadFileToStorage } from '../services/storageService';
import { getStorage } from '../utils/localStorage';
import type { RecomendaTamanho } from '../types/compatibilidade';

interface Props {
  produtoId: string;
  onEnviada: () => void;
}

// Procura no histórico local de pedidos o tamanho que a cliente comprou
// deste produto, só pra pré-preencher o campo (ela pode ajustar à mão).
function buscarTamanhoComprado(emailCliente: string | undefined, produtoId: string): string {
  if (!emailCliente) return '';
  const pedidos = getStorage<any[]>('fiorella_pedidos', []);
  for (const pedido of pedidos) {
    if (pedido?.cliente?.email !== emailCliente) continue;
    const item = (pedido.itens || []).find((i: any) => i.produtoId === produtoId);
    if (item?.tamanhoSelecionado) return item.tamanhoSelecionado;
  }
  return '';
}

export const ReviewForm = ({ produtoId, onEnviada }: Props) => {
  const { user } = useAuth();
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const [tamanhoComprado, setTamanhoComprado] = useState(() => buscarTamanhoComprado(user?.email, produtoId));
  const [recomendaTamanho, setRecomendaTamanho] = useState<RecomendaTamanho>('normal');
  const [consentimentoFoto, setConsentimentoFoto] = useState(false);
  const [foto, setFoto] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  if (!user) {
    return (
      <p className="text-sm text-[#aaa]">
        <Link to="/login" className="text-fiorella-gold underline underline-offset-2 hover:text-white">Faça login</Link> para avaliar este produto.
      </p>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (nota < 1) {
      setErro('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!comentario.trim()) {
      setErro('Escreva um comentário.');
      return;
    }
    // A foto só é aceita com o consentimento marcado — checagem redundante
    // à desabilitação do campo, pra nunca pular essa etapa mesmo se o
    // input for manipulado de outra forma.
    if (foto && !consentimentoFoto) {
      setErro('Marque o consentimento de uso da imagem para enviar uma foto.');
      return;
    }

    setEnviando(true);
    try {
      // Firestore rejeita campos com valor `undefined` (precisa ser `null`
      // ou a chave omitida) — usamos `null` quando não há foto.
      let fotoCliente: string | null = null;
      if (foto && consentimentoFoto) {
        fotoCliente = await uploadFileToStorage(foto);
      }

      // Avaliação com foto sempre entra pendente até moderação manual;
      // sem foto, publica direto. Essa regra não é opção do formulário.
      const status = fotoCliente ? 'pendente' : 'aprovada';

      // addAvaliacao segue o padrão do resto do firebaseService: engole o
      // erro internamente e retorna null em vez de lançar — por isso o
      // retorno precisa ser checado aqui, senão a UI comemora um envio
      // que não foi salvo.
      const id = await addAvaliacao({
        produtoId,
        usuarioId: user.id,
        nomeCliente: user.nome,
        nota,
        comentario: comentario.trim(),
        tamanhoComprado: tamanhoComprado.trim(),
        recomendaTamanho,
        fotoCliente,
        consentimentoFoto: !!fotoCliente && consentimentoFoto,
        status,
      });

      if (!id) {
        setErro('Não foi possível enviar sua avaliação. Tente novamente.');
        return;
      }

      setNota(0);
      setComentario('');
      setFoto(null);
      setConsentimentoFoto(false);
      onEnviada();
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      setErro('Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-fiorella-black-lightest border border-[#333] rounded-sm p-6 space-y-4">
      <h4 className="font-cormorant text-xl text-fiorella-gold">Avaliar este produto</h4>

      {erro && <p className="text-sm text-compat-nao-serve">{erro}</p>}

      <div>
        <label className="block text-sm text-white mb-2">Nota</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => setNota(n)} aria-label={`${n} estrela(s)`}>
              <Star size={22} className={n <= nota ? 'fill-fiorella-gold text-fiorella-gold' : 'text-[#555]'} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm text-white mb-1">Comentário</label>
        <textarea value={comentario} onChange={e => setComentario(e.target.value)} className="input-field h-24" placeholder="Conte como foi sua experiência com o produto..." />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white mb-1">Tamanho que comprou</label>
          <input type="text" value={tamanhoComprado} onChange={e => setTamanhoComprado(e.target.value)} className="input-field" placeholder="Ex: M, 42B..." />
        </div>
        <div>
          <label className="block text-sm text-white mb-1">Como o tamanho veio</label>
          <select value={recomendaTamanho} onChange={e => setRecomendaTamanho(e.target.value as RecomendaTamanho)} className="input-field">
            <option value="normal">Comprei do meu tamanho normal</option>
            <option value="acima">Comprei um tamanho acima</option>
            <option value="abaixo">Comprei um tamanho abaixo</option>
          </select>
        </div>
      </div>

      <div className="border-t border-[#333] pt-4">
        <label className="flex items-start gap-2 text-xs text-[#aaa] mb-2">
          <input type="checkbox" checked={consentimentoFoto} onChange={e => setConsentimentoFoto(e.target.checked)} className="mt-0.5 accent-fiorella-gold" />
          Autorizo o uso da minha foto nesta avaliação (opcional — só marque se for enviar uma foto).
        </label>
        <input
          type="file"
          accept="image/*"
          disabled={!consentimentoFoto}
          onChange={e => setFoto(e.target.files?.[0] || null)}
          className="input-field disabled:opacity-40 disabled:cursor-not-allowed"
        />
        {!consentimentoFoto && <p className="text-xs text-[#666] mt-1">Marque o consentimento acima para poder anexar uma foto.</p>}
      </div>

      <button type="submit" disabled={enviando} className={`btn-primary ${enviando ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {enviando ? 'Enviando...' : 'Enviar Avaliação'}
      </button>
    </form>
  );
};
