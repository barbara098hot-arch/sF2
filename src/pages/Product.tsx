import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProdutos, getAvaliacoesPorProduto } from '../services/firebaseService';
import { getWhatsAppNumber } from '../utils/contact';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getTamanhosPorCor, encontrarVariante, getEstoqueVariante } from '../utils/variants';
import { getMedidas } from '../utils/medidas';
import { verificarCompatibilidade, produtoTemCompatibilidadeDeTamanho, jaComprouProduto } from '../utils/compatibilidade';
import { SeloCompatibilidade } from '../components/SeloCompatibilidade';
import { BannerCadastrarMedidas } from '../components/BannerCadastrarMedidas';
import { ModalComoCalculamos } from '../components/ModalComoCalculamos';
import { ReviewForm } from '../components/ReviewForm';
import { ReviewList } from '../components/ReviewList';
import type { Avaliacao } from '../types/compatibilidade';
import { ShoppingBag, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
export const Product = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [produto, setProduto] = useState<any>(null);
  const [cor, setCor] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [sabor, setSabor] = useState('');
  const [qtd, setQtd] = useState(1);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [modalCompatAberto, setModalCompatAberto] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  useEffect(() => {
    const load = async () => {
      const todos = (await getProdutos()) as any[];
      const p = todos.find((item: any) => item.id === id);
      if (p) {
        setProduto(p);
        if (p.cores?.length) setCor(p.cores[0]);
        if (p.tamanhos?.length) setTamanho(p.tamanhos[0]);
        if (p.sabores?.length) setSabor(p.sabores[0]);
      }
    };
    load();
    setActiveImageIndex(0);
  }, [id]);
  const carregarAvaliacoes = useCallback(() => {
    if (!id) return;
    getAvaliacoesPorProduto(id).then(setAvaliacoes);
  }, [id]);
  useEffect(() => {
    carregarAvaliacoes();
  }, [carregarAvaliacoes]);
  // Quando a cor muda, o tamanho selecionado pode não existir mais nessa
  // combinação (produto com variantes reais de cor+tamanho+estoque) — troca
  // pro primeiro tamanho disponível pra essa cor em vez de deixar um
  // tamanho inválido selecionado.
  useEffect(() => {
    if (!produto) return;
    const disponiveis = getTamanhosPorCor(produto, cor);
    if (disponiveis.length > 0 && !disponiveis.includes(tamanho)) {
      setTamanho(disponiveis[0]);
    }
  }, [produto, cor]);
  // Galeria: sempre calculada (hooks antes de qualquer return condicional)
  const galeria: string[] = useMemo(() => {
    if (!produto) return [];
    return [
      produto.imagemPrincipal,
      ...(Array.isArray(produto.imagensAdicionais) ? produto.imagensAdicionais : []),
    ].filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
  }, [produto]);
  const hasMultipleImages = galeria.length > 1;
  const currentImage = galeria[activeImageIndex] || galeria[0] || '';
  const nextImage = useCallback(() => {
    if (galeria.length <= 1) return;
    setActiveImageIndex((prev) => (prev + 1) % galeria.length);
  }, [galeria.length]);
  const prevImage = useCallback(() => {
    if (galeria.length <= 1) return;
    setActiveImageIndex((prev) => (prev - 1 + galeria.length) % galeria.length);
  }, [galeria.length]);
  // Suporte a swipe no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
      if (diff < 0) nextImage();
      else prevImage();
    }
    setTouchStartX(null);
  };
  if (!produto) return <div className="text-center py-20">Produto não encontrado.</div>;

  // Tamanhos exibidos e estoque consideram a combinação cor+tamanho quando
  // o produto tem variantes reais cadastradas (src/utils/variants.ts já
  // cobria isso, mas não era usado aqui); produtos sem variantes continuam
  // caindo no fallback de estoque total do próprio utilitário.
  const tamanhosDisponiveis = getTamanhosPorCor(produto, cor);
  const estoqueDaCombinacao = getEstoqueVariante(produto, cor, tamanho);
  const varianteSelecionada = encontrarVariante(produto, cor, tamanho);

  const medidas = user?.id ? getMedidas(user.id) : null;
  const precisaCompatibilidade = produtoTemCompatibilidadeDeTamanho(produto);
  const avaliacoesAprovadas = avaliacoes.filter(a => a.status === 'aprovada');
  const resultadoCompatibilidade = precisaCompatibilidade
    ? verificarCompatibilidade(medidas, produto, {
        jaComprou: jaComprouProduto(user?.email, produto.id),
        avaliacoesAprovadas,
      })
    : null;

  const handleAddToCart = () => {
    addToCart({
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.imagemPrincipal,
      preco: produto.precoPromocional || produto.preco,
      corSelecionada: cor,
      tamanhoSelecionado: tamanho,
      saborSelecionado: sabor,
      varianteId: varianteSelecionada?.varianteId,
      quantidade: qtd,
      estoqueDisponivel: estoqueDaCombinacao
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const whatsapp = getWhatsAppNumber();

  let zapMsg = `Olá! Tenho interesse no produto: ${produto.nome}`;
  if (cor) zapMsg += ` — Cor: ${cor}`;
  if (tamanho) zapMsg += ` — Tamanho: ${tamanho}`;
  if (sabor) zapMsg += ` — Sabor: ${sabor}`;
  zapMsg += `. Poderia me ajudar?`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/catalogo" className="inline-flex items-center text-[#aaa] hover:text-fiorella-gold mb-8 transition-colors text-sm uppercase tracking-wider">
        <ChevronLeft size={16} className="mr-1" /> Voltar ao Catálogo
      </Link>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="w-full md:w-1/2">
          <div
            className="relative aspect-[3/4] overflow-hidden rounded-[4px] border border-[#333] bg-[#111] select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img
              key={currentImage}
              src={currentImage || 'https://via.placeholder.com/600x800'}
              alt={`${produto.nome} - foto ${activeImageIndex + 1}`}
              className="w-full h-full object-cover transition-opacity duration-300"
              draggable={false}
            />
            {produto.precoPromocional && (
              <span className="absolute top-4 left-4 bg-fiorella-red text-white text-[10px] px-2 py-1 font-bold tracking-wider uppercase z-10">Oferta</span>
            )}
            {produto.estoque === 0 && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                <span className="bg-[#111] text-white border border-[#333] px-6 py-3 uppercase tracking-widest text-lg">Esgotado</span>
              </div>
            )}

            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  aria-label="Foto anterior"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-fiorella-red text-white p-2 rounded-full transition-colors"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  aria-label="Próxima foto"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-fiorella-red text-white p-2 rounded-full transition-colors"
                >
                  <ChevronRight size={22} />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 text-white text-xs px-3 py-1 rounded-full tracking-wider">
                  {activeImageIndex + 1} / {galeria.length}
                </div>
              </>
            )}
          </div>

          {hasMultipleImages && (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {galeria.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`Ver foto ${idx + 1}`}
                  className={`flex-shrink-0 w-20 h-24 rounded-sm overflow-hidden border-2 transition-colors ${
                    activeImageIndex === idx
                      ? 'border-fiorella-gold'
                      : 'border-transparent hover:border-[#555]'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2">
            <span className="text-fiorella-gold text-xs uppercase tracking-[4px]">{produto.categoria}</span>
          </div>
          <h1 className="font-cormorant text-4xl md:text-5xl text-white mb-4">{produto.nome}</h1>

          <div className="flex items-end gap-4 mb-8 pb-8 border-b border-[#333]">
            {produto.precoPromocional ? (
              <>
                <span className="text-xl text-[#666] line-through">R$ {produto.preco.toFixed(2)}</span>
                <span className="text-4xl text-fiorella-gold font-medium">R$ {produto.precoPromocional.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-4xl text-fiorella-gold font-medium">R$ {produto.preco.toFixed(2)}</span>
            )}
          </div>

          <p className="text-[#aaa] font-light leading-relaxed mb-8">{produto.descricaoLonga || produto.descricaoCurta}</p>

          {produto.cores?.length > 0 && (
            <div className="mb-6">
              <span className="block text-sm text-white mb-3 uppercase tracking-wider">Cor: <span className="text-[#aaa]">{cor}</span></span>
              <div className="flex flex-wrap gap-3">
                {produto.cores.map((c: string) => (
                  <button key={c} onClick={() => setCor(c)} className={`px-4 py-2 text-sm border transition-colors ${cor === c ? 'border-fiorella-red bg-fiorella-red/10 text-white' : 'border-[#333] text-[#aaa] hover:border-fiorella-gold'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tamanhosDisponiveis.length > 0 && (
            <div className="mb-6">
              <span className="block text-sm text-white mb-3 uppercase tracking-wider">Tamanho: <span className="text-[#aaa]">{tamanho}</span></span>
              <div className="flex flex-wrap gap-3">
                {tamanhosDisponiveis.map((t: string) => (
                  <button key={t} onClick={() => setTamanho(t)} className={`w-12 h-12 flex items-center justify-center text-sm border transition-colors ${tamanho === t ? 'border-fiorella-red bg-fiorella-red/10 text-white' : 'border-[#333] text-[#aaa] hover:border-fiorella-gold'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {precisaCompatibilidade && (
            medidas ? (
              resultadoCompatibilidade && (
                <SeloCompatibilidade resultado={resultadoCompatibilidade} onAbrirExplicacao={() => setModalCompatAberto(true)} />
              )
            ) : (
              <BannerCadastrarMedidas />
            )
          )}

          {produto.sabores?.length > 0 && (
            <div className="mb-6">
              <span className="block text-sm text-white mb-3 uppercase tracking-wider">Sabor: <span className="text-[#aaa]">{sabor}</span></span>
              <div className="flex flex-wrap gap-3">
                {produto.sabores.map((s: string) => (
                  <button key={s} onClick={() => setSabor(s)} className={`px-4 py-2 text-sm border transition-colors ${sabor === s ? 'border-fiorella-red bg-fiorella-red/10 text-white' : 'border-[#333] text-[#aaa] hover:border-fiorella-gold'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-8">
            {estoqueDaCombinacao > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-[#333] h-[50px] w-32">
                  <button onClick={() => setQtd(Math.max(1, qtd - 1))} className="flex-1 text-[#aaa] hover:text-white">-</button>
                  <span className="flex-1 text-center text-white">{qtd}</span>
                  <button onClick={() => setQtd(Math.min(estoqueDaCombinacao, qtd + 1))} className="flex-1 text-[#aaa] hover:text-white">+</button>
                </div>

                <button onClick={handleAddToCart} className="btn-primary flex-1 h-[50px]">
                  <ShoppingBag size={18} /> {added ? 'Adicionado!' : 'Adicionar ao Carrinho'}
                </button>
              </div>
            ) : (
              <button disabled className="w-full bg-[#333] text-[#888] h-[50px] uppercase tracking-widest text-sm font-bold cursor-not-allowed">
                Produto Esgotado
              </button>
            )}

            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(zapMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 btn-secondary w-full h-[50px] border-[#25D366]/50 text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]"
            >
              <MessageCircle size={18} /> Comprar via WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-12 border-t border-[#333] grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="font-cormorant text-2xl text-fiorella-gold mb-6">Avaliações</h3>
          <ReviewList avaliacoes={avaliacoesAprovadas} />
        </div>
        <div>
          <ReviewForm produtoId={produto.id} onEnviada={carregarAvaliacoes} />
        </div>
      </div>

      <ModalComoCalculamos aberto={modalCompatAberto} onFechar={() => setModalCompatAberto(false)} />
    </div>
  );
};
