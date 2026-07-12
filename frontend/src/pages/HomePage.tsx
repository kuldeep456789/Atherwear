import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgePercent, ShieldCheck, Flame, Truck, X, Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/slices/userApiSlice';

import { useGetProductsQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import { getFirstProductImage } from '../lib/product';

const placeholderImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">AETHERWEAR</text></svg>';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [login, { isLoading: loginLoading }] = useLoginMutation();

  // Dynamic section queries
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useGetProductsQuery({
    sort: 'newest',
    pageNum: 1,
    pageSize: 8,
  });
  const { data: menData, isLoading: menLoading } = useGetProductsQuery({
    gender: 'men',
    pageNum: 1,
    pageSize: 4,
  });
  const { data: womenData, isLoading: womenLoading } = useGetProductsQuery({
    gender: 'women',
    pageNum: 1,
    pageSize: 4,
  });
  const { data: saleData } = useGetProductsQuery({
    sort: 'price_asc',
    pageNum: 1,
    pageSize: 4,
  });

  const newArrivals = Array.isArray(newArrivalsData?.products) ? newArrivalsData.products.slice(0, 8) : [];
  const menProducts = Array.isArray(menData?.products) ? menData.products.slice(0, 4) : [];
  const womenProducts = Array.isArray(womenData?.products) ? womenData.products.slice(0, 4) : [];
  const saleProducts = Array.isArray(saleData?.products) ? saleData.products.slice(0, 4) : [];

  // For hero slideshow, use new arrivals images
  const heroImages = useMemo(() => {
    if (newArrivals.length === 0) return [placeholderImage];
    return newArrivals.map((p: any) => getFirstProductImage(p) || placeholderImage);
  }, [newArrivals]);

  const dynamicImg1 = heroImages[1 % heroImages.length] || placeholderImage;
  const dynamicImg2 = heroImages[2 % heroImages.length] || placeholderImage;
  const dynamicImg3 = heroImages[3 % heroImages.length] || placeholderImage;

  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Popup form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const heroTimer = setInterval(() => {
      setCurrentHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 2000);

    if (!userInfo) {
      const popupTimer = setTimeout(() => setShowLoginPopup(true), 10000);
      return () => {
        clearInterval(heroTimer);
        clearTimeout(popupTimer);
      };
    }

    return () => clearInterval(heroTimer);
  }, [heroImages.length, userInfo]);

  useEffect(() => {
    if (showLoginPopup) {
      setCountdown(10);
    }
  }, [showLoginPopup]);

  useEffect(() => {
    if (!showLoginPopup) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showLoginPopup, countdown]);

  const handlePopupLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!email.trim() || !password.trim()) {
      setLoginError('Email and password are required.');
      return;
    }
    try {
      const result = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...result.user, accessToken: result.accessToken }));
      setShowLoginPopup(false);
      navigate('/');
    } catch {
      setLoginError('Invalid email or password.');
    }
  };

  return (
    <div className="w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans uppercase">
      {/* ───────── HERO ───────── */}
      <section className="relative min-h-[calc(100vh-130px)] overflow-hidden bg-black text-white border-b-2 border-black">
        {heroImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt="Aetherwear streetwear collection"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out transform ${idx === currentHeroIdx
              ? 'opacity-70 scale-100'
              : 'opacity-0 scale-105 pointer-events-none'
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative z-10 flex min-h-[calc(100vh-130px)] w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-16 items-end">
          <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-10">
            <div className="max-w-3xl">
              <h1 className="text-[2.2rem] min-[375px]:text-4xl sm:text-6xl lg:text-[5.5rem] font-black leading-[0.9] tracking-tighter uppercase">
                <span className="block sm:hidden whitespace-nowrap">AETHER WEAR</span>
                <span className="hidden sm:block">AETHER<br />WEAR</span>
              </h1>
              <div className="mt-6 sm:mt-8 flex flex-row gap-2 sm:gap-0 w-full sm:w-auto">
                <Link to="/men" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 sm:gap-2 bg-white px-4 py-3.5 sm:px-8 sm:py-5 text-[10px] sm:text-xs font-black tracking-widest text-black transition-all duration-300 hover:bg-red-600 hover:text-white border-2 border-white relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    SHOP MEN <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
                <Link to="/women" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-1.5 sm:gap-2 px-4 py-3.5 sm:px-8 sm:py-5 text-[10px] sm:text-xs font-black tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black border-2 border-white sm:-ml-[2px] relative overflow-hidden">
                  <span className="relative z-10 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                    SHOP WOMEN <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 w-full lg:w-auto mt-6 lg:mt-0">
              {[
                ['12K+', 'FITS SHIPPED'],
                ['4.8', 'AVG RATING'],
                ['48H', 'DISPATCH'],
              ].map(([value, label], idx) => (
                <div key={label} className={`border-2 border-white p-3 sm:p-5 text-center bg-black/50 backdrop-blur-sm min-w-0 ${idx > 0 ? '-ml-[2px]' : ''}`}>
                  <div className="text-xl sm:text-3xl font-black">{value}</div>
                  <div className="mt-1 text-[8px] sm:text-[9px] font-bold tracking-widest text-zinc-400 truncate">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 z-20 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIdx(idx)}
              className="group relative h-1 w-12 cursor-pointer bg-white/20 transition-all hover:bg-white/40 overflow-hidden"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-white transition-all ${idx === currentHeroIdx ? 'w-full duration-[2000ms] ease-linear' : 'w-0 duration-0'
                  }`}
              />
            </button>
          ))}
        </div>
      </section>
      <section className="border-b-2 border-black dark:border-white">
        <div className="flex flex-col md:flex-row">
          {[
            { icon: Truck, title: 'FREE SHIPPING', copy: 'On orders above ₹399' },
            { icon: ShieldCheck, title: 'ORIGINAL QUALITY', copy: 'Checked fabrics & finishing' },
            { icon: BadgePercent, title: 'BUNDLE PRICING', copy: 'Buy 3 and save more' },
          ].map(({ icon: Icon, title, copy }, idx) => (
            <div key={title} className={`flex-1 flex items-center gap-4 p-6 sm:p-8 ${idx < 2 ? 'border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white' : ''}`}>
              <span className="inline-flex h-12 w-12 items-center justify-center border-2 border-black dark:border-white">
                <Icon size={20} strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-sm font-black tracking-widest">{title}</h3>
                <p className="mt-1 text-xs text-zinc-500 normal-case tracking-normal">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── NEW ARRIVALS ───────── */}
      {!newArrivalsLoading && newArrivals.length > 0 && (
        <section className="border-b-2 border-black dark:border-white">
          <div className="px-6 sm:px-10 py-10 flex items-end justify-between gap-4 border-b-2 border-black dark:border-white">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 fill-current" />
                <span className="text-xs font-black tracking-widest text-zinc-500">JUST DROPPED</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">NEW ARRIVALS</h2>
            </div>
            <Link to="/collections/men" className="hidden sm:inline-flex items-center gap-2 text-xs font-black tracking-widest hover:text-red-600 transition-colors">
              VIEW ALL <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
            {newArrivals.map((product: any) => (
              <ProductCard key={product.pid || product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── FEATURED IMAGES ───────── */}
      <section className="border-b-2 border-black dark:border-white">
        <div className="grid md:grid-cols-2">
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white overflow-hidden">
            <img src={dynamicImg1} alt="Featured Collection 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="overflow-hidden">
            <img src={dynamicImg2} alt="Featured Collection 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* ───────── MEN'S PICKS ───────── */}
      {!menLoading && menProducts.length > 0 && (
        <section className="border-b-2 border-black dark:border-white">
          <div className="px-6 sm:px-10 py-10 flex items-end justify-between gap-4 border-b-2 border-black dark:border-white">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                <span className="text-xs font-black tracking-widest text-zinc-500">FOR HIM</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">MEN'S PICKS</h2>
            </div>
            <Link to="/collections/men" className="hidden sm:inline-flex items-center gap-2 text-xs font-black tracking-widest hover:text-red-600 transition-colors">
              SHOP MEN <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
            {menProducts.map((product: any) => (
              <ProductCard key={product.pid || product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── WOMEN'S PICKS ───────── */}
      {!womenLoading && womenProducts.length > 0 && (
        <section className="border-b-2 border-black dark:border-white">
          <div className="px-6 sm:px-10 py-10 flex items-end justify-between gap-4 border-b-2 border-black dark:border-white">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-black tracking-widest text-zinc-500">FOR HER</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">WOMEN'S PICKS</h2>
            </div>
            <Link to="/collections/women" className="hidden sm:inline-flex items-center gap-2 text-xs font-black tracking-widest hover:text-red-600 transition-colors">
              SHOP WOMEN <ArrowRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
            {womenProducts.map((product: any) => (
              <ProductCard key={product.pid || product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ───────── SALE CTA + STYLE BOXES ───────── */}
      <section className="border-b-2 border-black dark:border-white">
        <div className="grid lg:grid-cols-2">
          {/* Sale box */}
          <div className="bg-black text-white p-10 sm:p-14 flex flex-col justify-center border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white relative overflow-hidden">
            <img src={dynamicImg1} alt="Sale" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20" />
            <div className="relative z-10">
              <span className="text-xs font-black tracking-widest text-red-500">LIMITED OFFER</span>
              <h2 className="mt-4 text-5xl sm:text-7xl font-black leading-[0.85] tracking-tighter">
                BUY 3<br />FOR ₹1199
              </h2>
              <p className="mt-6 max-w-lg text-sm text-zinc-400 normal-case tracking-normal leading-relaxed">
                Build a full rotation with graphic tees, essentials, and relaxed fits.
              </p>
              <Link to="/sale" className="mt-8 inline-flex items-center gap-2 bg-white text-black px-8 py-5 text-xs font-black tracking-widest hover:bg-red-600 hover:text-white transition-colors border-2 border-white">
                SHOP SALE <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
          {/* Sale products grid */}
          <div className="grid grid-cols-2">
            {saleProducts.length > 0 ? (
              saleProducts.map((product: any) => (
                <ProductCard key={product.pid || product._id} product={product} />
              ))
            ) : (
              [['OVERSIZED', 'Built for easy layering'], ['GRAPHIC', 'Collab-inspired prints'], ['ESSENTIALS', 'Clean daily staples'], ['ACCESSORIES', 'Finish the look']].map(([title, copy], idx) => (
                <div key={title} className={`p-8 sm:p-10 border-black dark:border-white ${idx < 2 ? 'border-b-2' : ''} ${idx % 2 === 0 ? 'border-r-2' : ''}`}>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">{title}</h3>
                  <p className="mt-2 text-xs text-zinc-500 normal-case tracking-normal">{copy}</p>
                  <ArrowRight size={20} strokeWidth={2.5} className="mt-4 text-zinc-400" />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ───────── CURATED PICKS (PRODUCT IMAGES) ───────── */}
      <section className="border-b-2 border-black dark:border-white">
        <div className="px-6 sm:px-10 py-10 border-b-2 border-black dark:border-white">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter">CURATED PICKS</h2>
        </div>
        <div className="grid md:grid-cols-3">
          <div className="aspect-[3/4] overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white">
            <img src={dynamicImg1} alt="Leather Jacket" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-[3/4] overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white">
            <img src={dynamicImg2} alt="Handbag" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
          <div className="aspect-[3/4] overflow-hidden">
            <img src={dynamicImg3} alt="Men's Collection" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          </div>
        </div>
      </section>

      {/* ── 10s LOGIN POPUP ── */}
      {showLoginPopup && !userInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative bg-white dark:bg-zinc-900 text-black dark:text-white w-full max-w-sm rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">

            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-r from-black via-zinc-600 to-black dark:from-white dark:via-zinc-400 dark:to-white" />

            {/* Close */}
            <button
              onClick={() => setShowLoginPopup(false)}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <X size={14} strokeWidth={2.5} />
            </button>

            <div className="px-7 pt-7 pb-8">
              {/* Countdown ring + heading */}
              <div className="flex items-center gap-4 mb-5">
                {/* SVG countdown ring */}
                <div className="relative w-12 h-12 shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3" className="text-zinc-200 dark:text-zinc-700" />
                    <circle
                      cx="24" cy="24" r="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - countdown / 10)}`}
                      strokeLinecap="round"
                      className="text-black dark:text-white transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-black dark:text-white">
                    {countdown}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight leading-tight">Welcome Back!</h2>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Sign in to continue shopping</p>
                </div>
              </div>

              {/* Login form */}
              <form onSubmit={handlePopupLogin} className="space-y-3">
                {loginError && (
                  <p className="text-xs text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                    {loginError}
                  </p>
                )}

                {/* Email */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus-within:border-black dark:focus-within:border-white transition-colors">
                  <Mail size={15} className="text-zinc-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus-within:border-black dark:focus-within:border-white transition-colors">
                  <Lock size={15} className="text-zinc-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3.5 rounded-xl text-xs font-black tracking-widest uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                  {!loginLoading && <ArrowRight size={13} />}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Register link */}
              <Link
                to="/register"
                onClick={() => setShowLoginPopup(false)}
                className="block w-full text-center border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-3 rounded-xl text-xs font-bold tracking-wider hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-200"
              >
                Create an account
              </Link>

              <p className="text-center text-[10px] text-zinc-400 mt-4">
                Your data is safe. We don't spam.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HomePage;
