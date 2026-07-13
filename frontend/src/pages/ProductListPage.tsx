import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
import { useGetCategoriesQuery } from '../store/slices/categoryApiSlice';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 10;

const ProductListPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [page, setPage] = useState(1);
  const [collectionType, setCollectionType] = useState<'Men' | 'Women' | undefined>(undefined);
  const [isAccessories, setIsAccessories] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [sortBy, setSortBy] = useState('Popularity');
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (location.pathname.includes('/men')) {
      setCollectionType('Men');
      setIsAccessories(false);
      setIsSale(false);
      setActiveTab('MEN');
    } else if (location.pathname.includes('/women')) {
      setCollectionType('Women');
      setIsAccessories(false);
      setIsSale(false);
      setActiveTab('WOMEN');
    } else if (location.pathname.includes('/accessories')) {
      setCollectionType(undefined);
      setIsAccessories(true);
      setIsSale(false);
      setActiveTab('ACCESSORIES');
    } else if (location.pathname.includes('/sale')) {
      setCollectionType(undefined);
      setIsAccessories(false);
      setIsSale(true);
      setActiveTab('ALL');
    } else {
      setCollectionType(undefined);
      setIsAccessories(false);
      setIsSale(false);
      setActiveTab('ALL');
    }
    setPage(1);
  }, [location.pathname]);

  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const accessoryCategoryNames = ['Bewakoof Sneakers', 'Sliders', 'Clogs', 'Caps', 'Backpacks', 'Sling bags', 'Duffel bags'];
  const visibleCatalogCategories = isAccessories
    ? categories.filter((c: any) => accessoryCategoryNames.includes(c.name))
    : categories;

  const activeCategoryId =
    categoryParam ? visibleCatalogCategories.find((c: any) => c.name === categoryParam)?._id : undefined;

  const { data: productsData, isLoading, error } = useGetProductsQuery(
    {
      ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
      ...(keyword ? { q: keyword } : {}),
      ...(collectionType ? { collectionType } : {}),
      pageNum: 1,
      pageSize: 80,
    }
  );

  let filteredProducts = productsData?.products || [];

  if (isAccessories) {
    const accessoryCatIds = visibleCatalogCategories.map((c: any) => c._id);
    filteredProducts = filteredProducts.filter(
      (p: any) => p.tags?.includes('Accessories') || accessoryCatIds.includes(p.category)
    );
  }

  if (isSale) {
    filteredProducts = filteredProducts.filter(
      (p: any) => p.discountPrice && p.discountPrice < p.price
    );
  }

  // Tab filtering
  if (activeTab === 'MEN') {
    filteredProducts = filteredProducts.filter((p: any) => p.collectionType === 'Men');
  } else if (activeTab === 'WOMEN') {
    filteredProducts = filteredProducts.filter((p: any) => p.collectionType === 'Women');
  }

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const aPrice = a.discountPrice || a.price;
    const bPrice = b.discountPrice || b.price;
    if (sortBy === 'Popularity') return b.numReviews - a.numReviews;
    if (sortBy === 'Price: Low to High') return aPrice - bPrice;
    if (sortBy === 'Price: High to Low') return bPrice - aPrice;
    if (sortBy === 'Customer Rating') return b.averageRating - a.averageRating;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = sortedProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const pageTitle = keyword
    ? `Search: "${keyword}"`
    : isAccessories
    ? 'Accessories'
    : isSale
    ? 'Sale'
    : collectionType
    ? `${collectionType} Collections`
    : 'Our Shop';

  const tabs = ['MEN', 'WOMEN', 'ACCESSORIES'];

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

      {/* Accessories hero banner */}
      {isAccessories && (
        <div className="w-full border-b-2 border-black dark:border-white bg-black">
          <div className="max-w-[1920px] mx-auto relative h-[200px] sm:h-[320px] lg:h-[400px] overflow-hidden">
            <div className="w-full h-full bg-zinc-900 opacity-70 hover:opacity-90 transition-opacity duration-700" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center">
              <div className="px-6 sm:px-10 lg:px-16">
                <p className="text-white/60 text-xs sm:text-sm font-bold tracking-[0.3em] uppercase mb-2 sm:mb-3">Finish the look</p>
                <h2 className="text-white text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-none">
                  Accessories
                </h2>
                <p className="text-white/80 text-sm sm:text-base mt-3 sm:mt-4 max-w-md font-medium">
                  Bags, sneakers, caps & more — the details that define your style.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <option value="Popularity">SORT: POPULAR</option>
            <option value="Price: Low to High">SORT: PRICE ↑</option>
            <option value="Price: High to Low">SORT: PRICE ↓</option>
            <option value="Customer Rating">SORT: RATING</option>
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
