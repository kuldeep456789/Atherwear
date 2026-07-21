import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white font-sans w-full border-t border-zinc-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-6 py-14 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <Link to="/" className="inline-block">
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase">VASTRA</span>
          </Link>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-sm">
            Elevating everyday fashion with premium quality, modern design, and timeless Indian craftsmanship.
          </p>
        </div>

        {/* Shop Navigation */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Shop Collection</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <Link to="/collections/men" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Men's Collection
              </Link>
            </li>
            <li>
              <Link to="/collections/women" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Women's Collection
              </Link>
            </li>
          </ul>
        </div>

        {/* Support & Help */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Help & Support</h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <Link to="/track-order" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/returns" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Returns & Exchange
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Customer Support
              </Link>
            </li>
            <li>
              <Link to="/faq" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-0.5">
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Contact Us</h4>
          <ul className="space-y-3 text-xs">
            <li>
              <a href="mailto:vastra3456@gmail.com" className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors">
                <Mail size={15} className="shrink-0 text-zinc-500" />
                <span>vastra3456@gmail.com</span>
              </a>
            </li>
            <li>
              <a href="tel:+918255555577" className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors">
                <Phone size={15} className="shrink-0 text-zinc-500" />
                <span>+91 8255555577</span>
              </a>
            </li>
            <li className="flex items-center gap-2.5 text-zinc-400">
              <MapPin size={15} className="shrink-0 text-zinc-500" />
              <span>Bangalore, Karnataka, India</span>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
