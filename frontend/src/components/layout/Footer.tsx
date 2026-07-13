import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, Phone, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-black text-white border-t-2 border-black font-sans uppercase w-full">
      {/* Newsletter strip */}
      <div className="w-full border-b-2 border-white flex flex-col md:flex-row">
        <div className="flex-1 p-8 sm:p-12 md:p-14 border-b-2 md:border-b-0 md:border-r-2 border-white">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-3 leading-none">
            JOIN THE CLUB
          </h3>
          {/* <p className="text-sm sm:text-base text-zinc-400 font-medium normal-case tracking-normal max-w-md">
            Get 10% off your first order and exclusive access to limited drops.
          </p> */}
        </div>
        <div className="flex-1 p-8 sm:p-12 md:p-14 flex items-center">
          <form className="flex w-full border-2 border-white" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="YOUR EMAIL"
              required
              className="bg-transparent text-white px-4 py-4 sm:py-5 flex-1 text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-500"
            />
            <button type="submit" className="bg-white text-black px-8 sm:px-10 py-4 sm:py-5 text-sm font-black tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 shrink-0 cursor-pointer border-l-2 border-white">
              JOIN
            </button>
          </form>
          {subscribed && (
            <p className="text-green-400 text-sm ml-4 font-black whitespace-nowrap animate-pulse">SUBSCRIBED ✓</p>
          )}
        </div>
      </div>

      {/* Main footer grid — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand */}
        <div className="p-8 sm:p-12 md:p-14 border-b-2 sm:border-b-0 sm:border-r-2 border-white">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-4 leading-none">AETHERWEAR</h3>
          <p className="text-sm text-zinc-500 font-medium normal-case tracking-normal leading-relaxed mb-6">
            Premium streetwear crafted for those who dare to stand out. Limited drops, infinite style.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Instagram', 'YouTube', 'X / Twitter', 'Facebook'].map((label) => (
              <a
                key={label}
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex items-center gap-1.5 px-3 py-2 border-2 border-white text-xs font-black tracking-widest hover:bg-white hover:text-black transition-all duration-300 group"
              >
                {label}
                <ExternalLink size={12} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              </a>
            ))}
          </div>
        </div>

        {/* Shop links */}
        <div className="p-8 sm:p-12 md:p-14 border-b-2 sm:border-b-0 sm:border-r-2 border-white">
          <h4 className="text-sm font-black tracking-widest mb-6 text-zinc-400">SHOP</h4>
          <ul className="space-y-4">
            {[
              { to: '/new-arrivals', label: 'New Arrivals' },
              { to: '/men', label: 'Men' },
              { to: '/women', label: 'Women' },
              { to: '/collections/accessories', label: 'Accessories' },
              { to: '/sale', label: 'Sale', accent: true },
            ].map(({ to, label, accent }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={`text-base font-bold tracking-wider hover:underline underline-offset-4 transition-all duration-200 inline-flex items-center gap-1.5 group ${accent ? 'text-red-500 hover:text-red-400' : 'hover:text-white text-zinc-300'
                    }`}
                >
                  {label}
                  <ArrowUpRight size={12} strokeWidth={2.5} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div className="p-8 sm:p-12 md:p-14 border-b-2 sm:border-b-0 lg:border-r-2 border-white">
          <h4 className="text-sm font-black tracking-widest mb-6 text-zinc-400">HELP</h4>
          <ul className="space-y-4">
            {[
              { to: '/faq', label: 'FAQ' },
              { to: "", label: 'Shipping & Returns' },
              { to: '/track-order', label: 'Track Order' },
              { to: '/contact', label: 'Contact Us' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-base font-bold tracking-wider text-zinc-300 hover:text-white hover:underline underline-offset-4 transition-all duration-200 inline-flex items-center gap-1.5 group"
                >
                  {label}
                  <ArrowUpRight size={12} strokeWidth={2.5} className="opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="p-8 sm:p-12 md:p-14">
          <h4 className="text-sm font-black tracking-widest mb-6 text-zinc-400">CONTACT</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-zinc-300">
              <Mail size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-zinc-500" />
              <span className="text-base font-bold tracking-wider normal-case">prajapatikuldeep3456@gmail.com</span>
            </li>
            <li className="flex items-start gap-3 text-zinc-300">
              <Phone size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-zinc-500" />
              <span className="text-base font-bold tracking-wider">+91 8235494985</span>
            </li>
            <li className="flex items-start gap-3 text-zinc-300">
              <MapPin size={16} strokeWidth={2} className="mt-0.5 shrink-0 text-zinc-500" />
              <span className="text-base font-bold tracking-wider normal-case">Banglore, India</span>
            </li>
          </ul>
          {/* Payment methods */}
          <div className="mt-8">
            <h5 className="text-xs font-black tracking-widest text-zinc-500 mb-3">WE ACCEPT</h5>
            <div className="flex gap-2 flex-wrap">
              {['VISA', 'MC', 'UPI', 'AMEX', 'PayPal'].map((method) => (
                <span key={method} className="px-3 py-1.5 border border-zinc-700 text-zinc-400 text-[10px] font-black tracking-wider hover:border-white hover:text-white transition-colors">
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      {/* <div className="border-t-2 border-white bg-zinc-900">
        <div className="flex flex-col sm:flex-row justify-between items-center px-8 sm:px-12 md:px-14 py-6 text-xs text-zinc-500 tracking-widest font-bold gap-3">
          <span>&copy; {new Date().getFullYear()} AETHERWEAR. ALL RIGHTS RESERVED.</span>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">PRIVACY</Link>
            <Link to="/terms" className="hover:text-white transition-colors">TERMS</Link>
            <Link to="/accessibility" className="hover:text-white transition-colors">ACCESSIBILITY</Link>
          </div>
        </div>
      </div> */}
    </footer>
  );
};
export default Footer;
