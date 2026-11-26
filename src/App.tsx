import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Nav } from './components/Nav'
import { CartDrawer } from './components/CartDrawer'
import { CartProvider } from './cart/CartContext'
import { AuthProvider } from './auth/AuthContext'
import { StorefrontPage } from './pages/StorefrontPage'
import { AccountPage } from './pages/AccountPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from './pages/AuthPages'
import './App.css'
import './components/cart.css'
import './auth/auth.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <a href="#shop" className="skip-link">
            Skip to shop
          </a>
          <Nav />
          <Routes>
            <Route path="/" element={<StorefrontPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="*" element={<StorefrontPage />} />
          </Routes>
          <CartDrawer />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
