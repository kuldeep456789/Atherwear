import { Link, useParams } from 'react-router-dom';
import { useGetOrderDetailsQuery } from '../store/slices/orderApiSlice';
import { useGetProductDetailsQuery } from '../store/slices/productApiSlice';
import { CheckCircle, Clock, CreditCard, Package } from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Payment Pending', className: 'bg-orange-50 text-orange-700 border-orange-600 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-500' },
  confirmed: { label: 'Confirmed', className: 'bg-green-50 text-green-700 border-green-600 dark:bg-green-950/20 dark:text-green-400 dark:border-green-500' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-600 dark:bg-red-950/20 dark:text-red-400 dark:border-red-500' },
};

const OrderItemRow = ({ productId, quantity }: { productId: string; quantity: number }) => {
  const { data: product, isLoading } = useGetProductDetailsQuery(productId);
  const name = product?.name || product?.title || `Product ${productId}`;
  const image = product?.images?.[0];
  const price = product?.discountPrice || product?.price || 0;

  return (
    <div className="flex items-center gap-6 p-6 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
      <div className="w-20 h-24 border-2 border-black dark:border-white bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <Link to={`/product/${productId}`} className="font-bold text-sm md:text-base tracking-wide line-clamp-2 text-[hsl(var(--foreground))] hover:text-orange-600 transition-colors">
          {isLoading ? 'Loading…' : name}
        </Link>
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-base md:text-lg text-[hsl(var(--foreground))]">₹{price}</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest mt-1">QTY: {quantity}</p>
      </div>
    </div>
  );
};

const OrderSuccessPage = () => {
  const { id } = useParams();
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id);

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-950">
      <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen flex items-center justify-center text-red-500">
      Failed to load order. <Link to="/" className="underline ml-2">Go Home</Link>
    </div>
  );

  const status = statusConfig[order.status] || statusConfig.pending;
  const isPaid = order.paymentStatus === 'paid';
  const paymentMethodLabel =
    order.paymentProvider === 'COD'
      ? 'CASH ON DELIVERY'
      : 'RAZORPAY SECURE';
  const paymentStatusLabel =
    order.paymentProvider === 'COD'
      ? (isPaid ? 'PAYMENT COLLECTED' : 'PAYMENT PENDING')
      : (isPaid ? 'PAYMENT CAPTURED' : 'PAYMENT PENDING');

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] font-sans uppercase pb-24">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Success Banner */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-green-500/20 dark:bg-green-500/10 rounded-full animate-ping" />
            <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-950 border-2 border-green-600 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.3)]">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-500" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter mb-4 text-[hsl(var(--foreground))]">ORDER PLACED</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-lg mx-auto normal-case tracking-normal leading-relaxed">
            Thank you for shopping with Aetherwear.
          </p>
          <div className="mt-8 flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-zinc-500 tracking-widest">ORDER REFERENCE</span>
            <div className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 font-mono text-xs font-bold tracking-widest shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
              <span className="select-all">{order._id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Order Status */}
          <div className="group relative border-2 border-black dark:border-white p-6 md:p-8 bg-white dark:bg-[hsl(var(--card))] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-600 dark:bg-orange-500" />
            <div className="flex items-center gap-3 font-black uppercase tracking-widest mb-4 text-[hsl(var(--foreground))] text-xs ml-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-500" /> ORDER STATUS
            </div>
            <div className="ml-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest px-3 py-1.5 border-2 ${status.className}`}>
                {status.label.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Payment Info */}
          <div className="group relative border-2 border-black dark:border-white p-6 md:p-8 bg-white dark:bg-[hsl(var(--card))] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(234,88,12,1)] transition-all duration-300">
            <div className="absolute top-0 left-0 w-2 h-full bg-orange-600 dark:bg-orange-500" />
            <div className="flex items-center gap-3 font-black uppercase tracking-widest mb-4 text-[hsl(var(--foreground))] text-xs ml-2">
              <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-500" /> BILLING DETAILS
            </div>
            <div className="flex flex-col gap-4 ml-2">
              <div>
                <p className="text-[10px] text-zinc-500 mb-1 font-bold tracking-widest">PAYMENT METHOD</p>
                <p className="text-sm font-black tracking-wider text-black dark:text-white">{paymentMethodLabel}</p>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black tracking-widest px-3 py-1.5 border-2 ${
                  isPaid
                    ? 'bg-green-50 text-green-700 border-green-600 dark:bg-green-950/20 dark:text-green-400 dark:border-green-500'
                    : 'bg-orange-50 text-orange-700 border-orange-600 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-500'
                }`}>
                  {isPaid ? <><CheckCircle size={12} strokeWidth={3} /> {paymentStatusLabel}</> : paymentStatusLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="border-2 border-black dark:border-white bg-white dark:bg-[hsl(var(--card))] mb-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-3 font-black uppercase tracking-widest p-6 border-b-2 border-black dark:border-white text-[hsl(var(--foreground))] text-xs bg-zinc-50 dark:bg-zinc-900/50">
            <Package className="w-5 h-5 text-orange-600 dark:text-orange-500" /> ITEMS IN ORDER
          </div>
          <div className="divide-y-2 divide-zinc-100 dark:divide-zinc-800">
            {order.items.map((item: any, i: number) => (
              <OrderItemRow key={i} productId={item.productId} quantity={item.quantity} />
            ))}
          </div>
          <div className="p-6 md:p-8 bg-zinc-50 dark:bg-zinc-900/50 border-t-2 border-black dark:border-white flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="font-black uppercase tracking-widest text-sm text-zinc-500">GRAND TOTAL</span>
            <span className="text-3xl md:text-4xl font-black text-orange-600 dark:text-orange-500 font-mono tracking-tighter">₹{order.totalAmount}</span>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-block bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-2 border-black dark:border-white px-12 py-4 font-black tracking-widest hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all uppercase">
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
