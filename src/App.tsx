import { useEffect } from 'react'
import { Nav } from './components/Nav'
import { Hero } from './components/Hero'
import { Shop } from './components/Shop'
import { Section, PendingContent } from './components/Section'
import { CartDrawer } from './components/CartDrawer'
import { CartProvider } from './cart/CartContext'
import './App.css'
import './components/cart.css'

function App() {
  return (
    <CartProvider>
      <Storefront />
      <CartDrawer />
    </CartProvider>
  )
}

function Storefront() {
  // Scroll-triggered reveals. Elements with .reveal fade in once they enter the viewport.
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal')
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <a href="#shop" className="skip-link">
        Skip to shop
      </a>
      <Nav />
      <main>
        <Hero />

        <div className="reveal">
          <Section id="featured" eyebrow="Featured" title="Featured offerings">
            <PendingContent what="Featured offerings" />
          </Section>
        </div>

        <div className="reveal">
          <Shop />
        </div>

        <div className="reveal">
          <Section id="about" eyebrow="About" title="About the business">
            <PendingContent what="About the business" />
          </Section>
        </div>

        <div className="reveal">
          <Section id="why" eyebrow="Why us" title="Why choose us" tone="dark">
            <PendingContent what="Why choose us" />
          </Section>
        </div>

        <div className="reveal">
          <Section id="faq" eyebrow="FAQ" title="Frequently asked questions">
            <PendingContent what="FAQ entries" />
          </Section>
        </div>

        <div className="reveal">
          <Section id="contact" eyebrow="Contact" title="Get in touch">
            <PendingContent what="Business contact details" />
          </Section>
        </div>
      </main>

      <footer className="footer">
        <p>© Cognex. Business details to be provided.</p>
      </footer>
    </>
  )
}

export default App
