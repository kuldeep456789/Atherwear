import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronDown, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetProductsByCategoryQuery, useGetProductsQuery } from '../store/slices/productApiSlice';
import { useGetCategoriesQuery } from '../store/slices/categoryApiSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';



const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toSlug = (value: string) => normalizeSlug(value);
const fromSlug = (value: string) => value.replace(/-/g, ' ');

const cleanCategoryName = (name: string): string => {
  const lower = name.toLowerCase().trim();
  if (lower === "men's clothing" || lower === "women's clothing") return 'ALL';
  const cleaned = name
    .replace(/\bmen's\b/gi, '')
    .replace(/\bwomen's\b/gi, '')
    .replace(/couple\s*&\s*parent-child/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || name;
};

const matchesCollection = (name: string, gender: string, group = '') => {
  const normalized = `${name} ${group}`.toLowerCase();

  if (gender === 'men') {
    return /\b(men|men's|male)\b/i.test(normalized);
  }

  if (gender === 'women') {
    return /\b(women|women's|female)\b/i.test(normalized);
  }

  return true;
};

const ITEMS_PER_PAGE = 10;

const CollectionPage = () => {
  const { gender, subcategory } = useParams();
  const normalizedGender = gender?.toLowerCase() || '';
  const normalizedSubcategory = subcategory?.toLowerCase() || '';
  const [sortBy, setSortBy] = useState('Popularity');
  const [page, setPage] = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [normalizedGender, normalizedSubcategory]);

  useEffect(() => {
    if (!sortOpen) return;
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scrollCategories = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = 280;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  const sortOptions = [
    { value: 'Popularity', label: 'Popularity' },
    { value: 'Price: Low to High', label: 'Price ↑' },
    { value: 'Price: High to Low', label: 'Price ↓' },
  ];

  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const collectionTabs = Array.isArray(categoriesData)
    ? categoriesData.filter((category: any) =>
        matchesCollection(
          String(category?.name || ''),
          normalizedGender,
          String(category?.group || ''),
        ),
      )
    : [];

  const activeCategory = normalizedSubcategory
    ? collectionTabs.find((category: any) => normalizeSlug(String(category?.name || '')) === normalizeSlug(fromSlug(normalizedSubcategory)))
    : undefined;

  const categoryId = activeCategory?._id;

  const { data: categoryProductsData, isLoading: categoryLoading, error: categoryError } = useGetProductsByCategoryQuery(
    categoryId ? { categoryId, pageNum: 1, pageSize: 80 } : (undefined as any),
    { skip: !categoryId } as any,
  );

  const { data: genderProductsData, isLoading: genderLoading, error: genderError } = useGetProductsQuery(
    !categoryId
      ? {
          ...(normalizedGender ? { gender: normalizedGender } : {}),
          pageNum: 1,
          pageSize: 80,
        }
      : (undefined as any),
    { skip: !!categoryId } as any,
  );

  const data = categoryId ? categoryProductsData : genderProductsData;
  const isLoading = categoryId ? categoryLoading : genderLoading;
  const error = categoryId ? categoryError : genderError;

  const productsFromResponse = Array.isArray(data?.products)
    ? data.products
    : Array.isArray((data as any)?.data?.products)
      ? (data as any).data.products
      : Array.isArray((data as any)?.data?.records)
        ? (data as any).data.records
        : Array.isArray((data as any)?.records)
          ? (data as any).records
          : [];

  const sortedProducts = [...productsFromResponse].sort((a: any, b: any) => {
    const aPrice = Number(a.discountPrice ?? a.price ?? 0);
    const bPrice = Number(b.discountPrice ?? b.price ?? 0);
    const aReviews = Number(a.numReviews ?? 0);
    const bReviews = Number(b.numReviews ?? 0);
    if (sortBy === 'Popularity') return bReviews - aReviews;
    if (sortBy === 'Price: Low to High') return aPrice - bPrice;
    if (sortBy === 'Price: High to Low') return bPrice - aPrice;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pageTitle = activeCategory?.name
    ? `${cleanCategoryName(activeCategory.name)}`
    : subcategory
      ? `${fromSlug(subcategory)}`
      : gender
        ? `${gender} COLLECTIONS`
        : 'COLLECTIONS';

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase pt-[112px] sm:pt-[116px] lg:pt-[124px]">
      {/* Compact Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10">
          <div className="flex items-center gap-2 pt-5 pb-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500">
            <Link to="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">HOME</Link>
            <ChevronRight size={10} strokeWidth={2.5} />
            {gender && (
              <>
                <Link to={`/collections/${gender}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">{gender.toUpperCase()}</Link>
                <ChevronRight size={10} strokeWidth={2.5} />
              </>
            )}
            <span className="text-zinc-700 dark:text-zinc-300">{pageTitle}</span>
          </div>
          <div className="flex items-center justify-between pb-5">
            <h1 className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold tracking-tight text-[hsl(var(--foreground))] leading-none">
              {pageTitle}
            </h1>
            <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              {isLoading ? '...' : sortedProducts.length} ITEMS
            </span>
          </div>
        </div>
      </div>

      {/* Premium Category Navigation */}
      <div className="sticky top-[88px] bg-[hsl(var(--background))] z-20 border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 relative">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollCategories('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer hidden lg:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
          )}
          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollCategories('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-lg transition-all duration-200 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer hidden lg:flex"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          )}
          {/* Category Tabs */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar touch-pan-x py-3"
          >
            {categoriesLoading ? (
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-[14px] w-[60px] bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse shrink-0" />
                ))}
              </div>
            ) : (
              collectionTabs.map((tab: any) => {
                const tabSlug = toSlug(String(tab.name || ''));
                const isActive = normalizeSlug(normalizedSubcategory) === tabSlug;
                const displayName = cleanCategoryName(tab.name);

                return (
                  <Link
                    key={tab._id}
                    to={gender ? `/collections/${gender}/${tabSlug}` : `/collections/${tabSlug}`}
                    className={`group relative shrink-0 py-2 px-2 text-[13px] sm:text-[15px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'text-[hsl(var(--foreground))]'
                        : 'text-zinc-400 dark:text-zinc-500 hover:text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {displayName.toUpperCase()}
                    {isActive && (
                      <motion.span
                        layoutId="activeTab"
                        className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-[calc(100%-16px)] h-[3px] rounded-full bg-[hsl(var(--foreground))]"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <span className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-0 group-hover:w-[calc(100%-16px)] h-[3px] rounded-full bg-zinc-300 dark:bg-zinc-600 transition-all duration-300" />
                  </Link>
                );
              })
            )}
            {/* Sort on mobile/tablet inside scroll */}
            <div className="hidden sm:flex items-center h-full shrink-0 ml-2">
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 py-2 px-3 text-[13px] sm:text-[15px] font-bold tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
                >
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                  <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="absolute top-full right-0 mt-1.5 w-[200px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                      style={{ transformOrigin: 'top right' }}
                    >
                      <div className="py-1.5">
                        {sortOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                            className={`w-full flex items-center px-4 py-3 text-[13px] font-semibold tracking-normal text-left transition-all duration-150 cursor-pointer ${
                              sortBy === option.value
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sort Row */}
      <div className="sm:hidden flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-[hsl(var(--card))]">
        <span className="text-[11px] font-semibold text-zinc-400">{isLoading ? '...' : sortedProducts.length} ITEMS</span>
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider text-zinc-500 hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
          >
            SORT: {sortOptions.find((o) => o.value === sortBy)?.label}
            <ChevronDown size={13} strokeWidth={2.5} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="absolute top-full right-0 mt-1.5 w-[200px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                style={{ transformOrigin: 'top right' }}
              >
                <div className="py-1.5">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                      className={`w-full flex items-center px-4 py-3 text-[13px] font-semibold tracking-normal text-left transition-all duration-150 cursor-pointer ${
                        sortBy === option.value
                          ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1920px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t border-zinc-200 dark:border-zinc-800">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-b border-r border-zinc-200 dark:border-zinc-800 p-0">
                <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="p-4 space-y-2"><div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse w-3/4" /><div className="h-4 bg-zinc-100 dark:bg-zinc-800 animate-pulse w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 m-6">
            <h2 className="text-red-600 font-black text-xl mb-4">ERROR LOADING PRODUCTS</h2>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-6">
            <span className="text-5xl mb-6 block">✕</span>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))] mb-3">No Products Found</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t border-zinc-200 dark:border-zinc-800">
              {paginatedProducts.map((product: any) => (
                <ProductCard key={product.pid || product._id || product.id || product.name} product={product} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionPage;
