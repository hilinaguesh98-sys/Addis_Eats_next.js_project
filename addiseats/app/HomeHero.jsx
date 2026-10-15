import Image from 'next/image'
import HomeSearch from './HomeSearch'

export default function HomeHero() {
  return <section className="hero">
    <Image src="/hero.png" alt="Traditional Ethiopian dishes served on injera" fill priority sizes="100vw" className="hero-image"/>
    <div className="hero-overlay">
      <div className="container hero-content">
        <div className="hero-copy-block">
          <h1>Hungry? We've<br/>got you covered.</h1>
          <p className="hero-copy">Delicious Ethiopian and international dishes from your favorite local<br className="desktop-break"/> restaurants straight to your door.</p>
        </div>
        <HomeSearch />
      </div>
    </div>
  </section>
}
