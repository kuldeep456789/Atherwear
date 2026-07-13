import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useGetProductsByCategoryQuery } from '../../store/slices/productApiSlice';
import ProductCard from './ProductCard';

interface CategorySectionProps {
  categoryId: string;
  categoryName: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({ categoryId, categoryName }) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Only start fetching when the section scrolls into view (lazy load)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { data, isLoading, error } = useGetProductsByCategoryQuery(
    { categoryId, pageNum: 1, pageSize: 20 },
    { skip: !isVisible }, // Don't fire the API call until visible
  );

  const products = Array.isArray(data?.products) ? data.products : [];

  // Skeleton placeholder while loading
  if (!isVisible || isLoading) {
    return (
      <section ref={ref} className="border-b-2 border-black dark:border-white">
        <div className="px-6 sm:px-10 py-10">
          <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">{categoryName}</h2>
          {isLoading && (
            <div className="mt-8 flex gap-0 overflow-x-hidden">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="min-w-[280px] aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 animate-pulse border-r-2 border-black dark:border-white"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  // Don't render section if no products came back
  if (error || products.length === 0) {
    return null;
  }

  return (
    <section ref={ref} className="border-b-2 border-black dark:border-white">
      {/* Header */}
      <div className="px-6 sm:px-10 py-10 flex items-end justify-between gap-4 border-b-2 border-black dark:border-white">
        <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase">{categoryName}</h2>
        <Link
          to={`/men?category=${encodeURIComponent(categoryName)}`}
          className="hidden sm:inline-flex items-center gap-2 text-xs font-black tracking-widest hover:text-red-600 transition-colors"
        >
          VIEW ALL PRODUCTS <ArrowRight size={16} strokeWidth={2.5} />
        </Link>
      </div>

      {/* Horizontally scrollable product row */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {products.map((product: any) => (
          <div
            key={product.pid ?? product._id}
            className="min-w-[280px] max-w-[280px] sm:min-w-[320px] sm:max-w-[320px] shrink-0 border-r-2 border-black dark:border-white last:border-r-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;
