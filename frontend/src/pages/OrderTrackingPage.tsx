import { Link, useParams } from 'react-router-dom';
import { useGetOrderDetailsQuery } from '../store/slices/orderApiSlice';
import { ShoppingBag, Package, CheckCircle, Clock, Truck, MapPin, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { useGetProductDetailsQuery } from '../store/slices/productApiSlice';
import { formatINR } from '../lib/currency';

const TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'packed', label: 'Packed', icon: ShoppingBag },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'out_for_delivery', label: 'Out For Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const STEP_INDEX: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  out_for_delivery: 4,
  delivered: 5,
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Order Placed', className: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  packed: { label: 'Packed', className: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' },
  shipped: { label: 'Shipped', className: 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800' },
  out_for_delivery: { label: 'Out For Delivery', className: 'bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
};

const OrderTrackingPage = () => {
  const { id } = useParams();
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10] pt-[112px] sm:pt-[116px] lg:pt-[124px]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          {/* Skeleton */}
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
              ))}
            </div>
            <div className="h-80 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isForbidden = (error as any)?.status === 403 || (error as any)?.originalStatus === 403;
    const isNotFound = (error as any)?.status === 400 || (error as any)?.originalStatus === 400;

    if (isForbidden) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10] pt-[112px] sm:pt-[116px] lg:pt-[124px] flex items-center justify-center">
          <div className="text-center px-6 py-16 max-w-md">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-950/30 rounded-full" />
              <AlertCircle className="relative z-10 w-9 h-9 text-red-500" strokeWidth={1.5} />
            </div>
            <h1 className="text-[28px] font-bold text-zinc-900 dark:text-white mb-3">Access Denied</h1>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              You do not have permission to view this order. Please log in with the correct account.
            </p>
            <Link
              to="/account"
              className="inline-flex items-center justify-center h-[52px] px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200"
            >
              My Account
            </Link>
          </div>
        </div>
      );
    }

    if (isNotFound || !order) {
      return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10] pt-[112px] sm:pt-[116px] lg:pt-[124px] flex items-center justify-center">
          <div className="text-center px-6 py-16 max-w-md">
            <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
              <div className="absolute inset-0 bg-zinc-200/50 dark:bg-zinc-800/50 rounded-full" />
              <Package className="relative z-10 w-9 h-9 text-zinc-300 dark:text-zinc-600" strokeWidth={1} />
            </div>
            <h1 className="text-[28px] font-bold text-zinc-900 dark:text-white mb-3">Order Not Found</h1>
            <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
              The requested order could not be found. It may have been removed or the ID is incorrect.
            </p>
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <ShoppingBag size={16} strokeWidth={2} />
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10] pt-[112px] sm:pt-[116px] lg:pt-[124px] flex items-center justify-center">
        <div className="text-center px-6 py-16 max-w-md">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-red-100 dark:bg-red-950/30 rounded-full" />
            <AlertCircle className="relative z-10 w-9 h-9 text-red-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-bold text-zinc-900 dark:text-white mb-3">Something Went Wrong</h1>
          <p className="text-[14px] text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
            We could not load your order details. Please try again later.
          </p>
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center justify-center gap-2 h-[52px] px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[13px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200"
          >
            <ShoppingBag size={16} strokeWidth={2} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = STEP_INDEX[order.status] ?? 0;
  const status = statusConfig[order.status] || statusConfig.pending;
  const paymentLabel = order.paymentProvider === 'COD' ? 'Cash on Delivery' : 'Razorpay Secure';
  const paymentStatusLabel = order.paymentProvider === 'COD'
    ? (order.paymentStatus === 'paid' ? 'Collected' : 'Pending')
    : (order.paymentStatus === 'paid' ? 'Captured' : 'Unpaid');
  const isPaid = order.paymentStatus === 'paid';
  const itemCount = order.items?.reduce((a: number, i: any) => a + i.quantity, 0) || 0;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10] pt-[112px] sm:pt-[116px] lg:pt-[124px]">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <h1 className="text-[28px] sm:text-[36px] font-bold text-zinc-900 dark:text-white tracking-tight">
              Order Details
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-semibold border w-fit ${status.className}`}>
              <Clock size={13} strokeWidth={2} />
              {status.label.toUpperCase()}
            </span>
          </div>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-2 font-mono tracking-wider select-all">
            #{order._id}
          </p>
        </div>

        {/* Timeline */}
        <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-6 sm:p-8 mb-6">
          <h2 className="text-[16px] font-bold text-zinc-900 dark:text-white mb-6">Delivery Progress</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0 relative">
            {TIMELINE_STEPS.map((step, idx) => {
              const isComplete = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className={`flex sm:flex-1 flex-row sm:flex-col items-center w-full sm:w-auto ${idx < TIMELINE_STEPS.length - 1 ? 'mb-4 sm:mb-0' : ''}`}>
                  <div className="flex items-center sm:flex-col sm:items-center">
                    <div className={`relative flex items-center justify-center w-11 h-11 rounded-full border-2 transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                        : isCurrent
                        ? 'bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900 shadow-[0_0_12px_rgba(0,0,0,0.15)] dark:shadow-[0_0_12px_rgba(255,255,255,0.15)] scale-105'
                        : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-300 dark:text-zinc-600'
                    }`}>
                      {isComplete ? (
                        <CheckCircle size={18} strokeWidth={2.5} />
                      ) : (
                        <Icon size={16} strokeWidth={1.5} />
                      )}
                    </div>
                    {/* Connecting line (horizontal on desktop, vertical on mobile) */}
                    {idx < TIMELINE_STEPS.length - 1 && (
                      <div className={`sm:w-full sm:h-[3px] w-[3px] h-8 sm:ml-0 ml-[22px] rounded-full transition-colors duration-500 ${
                        isComplete ? 'bg-emerald-500' : isCurrent ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-zinc-100 dark:bg-zinc-800'
                      }`} />
                    )}
                  </div>
                  <p className={`text-[11px] font-semibold mt-2 sm:mt-2 ml-3 sm:ml-0 sm:text-center whitespace-nowrap transition-colors duration-300 ${
                    isComplete ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
                  }`}>
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <CreditCard size={18} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Payment</h3>
            </div>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-0.5">Method</p>
            <p className="text-[14px] font-semibold text-zinc-900 dark:text-white mb-2 capitalize">{paymentLabel}</p>
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider px-3 py-1.5 rounded-full border ${
              isPaid
                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
            }`}>
              {isPaid ? <><CheckCircle size={12} strokeWidth={2.5} /> {paymentStatusLabel}</> : paymentStatusLabel}
            </span>
          </div>

          <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white">Delivery</h3>
            </div>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mb-1">Estimated</p>
            <p className="text-[14px] font-semibold text-zinc-900 dark:text-white">5&ndash;8 business days</p>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden mb-6">
          <div className="px-6 sm:px-8 py-5 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-[16px] font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={18} className="text-zinc-400" strokeWidth={1.5} />
              Items ({itemCount})
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {order.items?.map((item: any, i: number) => (
              <OrderTrackingItemRow key={i} productId={item.productId} quantity={item.quantity} />
            ))}
          </div>
          <div className="px-6 sm:px-8 py-5 bg-zinc-50 dark:bg-zinc-900/30 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="text-[14px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total</span>
            <span className="text-[28px] sm:text-[32px] font-bold text-zinc-900 dark:text-white tracking-tight">{formatINR(order.totalAmount)}</span>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[15px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]"
          >
            <ShoppingBag size={18} strokeWidth={2} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

const OrderTrackingItemRow = ({ productId, quantity }: { productId: string; quantity: number }) => {
  const { data: product } = useGetProductDetailsQuery(productId);
  const name = product?.name || product?.title || `Product`;
  const image = product?.images?.[0];
  const price = product?.discountPrice || product?.price || 0;

  return (
    <div className="flex items-center gap-4 px-6 sm:px-8 py-4">
      <div className="w-[60px] h-[72px] shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        {image ? <img src={image} alt={name} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${productId}`} className="text-[14px] font-semibold text-zinc-900 dark:text-white line-clamp-2 hover:underline transition-colors">
          {name}
        </Link>
      </div>
      <div className="text-right shrink-0">
        <p className="text-[15px] font-bold text-zinc-900 dark:text-white">{formatINR(price)}</p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">QTY: {quantity}</p>
      </div>
    </div>
  );
};

export default OrderTrackingPage;
