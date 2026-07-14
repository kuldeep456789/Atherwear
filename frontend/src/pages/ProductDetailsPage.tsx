import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductDetailsQuery, useGetRelatedProductsQuery, useCreateReviewMutation } from '../store/slices/productApiSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addRecentlyViewed } from '../store/slices/recentlyViewedSlice';
import type { RootState } from '../store/store';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, Star, Check, ChevronRight, ChevronLeft, X, ZoomIn, SendHorizonal, ThumbsUp, Share2 } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getColorHex } from '../utils/colorMap';
import { getProductImages, getProductId } from '../lib/product';
import { formatINR } from '../lib/currency';
import DOMPurify from 'dompurify';

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Mock review data generator seeded per product
const MOCK_REVIEWS = [
  { user: 'Rahul M.', rating: 5, comment: 'Amazing quality! The fabric is super soft and the fit is perfect. Got so many compliments.', date: '2 days ago', helpful: 24 },
  { user: 'Priya S.', rating: 4, comment: 'Great product overall. Runs slightly large so size down. Color is exactly as shown.', date: '1 week ago', helpful: 17 },
  // { user: 'Arjun K.', rating: 5, comment: 'Best streetwear brand! This is my 4th purchase and quality never disappoints. 10/10.', date: '2 weeks ago', helpful: 31 },
  // { user: 'Sneha R.', rating: 4, comment: 'Fast delivery and well packaged. The print quality is excellent, washed twice and still looks new.', date: '3 weeks ago', helpful: 12 },
  // { user: 'Dev T.', rating: 3, comment: 'Good product but shipping took longer than expected. The fit is oversized as described.', date: '1 month ago', helpful: 8 },
  // { user: 'Meera L.', rating: 5, comment: 'Love love love! The graphic print is vibrant and the cotton is breathable. Perfect summer wear.', date: '1 month ago', helpful: 19 },
];

const ProductDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: product, isLoading, error } = useGetProductDetailsQuery(id);
  const [createReview, { isLoading: isReviewLoading }] = useCreateReviewMutation();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const productId = product ? getProductId(product) || id || '' : '';
  const isWishlisted = product ? wishlistItems.some((item: any) => item._id === productId) : false;
  const recentlyViewedItems = useSelector((state: RootState) => state.recentlyViewed.items);
  const recentItemsToDisplay = recentlyViewedItems.filter((item) => item._id !== id).slice(0, 4);
  const { data: relatedProductsData } = useGetRelatedProductsQuery(id, { skip: !id });
  const relatedProducts = relatedProductsData?.products || [];
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const [zoomLens, setZoomLens] = useState({ active: false, imgX: 50, imgY: 50, conX: 50, conY: 50 });
  const ZOOM_SCALE = 2.5;
  const LENS_SIZE = 110;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);
  // Reviews
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, boolean>>({});
  const reviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      dispatch(addRecentlyViewed(product));
      setSelectedImage(0);
    }
  }, [product, dispatch]);

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] pt-[112px] sm:pt-[116px] lg:pt-[124px]">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-7 flex flex-col lg:flex-row lg:gap-6 xl:gap-8">
          <div className="w-full lg:w-[48%] flex gap-1.5 lg:gap-2">
            <div className="hidden lg:flex flex-col gap-1.5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-[52px] h-[68px] rounded-lg shimmer" />
              ))}
            </div>
            <div className="flex-1 h-[550px] lg:h-[620px] shimmer rounded-xl border border-zinc-200 dark:border-zinc-700" />
          </div>
          <div className="w-full lg:w-[52%] py-4 lg:py-6 space-y-6 lg:space-y-7">
            <div className="h-6 shimmer w-1/5 rounded" />
            <div className="h-[52px] shimmer w-4/5 rounded" />
            <div className="h-5 shimmer w-2/5 rounded" />
            <div className="h-[44px] shimmer w-2/3 rounded" />
            <div className="h-9 shimmer w-full rounded-lg" />
            <div className="h-14 shimmer w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <div className="text-center border-2 border-black dark:border-white p-12">
          <span className="text-4xl mb-4 block">✕</span>
          <h2 className="text-2xl font-black uppercase tracking-widest mb-2">PRODUCT NOT FOUND</h2>
          <Link to="/" className="text-sm font-bold underline underline-offset-4 uppercase tracking-wider hover:text-red-600 transition-colors">
            BACK TO SHOP
          </Link>
        </div>
      </div>
    );
  }
  const variants = product?.variants ?? [];

  const colors =
    product?.colors?.length
      ? product.colors
      : [...new Set(variants.map((v: any) => v.color).filter(Boolean))];

  const sizes =
    product?.sizes?.length
      ? product.sizes
      : [...new Set(variants.map((v: any) => v.size).filter(Boolean))];
  const productName = String(product?.name || product?.title || '').trim();

  console.log("Product:", product);
  console.log("Variants:", product?.variants);
  console.log("Colors:", colors);
  console.log("Sizes:", sizes);

  const collabTag = product.tags?.find((t: string) => t.startsWith('Collab:'))?.replace('Collab:', '') || null;
  const discountPct =
    product.discountPrice && product.price > product.discountPrice
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      setErrorMsg('Please select a size and color');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    console.log("Price Check:", {
      price: product.price,
      discountPrice: product.discountPrice,
      product,
    });
    dispatch(
      addToCart({
        _id: productId,
        name: product.name,
        price: product.discountPrice || product.price,
        image: getProductImages(product)[0] || '',
        qty: 1,
        variant: { color: selectedColor, size: selectedSize },
      })
    );
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize || !selectedColor) {
      setErrorMsg('Please select a size and color');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }
    dispatch(
      addToCart({
        _id: productId,
        name: product.name,
        price: product.discountPrice || product.price,
        image: getProductImages(product)[0] || '',
        qty: 1,
        variant: { color: selectedColor, size: selectedSize },
      })
    );
    navigate('/cart');
  };

  const baseImages = getProductImages(product);

  const colorVariantImages = selectedColor && product.variants
    ? product.variants
        .filter((v: any) => v.color === selectedColor)
        .map((v: any) => v.variantImage || v.image || '')
        .filter(Boolean)
    : [];

  const displayImages = [...new Set([
    ...colorVariantImages,
    ...baseImages,
  ])];

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const img = container.querySelector('img');
    if (!img) return;
    const crect = container.getBoundingClientRect();
    const irect = img.getBoundingClientRect();
    const imgX = ((e.clientX - irect.left) / irect.width) * 100;
    const imgY = ((e.clientY - irect.top) / irect.height) * 100;
    const conX = ((e.clientX - crect.left) / crect.width) * 100;
    const conY = ((e.clientY - crect.top) / crect.height) * 100;
    setZoomLens({ active: true, imgX: Math.min(100, Math.max(0, imgX)), imgY: Math.min(100, Math.max(0, imgY)), conX: Math.min(100, Math.max(0, conX)), conY: Math.min(100, Math.max(0, conY)) });
  };

  const openLightbox = (idx: number) => {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const lightboxPrev = () => setLightboxIdx((p) => (p - 1 + displayImages.length) % displayImages.length);
  const lightboxNext = () => setLightboxIdx((p) => (p + 1) % displayImages.length);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    if (!userInfo) {
      setErrorMsg('Please sign in to submit a review.');
      return;
    }
    try {
      await createReview({
        productId: id,
        rating: reviewRating,
        comment: reviewText,
      }).unwrap();
      setReviewSubmitted(true);
      setReviewText('');
      setErrorMsg('');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.data?.message || 'Failed to submit review.');
    }
  };

  const allReviews = [
    ...(product?.reviews || []).map((r: any) => ({
      user: r.userName,
      rating: r.rating,
      comment: r.comment,
      date: new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
      helpful: 0,
    })),
    ...MOCK_REVIEWS,
  ];

  const totalNumReviews = allReviews.length;
  const averageRatingVal = allReviews.length > 0
    ? allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length
    : 0;

  // Rating distribution for display
  const ratingDist = [5, 4, 3, 2, 1].map(r => {
    const count = allReviews.filter(rv => rv.rating === r).length;
    const pct = totalNumReviews > 0 ? Math.round((count / totalNumReviews) * 100) : 0;
    return { r, count, pct };
  });

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] font-sans uppercase pb-24 lg:pb-0 pt-[112px] sm:pt-[116px] lg:pt-[124px]">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4">
        <div className="flex gap-2 items-center text-xs font-bold tracking-widest text-zinc-500">
          <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={3} />
          {product.gender && (
            <>
              <Link to={`/collections/${product.gender}`} className="hover:text-[hsl(var(--foreground))] transition-colors">
                {String(product.gender).toUpperCase()} COLLECTIONS
              </Link>
              <ChevronRight size={10} strokeWidth={3} />
            </>
          )}
          {product.subcategory && (
            <>
              <Link to={`/collections/${product.gender}/${normalizeSlug(String(product.subcategory))}`} className="hover:text-[hsl(var(--foreground))] transition-colors">
                {product.subcategory}
              </Link>
              <ChevronRight size={10} strokeWidth={3} />
            </>
          )}
          <span className="text-[hsl(var(--foreground))] line-clamp-1 normal-case tracking-normal">{product.title || product.name}</span>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 lg:px-7 flex flex-col lg:flex-row lg:gap-6 xl:gap-8">
        {/* Left — Images (48%) */}
        <div className="w-full lg:w-[48%]">
          <div className="flex gap-1.5 lg:gap-2">
            {/* Thumbnails — vertical on desktop */}
            <div className="hidden lg:flex flex-col gap-1.5 shrink-0 pt-0">
              {displayImages.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-[52px] h-[68px] rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                    selectedImage === i
                      ? 'border-[hsl(var(--foreground))] opacity-100 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-100 hover:border-zinc-400 dark:hover:border-zinc-500'
                  }`}
                >
                  <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            {/* Main image + Zoom preview wrapper */}
            <div className="flex-1 flex gap-0 xl:gap-3 min-w-0">
              {/* Main image */}
              <div className="flex-1 min-w-0 relative" ref={imageRef}>
                <div
                  onMouseMove={handleImageZoom}
                  onMouseLeave={() => setZoomLens((p) => ({ ...p, active: false }))}
                  onClick={() => openLightbox(selectedImage)}
                  className="w-full h-[550px] lg:h-[620px] bg-zinc-100 dark:bg-[#F4F4F2] overflow-hidden relative cursor-crosshair group rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex items-center justify-center"
                >
                  <img
                    key={selectedImage}
                    src={displayImages[selectedImage] || displayImages[0]}
                    alt={productName || 'Product'}
                    className="max-w-full max-h-full object-contain p-2 transition-opacity duration-300 ease-out animate-fadeIn select-none"
                    draggable={false}
                  />

                  {/* Zoom lens overlay */}
                  {zoomLens.active && (
                    <div
                      className="absolute border-2 border-[hsl(var(--foreground))] bg-white/10 dark:bg-black/10 pointer-events-none z-30 rounded-sm"
                      style={{
                        width: `${LENS_SIZE}px`,
                        height: `${LENS_SIZE}px`,
                        left: `calc(${zoomLens.conX}% - ${LENS_SIZE / 2}px)`,
                        top: `calc(${zoomLens.conY}% - ${LENS_SIZE / 2}px)`,
                      }}
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {discountPct > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-md shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                    {productName.toLowerCase().includes('oversized') && (
                      <span className="bg-black text-white text-[10px] font-semibold tracking-wider px-3 py-1.5 rounded-md shadow-sm">
                        OVERSIZED
                      </span>
                    )}
                  </div>

                  {/* Floating Wishlist + Share */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          toggleWishlist({
                            _id: productId,
                            name: product.name,
                            price: product.price,
                            discountPrice: product.discountPrice,
                            image: getProductImages(product)[0] || '',
                          })
                        );
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer active:scale-90 ${
                        isWishlisted
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-white dark:hover:bg-zinc-800'
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className="w-[18px] h-[18px]" fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({ title: productName, url: window.location.href });
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                        }
                      }}
                      className="w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer active:scale-90"
                      aria-label="Share"
                    >
                      <Share2 className="w-[16px] h-[16px]" strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Left/Right arrows */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90 z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-5 h-5" strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev + 1) % displayImages.length);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 shadow-sm hover:bg-white dark:hover:bg-zinc-800 flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100 active:scale-90 z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-5 h-5" strokeWidth={2} />
                      </button>
                    </>
                  )}

                  {/* Zoom hint */}
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[9px] font-medium tracking-wider px-2.5 py-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-md pointer-events-none z-10">
                    <ZoomIn size={11} strokeWidth={2} /> ZOOM
                  </div>
                </div>

                {/* Thumbnails — horizontal on mobile */}
                <div className="flex lg:hidden gap-1.5 mt-1.5 overflow-x-auto pb-1">
                  {displayImages.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-12 h-16 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                        selectedImage === i
                          ? 'border-[hsl(var(--foreground))] opacity-100'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Zoom preview panel — xl screens */}
              {zoomLens.active && (
                <div className="hidden xl:block w-[200px] shrink-0 self-start sticky top-[130px]">
                  <div className="w-full h-[266px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg bg-white dark:bg-zinc-900">
                    <img
                      src={displayImages[selectedImage] || displayImages[0]}
                      alt=""
                      className="w-full h-full object-cover"
                      draggable={false}
                      style={{
                        transform: `scale(${ZOOM_SCALE})`,
                        transformOrigin: `${zoomLens.imgX}% ${zoomLens.imgY}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — Details (sticky, 52%) */}
        <div className="w-full lg:w-[52%] lg:sticky lg:top-[130px] lg:self-start">
          <div className="pt-4 lg:pt-6 space-y-6 lg:space-y-7">
            {collabTag && (
              <span className="text-[12px] font-medium text-zinc-500 tracking-[0.15em] uppercase">
                VASTRA × {collabTag}
              </span>
            )}

            <div className="max-w-[420px]">
              <h1 className="text-[32px] sm:text-[42px] lg:text-[52px] font-bold leading-[1.1] tracking-tight normal-case">
                {productName || 'Product'}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={15}
                    strokeWidth={1.5}
                    fill={s <= Math.round(averageRatingVal) ? 'currentColor' : 'none'}
                    className={s <= Math.round(averageRatingVal) ? 'text-amber-500' : 'text-zinc-200 dark:text-zinc-700'}
                  />
                ))}
              </div>
              <span className="text-[15px] text-zinc-500 font-normal tracking-wide normal-case">
                {Number(averageRatingVal).toFixed(1)} ({totalNumReviews})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              {product.discountPrice ? (
                <>
                  <span className="text-[40px] lg:text-[44px] font-bold tracking-tight">{formatINR(product.discountPrice)}</span>
                  <span className="text-xl text-zinc-400 line-through">{formatINR(product.price)}</span>
                  <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-1 rounded-md border border-red-600">
                    -{discountPct}%
                  </span>
                </>
              ) : (
                <span className="text-[40px] lg:text-[44px] font-bold tracking-tight">{formatINR(product.price)}</span>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-600 text-white p-4 text-xs font-bold tracking-wider rounded-lg">
                {errorMsg}
              </div>
            )}

            {/* Color */}
            <div>
              <p className="text-[14px] font-semibold tracking-[0.12em] uppercase mb-4">
                Color: <span className="text-zinc-500 capitalize font-normal normal-case">{selectedColor || 'Select'}</span>
              </p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color: any) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer group ${selectedColor === color ? '' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <span
                      className={`w-[36px] h-[36px] rounded-full border-2 transition-all duration-200 block ${
                        selectedColor === color
                          ? 'border-[hsl(var(--foreground))] ring-2 ring-[hsl(var(--foreground))] ring-offset-2 ring-offset-[hsl(var(--background))] scale-110'
                          : 'border-zinc-300 dark:border-zinc-600 group-hover:scale-110 group-hover:border-zinc-400 dark:group-hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: getColorHex(color) }}
                    />
                    <span className={`text-[11px] font-medium tracking-wide whitespace-nowrap ${selectedColor === color ? 'text-[hsl(var(--foreground))]' : 'text-zinc-400'}`}>
                      {(color || '').charAt(0).toUpperCase() + (color || '').slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-[14px] font-semibold tracking-[0.12em] uppercase">
                  Size: <span className="text-zinc-500 font-normal normal-case">{selectedSize || 'Select'}</span>
                </p>
                <button
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[13px] text-zinc-500 underline underline-offset-2 cursor-pointer hover:text-[hsl(var(--foreground))] transition-colors font-medium"
                >
                  SIZE GUIDE
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sizes.map((size: any) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[60px] px-5 py-3.5 rounded-lg border text-sm font-semibold transition-all duration-200 cursor-pointer active:scale-[0.97] ${
                      selectedSize === size
                        ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))] shadow-sm'
                        : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-zinc-300 dark:border-zinc-600 hover:border-[hsl(var(--foreground))] hover:shadow-sm'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={handleBuyNow}
                className="flex-1 h-[56px] rounded-xl text-sm font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-85 active:scale-[0.98] shadow-sm hover:shadow-md"
              >
                BUY NOW
              </button>
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-[56px] rounded-xl text-sm font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-2 ${
                  isAdded
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-zinc-300 dark:border-zinc-600 hover:border-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] active:scale-[0.98]'
                }`}
              >
                {isAdded ? (
                  <><Check className="w-4 h-4" strokeWidth={3} /> ADDED</>
                ) : (
                  <><ShoppingBag className="w-4 h-4" strokeWidth={2} /> ADD TO CART</>
                )}
              </button>
              <button
                onClick={() =>
                  dispatch(
                    toggleWishlist({
                      _id: productId,
                      name: product.name,
                      price: product.price,
                      discountPrice: product.discountPrice,
                        image: getProductImages(product)[0] || '',
                    })
                  )
                }
                className={`h-[56px] w-[56px] shrink-0 rounded-xl border-2 transition-all duration-200 flex items-center justify-center cursor-pointer active:scale-[0.97] ${
                  isWishlisted
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-zinc-300 dark:border-zinc-600 hover:border-red-400 hover:text-red-500 hover:shadow-sm'
                }`}
              >
                <Heart className="w-5 h-5" fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { icon: Truck, label: 'FREE SHIPPING' },
                { icon: RotateCcw, label: '14 DAY RETURNS' },
                { icon: ShieldCheck, label: 'SECURE CHECKOUT' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center justify-center text-center py-3.5 px-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-[hsl(var(--card))] min-h-[76px] transition-all duration-250 hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-md">
                  <Icon className="w-5 h-5 mb-1.5 text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                  <span className="text-[9px] font-semibold tracking-wider leading-tight">{label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-[14px] font-semibold tracking-[0.12em] uppercase mb-3">
                Description
              </h3>
              <div
                className="product-description text-[15px] leading-relaxed normal-case tracking-normal text-zinc-500 dark:text-zinc-400"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description ?? '', {
                    ADD_TAGS: ['img'],
                    ADD_ATTR: ['src', 'alt', 'style'],
                  }),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <div className="border-t-2 border-black dark:border-white">
          <div className="px-6 sm:px-10 py-8 border-b-2 border-black dark:border-white">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              YOU MAY ALSO LIKE
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
            {relatedProducts.map((item: any) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentItemsToDisplay.length > 0 && (
        <div className="border-t-2 border-black dark:border-white">
          <div className="px-6 sm:px-10 py-8 border-b-2 border-black dark:border-white">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              RECENTLY VIEWED
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t-2 border-l-2 border-black dark:border-white">
            {recentItemsToDisplay.map((item: any) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* ───────── CUSTOMER REVIEWS ───────── */}
      <div ref={reviewRef} className="border-t-2 border-black dark:border-white">
        <div className="px-6 sm:px-10 py-10 border-b-2 border-black dark:border-white flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-widest text-zinc-500">VERIFIED PURCHASES</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tighter">CUSTOMER REVIEWS</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-4 py-2 text-sm font-black">
              <Star size={14} fill="currentColor" />
              {Number(averageRatingVal).toFixed(1)}
            </div>
            <span className="text-xs font-bold text-zinc-500 tracking-widest">{totalNumReviews} REVIEWS</span>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto grid lg:grid-cols-3 border-b-2 border-black dark:border-white">
          {/* Rating Summary */}
          <div className="border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white p-8 sm:p-10">
            <div className="text-6xl font-black font-mono mb-3">{Number(averageRatingVal).toFixed(1)}</div>
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} size={18} strokeWidth={2}
                  fill={s <= Math.round(averageRatingVal) ? 'currentColor' : 'none'}
                  className={s <= Math.round(averageRatingVal) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}
                />
              ))}
            </div>
            <p className="text-xs text-zinc-500 font-bold tracking-widest mb-6">Based on {totalNumReviews} reviews</p>
            {ratingDist.map(({ r, count, pct }) => (
              <div key={r} className="flex items-center gap-3 mb-2">
                <span className="text-xs font-black w-4 shrink-0">{r}</span>
                <Star size={10} fill="currentColor" className="text-amber-500 shrink-0" />
                <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-bold text-zinc-500 w-6 text-right">{count}</span>
              </div>
            ))}

            {/* Write a review */}
            <div className="mt-8 pt-6 border-t-2 border-black dark:border-white">
              <h3 className="text-xs font-black tracking-widest mb-4">WRITE A REVIEW</h3>
              {reviewSubmitted ? (
                <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-600 p-4">
                  <p className="text-xs font-black text-green-600 tracking-widest">✓ REVIEW SUBMITTED!</p>
                  <p className="text-[10px] text-zinc-500 mt-1 normal-case tracking-normal">Thank you for your feedback.</p>
                </div>
              ) : userInfo ? (
                <form onSubmit={handleReviewSubmit}>
                  {errorMsg && (
                    <div className="mb-3 text-[10px] font-black text-red-600 border-2 border-red-600 p-2 bg-red-50 dark:bg-red-950/20">
                      {errorMsg}
                    </div>
                  )}
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button type="button" key={s}
                        onMouseEnter={() => setReviewHoverRating(s)}
                        onMouseLeave={() => setReviewHoverRating(0)}
                        onClick={() => setReviewRating(s)}
                        className="cursor-pointer"
                      >
                        <Star size={20} strokeWidth={2}
                          fill={s <= (reviewHoverRating || reviewRating) ? 'currentColor' : 'none'}
                          className={s <= (reviewHoverRating || reviewRating) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="w-full border-2 border-black dark:border-white bg-[hsl(var(--card))] text-[hsl(var(--foreground))] px-4 py-3 text-sm normal-case tracking-normal resize-none focus:outline-none focus:border-zinc-400 placeholder:text-zinc-400 placeholder:normal-case"
                  />
                  <button type="submit" disabled={isReviewLoading}
                    className="mt-2 w-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-3 text-xs font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors flex items-center justify-center gap-2 cursor-pointer uppercase"
                  >
                    <SendHorizonal size={14} strokeWidth={2.5} /> {isReviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 p-6 text-center">
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 tracking-wider mb-4 uppercase leading-relaxed">Only registered members can submit reviews</p>
                  <Link to="/login" className="inline-block w-full text-center bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-3 text-xs font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white transition-colors">
                    SIGN IN TO REVIEW
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Review Cards */}
          <div className="lg:col-span-2 divide-y-2 divide-black dark:divide-white">
            {allReviews.map((review, idx) => (
              <div key={idx} className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border-2 border-black dark:border-white bg-[hsl(var(--foreground))] text-[hsl(var(--background))] flex items-center justify-center text-xs font-black shrink-0">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-black tracking-widest">{review.user}</p>
                      <p className="text-[10px] text-zinc-500 tracking-wider normal-case">{review.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={13} strokeWidth={2}
                        fill={s <= review.rating ? 'currentColor' : 'none'}
                        className={s <= review.rating ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-600'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm leading-relaxed normal-case tracking-normal text-zinc-700 dark:text-zinc-300">{review.comment}</p>
                <button
                  onClick={() => setHelpfulVotes(prev => ({ ...prev, [idx]: !prev[idx] }))}
                  className={`mt-4 flex items-center gap-2 text-[10px] font-black tracking-widest cursor-pointer transition-colors ${helpfulVotes[idx] ? 'text-green-600 dark:text-green-400' : 'text-zinc-400 hover:text-[hsl(var(--foreground))]'
                    }`}
                >
                  <ThumbsUp size={12} strokeWidth={2.5} fill={helpfulVotes[idx] ? 'currentColor' : 'none'} />
                  HELPFUL ({(review.helpful || 0) + (helpfulVotes[idx] ? 1 : 0)})
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Mobile Add to Bag Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[hsl(var(--card))] border-t border-zinc-200 dark:border-zinc-700 p-4 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-zinc-500 tracking-wide truncate">{productName || 'Product'}</p>
            <p className="text-base font-bold tracking-tight text-[hsl(var(--foreground))]">
              {formatINR(product.discountPrice || product.price)}
            </p>
          </div>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-xl text-sm font-bold tracking-wider transition-all duration-200 cursor-pointer bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:opacity-90 active:scale-[0.98] shadow-sm"
          >
            BUY NOW
          </button>
          <button
            onClick={handleAddToCart}
            className={`flex-1 h-12 rounded-xl text-sm font-bold tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-2 ${isAdded
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-zinc-300 dark:border-zinc-600 hover:border-[hsl(var(--foreground))] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] active:scale-[0.98]'
              }`}
          >
            {isAdded ? (
              <><Check className="w-3.5 h-3.5" strokeWidth={3} /> ADDED</>
            ) : (
              <><ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} /> ADD TO CART</>
            )}
          </button>
        </div>
      </div>

      {/* Size Guide Drawer */}
      <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${sizeGuideOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSizeGuideOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-l-2 border-black dark:border-white p-8 sm:p-12 transition-transform duration-300 ease-out flex flex-col justify-between ${sizeGuideOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div>
            <div className="flex justify-between items-center mb-8 border-b-2 border-black dark:border-white pb-4">
              <h2 className="text-xl font-black uppercase tracking-widest">SIZE GUIDE</h2>
              <button onClick={() => setSizeGuideOpen(false)} className="cursor-pointer hover:text-red-600 transition-colors">
                <span className="text-2xl font-black">✕</span>
              </button>
            </div>

            <p className="text-xs font-bold text-zinc-500 tracking-wider mb-6">
              ALL MEASUREMENTS ARE IN INCHES. FOR OVERSIZED ITEMS, WE RECOMMEND ORDERING YOUR TYPICAL SIZE FOR THE INTENDED FIT.
            </p>

            <div className="border-2 border-black dark:border-white divide-y-2 divide-black dark:divide-white font-mono text-xs">
              <div className="grid grid-cols-4 font-black bg-[hsl(var(--foreground))] text-[hsl(var(--background))] p-2">
                <div>SIZE</div>
                <div>CHEST</div>
                <div>WAIST</div>
                <div>LENGTH</div>
              </div>
              {[
                ['XS', '34-36', '28-30', '27'],
                ['S', '36-38', '30-32', '28'],
                ['M', '38-40', '32-34', '29'],
                ['L', '40-42', '34-36', '30'],
                ['XL', '42-44', '36-38', '31']
              ].map(([sz, ch, ws, len]) => (
                <div key={sz} className="grid grid-cols-4 p-2 font-bold">
                  <div>{sz}</div>
                  <div>{ch}</div>
                  <div>{ws}</div>
                  <div>{len}</div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setSizeGuideOpen(false)}
            className="w-full bg-[hsl(var(--foreground))] text-[hsl(var(--background))] py-4 text-xs font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      <div
        className={`fixed inset-0 z-[80] flex items-center justify-center transition-opacity duration-300 ${lightboxOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      >
        <div className="absolute inset-0 bg-black/95" onClick={() => setLightboxOpen(false)} />
        <div className="relative z-10 flex items-center justify-center w-full h-full px-4 py-8">
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-20"
          >
            <X size={20} strokeWidth={2} />
          </button>
          {/* Prev */}
          <button
            onClick={lightboxPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-20"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          {/* Image */}
          <img
            src={displayImages[lightboxIdx]}
            alt={productName || 'Product'}
            className="max-h-[85vh] max-w-[90vw] object-contain select-none"
          />
          {/* Next */}
          <button
            onClick={lightboxNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors cursor-pointer z-20"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {displayImages.map((_, di) => (
              <button
                key={di}
                onClick={() => setLightboxIdx(di)}
                className={`h-1.5 transition-all cursor-pointer ${di === lightboxIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
              />
            ))}
          </div>
          {/* Counter */}
          <div className="absolute top-4 left-4 text-white/70 text-xs font-black tracking-widest z-20">
            {lightboxIdx + 1} / {displayImages.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
