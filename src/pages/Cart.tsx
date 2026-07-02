import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-[#333] mb-6" />
        <h1 className="font-cormorant text-4xl text-fiorella-gold mb-4">Seu Carrinho está vazio</h1>
        <p className="text-[#aaa] mb-8">Descubra nossa coleção e adicione produtos para momentos inesquecíveis.</p>
        <Link to="/catalogo" className="btn-primary inline-flex">
          Explorar Coleção
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-cormorant text-4xl text-fiorella-gold mb-10 border-b border-[#333] pb-6">Seu Carrinho</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        <div className="flex-1">
          {cart.map(item => (
            <div key={item.id} className="flex gap-6 py-6 border-b border-[#333]">
              <img src={item.imagem || 'https://via.placeholder.com/100x120'} alt={item.nome} className="w-24 h-32 object-cover border border-[#222]" />
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white text-lg font-medium">{item.nome}</h3>
                    <div className="text-sm text-[#aaa] mt-1 space-y-1">
                      {item.corSelecionada && <p>Cor: {item.corSelecionada}</p>}
                      {item.tamanhoSelecionado && <p>Tamanho: {item.tamanhoSelecionado}</p>}
                      {item.saborSelecionado && <p>Sabor: {item.saborSelecionado}</p>}
                      <p className="text-xs text-[#666]">Estoque disponível: {item.estoqueDisponivel}</p>
                    </div>
                  </div>
                  <p className="text-fiorella-gold font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center border border-[#333] h-[36px] w-24">
                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantidade - 1))} className="flex-1 text-[#aaa] hover:text-white">-</button>
                    <span className="flex-1 text-center text-white text-sm">{item.quantidade}</span>
                    <button onClick={() => updateQuantity(item.id, Math.min(item.estoqueDisponivel, item.quantidade + 1))} className="flex-1 text-[#aaa] hover:text-white">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-[#666] hover:text-fiorella-red transition-colors text-sm flex items-center gap-1">
                    <Trash2 size={16} /> Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-fiorella-black-lightest border border-[#333] p-8 rounded-sm sticky top-28">
            <h2 className="font-cormorant text-2xl text-white mb-6">Resumo do Pedido</h2>

            <div className="space-y-4 border-b border-[#333] pb-6 mb-6">
              <div className="flex justify-between text-[#aaa]">
                <span>Subtotal</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#aaa]">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-8">
              <span className="text-white text-lg">Total</span>
              <span className="text-2xl text-fiorella-gold font-medium">R$ {cartTotal.toFixed(2)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-4 text-sm">
              Finalizar Pedido <ArrowRight size={18} />
            </button>
            <Link to="/catalogo" className="block text-center mt-4 text-[#aaa] hover:text-fiorella-gold text-sm underline transition-colors">
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
