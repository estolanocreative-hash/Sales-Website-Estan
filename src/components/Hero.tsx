import { ArrowDown } from 'lucide-react'

export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero__inner">
        <p className="eyebrow">Tagline to be provided</p>
        <h1 className="hero__title">
          <span className="hero__line">Cognex</span>
          <span className="hero__line hero__line--accent">Storefront</span>
        </h1>
        <p className="hero__lede">
          Business description to be provided. Physical products, digital products,
          and services will appear here once the business supplies its catalog.
        </p>
        <a href="#shop" className="btn btn--primary">
          SHOP NOW <ArrowDown size={18} aria-hidden="true" />
        </a>
      </div>
      <div className="hero__visual" aria-hidden="true">
        <img src="/assets/logo-placeholder.webp" alt="" />
      </div>
    </section>
  )
}
