import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown, ChevronRight, ChevronUp, SlidersHorizontal, X } from 'lucide-react';
import { useGetProductsQuery } from '../store/slices/productApiSlice';
import { useGetCategoriesQuery } from '../store/slices/categoryApiSlice';
import ProductCard from '../components/product/ProductCard';
import { getProductId } from '../lib/product';

const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, '-');
const fromSlug = (value: string) => value.replace(/-/g, ' ');

const COLLECTION_SUBCATEGORIES: Record<string, string[]> = {
  men: ['Shirts', 'T-Shirts', 'Oversized', 'Polo', 'Jeans', 'Cargo', 'Shorts', 'Jackets', 'Hoodies'],
  women: ['Dresses', 'Tops', 'Shirts', 'Jeans', 'Jackets', 'Co-ords'],
  accessories: ['Caps', 'Wallets', 'Sunglasses', 'Belts', 'Bags'],
};

const matchesCollection = (name: string, gender: string) => {
  const normalized = name.toLowerCase();

  if (gender === 'men') {
    return /\b(men|men's|male)\b/i.test(normalized);
  }

  if (gender === 'women') {
    return /\b(women|women's|female)\b/i.test(normalized);
  }

  if (gender === 'accessories') {
    return (
      normalized.includes('accessor') ||
      normalized.includes('bag') ||
      normalized.includes('shoe') ||
      normalized.includes('wallet') ||
      normalized.includes('belt') ||
      normalized.includes('cap') ||
      normalized.includes('sunglass')
    );
  }

  return true;
};

const FilterSection = ({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean; }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b-2 border-black dark:border-white pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => setOpen(!open)} className="w-full font-black text-sm mb-4 text-[hsl(var(--foreground))] flex justify-between items-center cursor-pointer uppercase tracking-widest">
        {title}
        {open ? <ChevronUp size={18} strokeWidth={2.5} /> : <ChevronDown size={18} strokeWidth={2.5} />}
      </button>
      {open && children}
    </div>
  );
};

