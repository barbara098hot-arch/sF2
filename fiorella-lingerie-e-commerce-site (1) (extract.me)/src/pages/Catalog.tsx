import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStorage } from '../utils/localStorage';
import { Search, SlidersHorizontal } from 'lucide-react';

export const Catalog = () => {
  const [searchParams] = useSearchParams();
  const initialCat = searchParams.get('cat') || '';
  
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState(initialCat);
  const [ordenacao, setOrdenacao] = useState('recentes');

  useEffect(() => {
    const all = getStorage<any[]>('fiorella_produtos', []).filter(p => p.ativo);
    setProdutos(all);
  }, []);

  useEffect(() => {
    let result = [...produtos];

    if (search) {
      result = result.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()));
    }
    if (categoria) {
      result = result.filter(p => p.categoria === categoria);
    }

    if (ordenacao === 'menor') {
      result.sort((a, b) => (a.precoPromocional || a.preco) - (b.precoPromocional || b.preco));
    } else if (ordenacao === 'maior') {
      result.sort((a, b) => (b.precoPromocional || b.preco) - (a.precoPromocional || a.preco));
    } else if (ordenacao === 'destaque') {
      result.sort((a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0));
    }

    setFiltered(result);
  }, [produtos, search, categoria, ordenacao]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-cormorant text-4xl md:text-5xl text-fiorella-gold text-center mb-12">Catálogo Exclusivo</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3 text-[#666]" size={20} />
          <input 
            type="text" 
            placeholder="Buscar produtos..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-12 py-3"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-3 text-[#666]" size={20} />
            <select 
              value={categoria} 
              onChange={e => setCategoria(e.target.value)}
              className="input-field pl-12 py-3 appearance-none w-48"
            >
              <option value="">Todas Categorias</option>
              <option value="Lingerie">Lingerie</option>
              <option value="Roupa">Roupa</option>
              <option value="Produto Erótico">Linha Sensual</option>
              <option value="Acessório">Acessórios</option>
            </select>
          </div>
          <select 
            value={ordenacao} 
            onChange={e => setOrdenacao(e.target.value)}
            className="input-field py-3 appearance-none w-48"
          >
            <option value="recentes">Mais Recentes</option>
            <option value="menor">Menor Preço</option>
            <option value="maior">Maior Preço</option>
            <option value="destaque">Destaques</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(produto => (
          <div key={produto.id} className="card group overflow-hidden flex flex-col h-full">
            <Link to={`/produto/${produto.id}`} className="block relative aspect-[3/4] overflow-hidden">
              <img src={produto.imagemPrincipal || 'https://via.placeholder.com/400x500'} alt={produto.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
              {produto.precoPromocional && (
                <span className="absolute top-4 left-4 bg-fiorella-red text-white text-[10px] px-2 py-1 font-bold tracking-wider uppercase">Oferta</span>
              )}
              {produto.estoque === 0 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="bg-[#111] text-white border border-[#333] px-4 py-2 uppercase tracking-widest text-sm">Esgotado</span>
                </div>
              )}
            </Link>
            <div className="p-5 flex-1 flex flex-col">
              <Link to={`/produto/${produto.id}`}>
                <h3 className="font-jost font-light text-lg mb-2 text-fiorella-light-cream truncate hover:text-fiorella-gold transition-colors">{produto.nome}</h3>
              </Link>
              <p className="text-xs text-[#666] mb-4 truncate">{produto.descricaoCurta}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <div className="flex flex-col">
                  {produto.precoPromocional ? (
                    <>
                      <span className="text-xs text-[#666] line-through">R$ {produto.preco.toFixed(2)}</span>
                      <span className="text-fiorella-gold font-medium text-lg">R$ {produto.precoPromocional.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-fiorella-gold font-medium text-lg">R$ {produto.preco.toFixed(2)}</span>
                  )}
                </div>
                <Link to={`/produto/${produto.id}`} className="text-sm uppercase tracking-wider border-b border-fiorella-gold text-fiorella-gold hover:text-white hover:border-white transition-colors">
                  Ver Mais
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-[#aaa]">
          <p>Nenhum produto encontrado com os filtros atuais.</p>
          <button onClick={() => {setSearch(''); setCategoria('');}} className="mt-4 text-fiorella-gold underline">Limpar filtros</button>
        </div>
      )}
    </div>
  );
};
