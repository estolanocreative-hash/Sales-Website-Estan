import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'
import { AdminGuard } from './AdminGuard'
import './admin.css'

export const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products & categories' },
  { to: '/admin/inventory', label: 'Inventory' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/customers', label: 'Customers' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/digital', label: 'Digital products' },
  { to: '/admin/bookings', label: 'Services & bookings' },
  { to: '/admin/content', label: 'Website content' },
  { to: '/admin/reports', label: 'Reports' },
  { to: '/admin/activity', label: 'Activity log' },
  { to: '/admin/administrators', label: 'Administrators' },
  { to: '/admin/settings', label: 'Business settings' },
]

type Theme = 'light' | 'dark'
const THEME_KEY = 'cognex-admin-theme'

function initialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY)
  return saved === 'dark' ? 'dark' : 'light'
}

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Storage unavailable: the choice applies for this visit only.
    }
  }, [theme])

  return (
    <div className="admin" data-theme={theme} data-collapsed={collapsed}>
      <AdminGuard>
        <div className="admin__shell">
          <aside className="admin__sidebar" aria-label="Admin navigation">
            <div className="admin__brand">{collapsed ? 'C' : 'Cognex Admin'}</div>
            <nav>
              <ul>
                {ADMIN_NAV.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} end={item.end} title={item.label}>
                      {collapsed ? item.label.charAt(0) : item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="admin__tools">
              <button
                type="button"
                className="admin__tool"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
                {!collapsed && <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>}
              </button>
              <button
                type="button"
                className="admin__tool"
                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
                {!collapsed && <span>Collapse</span>}
              </button>
            </div>
          </aside>
          <main className="admin__main">
            <Outlet />
          </main>
        </div>
      </AdminGuard>
    </div>
  )
}