const CollectionPage = () => {
  const { gender, subcategory } = useParams();
  const normalizedGender = gender?.toLowerCase() || '';
  const normalizedSubcategory = subcategory?.toLowerCase() || '';
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [localMinPrice, setLocalMinPrice] = useState<string>('');
  const [localMaxPrice, setLocalMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');
  const [sortBy, setSortBy] = useState('Popularity');

  useEffect(() => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setMinPrice('');
    setMaxPrice('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setMinRating('');
  }, [gender, subcategory]);

  const { data: categoriesData = [], isLoading: categoriesLoading } = useGetCategoriesQuery(undefined);
  const collectionTabs = Array.isArray(categoriesData)
    ? categoriesData.filter((category: any) => matchesCollection(String(category?.name || ''), normalizedGender))
    : [];

  const productQuery = {
    ...(normalizedGender ? { gender: normalizedGender } : {}),
    ...(normalizedSubcategory
      ? { subcategoryName: fromSlug(normalizedSubcategory) }
      : normalizedGender === 'accessories'
        ? { subcategoryName: 'caps' } // Default to caps to avoid massive accessories fetch
        : {}),
    ...(selectedSizes.length > 0 ? { sizes: selectedSizes.join(',') } : {}),
    ...(selectedColors.length > 0 ? { colors: selectedColors.join(',') } : {}),
    pageNum: 1,
    pageSize: 50,
  };

  const { data, isLoading, error } = useGetProductsQuery(productQuery);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]);
  };

  const productsFromResponse = Array.isArray(data?.products)
    ? data.products
    : Array.isArray((data as any)?.data?.products)
      ? (data as any).data.products
      : Array.isArray((data as any)?.data?.records)
        ? (data as any).data.records
        : Array.isArray((data as any)?.records)
          ? (data as any).records
          : [];

  let filteredProducts = [...productsFromResponse];

  if (minPrice) {
    filteredProducts = filteredProducts.filter((p: any) => Number(p.discountPrice || p.price || 0) >= Number(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter((p: any) => Number(p.discountPrice || p.price || 0) <= Number(maxPrice));
  }
  if (minRating) {
    filteredProducts = filteredProducts.filter((p: any) => Number(p.rating || p.averageRating || 4.5) >= Number(minRating));
  }

  const sortedProducts = filteredProducts.sort((a: any, b: any) => {
    const aPrice = Number(a.discountPrice ?? a.price ?? 0);
    const bPrice = Number(b.discountPrice ?? b.price ?? 0);
    const aReviews = Number(a.numReviews ?? 0);
    const bReviews = Number(b.numReviews ?? 0);
    const aRating = Number(a.rating ?? a.averageRating ?? 0);
    const bRating = Number(b.rating ?? b.averageRating ?? 0);

    if (sortBy === 'Popularity') return bReviews - aReviews;
    if (sortBy === 'Price: Low to High') return aPrice - bPrice;
    if (sortBy === 'Price: High to Low') return bPrice - aPrice;
    if (sortBy === 'Customer Rating') return bRating - aRating;
    return 0;
  });

  const availableSizes = Array.from(new Set(productsFromResponse.flatMap((p: any) => p.sizes || []))).filter(Boolean) as string[];
  const availableColors = Array.from(new Set(productsFromResponse.flatMap((p: any) => p.colors || []))).filter(Boolean) as string[];

  const pageTitle = subcategory
    ? `${fromSlug(subcategory)}`
    : gender
      ? `ALL ${gender}`
      : 'COLLECTION';

  const filterSidebar = (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--foreground))]">
      <h2 className="text-lg font-black mb-8 text-[hsl(var(--foreground))] uppercase tracking-widest border-b-2 border-black dark:border-white pb-4">Filters</h2>

      {/* Collection subcategory nav links */}
      {normalizedGender && COLLECTION_SUBCATEGORIES[normalizedGender] && (
        <div className="border-b-2 border-black dark:border-white pb-6 mb-6">
          <h3 className="font-black text-sm mb-4 text-[hsl(var(--foreground))] uppercase tracking-widest">
            {normalizedGender === 'accessories' ? 'Shop By' : `${normalizedGender} Collection`}
          </h3>
          <div className="flex flex-col">
            <Link
              to={`/collections/${normalizedGender}`}
              className={`py-2 px-3 text-xs font-bold uppercase tracking-widest border-b border-black/10 dark:border-white/10 transition-colors ${!normalizedSubcategory
                  ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                  : 'hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
                }`}
            >
              All {normalizedGender === 'accessories' ? 'Accessories' : normalizedGender}
            </Link>
            {COLLECTION_SUBCATEGORIES[normalizedGender].map((sub) => {
              const slug = toSlug(sub);
              const isActive = normalizedSubcategory === slug;
              return (
                <Link
                  key={sub}
                  to={`/collections/${normalizedGender}/${slug}`}
                  className={`py-2 px-3 text-xs font-bold uppercase tracking-widest border-b border-black/10 dark:border-white/10 transition-colors ${isActive
                      ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]'
                      : 'hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
                    }`}
                >
                  {sub}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <FilterSection title="Price">
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            placeholder="Min"
            value={localMinPrice}
            onChange={(e) => setLocalMinPrice(e.target.value)}
            onBlur={() => setMinPrice(localMinPrice ? String(Math.max(0, Number(localMinPrice))) : '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setMinPrice(localMinPrice ? String(Math.max(0, Number(localMinPrice))) : '');
            }}
            className="w-full p-2 border-2 border-black dark:border-white bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 appearance-none font-bold"
          />
          <span className="font-bold">-</span>
          <input
            type="number"
            placeholder="Max"
            value={localMaxPrice}
            onChange={(e) => setLocalMaxPrice(e.target.value)}
            onBlur={() => setMaxPrice(localMaxPrice ? String(Math.max(0, Number(localMaxPrice))) : '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setMaxPrice(localMaxPrice ? String(Math.max(0, Number(localMaxPrice))) : '');
            }}
            className="w-full p-2 border-2 border-black dark:border-white bg-[hsl(var(--background))] text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 appearance-none font-bold"
          />
        </div>
      </FilterSection>
      <FilterSection title="Rating">
        <div className="flex flex-col gap-2">
          {[4, 3, 2, 1].map((rating) => (
            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={minRating === String(rating)}
                onChange={() => setMinRating(String(rating))}
                className="w-5 h-5 appearance-none border-2 border-black dark:border-white checked:bg-black dark:checked:bg-white checked:relative checked:after:content-[''] checked:after:absolute checked:after:inset-1 checked:after:bg-white dark:checked:after:bg-black cursor-pointer transition-colors"
              />
              <span className="text-sm font-bold uppercase tracking-widest group-hover:text-zinc-500 transition-colors">
                {rating} Stars & Up
              </span>
            </label>
          ))}
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="rating"
              checked={minRating === ''}
              onChange={() => setMinRating('')}
              className="w-5 h-5 appearance-none border-2 border-black dark:border-white checked:bg-black dark:checked:bg-white checked:relative checked:after:content-[''] checked:after:absolute checked:after:inset-1 checked:after:bg-white dark:checked:after:bg-black cursor-pointer transition-colors"
            />
            <span className="text-sm font-bold uppercase tracking-widest group-hover:text-zinc-500 transition-colors">
              Any Rating
            </span>
          </label>
        </div>
      </FilterSection>
      <FilterSection title="Sizes">
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => (
            <button key={size} onClick={() => handleSizeToggle(size)} className={`px-4 py-2.5 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${selectedSizes.includes(size) ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'}`}>
              {size}
            </button>
          ))}
        </div>
      </FilterSection>
      <FilterSection title="Colors">
        <div className="flex flex-wrap gap-2">
          {availableColors.map((color) => (
            <button key={color} onClick={() => handleColorToggle(color)} className={`px-4 py-2.5 border-2 border-black dark:border-white text-xs font-black uppercase tracking-wider cursor-pointer transition-colors ${selectedColors.includes(color) ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'}`}>
              {color}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex justify-between items-center text-xs font-bold tracking-widest text-zinc-500">
        <div className="flex gap-2 items-center">
          <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={3} />
          {gender && (
            <>
              <Link to={`/collections/${gender}`} className="hover:text-[hsl(var(--foreground))] transition-colors">{gender}</Link>
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
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="w-full border-b-2 border-black dark:border-white flex items-center justify-between sticky top-[64px] sm:top-[80px] bg-[hsl(var(--card))] z-20">
        <div className="flex items-center h-14 overflow-x-auto whitespace-nowrap hide-scrollbar flex-1">
          <Link
            to={gender ? `/collections/${gender}` : '/collections'}
            className={`h-full flex items-center px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white transition-colors cursor-pointer shrink-0 ${!subcategory ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
              }`}
          >
            ALL
          </Link>
          {categoriesLoading ? (
            <span className="h-full flex items-center px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white">
              LOADING...
            </span>
          ) : (
            collectionTabs.map((tab: any) => {
              const tabSlug = toSlug(String(tab.name || ''));
              const isActive = normalizedSubcategory === tabSlug;

              return (
                <Link
                  key={tab._id}
                  to={gender ? `/collections/${gender}/${tabSlug}` : `/collections/${tabSlug}`}
                  className={`h-full flex items-center px-6 sm:px-8 text-xs font-black tracking-widest uppercase border-r-2 border-black dark:border-white transition-colors cursor-pointer shrink-0 ${isActive ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))]' : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]'
                    }`}
                >
                  {tab.name}
                </Link>
              );
            })
          )}
        </div>
        <div className="flex items-center h-14 shrink-0">
          <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden h-full px-6 text-xs font-black tracking-widest uppercase border-l-2 border-black dark:border-white cursor-pointer hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors flex items-center gap-2 relative">
            <SlidersHorizontal size={14} strokeWidth={2.5} /> FILTER
          </button>
          <div className="hidden lg:flex items-center h-full border-l-2 border-black dark:border-white">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-full px-6 text-xs font-black tracking-widest uppercase bg-[hsl(var(--card))] text-[hsl(var(--foreground))] cursor-pointer focus:outline-none appearance-none">
              <option value="Popularity">SORT: POPULAR</option>
              <option value="Price: Low to High">SORT: PRICE ↑</option>
              <option value="Price: High to Low">SORT: PRICE ↓</option>
              <option value="Customer Rating">SORT: RATING</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto flex items-start">
        <aside className="hidden lg:block w-[280px] xl:w-[320px] flex-shrink-0 sticky top-[136px] max-h-[calc(100vh-8.5rem)] overflow-y-auto p-6 border-r-2 border-black dark:border-white">
          {filterSidebar}
        </aside>

        <div className="flex-1 w-full">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 border-l-2 border-black dark:border-white">
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
            <div className="text-center py-20 px-6 border-b-2 border-l-2 border-black dark:border-white">
              <span className="text-6xl mb-6 block">✕</span>
              <h3 className="text-2xl font-black uppercase tracking-widest text-[hsl(var(--foreground))] mb-3">No Products Found</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 border-l-2 border-black dark:border-white border-t-0">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={getProductId(product) || product.name} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${mobileFiltersOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setMobileFiltersOpen(false)} />
        <div className={`absolute left-0 right-0 bottom-0 max-h-[82vh] bg-[hsl(var(--card))] border-t-2 border-black dark:border-white rounded-t-2xl overflow-hidden flex flex-col transition-transform duration-300 ease-out ${mobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <div className="flex justify-between items-center px-6 py-4 border-b-2 border-black dark:border-white shrink-0">
            <h2 className="font-black uppercase tracking-widest text-sm">FILTERS</h2>
            <button onClick={() => setMobileFiltersOpen(false)} className="h-10 w-10 inline-flex items-center justify-center border-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors">
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 p-6">{filterSidebar}</div>
          <div className="shrink-0 border-t-2 border-black dark:border-white p-4 flex gap-3">
            <button onClick={() => setMobileFiltersOpen(false)} className="flex-1 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-xs font-black tracking-widest uppercase border-2 border-black dark:border-white hover:bg-red-600 hover:text-white transition-colors cursor-pointer">
              SHOW {sortedProducts.length} ITEMS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;