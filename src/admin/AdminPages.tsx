import { ADMIN_NAV } from './AdminLayout'

/** Real pages come with the database. Until then each section says what it will show, and shows no numbers. */
function Pending({ title, description }: { title: string; description: string }) {
  return (
    <section className="admin-page">
      <h1>{title}</h1>
      <p className="admin-page__desc">{description}</p>
      <div className="admin-empty">
        <p>Not connected yet. This section will show live data once the database is set up.</p>
      </div>
    </section>
  )
}

const descriptions: Record<string, string> = {
  '/admin/products': 'Manage products, categories, variations, and SKUs.',
  '/admin/inventory': 'Stock levels, manual adjustments, low-stock alerts, and inventory history.',
  '/admin/orders': 'Order list, order details, and fulfillment status.',
  '/admin/customers': 'Customer accounts and their order history.',
  '/admin/payments': 'Payment records, verified confirmations, and refund status.',
  '/admin/digital': 'Digital files, secure delivery rules, and download access.',
  '/admin/bookings': 'Service requests, booking dates, and booking status.',
  '/admin/content': 'Edit approved website text and images.',
  '/admin/reports': 'Sales by day, week, month, and year, with exports.',
  '/admin/activity': 'Audit trail of administrator actions. Read-only for most roles.',
  '/admin/administrators': 'Invite administrators and assign roles. Owner only.',
  '/admin/settings': 'Business settings. Owner only.',
}

export function AdminOverview() {
  const cards = ['Total revenue', 'Total orders', 'Customers', 'Pending tasks']
  return (
    <section className="admin-page">
      <h1>Overview</h1>
      <p className="admin-page__desc">Business summary from the database.</p>
      <ul className="admin-cards">
        {cards.map((label) => (
          <li key={label} className="admin-card">
            <span>{label}</span>
            <strong aria-label="No data yet">—</strong>
          </li>
        ))}
      </ul>
      <div className="admin-empty">
        <p>No figures are shown because no data is connected yet. Nothing is estimated or invented.</p>
      </div>
    </section>
  )
}

export function AdminSection({ path }: { path: string }) {
  const item = ADMIN_NAV.find((n) => n.to === path)
  return <Pending title={item?.label ?? 'Admin'} description={descriptions[path] ?? ''} />
}
