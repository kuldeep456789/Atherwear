import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../../store/store';
import { addToCart, removeFromCart } from '../../store/slices/cartSlice';
import type { CartItem } from '../../store/slices/cartSlice';
import { X, ShoppingBag, Trash2, ArrowRight, ShoppingCart } from 'lucide-react';
import { formatINR } from '../../lib/currency';
import QuantitySelector from '../QuantitySelector';
import MinimumOrderModal from '../checkout/MinimumOrderModal';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

const MiniCart = ({ isOpen, onClose }: MiniCartProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems, totalPrice, itemsPrice } = useSelector((state: RootState) => state.cart);
  const [isMinOrderModalOpen, setIsMinOrderModalOpen] = useState(false);

  const handleCheckout = () => {
    if (totalPrice < 50000) {
      setIsMinOrderModalOpen(true);
      return;
    }
    onClose();
    navigate('/shipping');
  };

  const updateQty = (item: CartItem, delta: number) => {
    const newQty = item.qty + delta;
    if (newQty < 1) {
      dispatch(removeFromCart({ id: item._id, size: item.variant.size, color: item.variant.color }));
    } else {
      dispatch(addToCart({ ...item, qty: newQty }));
    }
  };

  const setQty = (item: CartItem, qty: number) => {
    dispatch(addToCart({ ...item, qty }));
  };

  const removeItem = (item: CartItem) => {
    dispatch(removeFromCart({ id: item._id, size: item.variant.size, color: item.variant.color }));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full z-[70] w-full max-w-[420px] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] border-l-2 border-black dark:border-white flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-black dark:border-white shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} strokeWidth={2.5} />
            <span className="text-base font-black tracking-widest uppercase">
              My Bag
              {cartItems.length > 0 && (
                <span className="ml-2 text-xs bg-[hsl(var(--foreground))] text-[hsl(var(--background))] px-2 py-0.5 font-black">
                  {cartItems.reduce((a, b) => a + b.qty, 0)}
                </span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 border-2 border-black dark:border-white flex items-center justify-center hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-6 px-8 text-center">
              <ShoppingCart size={48} strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700" />
              <div>
                <p className="text-sm font-black tracking-widest uppercase mb-2">Your bag is empty</p>
                <p className="text-xs text-zinc-500 normal-case tracking-normal">
                  Add something awesome to get started
                </p>
              </div>
              <button
                onClick={() => { onClose(); navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="px-8 py-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors uppercase"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y-2 divide-black dark:divide-white">
              {cartItems.map((item, idx) => (
                <div key={`${item._id}-${item.variant.size}-${item.variant.color}-${idx}`} className="flex gap-4 p-4">
                  {/* Product Image */}
                  <Link
                    to={`/product/${item._id}`}
                    onClick={onClose}
                    className="shrink-0 w-20 h-24 border-2 border-black dark:border-white overflow-hidden bg-zinc-100 dark:bg-zinc-900 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={item.image || undefined}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <Link
                        to={`/product/${item._id}`}
                        onClick={onClose}
                        className="text-xs font-black tracking-tight leading-snug line-clamp-2 uppercase hover:text-red-600 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                          {item.variant.size}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-600">·</span>
                        <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                          {item.variant.color}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty Controls */}
                      <QuantitySelector
                        value={item.qty}
                        min={1}
                        max={9999}
                        onDecrement={() => updateQty(item, -1)}
                        onIncrement={() => updateQty(item, 1)}
                        onChange={(qty) => setQty(item, qty)}
                        className="border-2 border-black dark:border-white h-8"
                      />

                      {/* Price + Remove */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black font-mono">
                          {formatINR(Math.round(Number(item.price)) * item.qty)}
                        </span>
                        <button
                          onClick={() => removeItem(item)}
                          className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="shrink-0 border-t-2 border-black dark:border-white">
            {/* Free shipping banner */}
            {itemsPrice < 5000 ? (
              <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900 border-b-2 border-black dark:border-white">
                <div className="flex items-center justify-between text-[10px] font-black tracking-widest uppercase mb-1.5">
                  <span className="text-zinc-500">Add {formatINR(5000 - itemsPrice)} more for free shipping</span>
                  <span className="text-[hsl(var(--foreground))]">{Math.round((itemsPrice / 5000) * 100)}%</span>
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-700 w-full">
                  <div
                    className="h-full bg-[hsl(var(--foreground))] transition-all duration-500"
                    style={{ width: `${Math.min((itemsPrice / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="px-6 py-3 bg-green-50 dark:bg-green-950/30 border-b-2 border-black dark:border-white">
                <p className="text-[10px] font-black tracking-widest uppercase text-green-600 dark:text-green-400 text-center">
                  🎉 You've unlocked FREE SHIPPING!
                </p>
              </div>
            )}

            {/* Totals */}
            <div className="px-6 py-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold tracking-widest uppercase">
                <span className="text-zinc-500">Subtotal</span>
                <span className="font-black font-mono">{formatINR(itemsPrice)}</span>
              </div>
              <p className="text-[10px] text-zinc-400 tracking-wide normal-case">Shipping calculated at checkout</p>
            </div>

            {/* CTAs */}
            <div className="flex border-t-2 border-black dark:border-white">
              <Link
                to="/cart"
                onClick={onClose}
                className="flex-1 py-5 text-xs font-black tracking-widest uppercase text-center border-r-2 border-black dark:border-white hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors"
              >
                View Cart
              </Link>
              <button
                onClick={handleCheckout}
                className="flex-1 py-5 text-xs font-black tracking-widest uppercase text-center bg-[hsl(var(--foreground))] text-[hsl(var(--background))] hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                Checkout <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      <MinimumOrderModal 
        isOpen={isMinOrderModalOpen} 
        onClose={() => setIsMinOrderModalOpen(false)} 
        cartTotal={totalPrice} 
      />
    </>
  );
};

export default MiniCart;
