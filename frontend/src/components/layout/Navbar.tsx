import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Heart, Moon, Sun, Truck, X, UserRound, Package, MapPin, Settings, LogOut } from 'lucide-react';
import MiniCart from './MiniCart';

// Promotional messages for the ticker (module scope)
const PROMO_MESSAGES = [
  `FREE SHIPPING ON ALL ORDERS ABOVE ${formatUSD(399)}`,
  'BUY 3 AND SAVE MORE ON EVERYDAY PICKS',
  'NEW ACCESSORIES DROP LIVE NOW',
];
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { useGetProductsQuery } from '../../store/slices/productApiSlice';
import { getProductId } from '../../lib/product';
import { formatUSD } from '../../lib/currency';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.cartItems);
  const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.qty, 0);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const wishlistCount = wishlistItems.length;
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const userDisplayName =
    userInfo?.firstName?.trim() ||
    [userInfo?.firstName, userInfo?.lastName].filter(Boolean).join(' ').trim() ||
    userInfo?.email ||
    'ME';

  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  // Live search
  const { data: searchResults, isFetching: isSearchFetching } = useGetProductsQuery(
    { q: searchQuery, pageNum: 1, pageSize: 5 },
    { skip: searchQuery.trim().length < 2 }
  );

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDarkTheme = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (!searchOverlayOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOverlayOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOverlayOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex((current) => (current + 1) % PROMO_MESSAGES.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOverlayOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { 
      to: '/collections/men', 
      label: 'MEN',
      dropdown: [
        { label: 'Shirts', to: '/collections/men/shirts' },
        { label: 'T-Shirts', to: '/collections/men/tshirts' },
        // 'Oversized' and 'Polo' have no matching CJ category — see CollectionPage.tsx CATEGORY_TABS.
        // { label: 'Oversized', to: '/collections/men/oversized' },
        // { label: 'Polo', to: '/collections/men/polo' },
        { label: 'Jeans', to: '/collections/men/jeans' },
        { label: 'Cargo', to: '/collections/men/cargo' },
        { label: 'Shorts', to: '/collections/men/shorts' },
        { label: 'Jackets', to: '/collections/men/jackets' },
        { label: 'Hoodies', to: '/collections/men/hoodies' },
      ]
    },
    {
      to: '/collections/women',
      label: 'WOMEN',
      dropdown: [
        { label: 'Dresses', to: '/collections/women/dresses' },
        { label: 'Tops', to: '/collections/women/tops' },
        { label: 'Shirts', to: '/collections/women/shirts' },
        { label: 'Jeans', to: '/collections/women/jeans' },
        { label: 'Jackets', to: '/collections/women/jackets' },
        { label: 'Co-ords', to: '/collections/women/co-ords' },
      ]
    },
    {
      to: '/collections/accessories',
      label: 'ACCESSORIES',
      dropdown: [
        { label: 'Caps', to: '/collections/accessories/caps' },
        { label: 'Wallets', to: '/collections/accessories/wallets' },
        { label: 'Sunglasses', to: '/collections/accessories/sunglasses' },
        { label: 'Belts', to: '/collections/accessories/belts' },
        { label: 'Bags', to: '/collections/accessories/bags' },
      ]
    },
    { to: '/new-arrivals', label: 'NEW' },
    { to: '/sale', label: 'SALE', accent: true },
  ];

  const extraLinks = [
    { to: '/account', label: 'My Orders', icon: Package },
    { to: '/account?tab=profile', label: 'Profile', icon: UserRound },
    { to: '/account?tab=wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account?tab=addresses', label: 'Addresses', icon: MapPin },
    { to: '/account?tab=settings', label: 'Settings', icon: Settings },
  ];



  return (
    <>
    <header className="sticky top-0 z-50 w-full bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-b-2 border-black dark:border-white transition-all duration-300 uppercase font-sans">
      {/* Promo strip */}
      <div className="w-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-b-2 border-black dark:border-white py-2.5 text-center text-sm font-bold tracking-widest flex items-center justify-center gap-3 select-none overflow-hidden h-11">
        <Truck className="h-4 w-4 shrink-0" />
        <div className="relative h-4 min-w-0 flex-1 overflow-hidden max-w-md">
            {PROMO_MESSAGES.map((message, index) => (
              <span
                key={message}
                className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ${
                  index === promoIndex
                    ? 'translate-y-0 opacity-100'
                    : index < promoIndex || (promoIndex === 0 && index === PROMO_MESSAGES.length - 1)
                      ? '-translate-y-full opacity-0'
                      : 'translate-y-full opacity-0'
                }`}
              >
                {message}
              </span>
            ))}
        </div>
      </div>

      {/* Main nav row */}
      <div className="w-full flex items-center h-16 sm:h-20 border-b-2 border-black dark:border-white">
        
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden flex items-center justify-center w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
        </button>

        {/* Desktop left nav links */}
        <nav className="hidden lg:flex items-center h-full border-r-2 border-black dark:border-white flex-1">
          {navLinks.map(({ to, label, accent, dropdown }) => (
            <div key={to} className="relative h-full group">
              <Link
                to={to}
                className={`h-full flex items-center px-8 border-r-2 border-black dark:border-white font-bold text-sm sm:text-base lg:text-lg tracking-widest group-hover:bg-[hsl(var(--foreground))] group-hover:text-[hsl(var(--background))] transition-colors ${
                  accent ? 'text-red-600 dark:text-red-400 group-hover:text-red-600' : ''
                }`}
              >
                {label}
              </Link>
              {dropdown && (
                <div className="absolute left-0 top-full w-48 bg-[hsl(var(--card))] border-2 border-t-0 border-black dark:border-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 flex flex-col">
                  {dropdown.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className="px-4 py-3 text-sm sm:text-base font-bold border-b last:border-b-0 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Center Logo */}
        <Link to="/" className="flex-1 lg:flex-none flex items-center justify-center px-4 lg:px-12 h-full text-2xl sm:text-3xl font-black tracking-tighter hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
          AETHERWEAR
        </Link>

        {/* Right actions */}
        <div className="flex items-center h-full border-l-2 border-black dark:border-white shrink-0">
          {/* Search button — opens full-screen overlay */}
          <button
            className="flex items-center justify-center w-14 sm:w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
            onClick={() => { setSearchOverlayOpen(true); setSearchQuery(''); }}
          >
            <Search className="h-5 w-5" strokeWidth={2} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="hidden sm:flex items-center justify-center w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="h-5 w-5" strokeWidth={2} /> : <Moon className="h-5 w-5" strokeWidth={2} />}
          </button>

          {/* Account */}
          {userInfo ? (
            <div className="relative hidden sm:flex items-center px-6 h-full border-r-2 border-black dark:border-white group">
                <button className="font-bold text-sm sm:text-base tracking-widest hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
                HI, {userDisplayName.toUpperCase()} ▼
              </button>
              <div className="absolute right-0 top-full w-48 bg-[hsl(var(--card))] border-2 border-black dark:border-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {extraLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="flex items-center px-4 py-3 text-sm font-bold border-b border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full flex items-center px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  LOGOUT
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:flex items-center justify-center w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
              <UserRound className="h-5 w-5" strokeWidth={2} />
            </Link>
          )}

          {/* Wishlist */}
          <Link to="/wishlist" className="flex items-center justify-center w-14 sm:w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors relative">
            <Heart className="h-5 w-5" strokeWidth={2} />
            {wishlistCount > 0 && (
              <span className="absolute top-3 right-2 sm:right-3 h-5 w-5 bg-red-600 border-2 border-black dark:border-white text-white text-[10px] font-black flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart — opens mini drawer */}
          <button
            onClick={() => setMiniCartOpen(true)}
            className="flex items-center justify-center w-16 sm:w-20 h-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-red-600 hover:text-white transition-colors relative group cursor-pointer"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute top-3 right-3 h-5 w-5 bg-white border-2 border-black text-black text-[10px] font-black flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-white transition-colors">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(var(--card))] border-b-2 border-black dark:border-white flex flex-col font-bold tracking-widest text-sm max-h-[80vh] overflow-y-auto">
          {navLinks.map(({ to, label, accent, dropdown }) => (
            <div key={to} className="flex flex-col border-b-2 border-black dark:border-white">
              <Link
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-5 text-base sm:text-lg font-black tracking-widest hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors ${
                  accent ? 'text-red-600 dark:text-red-400' : ''
                }`}
              >
                {label}
              </Link>
              {dropdown && (
                <div className="flex flex-col bg-[hsl(var(--muted))] border-t-2 border-black dark:border-white">
                  {dropdown.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-4 pl-10 text-xs sm:text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors border-b last:border-b-0 border-black/10 dark:border-white/20"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="p-5 border-b-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
          >
            {userInfo ? `ACCOUNT (${userDisplayName})` : 'LOGIN'}
          </Link>
          <button onClick={toggleTheme} className="p-5 border-b-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors text-left">
            {isDark ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
          {userInfo && (
            <button
              onClick={() => {
                dispatch(logout());
                setMobileMenuOpen(false);
              }}
              className="p-5 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors text-left"
            >
              LOGOUT
            </button>
          )}
        </div>
      )}

      {/* Full-screen Search Overlay */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setSearchOverlayOpen(false)} />
          
          {/* Overlay panel */}
          <div className="relative z-10 mx-auto mt-[10vh] w-full max-w-2xl px-4 sm:px-6" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setSearchOverlayOpen(false)}
              className="absolute -top-14 right-4 sm:right-6 flex items-center gap-2 text-sm font-black tracking-widest hover:text-red-600 transition-colors cursor-pointer z-20"
            >
              <X className="h-5 w-5" strokeWidth={2.5} /> CLOSE
            </button>

            {/* Search input */}
            <form onSubmit={(e) => { handleSearch(e); setSearchOverlayOpen(false); }}>
              <div className="flex border-4 border-[hsl(var(--foreground))] bg-[hsl(var(--card))]">
                <input
                  type="search"
                  placeholder="SEARCH PRODUCTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="flex-1 px-6 py-5 sm:py-6 text-lg sm:text-xl font-bold bg-transparent focus:outline-none placeholder:text-zinc-400 uppercase tracking-wider"
                />
                <button type="submit" className="px-8 sm:px-10 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center cursor-pointer">
                  <Search className="h-6 w-6" strokeWidth={2.5} />
                </button>
              </div>
            </form>

            {/* Results */}
            <div className="mt-4 bg-[hsl(var(--card))] border-4 border-t-0 border-[hsl(var(--foreground))] max-h-[50vh] overflow-y-auto">
              {searchQuery.trim().length >= 2 ? (
                isSearchFetching ? (
                  <div className="p-8 text-center">
                    <div className="inline-block h-8 w-8 border-4 border-[hsl(var(--foreground))] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold tracking-widest text-zinc-500">SEARCHING...</p>
                  </div>
                ) : searchResults?.products?.length > 0 ? (
                  <div className="divide-y-2 divide-black dark:divide-white">
                    {searchResults.products.slice(0, 8).map((product: any) => (
                      <Link
                        key={getProductId(product)}
                        to={`/product/${getProductId(product)}`}
                        onClick={() => setSearchOverlayOpen(false)}
                        className="flex items-center gap-5 p-5 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors group"
                      >
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/48'} 
                          alt="product" 
                          className="w-14 h-16 sm:w-16 sm:h-20 object-cover border-2 border-black dark:border-white group-hover:border-[hsl(var(--background))] transition-colors"
                        />
                        <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                          <span className="text-sm sm:text-base font-bold truncate">{product.title || product.productName}</span>
                          <span className="text-xs text-zinc-500 group-hover:text-zinc-300 truncate mt-1">{product.categoryName}</span>
                          <span className="text-sm font-black mt-1 font-mono">{formatUSD(product.discountPrice || product.price)}</span>
                        </div>
                        <Search className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={2} />
                      </Link>
                    ))}
                    <button
                      onClick={(e) => { handleSearch(e); setSearchOverlayOpen(false); }}
                      className="w-full p-5 text-sm font-black tracking-widest text-center border-t-2 border-black dark:border-white bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-3 cursor-pointer"
                    >
                      VIEW ALL {searchResults.products.length} RESULTS <Search className="h-4 w-4" strokeWidth={2.5} />
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <span className="text-4xl block mb-4 text-zinc-300">✕</span>
                    <p className="text-sm font-bold tracking-widest text-zinc-500">NO PRODUCTS FOUND</p>
                    <p className="text-xs text-zinc-400 mt-2 tracking-normal normal-case">Try a different search term</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-8 w-8 mx-auto mb-3 text-zinc-300" strokeWidth={1.5} />
                  <p className="text-sm font-bold tracking-widest text-zinc-500">TYPE TO SEARCH</p>
                  <p className="text-xs text-zinc-400 mt-1">Enter at least 2 characters</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>

    {/* Mini Cart Drawer — rendered outside header so it can cover full viewport */}
    <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
  </>);
};

export default Navbar;
