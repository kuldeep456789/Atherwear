import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-950 text-white font-sans w-full border-t border-zinc-800">
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Brand Column */}
          <div className="space-y-3 sm:space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase">VASTRA</span>
            </Link>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              Elevating everyday fashion with premium quality, modern design, and timeless Indian craftsmanship.
            </p>
          </div>

          {/* Mobile Side-by-Side Grid for Shop & Support on small screens */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-6 sm:gap-8">
            {/* Shop Navigation */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Shop</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link to="/collections/men" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    Men's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/collections/women" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    Women's Collection
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Help */}
            <div className="space-y-3 sm:space-y-4">
              <h4 className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Help</h4>
              <ul className="space-y-2 text-xs font-medium">
                <li>
                  <Link to="/track-order" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    Track Order
                  </Link>
                </li>
                <li>
                  <Link to="/returns" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    Support
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-zinc-400 hover:text-white transition-colors duration-200 block py-1">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">Contact Us</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="mailto:vastra3456@gmail.com" className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors py-0.5 break-all">
                  <Mail size={15} className="shrink-0 text-zinc-500" />
                  <span className="truncate">vastra3456@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+918255555577" className="flex items-center gap-2.5 text-zinc-400 hover:text-white transition-colors py-0.5">
                  <Phone size={15} className="shrink-0 text-zinc-500" />
                  <span>+91 8255555577</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-zinc-400 py-0.5">
                <MapPin size={15} className="shrink-0 text-zinc-500" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
