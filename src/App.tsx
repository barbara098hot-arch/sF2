// Temporary module declaration to silence missing type declarations for react-router-dom
// Remove this when @types/react-router-dom is installed or react-router-dom provides its own types
declare module 'react-router-dom';

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { initializeData } from './utils/initData';

import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';

import { Home } from './pages/Home';
import { Catalog } from './pages/Catalog';
import { Product } from './pages/Product';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';

function App() {
  useEffect(() => {
    initializeData();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="produto/:id" element={<Product />} />
              <Route path="carrinho" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="login" element={<Login />} />
              <Route path="perfil" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produtos" element={<AdminProducts />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="pagamentos" element={<AdminPayments />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
