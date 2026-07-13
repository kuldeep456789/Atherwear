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
          {/* <div className="flex flex-wrap gap-3">
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
          </div> */}
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
              {/* VISA */}
              <span className="px-3 py-1.5 border border-zinc-700 hover:border-white transition-colors">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3.5 w-auto text-zinc-400 hover:text-white">
                  <path d="M19.1 0l-6.3 15.5H8.7L5.8 3.3c-.2-.8-.4-1.1-1.1-1.4C4 1.5 2.4 1 0 .9V0h6.1c1.3 0 2.4.8 2.7 2.2l2.5 11.8L15.9 0h3.2zm8.3 11.3c0-2-3-2.1-3-3 0-.7.6-1.4 1.9-1.4 1.5 0 2.1.5 2.6.9l.5-2.3c-.7-.3-1.6-.7-2.9-.7-3 0-5.1 1.6-5.1 3.9 0 1.7 1.5 2.6 2.6 3.2 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.1-1.8 1.1-1.5 0-2.3-.6-2.8-1.1l-.5 2.4c.7.3 1.6.6 2.8.6 3.2 0 5.3-1.6 5.3-4.1zm8.2 3.5c.6 0 1.2-.1 1.7-.3l-.4 2.3c-.5.2-1.1.3-1.7.3-1.8 0-2.8-.9-2.8-2.7v-4.7h-1.6V9.7h1.6V7.3l2.8-.8v3.2h1.9v1.8h-1.9v4.5c0 .9.4 1.3 1.4 1.3zm13.1-7.9c-1.3 0-2.2.6-2.8 1.7l.1-.1-.1.1-.5 2.5c.6-.9 1.5-1.5 2.5-1.5 1.5 0 2.1 1.1 2.1 2.2 0 .3 0 .6-.1.9-1.3.1-2.8.3-4.1.9-1.3.6-2.1 1.6-2.1 3 0 1.7 1.3 2.9 3.2 2.9 1.3 0 2.3-.5 3.2-1.5l-.1.1c0 .5.4.8.8.8h2.4l.4-1.8h-1.2c-.4 0-.6-.2-.6-.6v-5.7c0-2.2-1.4-3.6-3.7-3.6zm1.6 6.2c0 .1 0 .2-.1.3-1 .4-2.1.6-3.2.6-1.1 0-1.7-.5-1.7-1.3 0-.9.8-1.4 2-1.4.6 0 1.3.1 2 .3.6.2 1 .5 1 1.2v.3zm-47.2 1.6L2.2 4.1c0-.1-.1-.2-.1-.3 0-.2.2-.3.4-.3h2.7c.5 0 .9.3 1 .8l1.6 7.6L9.0.8c.1-.4.5-.7.9-.7h2.5c.6 0 1 .5.9 1.1L11.9 15.5H9.4l-2.6-8.3-.9 5.5c-.1.5-.5.9-1 .9H2.4l-.4-1.9c.8.2 1.5.5 1.5 1.1 0 .3-.2.5-.5.5h-.8c-.3 0-.5-.2-.5-.5 0-.1 0-.2.1-.3z" />
                </svg>
              </span>
              {/* Mastercard */}
              <span className="px-3 py-1.5 border border-zinc-700 hover:border-white transition-colors">
                <svg viewBox="0 0 35 24" className="h-3.5 w-auto">
                  <circle cx="12.5" cy="12" r="10" fill="#EB001B" />
                  <circle cx="22.5" cy="12" r="10" fill="#F79E1B" />
                  <path d="M17.5 4.5A10 10 0 0 0 17.5 19.5 10 10 0 0 0 17.5 4.5z" fill="#FF5F00" />
                </svg>
              </span>
              {/* UPI */}
              <span className="px-3 py-1.5 border border-zinc-700 hover:border-white transition-colors">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3.5 w-auto text-zinc-400 hover:text-white">
                  <path d="M5.6 0H2.4v15.5h3.2V0zM15.8 0h-3.2v15.5h3.2V0zM24 0h9.6v2.5H24V0zm0 6.3h9.6v2.5H24V6.3zm0 6.3h9.6V15H24v-2.4zM0 8.9c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1S0 10.1 0 8.9zm13.7 0c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1zm37.9 0c0-1.2.9-2.1 2.1-2.1s2.1.9 2.1 2.1-.9 2.1-2.1 2.1-2.1-.9-2.1-2.1z" />
                </svg>
              </span>
              {/* PayPal */}
              <span className="px-3 py-1.5 border border-zinc-700 hover:border-white transition-colors">
                <svg viewBox="0 0 48 16" fill="currentColor" className="h-3.5 w-auto text-zinc-400 hover:text-white">
                  <path d="M6.5 0C4.8 0 3.3 1.1 3 2.8L1.3 12.5c-.1.7.4 1.3 1.1 1.3h2.5c.5 0 1-.4 1.1-.9l.4-2.3c.1-.6.6-1 1.2-1H9c2.5 0 4.5-2 4.9-4.6.2-1.3-.1-2.5-.9-3.4C12.2.8 11 0 9.2 0H6.5zm2.7 4.8c-.2 1.2-1.1 1.2-2 1.2H6.6l.5-3c0-.3.3-.5.6-.5h.5c.6 0 1.3 0 1.5.4.2.3.1.8 0 1.1-.1.3-.1.6-.1.8zm8.5-1.3c-.1.4-.9 5.4-.9 5.4-.1.6.4 1.2 1 1.2h2.3c.7 0 1.3-.5 1.4-1.2l1.2-6.3c.1-.7-.4-1.3-1.1-1.3h-2.4c-.6 0-1.1.4-1.2 1l-.3 1.7zm-2.1 0c.1-.6.6-1 1.2-1h1.8l.3-1.8c.1-.4-.2-.8-.6-.8h-2.4c-1.1 0-2 .8-2.2 1.9l-1.9 10.1c-.1.7.4 1.3 1.1 1.3h2.5c.5 0 .9-.4 1-.9l.8-4.1c.1-.4.5-.7 1-.7h2.3l.9-4.8H16c-.7 0-1.3.5-1.4 1.2l-.3 1.7z" />
                </svg>
              </span>
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
