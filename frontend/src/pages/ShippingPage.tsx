import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { saveShippingAddress } from '../store/slices/cartSlice';
import CheckoutSteps from '../components/checkout/CheckoutSteps';
import OrderSummarySidebar from '../components/checkout/OrderSummarySidebar';
import { MapPin, Building2, Hash, Globe, Phone, Mail, User } from 'lucide-react';
import { formatINR } from '../lib/currency';

const InputField = ({
  id, label, value, onChange, icon, required, placeholder, type, autoComplete
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  icon: React.ReactNode; required?: boolean; placeholder?: string;
  type?: string; autoComplete?: string;
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.trim().length > 0;

  return (
    <div className="relative group">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
        focused || hasValue ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500'
      }`}>
        {icon}
      </div>
      <input
        id={id}
        type={type || 'text'}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full h-[56px] pl-11 pr-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#18181B] text-[15px] font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-900 dark:focus:border-white focus:ring-1 focus:ring-zinc-900/10 dark:focus:ring-white/10 transition-all duration-200"
        placeholder={placeholder || label}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
      <label
        htmlFor={id}
        className={`absolute left-11 -top-2.5 px-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
          focused || hasValue
            ? 'opacity-100 translate-y-0 text-zinc-500 dark:text-zinc-400'
            : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
        style={{ backgroundColor: 'inherit' }}
      >
        {label}{required && ' *'}
      </label>
    </div>
  );
};

const ShippingPage = () => {
  const cart = useSelector((state: RootState) => state.cart);
  const { shippingAddress } = cart;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState(shippingAddress.address || '');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState(shippingAddress.city || '');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
  const [country, setCountry] = useState(shippingAddress.country || 'India');
  const [phone, setPhone] = useState(shippingAddress.phone || '');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = () => {
    dispatch(saveShippingAddress({
      address: `${address}${address2 ? `, ${address2}` : ''}`,
      city, postalCode, country, phone
    }));
    navigate('/payment');
  };

  const isFormValid = firstName && lastName && email && address && city && state && postalCode && country && phone;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10]">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <CheckoutSteps step1 />

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 xl:gap-12 mt-2">

          {/* ── Left: Form ── */}
          <div className="w-full lg:w-[65%]">
            <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden">
              {/* Header */}
              <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  Step 01 / 03
                </span>
                <h1 className="mt-2 text-[28px] sm:text-[32px] font-bold text-zinc-900 dark:text-white tracking-tight">
                  Shipping Address
                </h1>
                <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
                  Where should we send your order?
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={(e) => { e.preventDefault(); submitHandler(); }}
                className="px-6 sm:px-8 py-6 space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <InputField
                    id="firstName" label="First Name" value={firstName} onChange={setFirstName}
                    icon={<User size={15} strokeWidth={1.5} />} required autoComplete="given-name"
                  />
                  <InputField
                    id="lastName" label="Last Name" value={lastName} onChange={setLastName}
                    icon={<User size={15} strokeWidth={1.5} />} required autoComplete="family-name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <InputField
                    id="email" label="Email" value={email} onChange={setEmail}
                    icon={<Mail size={15} strokeWidth={1.5} />} required type="email" autoComplete="email"
                  />
                  <InputField
                    id="phone" label="Phone Number" value={phone} onChange={setPhone}
                    icon={<Phone size={15} strokeWidth={1.5} />} required type="tel" autoComplete="tel"
                  />
                </div>

                <InputField
                  id="address" label="Address Line 1" value={address} onChange={setAddress}
                  icon={<MapPin size={15} strokeWidth={1.5} />} required autoComplete="address-line1"
                />

                <InputField
                  id="address2" label="Address Line 2 (Optional)" value={address2} onChange={setAddress2}
                  icon={<MapPin size={15} strokeWidth={1.5} />} autoComplete="address-line2"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                  <InputField
                    id="city" label="City" value={city} onChange={setCity}
                    icon={<Building2 size={15} strokeWidth={1.5} />} required autoComplete="address-level2"
                  />
                  <InputField
                    id="state" label="State" value={state} onChange={setState}
                    icon={<Building2 size={15} strokeWidth={1.5} />} required autoComplete="address-level1"
                  />
                  <InputField
                    id="postalCode" label="Postal Code" value={postalCode} onChange={setPostalCode}
                    icon={<Hash size={15} strokeWidth={1.5} />} required autoComplete="postal-code"
                  />
                </div>

                <InputField
                  id="country" label="Country" value={country} onChange={setCountry}
                  icon={<Globe size={15} strokeWidth={1.5} />} required autoComplete="country-name"
                />

                <button type="submit" id="submit-shipping" className="hidden">Submit</button>
              </form>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Secure Checkout', sub: '256-bit SSL' },
                { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>, label: 'Easy Returns', sub: '30-day policy' },
                { icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M5 12h14M12 5l7 7-7 7"/></svg>, label: 'Free Shipping', sub: `On ${formatINR(5000)}+` },
              ].map((badge, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-1.5 py-4 px-2 rounded-xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-250">
                  <span className="text-zinc-400 dark:text-zinc-500">{badge.icon}</span>
                  <p className="text-[11px] font-bold tracking-wider text-zinc-700 dark:text-zinc-300">{badge.label}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500">{badge.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="w-full lg:w-[35%]">
            <OrderSummarySidebar
              buttonText="Continue to Payment"
              buttonAction={() => {
                const btn = document.getElementById('submit-shipping');
                if (btn) btn.click();
              }}
              disableButton={!isFormValid}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
