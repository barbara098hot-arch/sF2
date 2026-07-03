import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getConfig, getProdutos } from '../services/firebaseService';
import { getStorage } from '../utils/localStorage';

const defaultHomeBanners = {
  lingerie: 'https://images.unsplash.com/photo-1582042125584-3c8c6f116dc2?q=80&w=800&auto=format&fit=crop',
  linhaSensual: 'https://images.unsplash.com/photo-1629853381488-81f1d1fc5521?q=80&w=800&auto=format&fit=crop'
};

export const Home = () => {
  const [destaques, setDestaques] = useState<Array<any>>([]);
  const [homeBanners, setHomeBanners] = useState(defaultHomeBanners);



  useEffect(() => {
    const load = async () => {
      // banners vêm primeiro do Firestore/config, que é compartilhado com o site publicado.
      // localStorage fica apenas como fallback para configurações antigas no mesmo navegador.
      const [configFromDb, produtosFromDb] = await Promise.all([
        getConfig() as Promise<any>,
        getProdutos() as Promise<any[]>
      ]);
      const localConfig = getStorage<any>('fiorella_config', null);
      const cfgBanners = configFromDb?.homeBanners || localConfig?.homeBanners;

      if (cfgBanners?.lingerie || cfgBanners?.linhaSensual) {
        setHomeBanners({
          lingerie: cfgBanners.lingerie || defaultHomeBanners.lingerie,
          linhaSensual: cfgBanners.linhaSensual || defaultHomeBanners.linhaSensual
        });
      }

      setDestaques(
        (produtosFromDb as any[]).filter((p: any) => p.ativo && p.destaque).slice(0, 4)
      );
    };

    load();
  }, []);



  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-fiorella-black overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615893392416-8360d84a75be?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-fiorella-black to-transparent"></div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-[fadeIn_1.5s_ease-out]">
          <h1 className="font-cormorant text-5xl md:text-7xl mb-6 text-fiorella-light-cream leading-tight">
            Desperte o que há de <br/><span className="text-fiorella-gold italic">mais íntimo</span> em você
          </h1>
          <p className="font-jost text-fiorella-light-cream/80 text-lg mb-10 max-w-xl mx-auto font-light">
            Lingeries e produtos exclusivos para momentos inesquecíveis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/catalogo" className="btn-primary w-full sm:w-auto">
              Ver Coleção
            </Link>
            <Link to="/sobre" className="btn-secondary w-full sm:w-auto">
              Conheça a Fiorella
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section className="py-20 bg-fiorella-black-light px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-cormorant text-fiorella-gold mb-4">Coleção Exclusiva</h2>
              <div className="h-[1px] w-24 bg-fiorella-gold mx-auto opacity-50"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {destaques.map(produto => (
                <div key={produto.id} className="card group overflow-hidden">
                  <Link to={`/produto/${produto.id}`} className="block relative aspect-[3/4] overflow-hidden">
                    <img src={produto.imagemPrincipal || 'https://via.placeholder.com/400x500'} alt={produto.nome} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                    {produto.precoPromocional && (
                      <span className="absolute top-4 left-4 bg-fiorella-red text-white text-[10px] px-2 py-1 font-bold tracking-wider uppercase">Oferta</span>
                    )}
                  </Link>
                  <div className="p-4 text-center">
                    <h3 className="font-jost font-light text-lg mb-2 text-fiorella-light-cream truncate">{produto.nome}</h3>
                    <div className="flex justify-center items-baseline gap-2">
                      {produto.precoPromocional ? (
                        <>
                          <span className="text-sm text-gray-500 line-through">R$ {Number(produto.preco).toFixed(2)}</span>
                          <span className="text-fiorella-gold font-medium">R$ {Number(produto.precoPromocional).toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-fiorella-gold font-medium">R$ {Number(produto.preco).toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/catalogo" className="inline-block border-b border-fiorella-gold text-fiorella-gold pb-1 hover:text-fiorella-light-cream hover:border-fiorella-light-cream transition-colors uppercase tracking-widest text-sm">
                Ver todos os produtos
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categorias */}
      <section className="py-20 bg-fiorella-black px-4">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/catalogo?cat=Lingerie" className="relative h-[400px] overflow-hidden group">
              <img src={homeBanners.lingerie} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" alt="Lingerie" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="font-cormorant text-4xl text-fiorella-light-cream mb-2">Lingerie</h3>
                <span className="text-fiorella-gold text-sm tracking-[4px] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explorar</span>
              </div>
            </Link>
            <Link to="/catalogo?cat=Produto%20Erótico" className="relative h-[400px] overflow-hidden group">
              <img src={homeBanners.linhaSensual} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500" alt="Produtos Eróticos" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h3 className="font-cormorant text-4xl text-fiorella-light-cream mb-2">Linha Sensual</h3>
                <span className="text-fiorella-gold text-sm tracking-[4px] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300">Explorar</span>
              </div>
            </Link>
         </div>
      </section>
    </div>
  );
};
