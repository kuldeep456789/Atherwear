import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { savePaymentMethod } from '../store/slices/cartSlice';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { CreditCard, Wallet, Truck, ShieldCheck } from 'lucide-react';

const PaymentOption = ({
  value, label, sub, icons, checked, onSelect,
}: {
  value: string; label: string; sub: string; icons: React.ReactNode;
  checked: boolean; onSelect: (v: string) => void;
}) => (
  <label
    className={`relative flex items-center gap-4 px-5 sm:px-6 py-5 cursor-pointer transition-colors border-2 ${checked
        ? 'border-black dark:border-white'
        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
      }`}
  >
    {checked && <span className="absolute left-0 top-0 h-full w-1 bg-red-600" />}

    <input
      type="radio"
      name="paymentMethod"
      value={value}
      checked={checked}
      onChange={(e) => onSelect(e.target.value)}
      className="sr-only"
    />

    {/* Custom radio */}
    <span
      className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'border-black dark:border-white' : 'border-zinc-300 dark:border-zinc-600'
        }`}
    >
      {checked && <span className="w-2.5 h-2.5 rounded-full bg-black dark:bg-white" />}
    </span>

    <div className="flex flex-1 items-center justify-between gap-4">
      <div>
        <p className="text-sm sm:text-base font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          {label}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 normal-case">{sub}</p>
      </div>
      <div className={`flex gap-2 shrink-0 transition-colors ${checked ? 'text-black dark:text-white' : 'text-zinc-300 dark:text-zinc-600'}`}>
        {icons}
      </div>
    </div>
  </label>
);

const PaymentPage = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const { shippingAddress, paymentMethod: defaultPaymentMethod } = cart;
  const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod || 'Razorpay');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = () => {
    dispatch(savePaymentMethod(paymentMethod));
    navigate('/placeorder');
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-16">

        <CheckoutSteps step1 step2 />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 mt-8 border-2 border-black dark:border-white">

          {/* ── Left: Payment options ── */}
          <div className="lg:w-3/5 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white">

            <div className="px-6 sm:px-10 py-8 border-b-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">
                Step 02 / 03
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
                Payment Method
              </h1>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 normal-case">
                Choose how you'd like to pay
              </p>
            </div>

            <div className="px-6 sm:px-10 py-8 space-y-4">
              <PaymentOption
                value="Razorpay"
                label="Razorpay Secure"
                sub="Credit card, UPI, net banking"
                icons={<><CreditCard size={18} strokeWidth={1.75} /><Wallet size={18} strokeWidth={1.75} /></>}
                checked={paymentMethod === 'Razorpay'}
                onSelect={setPaymentMethod}
              />
              <PaymentOption
                value="COD"
                label="Cash on Delivery"
                sub="Pay when your order is delivered"
                icons={<Truck size={18} strokeWidth={1.75} />}
                checked={paymentMethod === 'COD'}
                onSelect={setPaymentMethod}
              />
            </div>

            {/* Reassurance strip */}
            <div className="flex items-center gap-2 px-6 sm:px-10 py-5 border-t-2 border-black dark:border-white">
              <ShieldCheck size={14} className="text-zinc-400 dark:text-zinc-500 shrink-0" strokeWidth={2} />
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Every transaction is encrypted end-to-end
              </p>
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-2/5 px-6 sm:px-10 py-8">
            <OrderSummarySidebar
              buttonText="Continue to Review"
              buttonAction={submitHandler}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;