import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, Heart, Moon, Sun, Truck, X, UserRound, Package, MapPin, Settings, LogOut } from 'lucide-react';
import MiniCart from './MiniCart';

// Promotional messages for the ticker (module scope)
const PROMO_MESSAGES = [
  'FREE SHIPPING ON ALL ORDERS ABOVE ₹399',
  'BUY 3 AND SAVE MORE ON EVERYDAY PICKS',
  'NEW ACCESSORIES DROP LIVE NOW',
];
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';
import { useGetProductsQuery } from '../../store/slices/productApiSlice';
import { getProductId } from '../../lib/product';

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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [promoIndex, setPromoIndex] = useState(0);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
      setMobileSearchOpen(false);
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
        // 'Co-ords' has no matching CJ category — see CollectionPage.tsx CATEGORY_TABS.
        // { label: 'Co-ords', to: '/collections/women/coords' },
      ]
    },
    {
      to: '/collections/accessories',
      label: 'ACCESSORIES',
      dropdown: [
        { label: 'Caps', to: '/collections/accessories/caps' },
        { label: 'Wallets', to: '/collections/accessories/wallets' },
        // 'Sunglasses' has no matching CJ category — see CollectionPage.tsx CATEGORY_TABS.
        // { label: 'Sunglasses', to: '/collections/accessories/sunglasses' },
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
      <div className="w-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-b-2 border-black dark:border-white py-2 text-center text-xs font-bold tracking-widest flex items-center justify-center gap-3 select-none overflow-hidden h-10">
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
                className={`h-full flex items-center px-6 border-r-2 border-black dark:border-white font-bold text-sm tracking-widest group-hover:bg-[hsl(var(--foreground))] group-hover:text-[hsl(var(--background))] transition-colors ${
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
                      className="px-4 py-3 text-xs font-bold border-b last:border-b-0 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
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
          {/* Desktop Search */}
          <div className="hidden xl:flex items-center h-full border-r-2 border-black dark:border-white w-64 relative group">
            <form onSubmit={handleSearch} className="w-full h-full relative">
              <input
                type="search"
                placeholder="SEARCH..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full h-full px-4 text-xs font-bold bg-transparent focus:outline-none placeholder:text-zinc-400"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2">
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full right-0 w-80 bg-[hsl(var(--card))] border-2 border-t-0 border-black dark:border-white shadow-xl z-50">
                {isSearchFetching ? (
                  <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">Searching...</div>
                ) : searchResults?.products?.length > 0 ? (
                  <div className="flex flex-col">
                    {searchResults.products.slice(0, 5).map((product: any) => (
                      <Link
                        key={getProductId(product)}
                        to={`/product/${getProductId(product)}`}
                        onClick={() => setShowSuggestions(false)}
                        className="flex items-center gap-3 p-3 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] border-b border-black/10 dark:border-white/10 last:border-0 transition-colors group/item"
                      >
                        <img 
                          src={product.images?.[0] || 'https://via.placeholder.com/40'} 
                          alt="product" 
                          className="w-10 h-10 object-cover border border-black/20 dark:border-white/20"
                        />
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-bold truncate">{product.title || product.productName}</span>
                          <span className="text-[10px] opacity-70 truncate">{product.categoryName}</span>
                        </div>
                      </Link>
                    ))}
                    <button 
                      onClick={handleSearch}
                      className="p-3 text-xs font-black uppercase tracking-widest text-center border-t-2 border-black dark:border-white hover:bg-red-600 hover:text-white transition-colors"
                    >
                      View All Results
                    </button>
                  </div>
                ) : (
                  <div className="p-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-center">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Mobile search toggle */}
          <button
            className="xl:hidden flex items-center justify-center w-14 sm:w-16 h-full border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
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
                <button className="font-bold text-xs tracking-widest hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
                HI, {userDisplayName.toUpperCase()} ▼
              </button>
              <div className="absolute right-0 top-full w-48 bg-[hsl(var(--card))] border-2 border-black dark:border-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                {extraLinks.map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to} className="flex items-center px-4 py-3 text-xs font-bold border-b border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full flex items-center px-4 py-3 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white transition-colors"
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

      {/* Mobile search bar */}
      {mobileSearchOpen && (
        <form onSubmit={handleSearch} className="xl:hidden w-full border-b-2 border-black dark:border-white flex h-14">
          <input
            type="search"
            placeholder="SEARCH PRODUCTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 text-xs font-bold bg-[hsl(var(--card))] focus:outline-none"
          />
          <button type="submit" className="w-16 flex items-center justify-center bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
            <Search className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>
      )}

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[hsl(var(--card))] border-b-2 border-black dark:border-white flex flex-col font-bold tracking-widest text-sm max-h-[80vh] overflow-y-auto">
          {navLinks.map(({ to, label, accent, dropdown }) => (
            <div key={to} className="flex flex-col border-b-2 border-black dark:border-white">
              <Link
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`p-5 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors ${
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
                      className="p-4 pl-10 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors border-b last:border-b-0 border-black/10 dark:border-white/20"
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
    </header>

    {/* Mini Cart Drawer — rendered outside header so it can cover full viewport */}
    <MiniCart isOpen={miniCartOpen} onClose={() => setMiniCartOpen(false)} />
  </>);
};

export default Navbar;
