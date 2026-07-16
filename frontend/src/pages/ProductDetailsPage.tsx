import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetProductDetailsQuery, useCreateReviewMutation } from '../store/slices/productApiSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import type { RootState } from '../store/store';
import { ShoppingBag, Heart, Star, Check, ChevronRight, ChevronLeft, X, ZoomIn, SendHorizontal, ThumbsUp, Share2, Loader2, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../components/Loader';
import WishlistLoginPopup from '../components/WishlistLoginPopup';
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
  const [showWishlistPopup, setShowWishlistPopup] = useState(false);

  const handleWishlistToggle = () => {
    if (!userInfo) {
      setShowWishlistPopup(true);
      return;
    }
    dispatch(
      toggleWishlist({
        _id: productId,
        name: product.name,
        price: product.price,
        discountPrice: product.discountPrice,
        image: getProductImages(product)[0] || '',
      })
    );
    if (!isWishlisted) {
      toast.success('Added to your Wishlist');
    }
  };

  useEffect(() => {
    setSelectedImage(0);
  }, [selectedColor]);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingCartItem');
    if (pending) {
      try {
        const item = JSON.parse(pending);
        dispatch(addToCart(item));
        setIsAdded(true);
        toast.success('Product added successfully');
        setTimeout(() => setIsAdded(false), 2000);
      } catch (_) {
        // ignore parse errors
      } finally {
        sessionStorage.removeItem('pendingCartItem');
      }
    }
  }, [dispatch]);

  if (isLoading) {
    return <Loader />;
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
    if (!userInfo) {
      const pendingItem = {
        _id: productId,
        name: product.name,
        price: product.discountPrice || product.price,
        image: getProductImages(product)[0] || '',
        qty: 1,
        variant: { color: selectedColor, size: selectedSize },
      };
      sessionStorage.setItem('pendingCartItem', JSON.stringify(pendingItem));
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
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
    setIsAdded(true);
    toast.success('Product added to your bag');
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
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] font-sans overflow-x-hidden">
      {/* Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-4">
          <div className="flex gap-2 items-center text-xs font-medium text-zinc-400">
            <Link to="/" className="hover:text-black dark:hover:text-white transition-colors">HOME</Link>
            <ChevronRight size={10} strokeWidth={2} />
            {product.gender && (
              <>
                <Link to={`/collections/${product.gender}`} className="hover:text-black dark:hover:text-white transition-colors">
                  {String(product.gender).toUpperCase()} COLLECTIONS
                </Link>
                <ChevronRight size={10} strokeWidth={2} />
              </>
            )}
            {product.subcategory && (
              <>
                <Link to={`/collections/${product.gender}/${normalizeSlug(String(product.subcategory))}`} className="hover:text-black dark:hover:text-white transition-colors">
                  {product.subcategory}
                </Link>
                <ChevronRight size={10} strokeWidth={2} />
              </>
            )}
            <span className="text-black dark:text-white line-clamp-1">{product.title || product.name}</span>
          </div>
        </div>
      </div>

      {/* Main — Two Column Layout */}
      <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-10">
        <div className="flex flex-col lg:flex-row lg:flex-nowrap items-start justify-center gap-12">

          {/* ─── Left — Gallery (55%) ─── */}
          <div className="w-full lg:w-[700px] lg:min-w-[580px] lg:flex-shrink-0">
            <div className="flex gap-3">
              {/* Thumbnail column */}
              <div className="hidden lg:flex flex-col gap-3 w-[80px] shrink-0">
                {displayImages.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-[80px] h-[110px] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 flex-shrink-0 hover:scale-105 ${selectedImage === i
                        ? 'border-black dark:border-white'
                        : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1 min-w-0 group" ref={imageRef}>
                <div
                  onMouseMove={handleImageZoom}
                  onMouseLeave={() => setZoomLens((p) => ({ ...p, active: false }))}
                  onClick={() => openLightbox(selectedImage)}
                  className="relative w-full max-w-[700px] h-[620px] lg:h-[720px] bg-[#f8f8f8] rounded-[18px] overflow-hidden flex items-center justify-center cursor-crosshair"
                >
                  <img
                    key={selectedImage}
                    src={displayImages[selectedImage] || displayImages[0]}
                    alt={productName || 'Product'}
                    className="max-w-full max-h-full object-contain p-6 transition-opacity duration-300 select-none"
                    draggable={false}
                  />

                  {/* Zoom lens */}
                  {zoomLens.active && (
                    <div
                      className="absolute border-2 border-black dark:border-white bg-white/10 dark:bg-black/10 pointer-events-none z-30 rounded-sm"
                      style={{
                        width: `${LENS_SIZE}px`,
                        height: `${LENS_SIZE}px`,
                        left: `calc(${zoomLens.conX}% - ${LENS_SIZE / 2}px)`,
                        top: `calc(${zoomLens.conY}% - ${LENS_SIZE / 2}px)`,
                      }}
                    />
                  )}

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {discountPct > 0 && (
                      <span className="bg-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                        -{discountPct}%
                      </span>
                    )}
                    {productName.toLowerCase().includes('oversized') && (
                      <span className="bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                        OVERSIZED
                      </span>
                    )}
                  </div>

                  {/* Floating Wishlist + Share */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWishlistToggle();
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 cursor-pointer active:scale-90 ${isWishlisted
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

                  {/* Nav arrows at bottom-right (Nike-style) */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                        }}
                        className="absolute bottom-4 right-14 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-10 cursor-pointer"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={18} strokeWidth={2} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage((prev) => (prev + 1) % displayImages.length);
                        }}
                        className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-shadow z-10 cursor-pointer"
                        aria-label="Next image"
                      >
                        <ChevronRight size={18} strokeWidth={2} />
                      </button>
                    </>
                  )}

                  {/* Zoom hint */}
                  <div className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] font-medium px-2.5 py-1.5 rounded-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <ZoomIn size={11} strokeWidth={2} /> ZOOM
                  </div>
                </div>

                {/* Mobile thumbnails — horizontal slider */}
                <div className="flex lg:hidden gap-2 mt-3 overflow-x-auto pb-1">
                  {displayImages.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={`flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImage === i
                          ? 'border-black dark:border-white'
                          : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>

                {/* Zoom preview — xl screens */}
                {zoomLens.active && (
                  <div className="hidden xl:block mt-3">
                    <div className="w-full h-[200px] overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-lg bg-white dark:bg-zinc-900">
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

          {/* ─── Right — Product Details (45%) ─── */}
          <div className="w-full lg:w-[500px] lg:min-w-[380px] lg:flex-shrink-0 lg:sticky lg:top-6 self-start">
            <div className="space-y-4">
              {/* Brand */}
              <span className="block text-sm font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                {collabTag ? `VASTRA × ${collabTag}` : 'VASTRA'}
              </span>

              {/* Product Name */}
              <h1 className="text-2xl font-semibold leading-tight line-clamp-2 text-zinc-900 dark:text-white">
                {productName || 'Product'}
              </h1>

              {/* Rating Badge */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-amber-500">&#9733;</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{Number(averageRatingVal).toFixed(1)}</span>
                <span className="text-zinc-400">| {totalNumReviews} Reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                  {formatINR(product.discountPrice || product.price)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg text-zinc-400 line-through">{formatINR(product.price)}</span>
                    <span className="text-sm font-bold text-green-600">{discountPct}% OFF</span>
                  </>
                )}
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 text-sm font-medium p-3 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Colour */}
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-3">Colour</p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((color: any) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-[28px] h-[28px] rounded-full border transition-all duration-200 cursor-pointer hover:scale-105 flex items-center justify-center ${selectedColor === color
                          ? 'border-black dark:border-white'
                          : 'border-zinc-300 dark:border-zinc-600'
                        }`}
                      style={{ backgroundColor: getColorHex(color) }}
                      title={color}
                    >
                      {selectedColor === color && (
                        <svg className="w-3.5 h-3.5 text-white drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Select Size</p>
                  <button
                    onClick={() => setSizeGuideOpen(true)}
                    className="text-sm font-medium text-zinc-400 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Size Guide →
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size: any) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-[42px] rounded-[10px] border text-[15px] font-medium transition-all duration-200 cursor-pointer active:scale-[0.97] ${selectedSize === size
                          ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
                          : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-[#d9d9d9] dark:border-zinc-600 hover:border-black dark:hover:border-white hover:bg-[#fafafa] dark:hover:bg-zinc-800'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBuyNow}
                  className="flex-1 h-14 rounded-xl text-sm font-bold tracking-wider transition-all duration-200 cursor-pointer bg-black dark:bg-white text-white dark:text-black hover:shadow-lg active:scale-[0.98]"
                >
                  BUY NOW
                </button>
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 h-14 rounded-xl text-sm font-bold tracking-wider transition-all duration-200 cursor-pointer border-2 active:scale-[0.98] ${isAdded
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:shadow-sm'
                    }`}
                >
                  {isAdded ? (
                    <span className="flex items-center justify-center gap-2"><Check size={16} strokeWidth={3} /> ADDED</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><ShoppingBag size={16} /> ADD TO CART</span>
                  )}
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`w-14 h-14 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-[0.95] ${isWishlisted
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700 hover:border-red-400 hover:text-red-500 hover:shadow-sm'
                    }`}
                  aria-label="Wishlist"
                >
                  <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} strokeWidth={2} />
                </button>
              </div>

              {/* Description */}
              <div className="pt-0">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 mb-3">Description</h3>
                <div
                  className="product-description text-sm leading-relaxed text-zinc-500 dark:text-zinc-400"
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
      </div>

      {/* ───────── CUSTOMER REVIEWS ───────── */}
      <div ref={reviewRef} className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 py-16 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-sm font-semibold tracking-wider text-[#0050cb] uppercase mb-2 block">Verified Feedback</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Customer Reviews</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3 shadow-sm">
              <Star size={18} fill="currentColor" className="text-amber-500" />
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{Number(averageRatingVal).toFixed(1)}</span>
            </div>
            <span className="text-sm font-medium text-zinc-500">{totalNumReviews} Total Reviews</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Rating Summary & Write Review */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-none">
              <div className="flex items-end gap-4 mb-8">
                <div className="text-6xl font-bold tracking-tighter text-zinc-900 dark:text-zinc-100">{Number(averageRatingVal).toFixed(1)}</div>
                <div className="pb-2">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={20} strokeWidth={2}
                        fill={s <= Math.round(averageRatingVal) ? 'currentColor' : 'none'}
                        className={s <= Math.round(averageRatingVal) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Based on {totalNumReviews} reviews</p>
                </div>
              </div>
              
              <div className="space-y-3.5">
                {ratingDist.map(({ r, count, pct }) => (
                  <div key={r} className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 w-10 shrink-0 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {r} <Star size={12} fill="currentColor" className="text-amber-500" />
                    </div>
                    <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-zinc-400 w-8 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Write a review */}
            <div className="bg-zinc-50 dark:bg-[#151515] border border-zinc-200 dark:border-zinc-800/60 rounded-3xl p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] dark:shadow-none">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-6">Write a Review</h3>
              {reviewSubmitted ? (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-2xl p-5 flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full shrink-0">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-green-800 dark:text-green-300">Review Submitted!</p>
                    <p className="text-xs text-green-600 dark:text-green-400/80 mt-1 leading-relaxed">Thank you for sharing your experience. Your feedback helps others make better choices.</p>
                  </div>
                </div>
              ) : userInfo ? (
                <form onSubmit={handleReviewSubmit}>
                  {errorMsg && (
                    <div className="mb-5 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl p-4">
                      {errorMsg}
                    </div>
                  )}
                  <div className="mb-6">
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-3">Tap to rate</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button type="button" key={s}
                          onMouseEnter={() => setReviewHoverRating(s)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                          onClick={() => setReviewRating(s)}
                          className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star size={32} strokeWidth={1.5}
                            fill={s <= (reviewHoverRating || reviewRating) ? 'currentColor' : 'none'}
                            className={s <= (reviewHoverRating || reviewRating) ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    rows={4}
                    placeholder="What did you like or dislike?"
                    className="w-full bg-white dark:bg-[#0a0a0a] border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0050cb]/20 focus:border-[#0050cb] transition-all placeholder:text-zinc-400 mb-5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
                  />
                  <button type="submit" disabled={isReviewLoading}
                    className="w-full bg-[#0050cb] hover:bg-[#003d99] text-white rounded-2xl py-4 text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isReviewLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
                    {isReviewLoading ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-4 px-2">
                  <div className="bg-zinc-100 dark:bg-zinc-800/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5">
                    <UserRound className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">Join our community to share your experience with this product.</p>
                  <Link to="/login" className="inline-block w-full bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black rounded-2xl py-4 text-sm font-bold transition-colors shadow-md">
                    Sign In to Review
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Review Cards */}
          <div className="lg:col-span-8 space-y-5">
            {allReviews.map((review, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111111] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] dark:shadow-none dark:hover:border-zinc-700 transition-all">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center text-lg font-bold text-zinc-700 dark:text-zinc-300 shadow-inner shrink-0">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{review.user}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} size={14} strokeWidth={2}
                              fill={s <= review.rating ? 'currentColor' : 'none'}
                              className={s <= review.rating ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'}
                            />
                          ))}
                        </div>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                        <span className="text-xs font-medium text-zinc-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 mt-5 mb-6">
                  {review.comment}
                </p>
                
                <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-5 mt-auto">
                  <button
                    onClick={() => setHelpfulVotes(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full transition-all cursor-pointer ${
                      helpfulVotes[idx] 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-[inset_0_0_0_1px_rgba(22,163,74,0.2)]' 
                        : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200'
                    }`}
                  >
                    <ThumbsUp size={14} strokeWidth={helpfulVotes[idx] ? 2.5 : 2} fill={helpfulVotes[idx] ? 'currentColor' : 'none'} />
                    Helpful ({(review.helpful || 0) + (helpfulVotes[idx] ? 1 : 0)})
                  </button>
                </div>
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

      {showWishlistPopup && (
        <WishlistLoginPopup
          product={{
            _id: productId,
            name: product.name,
            price: product.price,
            discountPrice: product.discountPrice,
            image: getProductImages(product)[0] || '',
          }}
          onClose={() => setShowWishlistPopup(false)}
        />
      )}

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
