import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import FoodList from './pages/FoodList';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Reviews from './pages/Reviews';
import Offers from './pages/Offers';
import Support from './pages/Support';

// Placeholder pages for user features
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminDashboard from './pages/AdminDashboard';
import EmailCampaign from './pages/EmailCampaign';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import FoodDetail from './pages/FoodDetail';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import Unsubscribe from './pages/Unsubscribe';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<FoodList />} />
                <Route path="/food/:id" element={<FoodDetail />} />
                <Route path="/foods" element={<Navigate to="/menu" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/support" element={<Support />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
                
                {/* Payment Routes */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/failure" element={<PaymentFailure />} />
                
                {/* Email Routes */}
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/email-campaign" element={<EmailCampaign />} />
              </Routes>
            </main>
            <Footer />
          </div>
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}
