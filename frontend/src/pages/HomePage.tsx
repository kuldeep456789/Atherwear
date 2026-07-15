import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { X, Eye, EyeOff, Mail, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { setCredentials } from '../store/slices/authSlice';
import { useLoginMutation } from '../store/slices/userApiSlice';

import { useGetProductsQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';



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

  const carouselProducts = useMemo(() => {
    const mixed: any[] = [];
    const max = Math.min(menProducts.length, womenProducts.length, 5);
    for (let i = 0; i < max; i++) {
      mixed.push(menProducts[i], womenProducts[i]);
    }
    return mixed.slice(0, 10);
  }, [menProducts, womenProducts]);

  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const heroImages = [
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80',
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1920&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1920&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1920&q=80',
  ];

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
      <section className="relative h-[550px] sm:h-[650px] lg:h-[720px] overflow-hidden bg-black text-white">
        {heroImages.map((img: string, idx: number) => (
          <div
            key={idx}
            className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${idx === currentHeroIdx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          >
            <img
              src={img}
              alt="VASTRA fashion collection"
              loading={idx === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover object-center"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 flex h-full w-full max-w-[1400px] mx-auto px-12 lg:px-20 pb-20 lg:pb-24 items-end">
          <div className="max-w-xl">
            <h1 className="text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter text-white">
              VASTRA
            </h1>
            <p className="mt-5 text-lg text-white/90 max-w-md leading-8 font-normal normal-case tracking-normal">
              Discover premium fashion crafted for modern lifestyles. Explore timeless collections designed with quality, comfort, and confidence for every occasion.
            </p>
            <div className="mt-8 flex flex-row gap-5 items-center">
              <Link to="/collections/men" className="inline-flex items-center justify-center h-[64px] px-14 bg-white text-black text-lg font-bold tracking-widest transition-all duration-300 hover:bg-zinc-200 border-2 border-white active:scale-[0.98]">
                SHOP MEN
              </Link>
              <Link to="/collections/women" className="inline-flex items-center justify-center h-[64px] px-14 text-white text-lg font-bold tracking-widest transition-all duration-300 hover:bg-white hover:text-black border-2 border-white active:scale-[0.98]">
                SHOP WOMEN
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {heroImages.map((_: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentHeroIdx(idx)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === currentHeroIdx ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>



      {/* ───────── FEATURED COLLECTION ───────── */}
      {carouselProducts.length > 0 && (
        <section className="border-b-2 border-black dark:border-white">
          <div className="max-w-[1920px] mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
            <div className="flex items-end justify-between mb-8 sm:mb-10">
              <div>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none">COLLECTION</h2>
              </div>

            </div>
            <div className="relative" ref={carouselRef}>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${carouselIdx * (carouselRef.current?.offsetWidth ?? 0)}px)` }}
                >
                  {carouselProducts.map((product: any) => (
                    <div
                      key={product.pid || product._id}
                      className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4"
                    >
                      <div className="px-3">
                        <ProductCard product={product} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {carouselProducts.length > 4 && (
                <div className="flex justify-end mt-8 gap-3">
                  <button
                    onClick={() => setCarouselIdx((p) => Math.max(0, p - 1))}
                    disabled={carouselIdx === 0}
                    className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Previous products"
                  >
                    <ChevronLeft size={20} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setCarouselIdx((p) => {
                      if (!carouselRef.current) return p;
                      const maxIdx = Math.ceil(carouselProducts.length / 4) - 1;
                      return Math.min(p + 1, maxIdx);
                    })}
                    disabled={
                      !carouselRef.current ||
                      carouselIdx >= Math.ceil(carouselProducts.length / 4) - 1
                    }
                    className="w-12 h-12 rounded-full bg-white shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer"
                    aria-label="Next products"
                  >
                    <ChevronRight size={20} strokeWidth={2} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
export default HomePage;
