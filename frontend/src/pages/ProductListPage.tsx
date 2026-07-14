import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
import { useGetCategoriesQuery } from '../store/slices/categoryApiSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const getCollectionFromPath = (pathname: string) =>
  pathname.includes('/men') ? 'Men' as const
    : pathname.includes('/women') ? 'Women' as const
      : pathname.includes('/new-arrivals') ? undefined
      : undefined;

const getActiveTabFromPath = (pathname: string) =>
  pathname.includes('/new-arrivals') ? 'ALL'
    : pathname.includes('/men') ? 'MEN'
    : pathname.includes('/women') ? 'WOMEN'
      : 'ALL';

const ProductListPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [page, setPage] = useState(1);
  const collectionType = getCollectionFromPath(location.pathname);
  const isNewArrivals = location.pathname.includes('/new-arrivals');
  const [sortBy, setSortBy] = useState(isNewArrivals ? 'Newest' : 'Popularity');
  const [activeTab, setActiveTab] = useState(() => getActiveTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getActiveTabFromPath(location.pathname));
    setPage(1);
  }, [location.pathname]);

  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const visibleCatalogCategories = categories;

  const activeCategoryId =
    categoryParam ? visibleCatalogCategories.find((c: any) => c.name === categoryParam)?._id : undefined;

  const { data: productsData, isLoading, error } = useGetProductsQuery(
    {
      ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
      ...(keyword ? { q: keyword } : {}),
      ...(collectionType ? { collectionType } : {}),
      ...(isNewArrivals ? { sort: 'newest' } : {}),
      pageNum: 1,
      pageSize: 100,
    }
  );

  let filteredProducts = productsData?.products || [];

  // Tab filtering
  if (activeTab === 'MEN') {
    filteredProducts = filteredProducts.filter((p: any) => p.collectionType === 'Men');
  } else if (activeTab === 'WOMEN') {
    filteredProducts = filteredProducts.filter((p: any) => p.collectionType === 'Women');
  }

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const aPrice = a.discountPrice || a.price;
    const bPrice = b.discountPrice || b.price;
    if (sortBy === 'Newest') return 0;
    if (sortBy === 'Popularity') return b.numReviews - a.numReviews;
    if (sortBy === 'Price: Low to High') return aPrice - bPrice;
    if (sortBy === 'Price: High to Low') return bPrice - aPrice;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pageTitle = isNewArrivals
    ? 'NEW ARRIVALS'
    : keyword
    ? `Search: "${keyword}"`
    : collectionType
    ? `${collectionType} Collections`
    : 'Our Shop';

  const tabs = isNewArrivals ? ['MEN', 'WOMEN'] : ['MEN', 'WOMEN'];

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex justify-between items-center text-xs font-bold tracking-widest text-zinc-500">
        <div className="flex gap-2 items-center">
          <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={3} />
          <span className="text-[hsl(var(--foreground))]">{pageTitle}</span>
        </div>
        <span className="text-[hsl(var(--foreground))] font-black tracking-widest">
          FOUND {isLoading ? '...' : sortedProducts.length} ITEMS
        </span>
      </div>

      {/* Page header */}
      <div className="w-full border-b-2 border-black dark:border-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Filter tabs bar (Sticky at top) */}
      <div className="w-full border-b-2 border-black dark:border-white flex items-center justify-between sticky top-[130px] bg-[hsl(var(--card))] z-20">
        <div className="flex items-center h-14">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`h-full px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white transition-colors cursor-pointer ${
                activeTab === tab
                  ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center h-14 border-l-2 border-black dark:border-white">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-full px-6 text-xs font-black tracking-widest uppercase bg-[hsl(var(--card))] text-[hsl(var(--foreground))] cursor-pointer focus:outline-none appearance-none"
          >
            <option value="Newest">SORT: NEWEST</option>
            <option value="Popularity">SORT: POPULAR</option>
            <option value="Price: Low to High">SORT: PRICE ↑</option>
            <option value="Price: High to Low">SORT: PRICE ↓</option>
          </select>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto">
        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t-2 border-l-2 border-black dark:border-white">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="border-r-2 border-b-2 border-black dark:border-white p-0">
                <div className="aspect-[4/5] shimmer" />
                <div className="p-4 space-y-2">
                  <div className="h-4 shimmer w-3/4" />
                  <div className="h-4 shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 border-2 border-black dark:border-white m-6">
            <span className="text-lg font-black uppercase tracking-widest text-red-600">ERROR LOADING PRODUCTS</span>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 px-6 border-b-2 border-black dark:border-white">
            <span className="text-6xl mb-6 block">✕</span>
            <h3 className="text-3xl font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-3">No Products Found</h3>
            <p className="text-base text-zinc-500 max-w-sm mx-auto mb-6 font-medium">
              We couldn't find any products matching your current filters.
            </p>
          </div>
        ) : (
          <>
            {/* BORDER-COLLAPSE GRID */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t-2 border-l-2 border-black dark:border-white">
              {paginatedProducts.map((product: any, index: number) => (
                <ProductCard
                  key={product.pid || product._id || product.id || `${product.title || product.name || 'product'}-${index}`}
                  product={product}
                  keyword={keyword}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
