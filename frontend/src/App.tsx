import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import CollectionPage from './pages/CollectionPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import ShippingPage from './pages/ShippingPage';
import PaymentPage from './pages/PaymentPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import PrivateRoute from './components/auth/PrivateRoute';
import WelcomePopup from './components/WelcomePopup';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen w-full flex flex-col bg-white dark:bg-zinc-950">
        <Navbar />

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/collections/:gender" element={<CollectionPage />} />
            <Route path="/collections/:gender/:subcategory" element={<CollectionPage />} />
            <Route path="/men" element={<ProductListPage />} />
            <Route path="/women" element={<ProductListPage />} />
            <Route path="/accessories" element={<ProductListPage />} />
            <Route path="/search" element={<ProductListPage />} />
            <Route path="/new-arrivals" element={<ProductListPage />} />
            <Route path="/trending" element={<ProductListPage />} />
            <Route path="/sale" element={<ProductListPage />} />
            <Route path="/product/:id" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<LoginPage />} />
            <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
            <Route path="/shipping" element={<PrivateRoute><ShippingPage /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/placeorder" element={<PrivateRoute><PlaceOrderPage /></PrivateRoute>} />
            <Route path="/order/:id" element={<PrivateRoute><OrderSuccessPage /></PrivateRoute>} />
          </Routes>
        </main>

        <Footer />
        <WelcomePopup />
      </div>
    </Router>
  );
}

export default App;

