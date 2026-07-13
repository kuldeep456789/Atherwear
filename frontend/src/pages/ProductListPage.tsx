import { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
import { useGetCategoriesQuery } from '../store/slices/categoryApiSlice';
import ProductCard from '../components/product/ProductCard';

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-black dark:border-white pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full font-black text-sm mb-4 text-[hsl(var(--foreground))] flex justify-between items-center cursor-pointer uppercase tracking-widest"
      >
        {title}
        {open ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
      </button>
      {open && children}
    </div>
  );
};

const ProductListPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [page, setPage] = useState(1);
  const [collectionType, setCollectionType] = useState<'Men' | 'Women' | undefined>(undefined);
  const [isAccessories, setIsAccessories] = useState(false);
  const [isSale, setIsSale] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [brandChecked, setBrandChecked] = useState(true);
  const [sortBy, setSortBy] = useState('Popularity');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    if (location.pathname.includes('/men')) {
      setCollectionType('Men');
      setIsAccessories(false);
      setIsSale(false);
    } else if (location.pathname.includes('/women')) {
      setCollectionType('Women');
      setIsAccessories(false);
      setIsSale(false);
    } else if (location.pathname.includes('/accessories')) {
      setCollectionType(undefined);
      setIsAccessories(true);
      setIsSale(false);
    } else if (location.pathname.includes('/sale')) {
      setCollectionType(undefined);
      setIsAccessories(false);
      setIsSale(true);
    } else {
      setCollectionType(undefined);
      setIsAccessories(false);
      setIsSale(false);
    }
    setSelectedCategories([]);
    setSelectedSizes([]);
    setPage(1);
  }, [location.pathname]);

  const { data: categoriesData } = useGetCategoriesQuery(undefined);
  const categories = Array.isArray(categoriesData) ? categoriesData : [];
  const accessoryCategoryNames = ['Bewakoof Sneakers', 'Sliders', 'Clogs', 'Caps', 'Backpacks', 'Sling bags', 'Duffel bags'];
  const visibleCatalogCategories = isAccessories
    ? categories.filter((c: any) => accessoryCategoryNames.includes(c.name))
    : categories;

  // CJ's product-list API only accepts a single categoryId per request, so the
  // category filter is effectively single-select even though it renders as checkboxes.
  const activeCategoryId =
    selectedCategories[0] ||
    (categoryParam ? visibleCatalogCategories.find((c: any) => c.name === categoryParam)?._id : undefined);

  const { data: productsData, isLoading, error } = useGetProductsQuery(
    {
      ...(activeCategoryId ? { categoryId: activeCategoryId } : {}),
      ...(keyword ? { q: keyword } : {}),
      pageNum: page,
      pageSize: 80,
    }
  );

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories((prev) => (prev[0] === id ? [] : [id]));
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

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

  if (selectedSizes.length > 0) {
    filteredProducts = filteredProducts.filter((p: any) =>
      p.variants?.some((v: any) => selectedSizes.includes(v.size) && v.stock > 0)
    );
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

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL'];
  const visibleCategories = showAllCategories
    ? visibleCatalogCategories
    : visibleCatalogCategories.slice(0, 8);
  const visibleSizes = sizeOptions;

  const pageTitle = keyword
    ? `Search: "${keyword}"`
    : isAccessories
    ? 'Accessories'
    : isSale
    ? 'Sale'
    : collectionType
    ? `${collectionType} Collections`
    : 'Our Shop';

  const tabs = ['ALL', 'MEN', 'WOMEN', 'ACCESSORIES'];

  const filterSidebar = (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-lg font-black mb-8 text-[hsl(var(--foreground))] uppercase tracking-widest border-b-2 border-black dark:border-white pb-4">
        Filters
      </h2>

      <FilterSection title="Category">
        <div className="space-y-4 pl-0.5">
          {visibleCatalogCategories.length === 0 ? (
            <p className="text-sm text-zinc-500">Loading...</p>
          ) : (
            visibleCategories.map((cat: any) => (
              <label key={cat._id} className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat._id)}
                  onChange={() => handleCategoryToggle(cat._id)}
                  className="h-5 w-5 border-2 border-black dark:border-white cursor-pointer accent-black"
                />
                <span className="text-sm font-bold text-[hsl(var(--foreground))] group-hover:underline transition-colors uppercase tracking-wide">
                  {cat.name}
                </span>
              </label>
            ))
          )}
          {visibleCatalogCategories.length > 5 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="text-sm font-black text-[hsl(var(--foreground))] cursor-pointer underline underline-offset-4 uppercase tracking-wider"
            >
              {showAllCategories ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Sizes">
        <div className="flex flex-wrap gap-2">
          {visibleSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`px-4 py-2.5 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${
                selectedSizes.includes(size)
                  ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                  : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Brand">
        <label className="flex items-center gap-4 cursor-pointer">
          <input
            type="checkbox"
            checked={brandChecked}
            onChange={() => setBrandChecked((prev) => !prev)}
            className="h-5 w-5 border-2 border-black dark:border-white cursor-pointer accent-black"
          />
          <span className="text-sm font-bold text-[hsl(var(--foreground))] uppercase tracking-wide">Aetherwear</span>
        </label>
        <label className="flex items-center gap-4 cursor-pointer mt-4">
          <input
            type="checkbox"
            className="h-5 w-5 border-2 border-black dark:border-white cursor-pointer accent-black"
          />
          <span className="text-sm font-bold text-[hsl(var(--foreground))] uppercase tracking-wide">Aetherwear HD 1.0</span>
        </label>
      </FilterSection>
    </div>
  );

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
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
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
          {/* Mobile filter toggle */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden h-full px-6 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white cursor-pointer hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors flex items-center gap-2 relative"
          >
            <SlidersHorizontal size={14} strokeWidth={2.5} />
            FILTER
            {(selectedCategories.length + selectedSizes.length) > 0 && (
              <span className="absolute top-2 right-2 min-w-[18px] h-[18px] bg-red-600 text-white text-[9px] font-black flex items-center justify-center px-0.5">
                {selectedCategories.length + selectedSizes.length}
              </span>
            )}
          </button>
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

      <div className="max-w-[1920px] mx-auto flex items-start">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0 sticky top-32 max-h-[calc(100vh-8rem)] overflow-y-auto p-6 border-r-2 border-black dark:border-white">
          {filterSidebar}
        </aside>

        {/* Main content */}
        <div className="flex-1 w-full">
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
              <h3 className="text-2xl font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-3">No Products Found</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6 font-medium">
                We couldn't find any products matching your current filters.
              </p>
              {(selectedCategories.length > 0 || selectedSizes.length > 0 || keyword) && (
                <button
                  onClick={() => { setSelectedCategories([]); setSelectedSizes([]); setActiveTab('ALL'); }}
                  className="px-8 py-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-black uppercase tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                >
                  CLEAR ALL FILTERS
                </button>
              )}
            </div>
          ) : (
            <>
              {/* BORDER-COLLAPSE GRID */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 border-t-2 border-l-2 border-black dark:border-white">
                {sortedProducts.map((product: any, index: number) => (
                  <ProductCard
                    key={product.pid || product._id || product.id || `${product.title || product.name || 'product'}-${index}`}
                    product={product}
                    keyword={keyword}
                  />
                ))}
              </div>

              {/* Pagination */}
              {selectedCategories.length === 0 &&
                selectedSizes.length === 0 &&
                !keyword &&
                productsData?.pages > 1 && (
                  <div className="flex justify-center py-10 gap-0 border-t-2 border-black dark:border-white">
                    {[...Array(productsData.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setPage(i + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center font-black text-sm transition-all cursor-pointer -ml-[2px] first:ml-0 ${
                          page === i + 1
                            ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                            : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet (slide-up) */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
        <div
          className={`absolute left-0 right-0 bottom-0 max-h-[82vh] bg-[hsl(var(--card))] border-t-2 border-black dark:border-white rounded-t-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out ${
            mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2 shrink-0">
            <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-600 rounded-full" />
          </div>
          {/* Header */}
          <div className="flex justify-between items-center px-6 pb-4 border-b-2 border-black dark:border-white shrink-0">
            <h2 className="font-black uppercase tracking-widest text-sm">
              FILTERS
              {(selectedCategories.length + selectedSizes.length) > 0 && (
                <span className="ml-2 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[10px] font-black px-2 py-0.5">
                  {selectedCategories.length + selectedSizes.length} ACTIVE
                </span>
              )}
            </h2>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="h-10 w-10 inline-flex items-center justify-center border-2 border-black dark:border-white cursor-pointer hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
          {/* Scrollable filter content */}
          <div className="overflow-y-auto flex-1 p-6">
            {filterSidebar}
          </div>
          {/* Apply button */}
          <div className="shrink-0 border-t-2 border-black dark:border-white p-4 flex gap-3">
            {(selectedCategories.length + selectedSizes.length) > 0 && (
              <button
                onClick={() => { setSelectedCategories([]); setSelectedSizes([]); }}
                className="flex-none px-6 py-4 border-2 border-black dark:border-white text-xs font-black tracking-widest uppercase hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
              >
                CLEAR
              </button>
            )}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="flex-1 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-xs font-black tracking-widest uppercase border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors cursor-pointer"
            >
              SHOW {isLoading ? '...' : sortedProducts.length} ITEMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
