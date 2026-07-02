import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStorage, setStorage } from '../utils/localStorage';

export interface CartItem {
  id: string; // unique ID for cart item
  produtoId: string;
  nome: string;
  imagem: string;
  preco: number;
  corSelecionada?: string;
  tamanhoSelecionado?: string;
  saborSelecionado?: string;
  varianteId?: string; // id da variante especifica (cor+tamanho+estoque)
  quantidade: number;
  estoqueDisponivel: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = getStorage<CartItem[]>('fiorella_carrinho', []);
    setCart(savedCart);
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    setStorage('fiorella_carrinho', newCart);
  };

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    const existingIndex = cart.findIndex(c =>
      c.produtoId === item.produtoId &&
      c.corSelecionada === item.corSelecionada &&
      c.tamanhoSelecionado === item.tamanhoSelecionado &&
      c.saborSelecionado === item.saborSelecionado &&
      c.varianteId === item.varianteId
    );

    const newCart = [...cart];
    if (existingIndex >= 0) {
      const newQty = newCart[existingIndex].quantidade + item.quantidade;
      newCart[existingIndex].quantidade = newQty > item.estoqueDisponivel ? item.estoqueDisponivel : newQty;
    } else {
      newCart.push({ ...item, id: Math.random().toString(36).substring(7) });
    }
    saveCart(newCart);
  };

  const removeFromCart = (id: string) => {
    const newCart = cart.filter(item => item.id !== id);
    saveCart(newCart);
  };

  const updateQuantity = (id: string, quantity: number) => {
    const newCart = cart.map(item => {
      if (item.id === id) {
        return { ...item, quantidade: quantity > item.estoqueDisponivel ? item.estoqueDisponivel : quantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantidade, 0);
  const cartTotal = cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
