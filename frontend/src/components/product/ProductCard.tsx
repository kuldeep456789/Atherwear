import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import type { RootState } from '../../store/store';
import { getFirstProductImage, getProductId } from '../../lib/product';
import { formatINR } from '../../lib/currency';

const PLACEHOLDER_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">VASTRA</text></svg>';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    variants?: { color: string; size: string; stock: number }[];
    colors?: string[];
    sizes?: string[];
    tags?: string[];
    title?: string;
    numReviews?: number;
    averageRating?: number;
  };
  keyword?: string;
}

export const ProductCardSkeleton = () => (
  <div className="w-full bg-white dark:bg-zinc-900 rounded-[14px] overflow-hidden animate-pulse">
    <div className="aspect-[4/5] bg-zinc-100 dark:bg-zinc-800" />
    <div className="p-4 pb-[18px] space-y-2.5">
      <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
      <div className="h-[18px] w-full bg-zinc-100 dark:bg-zinc-800 rounded" />
      <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded mt-1" />
    </div>
  </div>
);

const ProductCard = ({ product }: ProductCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const productId = getProductId(product) || product.name || 'product';
  const isWishlisted = wishlistItems.some((item: any) => item._id === productId);

  const primaryImage = getFirstProductImage(product) || PLACEHOLDER_IMAGE;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(
      toggleWishlist({
        _id: productId,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: primaryImage,
      })
    );
  };

  return (
    <div className="group relative flex flex-col w-full bg-white dark:bg-zinc-900 rounded-[14px] border border-[#ececec] dark:border-zinc-800 overflow-hidden cursor-pointer transition-shadow duration-400 ease-out hover:shadow-[0_12px_35px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_12px_35px_rgba(0,0,0,0.35)]">
      <Link to={`/product/${productId}`} className="block w-full">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-50 dark:bg-zinc-800 rounded-t-[14px]">
          {imageFailed ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-800 px-8 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">VASTRA</span>
              <span className="mt-2 line-clamp-3 text-lg font-bold leading-tight text-zinc-700 dark:text-zinc-300">
                {product.title || product.name}
              </span>
            </div>
          ) : (
            <img
              src={primaryImage}
              alt={product.name}
              loading="lazy"
              onError={() => { if (primaryImage !== PLACEHOLDER_IMAGE) setImageFailed(true); }}
              className="h-full w-full object-cover object-center transition-transform duration-[400ms] ease-out group-hover:scale-[1.06]"
            />
          )}

          <button
            onClick={handleWishlistClick}
            className={`absolute top-3 right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-110 ${
              isWishlisted
                ? 'text-orange-500 shadow-orange-500/20'
                : 'text-zinc-400 hover:text-orange-500'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
          </button>
        </div>
      </Link>

      <Link to={`/product/${productId}`} className="flex flex-col px-4 py-[14px] flex-1 space-y-1">
        <h3 className="text-base font-medium text-gray-900 dark:text-white line-clamp-2 leading-snug">
          {product.title || product.name}
        </h3>
        <div className="text-base font-medium text-gray-900 dark:text-white">
          {formatINR(product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price)}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
