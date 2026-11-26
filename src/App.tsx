import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { AdminLayout, ADMIN_NAV } from './admin/AdminLayout'
import { AdminOverview, AdminSection } from './admin/AdminPages'
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

/** Public storefront chrome: skip link, navigation, cart drawer. Not used by the private admin area. */
function PublicLayout() {
  return (
    <>
      <a href="#shop" className="skip-link">
        Skip to shop
      </a>
      <Nav />
      <Outlet />
      <CartDrawer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<StorefrontPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="*" element={<StorefrontPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              {ADMIN_NAV.filter((item) => !item.end).map((item) => (
                <Route
                  key={item.to}
                  path={item.to.replace('/admin/', '')}
                  element={<AdminSection path={item.to} />}
                />
              ))}
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
