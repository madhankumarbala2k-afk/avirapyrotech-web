import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Admin panel pages & components — lazy loaded for performance
import Layout from './components/Layout';
const Login       = lazy(() => import('./pages/Login'));
const Dashboard   = lazy(() => import('./pages/Dashboard'));
const Products    = lazy(() => import('./pages/Products'));
const Categories  = lazy(() => import('./pages/Categories'));
const Banners     = lazy(() => import('./pages/Banners'));
const Orders      = lazy(() => import('./pages/Orders'));
const Settings    = lazy(() => import('./pages/Settings'));

// Customer website pages & components — lazy loaded for performance
import CustomerLayout from './components/customer/CustomerLayout';
const Home          = lazy(() => import('./pages/customer/Home'));
const ProductList   = lazy(() => import('./pages/customer/ProductList'));
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'));
const Cart          = lazy(() => import('./pages/customer/Cart'));
const Checkout      = lazy(() => import('./pages/customer/Checkout'));
const OrderSuccess  = lazy(() => import('./pages/customer/OrderSuccess'));
const About         = lazy(() => import('./pages/customer/About'));
const Contact       = lazy(() => import('./pages/customer/Contact'));

// Full-page loading spinner shown while lazy chunks are being fetched
function PageLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#0f0f0f'
    }}>
      <div style={{
        width: 48, height: 48,
        border: '4px solid #ff6b00',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// Admin Protected Route security guard
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

// Customer Layout Wrapper to avoid redundancy
function CustomerRoute({ children }) {
  return <CustomerLayout>{children}</CustomerLayout>;
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        
        {/* ========================================== */}
        {/* PUBLIC CUSTOMER WEBSITE ROUTES             */}
        {/* ========================================== */}
        <Route path="/" element={<CustomerRoute><Home /></CustomerRoute>} />
        <Route path="/products" element={<CustomerRoute><ProductList /></CustomerRoute>} />
        <Route path="/product/:id" element={<CustomerRoute><ProductDetail /></CustomerRoute>} />
        <Route path="/cart" element={<CustomerRoute><Cart /></CustomerRoute>} />
        <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
        <Route path="/order-success" element={<CustomerRoute><OrderSuccess /></CustomerRoute>} />
        <Route path="/about" element={<CustomerRoute><About /></CustomerRoute>} />
        <Route path="/contact" element={<CustomerRoute><Contact /></CustomerRoute>} />

        {/* ========================================== */}
        {/* ADMIN SECURITY & CONTROL PANEL ROUTES      */}
        {/* ========================================== */}
        <Route path="/admin/login" element={<Login />} />
        
        {/* Secure Admin Pages */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <Products />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <ProtectedRoute>
              <Banners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/shop-settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/website-settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* ========================================== */}
        {/* FALLBACK & REDIRECT ROUTES                 */}
        {/* ========================================== */}
        {/* Legacy redirect for old logins */}
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        
        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
