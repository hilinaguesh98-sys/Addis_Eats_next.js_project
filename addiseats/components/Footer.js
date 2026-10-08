import Link from 'next/link'

export default function Footer() {
  return <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand"><Link href="/" className="footer-logo">Addis<span>Eats</span></Link><p>Bringing the rich, authentic flavors of<br/>Ethiopian cuisine to your doorstep.<br/>Order from local restaurants and enjoy<br/>the best meals in Addis Ababa.</p></div>
      <div><h4>DISCOVER</h4><Link href="/menu">Popular Food</Link><Link href="/menu">Traditional Foods</Link><Link href="/favorites">Saved Favorites</Link><Link href="/menu">Special Offers</Link></div>
      <div><h4>GET HELP</h4><Link href="/orders">Contact Support</Link><Link href="/orders">Delivery Areas</Link><Link href="/orders">Refund Policy</Link></div>
    </div>
    <div className="footer-bottom"><span>© 2024 Addis Eats. All rights reserved.</span><span>f &nbsp; ◎ &nbsp; in</span></div>
  </footer>
}
