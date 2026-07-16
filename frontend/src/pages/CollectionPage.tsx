import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
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
    return /\b(men|man|male|mens)\b/i.test(normalized) && !/\b(women|woman|female|womens)\b/i.test(normalized);
  }

  if (gender === 'women') {
    return /\b(women|woman|female|womens)\b/i.test(normalized);
  }

  // For 'all' or empty gender, include everything
  return true;
};

// Client-side gender filter — strict match on collectionType or gender field
const matchesProductGender = (product: any, gender: string): boolean => {
  if (!gender || gender === 'all') return true;
  const ct = String(product?.collectionType ?? product?.gender ?? '').toLowerCase().trim();
  return ct === gender.toLowerCase();
};


const CollectionPage = () => {
  const { gender, subcategory } = useParams();
  const normalizedGender = gender?.toLowerCase() || '';
  const normalizedSubcategory = subcategory?.toLowerCase() || '';
  const isAllGender = normalizedGender === 'all' || normalizedGender === '';
  const [page, setPage] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [normalizedGender, normalizedSubcategory]);

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

  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);

  // For "all" gender, show all categories; for men/women, filter accordingly
  const collectionTabs = Array.isArray(categoriesData)
    ? categoriesData.filter((category: any) =>
        matchesCollection(
          String(category?.name || ''),
          isAllGender ? '' : normalizedGender,
          String(category?.group || ''),
        ),
      )
    : [];

  const activeCategory = normalizedSubcategory
    ? collectionTabs.find((category: any) => normalizeSlug(String(category?.name || '')) === normalizeSlug(fromSlug(normalizedSubcategory)))
    : undefined;

  // Main gender query — uses warehouse, server-side paginated
  const { data: genderProductsData, isLoading: genderLoading, error: genderError } = useGetProductsQuery({
    ...(normalizedGender && !isAllGender ? { gender: normalizedGender } : {}),
    ...(activeCategory?.name ? { subcategoryName: activeCategory.name } : {}),
    pageNum: page,
    pageSize: 20,
  });

  // Fetch men product count (for getCategoryCount helper)
  const { data: menProductsData } = useGetProductsQuery(
    { gender: 'men', pageNum: 1, pageSize: 20 },
    { skip: !isAllGender && normalizedGender !== 'men' },
  );

  // Fetch women product count
  const { data: womenProductsData } = useGetProductsQuery(
    { gender: 'women', pageNum: 1, pageSize: 20 },
    { skip: !isAllGender && normalizedGender !== 'women' },
  );

  const data = genderProductsData;
  const isLoading = genderLoading;
  const error = genderError;

  const productsFromResponse = Array.isArray(data?.products)
    ? data.products
    : Array.isArray((data as any)?.data?.products)
      ? (data as any).data.products
      : Array.isArray((data as any)?.data?.records)
        ? (data as any).data.records
        : Array.isArray((data as any)?.records)
          ? (data as any).records
          : [];

  // Strictly filter products by gender — applied on ALL tab (no subcategory)
  const genderFilteredProducts = !activeCategory?.name && normalizedGender && !isAllGender
    ? productsFromResponse.filter((p: any) => matchesProductGender(p, normalizedGender))
    : productsFromResponse;

  const sortedProducts = [...genderFilteredProducts];

  // ── Count helpers ──────────────────────────────────────────────────────────
  const menCount = (() => {
    const raw = Array.isArray(menProductsData?.products) ? menProductsData.products : [];
    return raw.filter((p: any) => matchesProductGender(p, 'men')).length;
  })();

  const womenCount = (() => {
    const raw = Array.isArray(womenProductsData?.products) ? womenProductsData.products : [];
    return raw.filter((p: any) => matchesProductGender(p, 'women')).length;
  })();

  const totalAllCount = isAllGender
    ? sortedProducts.length
    : menCount + womenCount || sortedProducts.length;

  // Per-category product count (from already-loaded genderProductsData)
  const allLoadedProducts = Array.isArray(genderProductsData?.products)
    ? genderProductsData.products
    : [];

  const getCategoryCount = (tab: any): number => {
    if (!allLoadedProducts.length) return 0;
    const tabSlug = normalizeSlug(String(tab.name || ''));
    return allLoadedProducts.filter((p: any) => {
      const pCat = normalizeSlug(String(p?.categoryName || p?.category || ''));
      const pCatId = String(p?.categoryId || '');
      return pCat === tabSlug || pCatId === tab._id;
    }).length;
  };

  // ── Category tabs ──────────────────────────────────────────────────────────
  const filteredTabs = Array.isArray(collectionTabs)
    ? collectionTabs.filter((tab: any) => cleanCategoryName(tab.name).toUpperCase() !== 'ALL')
    : [];

  const categoryTabLinks = filteredTabs.map((tab: any) => {
    const tabSlug = toSlug(String(tab.name || ''));
    const displayName = cleanCategoryName(tab.name);
    const isActive = normalizeSlug(normalizedSubcategory) === tabSlug;
    const tabCount = getCategoryCount(tab);

    return (
      <Link
        key={tab.name}
        to={gender ? `/collections/${gender}/${tabSlug}` : `/collections/${tabSlug}`}
        className={`group relative shrink-0 py-2 px-2 text-[13px] sm:text-[15px] font-bold tracking-wider transition-all duration-200 cursor-pointer ${
          isActive
            ? 'text-[hsl(var(--foreground))]'
            : 'text-zinc-400 dark:text-zinc-500 hover:text-[hsl(var(--foreground))]'
        }`}
      >
        {displayName.toUpperCase()}
        {tabCount > 0 && (
          <span className={`ml-1 text-[10px] font-semibold ${isActive ? 'text-zinc-500 dark:text-zinc-400' : 'text-zinc-400 dark:text-zinc-600'}`}>
            ({tabCount})
          </span>
        )}
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
  });

  // Server returns the current page products directly — no client-side slicing needed
  // For warehouse responses, data.total gives the full pool size
  const serverTotal: number = (data as any)?.total ?? sortedProducts.length;
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.max(1, Math.ceil(serverTotal / ITEMS_PER_PAGE));
  // Products are already paged by the server, display them as-is
  const paginatedProducts = sortedProducts;

  const pageTitle = activeCategory?.name
    ? `${cleanCategoryName(activeCategory.name)}`
    : subcategory
      ? `${fromSlug(subcategory)}`
      : normalizedGender === 'all'
        ? 'ALL COLLECTIONS'
        : gender
          ? `${gender} COLLECTIONS`
          : 'COLLECTIONS';

  // Section count shown in the header (men/women page = their count; all page = total)
  const headerCount = isAllGender
    ? totalAllCount
    : sortedProducts.length;

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
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
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
                {isLoading ? '...' : headerCount} ITEMS
              </span>
            </div>
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
              <div className="flex items-center gap-2 sm:gap-3">
                {categoryTabLinks}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Products Grid */}
      <div className="max-w-[1920px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
