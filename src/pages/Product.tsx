import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProdutos } from '../services/firebaseService';
import { getWhatsAppNumber } from '../utils/contact';
import { useCart } from '../context/CartContext';
import { ShoppingBag, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
export const Product = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState<any>(null);
  const [cor, setCor] = useState('');
  const [tamanho, setTamanho] = useState('');
  const [sabor, setSabor] = useState('');
  const [qtd, setQtd] = useState(1);
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
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
  if (!produto) return <div className="text-center py-20">Produto nÃo encontrado.</div>;


  if (!produto) return <div className="text-center py-20">Produto não encontrado.</div>;
  const handleAddToCart = () => {
    addToCart({
      produtoId: produto.id,
      nome: produto.nome,
      imagem: produto.imagemPrincipal,
      preco: produto.precoPromocional || produto.preco,
      corSelecionada: cor,
      tamanhoSelecionado: tamanho,
      saborSelecionado: sabor,
      quantidade: qtd,
      estoqueDisponivel: produto.estoque
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
                  aria-label="Pr\u00f3xima foto"
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

          {produto.tamanhos?.length > 0 && (
            <div className="mb-6">
              <span className="block text-sm text-white mb-3 uppercase tracking-wider">Tamanho: <span className="text-[#aaa]">{tamanho}</span></span>
              <div className="flex flex-wrap gap-3">
                {produto.tamanhos.map((t: string) => (
                  <button key={t} onClick={() => setTamanho(t)} className={`w-12 h-12 flex items-center justify-center text-sm border transition-colors ${tamanho === t ? 'border-fiorella-red bg-fiorella-red/10 text-white' : 'border-[#333] text-[#aaa] hover:border-fiorella-gold'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
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
            {produto.estoque > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-[#333] h-[50px] w-32">
                  <button onClick={() => setQtd(Math.max(1, qtd - 1))} className="flex-1 text-[#aaa] hover:text-white">-</button>
                  <span className="flex-1 text-center text-white">{qtd}</span>
                  <button onClick={() => setQtd(Math.min(produto.estoque, qtd + 1))} className="flex-1 text-[#aaa] hover:text-white">+</button>
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
    </div>
  );
};
