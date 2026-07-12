import { useState } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-black text-white border-t-2 border-black font-sans uppercase">
      {/* Newsletter strip */}
      <div className="w-full border-b-2 border-white flex flex-col md:flex-row">
        <div className="flex-1 p-8 sm:p-12 border-b-2 md:border-b-0 md:border-r-2 border-white">
          <h3 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
            JOIN THE CLUB
          </h3>
          <p className="text-sm text-zinc-400 font-medium normal-case tracking-normal">
            Get 10% off your first order. No spam, ever.
          </p>
        </div>
        <div className="flex-1 p-8 sm:p-12 flex items-center">
          <form className="flex w-full border-2 border-white" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="YOUR EMAIL"
              required
              className="bg-transparent text-white px-4 py-4 flex-1 text-xs font-bold tracking-widest focus:outline-none placeholder:text-zinc-500"
            />
            <button type="submit" className="bg-white text-black px-8 py-4 text-xs font-black tracking-widest hover:bg-red-600 hover:text-white transition-colors shrink-0 cursor-pointer border-l-2 border-white">
              JOIN
            </button>
          </form>
          {subscribed && (
            <p className="text-green-400 text-xs ml-4 font-black">SUBSCRIBED ✓</p>
          )}
        </div>
      </div>

      {/* Main footer grid — 4 boxes */}
      <div className="flex flex-col md:flex-row">
        {/* Brand */}
        <div className="flex-1 p-8 sm:p-12 border-b-2 md:border-b-0 md:border-r-2 border-white">
          <h3 className="text-2xl font-black tracking-tighter mb-4">AETHERWEAR</h3>
          <p className="text-xs text-zinc-400 normal-case tracking-normal leading-relaxed mb-6">
            Premium streetwear crafted for those who dare to stand out.
          </p>
          <div className="flex gap-2">
            <a href="#" className="w-10 h-10 border-2 border-white flex items-center justify-center text-xs font-black hover:bg-white hover:text-black transition-colors" aria-label="Instagram">
              IG
            </a>
            <a href="#" className="w-10 h-10 border-2 border-white flex items-center justify-center text-xs font-black hover:bg-white hover:text-black transition-colors" aria-label="Twitter">
              X
            </a>
            <a href="#" className="w-10 h-10 border-2 border-white flex items-center justify-center text-xs font-black hover:bg-white hover:text-black transition-colors" aria-label="YouTube">
              YT
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div className="flex-1 p-8 sm:p-12 border-b-2 md:border-b-0 md:border-r-2 border-white">
          <h4 className="text-xs font-black tracking-widest mb-6 text-zinc-400">SHOP</h4>
          <ul className="space-y-3 text-sm font-bold tracking-wider">
            <li><Link to="/new-arrivals" className="hover:text-red-500 transition-colors">NEW ARRIVALS</Link></li>
            <li><Link to="/men" className="hover:text-red-500 transition-colors">MEN</Link></li>
            <li><Link to="/women" className="hover:text-red-500 transition-colors">WOMEN</Link></li>
            <li><Link to="/accessories" className="hover:text-red-500 transition-colors">ACCESSORIES</Link></li>
            <li><Link to="/sale" className="text-red-500 hover:text-red-400 transition-colors">SALE</Link></li>
          </ul>
        </div>

        {/* Help links */}
        <div className="flex-1 p-8 sm:p-12 border-b-2 md:border-b-0 md:border-r-2 border-white">
          <h4 className="text-xs font-black tracking-widest mb-6 text-zinc-400">HELP</h4>
          <ul className="space-y-3 text-sm font-bold tracking-wider">
            <li><Link to="/faq" className="hover:text-red-500 transition-colors">FAQ</Link></li>
            <li><Link to="/shipping" className="hover:text-red-500 transition-colors">SHIPPING & RETURNS</Link></li>
            <li><Link to="/track-order" className="hover:text-red-500 transition-colors">TRACK ORDER</Link></li>
            <li><Link to="/contact" className="hover:text-red-500 transition-colors">CONTACT</Link></li>
          </ul>
        </div>

        {/* Company links */}
        <div className="flex-1 p-8 sm:p-12">
          <h4 className="text-xs font-black tracking-widest mb-6 text-zinc-400">COMPANY</h4>
          <ul className="space-y-3 text-sm font-bold tracking-wider">
            <li><Link to="/about" className="hover:text-red-500 transition-colors">ABOUT US</Link></li>
            <li><Link to="/careers" className="hover:text-red-500 transition-colors">CAREERS</Link></li>
            <li><Link to="/terms" className="hover:text-red-500 transition-colors">TERMS</Link></li>
            <li><Link to="/privacy" className="hover:text-red-500 transition-colors">PRIVACY</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t-2 border-white">
        <div className="flex flex-col sm:flex-row justify-between items-center px-8 sm:px-12 py-5 text-xs text-zinc-500 tracking-widest font-bold">
          <p>&copy; {new Date().getFullYear()} AETHERWEAR</p>
          <p className="mt-2 sm:mt-0 normal-case tracking-normal">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
