import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BadgePercent, ShieldCheck, Truck, X, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/slices/userApiSlice';

import { useGetProductsQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import { getFirstProductImage } from '../lib/product';
import { formatUSD } from '../lib/currency';

const placeholderImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">VASTRA</text></svg>';

const HomePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const [login, { isLoading: loginLoading }] = useLoginMutation();

  // Dynamic section queries
  const { data: newArrivalsData } = useGetProductsQuery({
    sort: 'newest',
    pageNum: 1,
    pageSize: 12,
  });

  const newArrivals = Array.isArray(newArrivalsData?.products) ? newArrivalsData.products : [];

  // For hero slideshow, use new arrivals images
  const heroImages = useMemo(() => {
    if (newArrivals.length === 0) return [placeholderImage];
    return newArrivals.map((p: any) => getFirstProductImage(p) || placeholderImage);
  }, [newArrivals]);

  const [currentHeroIdx, setCurrentHeroIdx] = useState(0);
  const [heroFailedImgs, setHeroFailedImgs] = useState<Set<number>>(new Set());
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
        {heroImages.map((img: string, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 h-full w-full transition-all duration-1000 ease-in-out transform ${idx === currentHeroIdx
              ? 'opacity-80 scale-100'
              : 'opacity-0 scale-105 pointer-events-none'
              }`}
          >
            {heroFailedImgs.has(idx) ? (
              <div className="h-full w-full bg-zinc-900 flex items-center justify-center">
                <span className="text-white/20 text-6xl font-black tracking-[0.3em]">AW</span>
              </div>
            ) : (
              <img
                src={img}
                alt="VASTRA fashion collection"
                loading={idx === 0 ? 'eager' : 'lazy'}
                onError={() => setHeroFailedImgs(prev => new Set(prev).add(idx))}
                className="h-full w-full object-cover object-center"
              />
            )}
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative z-10 flex min-h-[calc(100vh-130px)] w-full max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-16 items-end">
          <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 pb-10">
            <div className="max-w-3xl">
              <p className="text-sm sm:text-base font-black tracking-[0.3em] text-[#C9A227] mb-4">PREMIUM MINIMAL FASHION</p>
              <h1 className="text-[2.5rem] min-[375px]:text-5xl sm:text-7xl lg:text-[6rem] font-black leading-[0.85] tracking-tighter uppercase">
                <span className="block sm:hidden whitespace-nowrap">VASTRA</span>
                <span className="hidden sm:block">VASTRA</span>
              </h1>
              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-zinc-400 max-w-lg normal-case tracking-normal font-medium leading-relaxed">
                Premium minimal fashion for the modern wardrobe. Timeless design, effortless style.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-row gap-3 sm:gap-0 w-full sm:w-auto">
                <Link to="/men" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-3 bg-white px-6 py-5 sm:px-14 sm:py-7 text-sm sm:text-lg font-black tracking-widest text-black transition-all duration-300 hover:bg-red-600 hover:text-white border-2 border-white relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  <span className="relative z-10 flex items-center gap-3 whitespace-nowrap">
                    SHOP MEN <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
                <Link to="/women" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-3 px-6 py-5 sm:px-14 sm:py-7 text-sm sm:text-lg font-black tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black border-2 border-white sm:-ml-[2px] relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  <span className="relative z-10 flex items-center gap-3 whitespace-nowrap">
                    SHOP WOMEN <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-3 w-full lg:w-auto mt-8 lg:mt-0">
              {[
                ['12K+', 'FITS SHIPPED'],
                ['4.8', 'AVG RATING'],
                ['48H', 'DISPATCH'],
              ].map(([value, label], idx) => (
                <div key={label} className={`border-2 border-white p-4 sm:p-6 text-center bg-black/50 backdrop-blur-sm min-w-0 ${idx > 0 ? '-ml-[2px]' : ''}`}>
                  <div className="text-2xl sm:text-4xl font-black">{value}</div>
                  <div className="mt-1.5 text-[10px] sm:text-xs font-bold tracking-widest text-zinc-400 truncate">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-6 sm:left-10 lg:left-16 z-20 flex gap-2">
          {heroImages.map((_: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIdx(idx)}
              className="group relative h-1.5 w-14 cursor-pointer bg-white/20 transition-all hover:bg-white/40 overflow-hidden"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-white transition-all ${idx === currentHeroIdx ? 'w-full duration-[2000ms] ease-linear' : 'w-0 duration-0'
                  }`}
              />
            </button>
          ))}
        </div>
      </section>

      {/* ───────── FEATURES STRIP ───────── */}
      <section className="border-b-2 border-black dark:border-white bg-[hsl(var(--card))]">
        <div className="flex flex-col md:flex-row">
          {[
            { icon: Truck, title: 'FREE SHIPPING', copy: `On orders above ${formatUSD(399)}` },
            { icon: ShieldCheck, title: 'ORIGINAL QUALITY', copy: 'Checked fabrics & finishing' },
            { icon: BadgePercent, title: 'BUNDLE PRICING', copy: 'Buy 3 and save more' },
          ].map(({ icon: Icon, title, copy }, idx) => (
            <div key={title} className={`group flex-1 flex items-center gap-4 p-6 sm:p-8 md:p-10 transition-all duration-300 hover:bg-[hsl(var(--foreground))]/5 ${idx < 2 ? 'border-b-2 md:border-b-0 md:border-r-2 border-black dark:border-white' : ''}`}>
              <span className="inline-flex h-14 w-14 items-center justify-center border-2 border-black dark:border-white group-hover:bg-[hsl(var(--foreground))] group-hover:text-[hsl(var(--background))] transition-all duration-300">
                <Icon size={22} strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-black tracking-widest">{title}</h3>
                <p className="mt-1.5 text-sm text-zinc-500 normal-case tracking-normal">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── NEW ARRIVALS ───────── */}
      {newArrivals.length > 0 && (
        <section className="border-b-2 border-black dark:border-white">
          <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <p className="text-xs sm:text-sm font-black tracking-[0.25em] text-zinc-500 mb-2">FRESH DROPS</p>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">NEW ARRIVALS</h2>
              </div>

            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
              {newArrivals.slice(0, 8).map((product: any) => (
                <ProductCard key={product.pid || product._id} product={product} />
              ))}
            </div>

          </div>
        </section>
      )}


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
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Sign in to continue shopping</p>
                </div>
              </div>

              {/* Login form */}
              <form onSubmit={handlePopupLogin} className="space-y-3">
                {loginError && (
                  <p className="text-sm text-red-500 font-semibold bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg">
                    {loginError}
                  </p>
                )}

                {/* Email */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-black dark:focus-within:border-white transition-colors">
                  <Mail size={16} className="text-zinc-400 shrink-0" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent text-base font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-black dark:focus-within:border-white transition-colors">
                  <Lock size={16} className="text-zinc-400 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 bg-transparent text-base font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-sm font-black tracking-widest uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loginLoading ? 'Signing in...' : 'Sign In'}
                  {!loginLoading && <ArrowRight size={14} />}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Register link */}
              <Link
                to="/register"
                onClick={() => setShowLoginPopup(false)}
                className="block w-full text-center border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 py-3.5 rounded-xl text-sm font-bold tracking-wider hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all duration-200"
              >
                Create an account
              </Link>

              <p className="text-center text-xs text-zinc-400 mt-4">
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