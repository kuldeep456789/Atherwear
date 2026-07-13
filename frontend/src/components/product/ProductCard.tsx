import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
import type { RootState } from '../../store/store';
import { getColorHex } from '../../utils/colorMap';
import { getFirstProductImage, getProductId, getProductImages } from '../../lib/product';
import { formatUSD } from '../../lib/currency';
import DOMPurify from 'dompurify';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">VASTRA</text></svg>';


interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images: string[];
    averageRating?: number;
    rating?: number;
    numReviews?: number;
    variants?: { color: string; size: string; stock: number }[];
    colors?: string[];
    sizes?: string[];
    tags?: string[];
    title?: string;
  };
  keyword?: string;
}

const ProductCard = ({ product, keyword }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const productId = getProductId(product) || product.name || 'product';
  const isWishlisted = wishlistItems.some((item: any) => item._id === productId);

  const productImages = getProductImages(product);
  // Brand placeholder image (inline SVG via data URI)
  // const placeholderImage = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect width="100%" height="100%" fill="%23f4f4f5"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="900" fill="%23a1a1aa" letter-spacing="4">VASTRA</text></svg>';

  const primaryImage = getFirstProductImage(product) || PLACEHOLDER_IMAGE;
  const secondaryImage = productImages[1] || primaryImage;

  const uniqueColors = product.colors || (product.variants
    ? Array.from(new Set(product.variants.map((v) => v.color)))
    : []);
  const uniqueSizes = product.sizes || (product.variants
    ? Array.from(new Set(product.variants.map((v) => v.size)))
    : []);

  const discountPercentage =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

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
    <div
      className="group flex flex-col w-full select-none border-r-2 border-b-2 border-black dark:border-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-[#F4F4F2] dark:p-1.5 cursor-pointer">
        <Link to={`/product/${productId}`} className="block h-full w-full">
          {imageFailed ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-white dark:bg-black px-8 text-center">
              <span className="mb-3 text-[11px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
                VASTRA
              </span>
              <span className="line-clamp-3 text-xl font-black leading-tight text-black dark:text-white">
                {product.title || product.name}
              </span>
            </div>
          ) : (
            <img
              src={isHovered ? secondaryImage : primaryImage}
              alt={product.name}
              onError={() => {
                if (primaryImage !== PLACEHOLDER_IMAGE) {
                  setImageFailed(true);
                }
              }}
              className="object-cover object-center w-full h-full transition-transform duration-500 ease-out group-hover:scale-105 dark:mix-blend-multiply"
            />
          )}
        </Link>


        {/* Sale badge — flat rectangle */}
        {/* {discountPercentage > 0 && (
          <span className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-wider border-r-2 border-b-2 border-black dark:border-white">
            SALE
          </span>
        )} */}

        {/* Wishlist */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 z-10 h-10 w-10 inline-flex items-center justify-center border-2 border-black dark:border-white bg-white dark:bg-black transition-colors cursor-pointer ${isWishlisted ? 'text-red-500' : 'text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
            }`}
          aria-label="Add to wishlist"
        >
          <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Rating + Badges row — top left */}
        <div className="absolute top-2 left-2 flex flex-col items-start gap-1 z-10">
          <div className="flex items-center gap-1 bg-white/90 dark:bg-black/90 px-2 py-1 border-2 border-black dark:border-white">
            <div className="flex text-yellow-500 text-xs">
              {"★".repeat(Math.round(Number(product.rating || product.averageRating || 4.5)))}
              {"☆".repeat(5 - Math.round(Number(product.rating || product.averageRating || 4.5)))}
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest text-white bg-green-600 px-1.5 py-0.5 leading-tight">
              IN STOCK
            </span>
            {/* <span className="text-[8px] font-black uppercase tracking-widest text-white bg-blue-600 px-1.5 py-0.5 leading-tight">
              FREE SHIPPING
            </span> */}
          </div>
        </div>
        {uniqueColors.length > 0 && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 z-10">
            {uniqueColors.slice(0, 3).map((color) => (
              <div
                key={color}
                className="w-5 h-5 border-2 border-black dark:border-white"
                style={{ backgroundColor: getColorHex(color) }}
                title={color}
              />
            ))}
            {uniqueColors.length > 3 && (
              <span className="text-[10px] text-white font-black bg-black px-1.5 py-0.5 border-2 border-black">+{uniqueColors.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Variant Selectors — inline like Stynra */}
      <div className="flex border-t-2 border-black dark:border-white">
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="w-1/2 border-r-2 border-black dark:border-white bg-[hsl(var(--card))] text-[hsl(var(--foreground))] px-3 py-3 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer focus:outline-none hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <option value="">SIZE</option>
          {uniqueSizes.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <select
          value={selectedColor}
          onChange={(e) => setSelectedColor(e.target.value)}
          className="w-1/2 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] px-3 py-3 text-xs font-bold uppercase tracking-wider appearance-none cursor-pointer focus:outline-none hover:bg-[hsl(var(--secondary))] transition-colors"
        >
          <option value="">COLOR</option>
          {uniqueColors.map((color) => (
            <option key={color} value={color}>{color.toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Product Info — centered */}
      <div className="flex flex-col items-center text-center gap-1 p-4">
        {/* Title */}
        <Link to={`/product/${productId}`}>
          {keyword ? (
            <h3
              className="text-base font-bold text-[hsl(var(--foreground))] line-clamp-2 leading-tight hover:underline transition-colors uppercase tracking-wide"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize((product.title || product.name).replace(new RegExp(`(${keyword})`, 'gi'), '<mark class="bg-yellow-300 text-black px-1 font-black">$1</mark>'))
              }}
            />
          ) : (
            <h3 className="text-base font-bold text-[hsl(var(--foreground))] line-clamp-2 leading-tight hover:underline transition-colors uppercase tracking-wide">
              {product.title || product.name}
            </h3>
          )}
        </Link>

        {/* Pricing — monospace */}
        <div className="flex items-center gap-2 mt-1 font-mono">
          {product.discountPrice && product.discountPrice < product.price ? (
            <>
              <span className="text-xl font-black text-[hsl(var(--foreground))]">{formatUSD(product.discountPrice)}</span>
              <span className="text-base text-zinc-400 line-through">{formatUSD(product.price)}</span>
              <span className="text-sm font-black text-red-600">-{discountPercentage}%</span>
            </>
          ) : (
            <span className="text-xl font-black text-[hsl(var(--foreground))]">{formatUSD(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
