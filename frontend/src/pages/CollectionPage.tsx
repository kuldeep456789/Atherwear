import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
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
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex justify-between items-center text-xs font-bold tracking-widest text-zinc-500">
        <div className="flex gap-2 items-center">
          <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={3} />
          {gender && (
            <>
              <Link to={`/collections/${gender}`} className="hover:text-[hsl(var(--foreground))] transition-colors">{gender.toUpperCase()} COLLECTIONS</Link>
              <ChevronRight size={10} strokeWidth={3} />
            </>
          )}
          <span className="text-[hsl(var(--foreground))]">{pageTitle}</span>
        </div>
        <span className="text-[hsl(var(--foreground))] font-black tracking-widest">
          FOUND {isLoading ? '...' : sortedProducts.length} ITEMS
        </span>
      </div>

      <div className="w-full border-b-2 border-black dark:border-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="w-full border-b-2 border-black dark:border-white flex items-center justify-between sticky top-[64px] sm:top-[80px] bg-[hsl(var(--card))] z-20">
        <div className="flex items-center h-14 overflow-x-auto whitespace-nowrap hide-scrollbar flex-1">
          {categoriesLoading ? (
            <span className="h-full flex items-center px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white">
              LOADING...
            </span>
          ) : (
            collectionTabs.map((tab: any) => {
              const tabSlug = toSlug(String(tab.name || ''));
              const isActive = normalizeSlug(normalizedSubcategory) === tabSlug;

              return (
                <Link
                  key={tab._id}
                  to={gender ? `/collections/${gender}/${tabSlug}` : `/collections/${tabSlug}`}
                  className={`h-full flex items-center px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white transition-colors cursor-pointer shrink-0 ${isActive ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
                    }`}
                >
                  {cleanCategoryName(tab.name)}
                </Link>
              );
            })
          )}
        </div>
        <div className="flex items-center h-14 shrink-0">
          <div className="relative flex items-center h-full border-l-2 border-black dark:border-white" ref={sortRef}>
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="relative flex items-center gap-2 h-full px-5 text-sm font-semibold tracking-wider bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <ChevronDown size={14} strokeWidth={2.5} className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="absolute top-full right-0 mt-1.5 w-[230px] bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden z-50"
                  style={{ transformOrigin: 'top right' }}
                >
                  <div className="py-1.5">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => { setSortBy(option.value); setSortOpen(false); }}
                        className={`w-full flex items-center px-4 py-3 text-base font-medium tracking-normal text-left transition-all duration-150 cursor-pointer ${
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

      <div className="max-w-[1920px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t-2 border-l-2 border-black dark:border-white">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-b-2 border-r-2 border-black dark:border-white p-0">
                <div className="aspect-[4/5] bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="p-4 space-y-2"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse w-3/4" /><div className="h-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 border-2 border-black dark:border-white m-6">
            <h2 className="text-red-600 font-black text-xl mb-4">
              ERROR LOADING PRODUCTS
            </h2>
            <pre className="text-left text-xs bg-gray-100 dark:bg-gray-900 p-4 overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-6 border-b-2 border-black dark:border-white">
            <span className="text-6xl mb-6 block">✕</span>
            <h3 className="text-2xl font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-3">No Products Found</h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t-2 border-l-2 border-black dark:border-white">
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
