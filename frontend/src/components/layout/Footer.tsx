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
      <div className="w-full border-b border-zinc-800 flex flex-col md:flex-row">
        <div className="flex-1 px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11 border-b md:border-b-0 md:border-r border-zinc-800">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-none">
            JOIN THE CLUB
          </h3>
        </div>
        <div className="flex-1 px-6 py-7 sm:px-10 sm:py-9 md:px-12 md:py-11 flex items-center">
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
        </div>
      </div>

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
              { to: '/men', label: 'Men' },
              { to: '/women', label: 'Women' },
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

          {/* Payment methods */}
          {/* <div className="mt-5">
            <h5 className="text-[10px] font-black tracking-[0.2em] text-zinc-600 mb-2">WE ACCEPT</h5>
            <div className="flex gap-2 flex-wrap">
              <span className="px-2.5 py-1.5 border border-zinc-800 hover:border-[#C9A227] transition-colors duration-200 rounded-sm">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3 w-auto text-zinc-500 hover:text-white transition-colors duration-200">
                  <path d="M19.1 0l-6.3 15.5H8.7L5.8 3.3c-.2-.8-.4-1.1-1.1-1.4C4 1.5 2.4 1 0 .9V0h6.1c1.3 0 2.4.8 2.7 2.2l2.5 11.8L15.9 0h3.2zm8.3 11.3c0-2-3-2.1-3-3 0-.7.6-1.4 1.9-1.4 1.5 0 2.1.5 2.6.9l.5-2.3c-.7-.3-1.6-.7-2.9-.7-3 0-5.1 1.6-5.1 3.9 0 1.7 1.5 2.6 2.6 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.1-1.8 1.1-1.5 0-2.3-.6-2.8-1.1l-.5 2.4c.7.3 1.6.6 2.8.6 3.2 0 5.3-1.6 5.3-4.1zm8.2 3.5c.6 0 1.2-.1 1.7-.3l-.4 2.3c-.5.2-1.1.3-1.7.3-1.8 0-2.8-.9-2.8-2.7v-4.7h-1.6V9.7h1.6V7.3l2.8-.8v3.2h1.9v1.8h-1.9v4.5c0 .9.4 1.3 1.4 1.3zm13.1-7.9c-1.3 0-2.2.6-2.8 1.7l.1-.1-.1.1-.5 2.5c.6-.9 1.5-1.5 2.5-1.5 1.5 0 2.1 1.1 2.1 2.2 0 .3 0 .6-.1.9-1.3.1-2.8.3-4.1.9-1.3.6-2.1 1.6-2.1 3 0 1.7 1.3 2.9 3.2 2.9 1.3 0 2.3-.5 3.2-1.5l-.1.1c0 .5.4.8.8.8h2.4l.4-1.8h-1.2c-.4 0-.6-.2-.6-.6v-5.7c0-2.2-1.4-3.6-3.7-3.6zm1.6 6.2c0 .1 0 .2-.1.3-1 .4-2.1.6-3.2.6-1.1 0-1.7-.5-1.7-1.3 0-.9.8-1.4 2-1.4.6 0 1.3.1 2 .3.6.2 1 .5 1 1.2v.3zm-47.2 1.6L2.2 4.1c0-.1-.1-.2-.1-.3 0-.2.2-.3.4-.3h2.7c.5 0 .9.3 1 .8l1.6 7.6L9.0.8c.1-.4.5-.7.9-.7h2.5c.6 0 1 .5.9 1.1L11.9 15.5H9.4l-2.6-8.3-.9 5.5c-.1.5-.5.9-1 .9H2.4l-.4-1.9c.8.2 1.5.5 1.5 1.1 0 .3-.2.5-.5.5h-.8c-.3 0-.5-.2-.5-.5 0-.1 0-.2.1-.3z" />
                </svg>
              </span>
              <span className="px-2.5 py-1.5 border border-zinc-800 hover:border-[#C9A227] transition-colors duration-200 rounded-sm">
                <svg viewBox="0 0 35 24" className="h-3 w-auto">
                  <circle cx="12.5" cy="12" r="10" fill="#EB001B" />
                  <circle cx="22.5" cy="12" r="10" fill="#F79E1B" />
                  <path d="M17.5 4.5A10 10 0 0 0 17.5 19.5 10 10 0 0 0 17.5 4.5z" fill="#FF5F00" />
                </svg>
              </span>
              <span className="px-2.5 py-1.5 border border-zinc-800 hover:border-[#C9A227] transition-colors duration-200 rounded-sm">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3 w-auto text-zinc-500 hover:text-white transition-colors duration-200">
                  <path d="M5.6 0H2.4v15.5h3.2V0zM15.8 0h-3.2v15.5h3.2V0zM24 0h9.6v2.5H24V0zm0 6.3h9.6v2.5H24V6.3zm0 6.3h9.6V15H24v-2.4zM0 8.9c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1S0 10.1 0 8.9zm13.7 0c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1zm37.9 0c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1z" />
                </svg>
              </span>
              <span className="px-2.5 py-1.5 border border-zinc-800 hover:border-[#C9A227] transition-colors duration-200 rounded-sm">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3 w-auto text-zinc-500 hover:text-white transition-colors duration-200">
                  <path d="M6.5 0C4.8 0 3.3 1.1 3 2.8L1.3 12.5c-.1.7.4 1.3 1.1 1.3h2.5c.5 0 1-.4 1.1-.9l.4-2.3c.1-.6.6-1 1.2-1H9c2.5 0 4.5-2 4.9-4.6.2-1.3-.1-2.5-.9-3.4C12.2.8 11 0 9.2 0H6.5zm2.7 4.8c-.2 1.2-1.1 1.2-2 1.2H6.6l.5-3c0-.3.3-.5.6-.5h.5c.6 0 1.3 0 1.5.4.2.3.1.8 0 1.1-.1.3-.1.6-.1.8zm8.5-1.3c-.1.4-.9 5.4-.9 5.4-.1.6.4 1.2 1 1.2h2.3c.7 0 1.3-.5 1.4-1.2l1.2-6.3c.1-.7-.4-1.3-1.1-1.3h-2.4c-.6 0-1.1.4-1.2 1l-.3 1.7zm-2.1 0c.1-.6.6-1 1.2-1h1.8l.3-1.8c.1-.4-.2-.8-.6-.8h-2.4c-1.1 0-2 .8-2.2 1.9l-1.9 10.1c-.1.7.4 1.3 1.1 1.3h2.5c.5 0 .9-.4 1-.9l.8-4.1c.1-.4.5-.7 1-.7h2.3l.9-4.8H16c-.7 0-1.3.5-1.4 1.2l-.3 1.7z" />
                </svg>
              </span>
            </div>
          </div> */}
        </div>
      </div>
    </footer>
  );
};
export default Footer;
