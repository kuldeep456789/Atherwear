import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-black text-white font-sans uppercase w-full">
      {/* Newsletter strip */}
      {/* <div className="w-full border-b border-zinc-800 flex flex-col md:flex-row">
        <div className="flex-1 px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11 border-b md:border-b-0 md:border-r border-zinc-800">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none">
            JOIN THE CLUB
          </h3>
        </div> */}
      {/* <div className="flex-1 px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11 flex items-center">
          <form className="flex w-full border border-zinc-700 focus-within:border-[#C9A227] transition-colors duration-300" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="YOUR EMAIL"
              required
              className="bg-transparent text-white px-4 py-2.5 sm:py-3 flex-1 text-xs sm:text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-600"
            />
            <button type="submit" className="bg-[#C9A227] text-black px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-black tracking-widest hover:bg-[#b8921f] transition-all duration-300 shrink-0 cursor-pointer border-l border-zinc-700">
              JOIN
            </button>
          </form>
          {subscribed && (
            <p className="text-[#C9A227] text-xs ml-3 font-black whitespace-nowrap animate-pulse">SUBSCRIBED ✓</p>
          )}
        </div> */}
      {/* </div> */}

      {/* Main footer grid — 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
        {/* Brand */}
        <div className="px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11">
          <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-2 leading-none">VASTRA</h3>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium normal-case tracking-normal leading-relaxed max-w-xs">
            Premium minimal fashion for the modern wardrobe. Timeless design, effortless style.
          </p>
        </div>

        {/* Shop links */}
        <div className="px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11">
          <h4 className="text-[10px] font-black tracking-[0.2em] mb-3 text-zinc-500">SHOP</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/collections/men', label: 'Men' },
              { to: '/collections/women', label: 'Women' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm font-bold tracking-wider text-zinc-400 hover:text-[#C9A227] transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help links */}
        <div className="px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11">
          <h4 className="text-[10px] font-black tracking-[0.2em] mb-3 text-zinc-500">HELP</h4>
          <ul className="space-y-2.5">
            {[
              { to: '/faq', label: 'FAQ' },
              { to: "/shipping-returns", label: 'Shipping & Returns' },
              { to: '/track-order', label: 'Track Order' },
              { to: '/contact', label: 'Contact Us' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-sm font-bold tracking-wider text-zinc-400 hover:text-[#C9A227] transition-colors duration-200 relative inline-block after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#C9A227] after:transition-all after:duration-300 hover:after:w-full"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact + Social */}
        <div className="px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11">
          <h4 className="text-[10px] font-black tracking-[0.2em] mb-3 text-zinc-500">CONTACT</h4>
          <ul className="space-y-2.5">
            <li>
              <a href="mailto:prajapatikuldeep3456@gmail.com" className="flex items-start gap-2.5 text-zinc-400 hover:text-[#C9A227] transition-colors duration-200 group">
                <Mail size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-[#C9A227] transition-colors duration-200" />
                <span className="text-xs sm:text-sm font-bold tracking-wider normal-case">prajapatikuldeep3456@gmail.com</span>
              </a>
            </li>
            <li>
              <a href="tel:+918235494985" className="flex items-start gap-2.5 text-zinc-400 hover:text-[#C9A227] transition-colors duration-200 group">
                <Phone size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-[#C9A227] transition-colors duration-200" />
                <span className="text-xs sm:text-sm font-bold tracking-wider">+91 8235494985</span>
              </a>
            </li>
            <li>
              <a href="https://maps.google.com/?q=Bangalore+India" target="_blank" rel="noopener noreferrer" className="flex items-start gap-2.5 text-zinc-400 hover:text-[#C9A227] transition-colors duration-200 group">
                <MapPin size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-zinc-600 group-hover:text-[#C9A227] transition-colors duration-200" />
                <span className="text-xs sm:text-sm font-bold tracking-wider normal-case">Bangalore, India</span>
              </a>
            </li>
          </ul>

          {/* Social */}
          <div className="mt-5">
            <h5 className="text-[10px] font-black tracking-[0.2em] text-zinc-500 mb-2">FOLLOW US</h5>
            <div className="flex items-center gap-3">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-zinc-500 hover:text-[#C9A227] transition-all duration-250 hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="text-zinc-500 hover:text-[#C9A227] transition-all duration-250 hover:scale-110">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer >
  );
};
export default Footer;
