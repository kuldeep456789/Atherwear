import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addToCart, removeFromCart, applyCoupon, removeCoupon, COUPONS } from '../store/slices/cartSlice';
import type { CartItem } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { useGetRelatedProductsQuery } from '../store/slices/productApiSlice';
import ProductCard from '../components/product/ProductCard';
import { 
  Trash2, 
  ShoppingBag, 
  Heart, 
  Percent, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Plus, 
  Minus,
  Tag
} from 'lucide-react';
import { formatINR } from '../lib/currency';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state: RootState) => state.cart);
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = cart;

  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const isItemWishlisted = (id: string) => wishlistItems.some((item: any) => item._id === id);

  const [couponCode, setCouponCode] = useState(cart.appliedCoupon || '');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Sync internal coupon message with slice state updates (e.g. if conditions change)
  useEffect(() => {
    if (cart.appliedCoupon) {
      setCouponCode(cart.appliedCoupon);
      if (!couponMsg) {
        setCouponMsg({ text: `Coupon "${cart.appliedCoupon}" is active!`, isError: false });
      }
    } else {
      setCouponCode('');
      setCouponMsg(null);
    }
  }, [cart.appliedCoupon]);

  // Fetch recommendations based on the first cart item
  const firstCartItemId = cartItems[0]?._id;
  const { data: relatedData } = useGetRelatedProductsQuery(firstCartItemId, { skip: !firstCartItemId });
  const recommendedProducts = relatedData?.products
    ?.filter((p: any) => !cartItems.some((c: any) => c._id === (p.pid || p._id)))
    ?.slice(0, 4) || [];

  const addToCartHandler = (item: CartItem, qty: number) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const removeFromCartHandler = (id: string, size: string, color: string) => {
    dispatch(removeFromCart({ id, size, color }));
  };

  const moveToWishlistHandler = (item: CartItem) => {
    if (!isItemWishlisted(item._id)) {
      dispatch(toggleWishlist({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
      }));
    }
    dispatch(removeFromCart({ id: item._id, size: item.variant.size, color: item.variant.color }));
    setCouponMsg({ text: 'Moved item to wishlist.', isError: false });
    setTimeout(() => setCouponMsg(null), 3000);
  };

  const handleApplyCoupon = (code: string) => {
    const cleanCode = code.toUpperCase().trim();
    if (!cleanCode) return;

    const couponDef = COUPONS[cleanCode];
    if (!couponDef) {
      setCouponMsg({ text: `Invalid coupon. Try: ${Object.keys(COUPONS).join(', ')}.`, isError: true });
      return;
    }
    if (itemsPrice < couponDef.min) {
      setCouponMsg({ text: `Min. cart value of ${formatINR(couponDef.min)} required for ${cleanCode}.`, isError: true });
      return;
    }
    dispatch(applyCoupon(cleanCode));
    const savings = couponDef.discount(itemsPrice);
    setCouponMsg({ text: `"${cleanCode}" applied! You save ${formatINR(savings)}.`, isError: false });
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    setCouponCode('');
    setCouponMsg({ text: 'Coupon removed.', isError: false });
    setTimeout(() => setCouponMsg(null), 3000);
  };

  const checkoutHandler = () => {
    navigate('/shipping');
  };

  // Shipping progress — next tier
  const getShippingNext = () => {
    const discounted = itemsPrice - cart.couponDiscount;
    if (discounted === 0) return { msg: '', pct: 0, free: false };
    if (discounted >= 5000) return { msg: '🎉 FREE shipping unlocked!', pct: 100, free: true };
    if (discounted >= 999) return { msg: `Add ${formatINR(5000 - discounted)} more for FREE shipping`, pct: (discounted / 5000) * 100, free: false };
    if (discounted >= 499) return { msg: `Add ${formatINR(999 - discounted)} more to drop shipping to ${formatINR(49)}`, pct: (discounted / 999) * 100, free: false };
    return { msg: `Add ${formatINR(499 - discounted)} more to drop shipping to ${formatINR(99)}`, pct: (discounted / 499) * 100, free: false };
  };
  const shippingStatus = getShippingNext();

  // Total savings = coupon discount + shipping savings (if free)
  const originalShipping = (() => {
    const d = itemsPrice - cart.couponDiscount;
    if (d === 0) return 0;
    if (d < 499) return 150;
    return 150; // baseline rate
  })();
  const totalSavings = cart.couponDiscount + (shippingPrice === 0 && itemsPrice > 0 ? originalShipping : 0);

  // Coupon list for display
  const couponList = Object.entries(COUPONS).map(([code, def]) => ({ code, desc: def.desc, min: def.min }));

  return (
    <div className="container mx-auto px-4 py-8 lg:py-12 text-black dark:text-white min-h-[calc(100vh-400px)]">
      <h1 className="text-3xl font-black uppercase tracking-widest mb-8 text-center sm:text-left">Shopping Bag</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-950 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md max-w-2xl mx-auto my-12">
          <ShoppingBag className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-6" strokeWidth={1} />
          <h2 className="text-2xl font-extrabold uppercase tracking-wide mb-2">Your shopping bag is empty</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 text-sm max-w-sm mx-auto">Looks like you haven't added anything to your cart yet. Explore our latest arrivals to find something you love!</p>
          <div className="flex justify-center gap-4">
            <Link to="/men" className="bg-black text-white dark:bg-white dark:text-black px-6 py-3 text-xs font-extrabold tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
              SHOP MEN
            </Link>
            <Link to="/women" className="bg-transparent border border-black text-black dark:border-white dark:text-white px-6 py-3 text-xs font-extrabold tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 transition">
              SHOP WOMEN
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Cart Items Column */}
          <div className="w-full lg:w-2/3">
            {/* Free Shipping Tracker */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Truck className="h-5 w-5 text-red-600 dark:text-red-500 animate-pulse" />
                <span className="text-sm font-medium">
                  {shippingStatus.free ? (
                    <span className="text-green-600 dark:text-green-400 font-bold">{shippingStatus.msg}</span>
                  ) : (
                    <span>{shippingStatus.msg}</span>
                  )}
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden relative">
                <div 
                  className="bg-red-600 dark:bg-red-500 h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${shippingStatus.pct}%` }}
                />
              </div>
            </div>

            {/* Items List */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded divide-y divide-zinc-200 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.variant.size}-${item.variant.color}`} className="p-6 flex flex-col sm:flex-row gap-6">
                  {/* Image */}
                  <div className="w-full sm:w-28 h-36 flex-shrink-0 bg-zinc-100 dark:bg-zinc-900">
                    <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <p className="font-extrabold text-lg text-zinc-950 dark:text-white shrink-0">{formatINR(item.price)}</p>
                      <div className="text-right">
                        <Link to={`/product/${item._id}`} className="text-lg font-bold tracking-tight hover:underline line-clamp-1">
                          {item.name}
                        </Link>
                        <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1.5 font-medium uppercase tracking-wider">
                          Color: {item.variant.color} &nbsp;|&nbsp; Size: {item.variant.size}
                        </p>
                      </div>
                    </div>

                    {/* Stepper controls & actions */}
                    <div className="flex justify-between items-center mt-6">
                      {/* Premium Quantity Stepper Selector */}
                      <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
                        <button 
                          onClick={() => item.qty > 1 && addToCartHandler(item, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className={`p-1.5 px-3 transition text-zinc-500 dark:text-zinc-400 ${item.qty <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer'}`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-semibold select-none">{item.qty}</span>
                        <button 
                          onClick={() => addToCartHandler(item, item.qty + 1)}
                          className="p-1.5 px-3 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition text-zinc-500 dark:text-zinc-400 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Item Actions */}
                      <div className="flex gap-4">
                        <button 
                          onClick={() => moveToWishlistHandler(item)}
                          className={`flex items-center gap-1.5 text-xs font-bold uppercase transition py-2 px-3 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 cursor-pointer ${
                            isItemWishlisted(item._id) ? 'text-red-500 border-red-200 dark:border-red-950/20' : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                          title="Save item for later in wishlist"
                        >
                          <Heart className="w-4 h-4" fill={isItemWishlisted(item._id) ? 'currentColor' : 'none'} />
                          <span className="hidden sm:inline">Wishlist</span>
                        </button>

                        <button 
                          onClick={() => removeFromCartHandler(item._id, item.variant.size, item.variant.color)}
                          className="text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition cursor-pointer"
                          title="Remove item from bag"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Column */}
          <div className="w-full lg:w-1/3">
            {/* Coupons and Offers Panel */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded mb-6">
              <h3 className="font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200">
                <Percent className="h-4 w-4 text-red-600" /> Coupons & Offers
              </h3>
              
              {/* Total Savings Banner */}
              {totalSavings > 0 && (
                <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded p-3 mb-4">
                  <Tag className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-bold text-green-700 dark:text-green-400">You're saving {formatINR(totalSavings)} on this order!</span>
                </div>
              )}

              <div className="flex gap-2 mb-4">
                <input 
                  type="text" 
                  placeholder="Enter Coupon Code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={!!cart.appliedCoupon}
                  className="flex-grow px-3 py-2 border border-zinc-300 dark:border-zinc-800 rounded text-sm focus:outline-none focus:border-black dark:focus:border-white disabled:bg-zinc-100 dark:disabled:bg-zinc-900/50 bg-transparent uppercase font-semibold text-zinc-950 dark:text-white"
                />
                {cart.appliedCoupon ? (
                  <button 
                    onClick={handleRemoveCoupon}
                    className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition cursor-pointer"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApplyCoupon(couponCode)}
                    disabled={!couponCode}
                    className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black rounded hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-bold transition disabled:opacity-45 cursor-pointer"
                  >
                    APPLY
                  </button>
                )}
              </div>

              {couponMsg && (
                <div className={`p-2.5 rounded text-xs mb-4 font-semibold ${couponMsg.isError ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30' : 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30'}`}>
                  {couponMsg.text}
                </div>
              )}

              <div className="space-y-3 mt-4">
                {couponList.map((coupon) => {
                  const isEligible = itemsPrice >= coupon.min;
                  const isCurrentlyApplied = cart.appliedCoupon === coupon.code;
                  return (
                    <div key={coupon.code} className={`border border-dashed p-3 rounded flex justify-between items-center transition-all ${isCurrentlyApplied ? 'border-green-500 bg-green-50/20 dark:bg-green-950/10' : 'border-zinc-200 dark:border-zinc-800'}`}>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider border ${isCurrentlyApplied ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-900' : 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-200 dark:border-zinc-850'}`}>
                            {coupon.code}
                          </span>
                          {!isEligible && (
                            <span className="text-[10px] text-zinc-400">Min: {formatINR(coupon.min)}</span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 font-medium">{coupon.desc}</p>
                      </div>
                      {isCurrentlyApplied ? (
                        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                          <Check className="h-3.5 w-3.5" /> APPLIED
                        </span>
                      ) : (
                        <button 
                          onClick={() => handleApplyCoupon(coupon.code)}
                          disabled={!isEligible || !!cart.appliedCoupon}
                          className={`text-xs font-bold uppercase transition px-3 py-1 border rounded cursor-pointer ${
                            !isEligible || !!cart.appliedCoupon 
                            ? 'opacity-40 border-zinc-200 dark:border-zinc-800 text-zinc-400 cursor-not-allowed' 
                            : 'border-zinc-950 text-zinc-950 hover:bg-zinc-950 hover:text-white dark:border-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-100 dark:hover:text-black'
                          }`}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Details Block */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded">
              <h2 className="text-lg font-black uppercase tracking-widest mb-6 border-b dark:border-zinc-900 pb-3">Price Details</h2>
              
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Total MRP</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{formatINR(itemsPrice)}</span>
                </div>
                
                {cart.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Coupon Discount ({cart.appliedCoupon})</span>
                    <span className="font-bold">-{formatINR(cart.couponDiscount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">Delivery Charges</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">
                    {shippingPrice === 0 ? (
                      <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1.5">
                        <span className="line-through text-zinc-400 text-xs font-normal">{formatINR(100)}</span> FREE
                      </span>
                    ) : (
                      formatINR(shippingPrice)
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400 font-medium">GST / Tax (18%)</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{formatINR(taxPrice)}</span>
                </div>
              </div>
              
              <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-900 pt-4 mb-6">
                <span className="text-base font-bold">Total Amount</span>
                <span className="text-lg font-black text-zinc-950 dark:text-white">{formatINR(totalPrice)}</span>
              </div>

              <button 
                onClick={checkoutHandler}
                className="w-full bg-black text-white dark:bg-white dark:text-black py-4 font-black tracking-widest hover:bg-zinc-800 dark:hover:bg-zinc-200 transition flex justify-center items-center gap-2 cursor-pointer uppercase text-xs"
              >
                PROCEED TO CHECKOUT
              </button>
            </div>

            {/* Security Badges */}
            <div className="grid grid-cols-3 gap-2 mt-6 border border-zinc-200 dark:border-zinc-900 p-4 rounded text-center bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex flex-col items-center gap-1.5">
                <ShieldCheck className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                <span className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">100% SECURE</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 border-x border-zinc-200 dark:border-zinc-900 px-1">
                <RotateCcw className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                <span className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">14-DAY RETURN</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-zinc-700 dark:text-zinc-300" strokeWidth={1.5} />
                <span className="text-[9px] font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase">100% ORIGINAL</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Section */}
      {cartItems.length > 0 && recommendedProducts.length > 0 && (
        <div className="mt-20 pt-12 border-t border-zinc-200 dark:border-zinc-900">
          <h2 className="text-2xl font-black tracking-widest uppercase mb-8 text-center sm:text-left">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedProducts.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
