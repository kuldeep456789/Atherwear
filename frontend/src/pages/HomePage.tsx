import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, BadgePercent, ShieldCheck, Truck, X, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/slices/userApiSlice';

import { useGetProductsQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';
import { getFirstProductImage } from '../lib/product';
import { formatUSD } from '../lib/currency';

const placeholderImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">AETHERWEAR</text></svg>';

const ITEMS_PER_PAGE = 10;

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.state]);

  const [login, { isLoading: loginLoading }] = useLoginMutation();

  // Dynamic section queries
  const { data: newArrivalsData } = useGetProductsQuery({
    sort: 'newest',
    pageNum: 1,
    pageSize: 100,
  });

  const { data: menData } = useGetProductsQuery({
    collectionType: 'Men',
    pageNum: 1,
    pageSize: 80,
  });

  const { data: womenData } = useGetProductsQuery({
    collectionType: 'Women',
    pageNum: 1,
    pageSize: 80,
  });

  const newArrivals = Array.isArray(newArrivalsData?.products) ? newArrivalsData.products : [];
  const menProducts = Array.isArray(menData?.products) ? menData.products : [];
  const womenProducts = Array.isArray(womenData?.products) ? womenData.products : [];

  const [menShowAll, setMenShowAll] = useState(false);
  const [menPage, setMenPage] = useState(1);
  const [womenShowAll, setWomenShowAll] = useState(false);
  const [womenPage, setWomenPage] = useState(1);

  const menTotalPages = Math.max(1, Math.ceil(menProducts.length / ITEMS_PER_PAGE));
  const womenTotalPages = Math.max(1, Math.ceil(womenProducts.length / ITEMS_PER_PAGE));

  const visibleMen = menShowAll
    ? menProducts.slice((menPage - 1) * ITEMS_PER_PAGE, menPage * ITEMS_PER_PAGE)
    : menProducts.slice(0, ITEMS_PER_PAGE);
  const visibleWomen = womenShowAll
    ? womenProducts.slice((womenPage - 1) * ITEMS_PER_PAGE, womenPage * ITEMS_PER_PAGE)
    : womenProducts.slice(0, ITEMS_PER_PAGE);

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
                alt="Aetherwear streetwear collection"
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
              {/* <p className="text-sm sm:text-base font-black tracking-[0.3em] text-red-500 mb-4">NEW SEASON DROP</p> */}
              <h1 className="text-[2.5rem] min-[375px]:text-5xl sm:text-7xl lg:text-[6rem] font-black leading-[0.85] tracking-tighter uppercase">
                <span className="block sm:hidden whitespace-nowrap">VASTRA</span>
                <span className="hidden sm:block">VASTRA</span>
              </h1>
              {/* <p className="mt-4 sm:mt-6 text-sm sm:text-base text-zinc-400 max-w-lg normal-case tracking-normal font-medium leading-relaxed">
                Premium streetwear engineered for the modern rebel. Limited drops, infinite attitude.
              </p> */}
              <div className="mt-8 sm:mt-10 flex flex-row gap-3 sm:gap-0 w-full sm:w-auto">
                <Link to="/collections/men" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-3 bg-white px-6 py-5 sm:px-14 sm:py-7 text-sm sm:text-lg font-black tracking-widest text-black transition-all duration-300 hover:bg-red-600 hover:text-white border-2 border-white relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  <span className="relative z-10 flex items-center gap-3 whitespace-nowrap">
                    SHOP MEN <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </span>
                </Link>
                <Link to="/collections/women" className="group/btn flex-1 sm:flex-initial justify-center inline-flex items-center gap-3 px-6 py-5 sm:px-14 sm:py-7 text-sm sm:text-lg font-black tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-black border-2 border-white sm:-ml-[2px] relative overflow-hidden shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
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
                {/* <p className="text-xs sm:text-sm font-black tracking-[0.25em] text-zinc-500 mb-2">FRESH DROPS</p> */}
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">NEW ARRIVALS</h2>
              </div>
              <Link
                to="/new-arrivals"
                className="hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm font-black tracking-widest hover:underline underline-offset-4 transition-all group"
              >
                VIEW ALL <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {newArrivals.slice(0, 10).map((product: any) => (
                <ProductCard key={product.pid || product._id} product={product} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/new-arrivals"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-black dark:border-white text-xs font-black tracking-widest hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
              >
                VIEW ALL NEW ARRIVALS <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
export default HomePage;
