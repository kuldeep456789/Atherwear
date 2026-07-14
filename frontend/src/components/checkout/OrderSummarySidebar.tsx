import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { ArrowRight, Package } from 'lucide-react';
import { formatINR } from '../../lib/currency';

interface OrderSummarySidebarProps {
  buttonText?: string;
  buttonAction?: () => void;
  disableButton?: boolean;
}

const OrderSummarySidebar = ({ buttonText, buttonAction, disableButton }: OrderSummarySidebarProps) => {
  const cart = useSelector((state: RootState) => state.cart);
  const { cartItems, itemsPrice, shippingPrice, taxPrice, totalPrice } = cart;

  return (
    <div className="sticky top-28 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <Package size={15} className="text-zinc-400" />
        <h2 className="text-xs font-black uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-300">
          Order Summary
        </h2>
        <span className="ml-auto text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items */}
      <div className="px-6 py-4 max-h-56 overflow-y-auto space-y-4 scrollbar-thin">
        {cartItems.map((item) => (
          <div key={`${item._id}-${item.variant.size}-${item.variant.color}`} className="flex gap-3 items-start">
            <div className="relative w-14 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover" />
              <span className="absolute -top-1.5 -right-1.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {item.qty}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold leading-snug text-zinc-900 dark:text-white line-clamp-2">{item.name}</p>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase tracking-wider">
                {item.variant.color} · {item.variant.size}
              </p>
              <p className="text-xs font-black text-zinc-900 dark:text-white mt-1">{formatINR(item.price)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Subtotal</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatINR(itemsPrice)}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Shipping</span>
          <span className={`font-bold text-sm ${shippingPrice === 0 ? 'text-emerald-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {shippingPrice === 0 ? 'FREE' : formatINR(shippingPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 dark:text-zinc-400">Tax</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatINR(taxPrice)}</span>
        </div>
      </div>

      {/* Total */}
      <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
        <span className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">Total</span>
        <span className="text-xl font-black text-zinc-900 dark:text-white">{formatINR(totalPrice)}</span>
      </div>

      {/* CTA Button */}
      {buttonText && buttonAction && (
        <div className="px-6 pb-6">
          <button
            onClick={buttonAction}
            disabled={disableButton || cartItems.length === 0}
            className="w-full group flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-xs font-black tracking-[0.15em] uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {buttonText}
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummarySidebar;
