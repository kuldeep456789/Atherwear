import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { saveShippingAddress } from '../store/slices/cartSlice';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { MapPin, Building2, Hash, Globe, Phone, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { formatUSD } from '../lib/currency';

const InputField = ({
  id, label, value, onChange, icon, required, placeholder
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  icon: React.ReactNode; required?: boolean; placeholder?: string;
}) => (
  <div className="relative group">
    {/* Floating label input */}
    <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 focus-within:border-black dark:focus-within:border-white focus-within:bg-white dark:focus-within:bg-zinc-800 transition-all duration-200 focus-within:shadow-[0_0_0_3px_rgba(0,0,0,0.06)] dark:focus-within:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]">
      <span className="text-zinc-400 dark:text-zinc-500 group-focus-within:text-black dark:group-focus-within:text-white transition-colors shrink-0">
        {icon}
      </span>
      <div className="flex-1 relative">
        <label
          htmlFor={id}
          className={`absolute left-0 text-[10px] font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${
            value
              ? 'top-0 text-zinc-500 dark:text-zinc-400'
              : 'top-1/2 -translate-y-1/2 text-xs text-zinc-400 dark:text-zinc-500'
          } peer-focus:top-0 peer-focus:text-[10px] peer-focus:text-zinc-500`}
        >
          {label}
        </label>
        <input
          id={id}
          type="text"
          className="peer w-full bg-transparent text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none pt-4 placeholder:text-transparent"
          placeholder={placeholder || label}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  </div>
);

const ShippingPage = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress.address || '');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || 'India');
  const [phone, setPhone] = useState(shippingAddress.phone || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = () => {
    dispatch(saveShippingAddress({ address, city, postalCode, country, phone }));
    navigate('/payment');
  };

  const trustBadges = [
    { icon: <ShieldCheck size={20} strokeWidth={1.5} />, label: 'Secure Checkout', sub: '256-bit SSL encrypted' },
    { icon: <RotateCcw size={20} strokeWidth={1.5} />, label: 'Easy Returns', sub: '30-day return policy' },
    { icon: <Truck size={20} strokeWidth={1.5} />, label: 'Free Shipping', sub: `On orders over ${formatUSD(5000)}` },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Stepper */}
        <CheckoutSteps step1 />

        <div className="flex flex-col lg:flex-row gap-8 mt-2">

          {/* ── Left: Form ── */}
          <div className="lg:w-3/5 space-y-6">

            {/* Section Header */}
            <div>
              <span className="inline-block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-1">
                Step 1 of 3
              </span>
              <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white leading-tight">
                Shipping Address
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Where should we send your order?
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 sm:p-8">
              <form
                onSubmit={(e) => { e.preventDefault(); submitHandler(); }}
                className="space-y-4"
              >
                {/* Street Address - full width */}
                <InputField
                  id="address"
                  label="Street Address"
                  value={address}
                  onChange={setAddress}
                  icon={<MapPin size={16} />}
                  placeholder="e.g. 12, MG Road, Apt 4B"
                  required
                />

                {/* City + Postal Code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="city"
                    label="City"
                    value={city}
                    onChange={setCity}
                    icon={<Building2 size={16} />}
                    placeholder="e.g. Mumbai"
                    required
                  />
                  <InputField
                    id="postalCode"
                    label="Postal Code"
                    value={postalCode}
                    onChange={setPostalCode}
                    icon={<Hash size={16} />}
                    placeholder="e.g. 400001"
                    required
                  />
                </div>

                {/* Country */}
                <InputField
                  id="country"
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  icon={<Globe size={16} />}
                  placeholder="e.g. India"
                  required
                />

                {/* Phone */}
                <InputField
                  id="phone"
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  icon={<Phone size={16} />}
                  placeholder="e.g. +91 9876543210"
                  required
                />

                {/* Hidden submit target */}
                <button type="submit" id="submit-shipping" className="hidden">Submit</button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex flex-col items-center text-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-3 py-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="text-zinc-400 dark:text-zinc-500">{badge.icon}</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">{badge.label}</p>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-2/5">
            <OrderSummarySidebar
              buttonText="Continue to Payment"
              buttonAction={() => {
                const btn = document.getElementById('submit-shipping');
                if (btn) btn.click();
              }}
              disableButton={!address || !city || !postalCode || !country || !phone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
