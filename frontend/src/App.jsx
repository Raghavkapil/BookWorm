import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import WritersPage from './pages/WritersPage';
import CheckoutAddressPage from './pages/CheckoutAddressPage';
import CheckoutPaymentPage from './pages/CheckoutPaymentPage';
import PaymentResultPage from './pages/PaymentResultPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './features/auth/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="wishlist" element={<WishlistPage />} />
        <Route path="writers" element={<WritersPage />} />
        <Route path="products/:id" element={<ProductDetailsPage />} />
        <Route path="categories/:slug" element={<CategoryPage />} />
        <Route path="brands/:slug" element={<BrandPage />} />
        <Route path="cart" element={<CartPage />} />

        {/* Protected Checkout & User routes */}
        <Route
          path="checkout/address"
          element={
            <ProtectedRoute>
              <CheckoutAddressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout/payment"
          element={
            <ProtectedRoute>
              <CheckoutPaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="payment/result"
          element={
            <ProtectedRoute>
              <PaymentResultPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id/confirmation"
          element={
            <ProtectedRoute>
              <OrderConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrderHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Auth routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
