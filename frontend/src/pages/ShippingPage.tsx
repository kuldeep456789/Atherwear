import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { saveShippingAddress } from '../store/slices/cartSlice';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { MapPin, Building2, Hash, Globe, Phone, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { formatINR } from '../lib/currency';

const InputField = ({
  id, label, value, onChange, icon, required, placeholder
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  icon: React.ReactNode; required?: boolean; placeholder?: string;
}) => (
  <div className="group">
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2 group-focus-within:text-black dark:group-focus-within:text-white transition-colors"
    >
      <span className="text-zinc-400 dark:text-zinc-500 group-focus-within:text-red-600 transition-colors">
        {icon}
      </span>
      {label}
      {required && <span className="text-red-600">*</span>}
    </label>
    <input
      id={id}
      type="text"
      className="w-full bg-transparent border-2 border-zinc-200 dark:border-zinc-700 px-4 py-3.5 text-sm font-semibold text-zinc-900 dark:text-white placeholder:text-zinc-400 placeholder:font-normal focus:outline-none focus:border-black dark:focus:border-white transition-colors"
      placeholder={placeholder || label}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
    />
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
    { icon: <ShieldCheck size={18} strokeWidth={2} />, label: 'Secure Checkout', sub: '256-bit SSL encrypted' },
    { icon: <RotateCcw size={18} strokeWidth={2} />, label: 'Easy Returns', sub: '30-day return policy' },
    { icon: <Truck size={18} strokeWidth={2} />, label: 'Free Shipping', sub: `On orders over ${formatINR(5000)}` },
  ];

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10 sm:py-16">

        {/* Stepper */}
        <CheckoutSteps step1 />

        <div className="flex flex-col lg:flex-row gap-0 lg:gap-10 mt-8 border-2 border-black dark:border-white">

          {/* ── Left: Form ── */}
          <div className="lg:w-3/5 border-b-2 lg:border-b-0 lg:border-r-2 border-black dark:border-white">

            {/* Section Header */}
            <div className="px-6 sm:px-10 py-8 border-b-2 border-black dark:border-white">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-600">
                Step 01 / 03
              </span>
              <h1 className="mt-2 text-3xl sm:text-4xl font-black uppercase tracking-tighter leading-none">
                Shipping Address
              </h1>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 normal-case">
                Where should we send your order?
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); submitHandler(); }}
              className="px-6 sm:px-10 py-8 space-y-5"
            >
              <InputField
                id="address"
                label="Street Address"
                value={address}
                onChange={setAddress}
                icon={<MapPin size={13} />}
                placeholder="e.g. 12, MG Road, Apt 4B"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <InputField
                  id="city"
                  label="City"
                  value={city}
                  onChange={setCity}
                  icon={<Building2 size={13} />}
                  placeholder="e.g. Mumbai"
                  required
                />
                <InputField
                  id="postalCode"
                  label="Postal Code"
                  value={postalCode}
                  onChange={setPostalCode}
                  icon={<Hash size={13} />}
                  placeholder="e.g. 400001"
                  required
                />
              </div>

              <InputField
                id="country"
                label="Country"
                value={country}
                onChange={setCountry}
                icon={<Globe size={13} />}
                placeholder="e.g. India"
                required
              />

              <InputField
                id="phone"
                label="Phone Number"
                value={phone}
                onChange={setPhone}
                icon={<Phone size={13} />}
                placeholder="e.g. +91 9876543210"
                required
              />

              {/* Hidden submit target */}
              <button type="submit" id="submit-shipping" className="hidden">Submit</button>
            </form>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 border-t-2 border-black dark:border-white">
              {trustBadges.map((badge, idx) => (
                <div
                  key={badge.label}
                  className={`flex flex-col items-center text-center gap-2 px-3 py-6 ${idx < 2 ? 'border-r-2 border-black dark:border-white' : ''}`}
                >
                  <span className="text-zinc-400 dark:text-zinc-500">{badge.icon}</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest">{badge.label}</p>
                    <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 normal-case">{badge.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:w-2/5 px-6 sm:px-10 py-8">
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