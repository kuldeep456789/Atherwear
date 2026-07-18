import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useCreateReturnMutation, useGetMyReturnsQuery } from '../store/slices/returnApiSlice';
import { Check, X, ChevronRight, ChevronDown, RotateCcw, Truck, Clock, ShieldCheck, Image as ImageIcon, Star, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RETURN_REASONS = [
  'Wrong Size', 'Poor Fit', 'Damaged Item', 'Missing Product',
  'Color Mismatch', 'Quality Issue', 'Wrong Item Received',
  'Changed Mind', 'Late Delivery', 'Other',
];

const STATUS_STEPS = [
  { key: 'requested', label: 'Return Requested', icon: RotateCcw },
  { key: 'approved', label: 'Approved', icon: Check },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled', icon: Clock },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'quality_check', label: 'Quality Check', icon: ShieldCheck },
  { key: 'refund_initiated', label: 'Refund Initiated', icon: Star },
  { key: 'refund_completed', label: 'Refund Completed', icon: Check },
];

const STATUS_ORDER = STATUS_STEPS.map((s) => s.key);

const getStatusIndex = (status: string) => {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
};

const nonReturnable = ['Innerwear', 'Accessories', 'Gift Cards', 'Final Sale Items'];

const ReturnsPage = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [activeTab, setActiveTab] = useState<'policy' | 'form' | 'history'>('policy');
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [createReturn, { isLoading: isSubmitting }] = useCreateReturnMutation();
  const { data: myReturns = [], isLoading: returnsLoading, refetch } = useGetMyReturnsQuery(undefined, { skip: !userInfo, pollingInterval: 3000 });

  // Form state
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [productSize, setProductSize] = useState('');
  const [productColor, setProductColor] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [exchangeSize, setExchangeSize] = useState('');
  const [pickupStreet, setPickupStreet] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [pickupState, setPickupState] = useState('');
  const [pickupPincode, setPickupPincode] = useState('');
  const [pickupPhone, setPickupPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');
  const [selectedReturn, setSelectedReturn] = useState<string | null>(null);

  const handleAddImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!orderId || !productId || !productName || !reason) {
      setFormError('Order ID, Product ID, Product Name, and Reason are required.');
      return;
    }
    if (!pickupStreet || !pickupCity || !pickupState || !pickupPincode || !pickupPhone) {
      setFormError('Please complete the pickup address fields.');
      return;
    }
    try {
      const body: any = {
        orderId,
        productId,
        productName,
        reason,
        description,
        images,
        pickupAddress: {
          street: pickupStreet,
          city: pickupCity,
          state: pickupState,
          pincode: pickupPincode,
          phone: pickupPhone,
        },
      };
      if (productImage) body.productImage = productImage;
      if (productSize) body.productSize = productSize;
      if (productColor) body.productColor = productColor;
      if (exchangeSize) body.exchangeSize = exchangeSize;

      await createReturn(body).unwrap();
      setSuccessMsg('Return request submitted successfully! Track its status below.');
      setOrderId(''); setProductId(''); setProductName(''); setProductImage('');
      setProductSize(''); setProductColor(''); setReason(''); setDescription('');
      setImages([]); setExchangeSize(''); setPickupStreet(''); setPickupCity('');
      setPickupState(''); setPickupPincode(''); setPickupPhone('');
      refetch();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setFormError(err?.data?.message || 'Failed to submit return request.');
    }
  };

  const faqs = [
    { q: 'How long does a refund take?', a: 'Refunds are processed within 3–5 business days for original payment methods, and instantly for wallet credits.' },
    { q: 'Can I exchange a size?', a: 'Yes! Select the "Exchange Size" option in the return form and choose your preferred size. We\'ll ship the replacement after the pickup is completed.' },
    { q: 'Can I return sale items?', a: 'Final sale items, innerwear, and accessories are non-returnable. All other sale items follow the standard 7-day return policy.' },
    { q: 'How do I cancel a return?', a: 'Contact our support team within 24 hours of submitting the request to cancel. Once pickup is scheduled, cancellation may not be possible.' },
    { q: 'Who pays for return shipping?', a: 'Return shipping is free for all eligible items. We\'ll provide a free pickup from your address.' },
    { q: 'Can I return multiple products?', a: 'Yes, you can submit separate return requests for each product in your order. Each request is handled individually.' },
  ];

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mb-6">
          <Link to="/" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={2.5} />
          <Link to="/shipping-policy" className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">SHIPPING</Link>
          <ChevronRight size={10} strokeWidth={2.5} />
          <span className="text-zinc-700 dark:text-zinc-300">RETURNS</span>
        </div>

        <h1 className="text-[32px] sm:text-[38px] lg:text-[44px] font-bold leading-[1.1] mb-3">Returns & Refunds</h1>
        <p className="text-[15px] text-zinc-500 mb-8 max-w-xl">Hassle-free returns within 7 days of delivery. Start a return or track an existing request.</p>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl w-fit">
          {[
            { key: 'policy', label: 'Return Policy' },
            { key: 'form', label: 'Start a Return' },
            ...(userInfo ? [{ key: 'history', label: 'My Returns' }] : []),
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-5 py-2.5 rounded-lg text-[13px] font-bold tracking-wide transition-all duration-200 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))] shadow-sm'
                  : 'text-zinc-500 hover:text-[hsl(var(--foreground))]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ───── TAB: POLICY ───── */}
          {activeTab === 'policy' && (
            <motion.div key="policy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {/* Return Policy */}
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <RotateCcw size={20} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[18px] font-bold">Return Policy</h2>
                </div>
                <div className="bg-[hsl(var(--card))] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                  <p className="text-[15px] font-semibold mb-4">Easy 7-Day Returns</p>
                  <p className="text-[13px] text-zinc-500 mb-4">Items must meet the following conditions:</p>
                  <div className="space-y-2.5 mb-6">
                    {['Unused', 'Unwashed', 'Original Tags Attached', 'Original Packaging', 'No Damage'].map((cond) => (
                      <div key={cond} className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                          <Check size={12} strokeWidth={3} className="text-green-600" />
                        </span>
                        <span className="text-[13px] font-medium">{cond}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[13px] font-semibold mb-3 text-red-600">Non-returnable Items</p>
                  <div className="flex flex-wrap gap-2">
                    {nonReturnable.map((item) => (
                      <span key={item} className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">{item}</span>
                    ))}
                  </div>
                </div>
              </section>

              {/* Start Return CTA */}
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl p-6 text-center mb-10">
                <p className="text-[15px] font-semibold mb-1">Ready to return an item?</p>
                <p className="text-[13px] text-zinc-500 mb-4">Start your return request and we'll guide you through the process.</p>
                <button onClick={() => setActiveTab('form')} className="h-[48px] px-8 rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[13px] font-bold tracking-wide hover:opacity-90 transition-all cursor-pointer">
                  START RETURN
                </button>
              </div>

              {/* FAQ */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[18px] font-bold">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-2">
                  {faqs.map((faq) => (
                    <div key={faq.q} className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setFaqOpen(faqOpen === faq.q ? null : faq.q)}
                        className="w-full flex items-center justify-between p-4 text-left text-[14px] font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        {faq.q}
                        <ChevronDown size={16} strokeWidth={2} className={`shrink-0 transition-transform duration-200 ${faqOpen === faq.q ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {faqOpen === faq.q && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                            <p className="px-4 pb-4 text-[13px] text-zinc-500 leading-relaxed">{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>

              {/* Refund Information */}
              <section className="mt-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <ShieldCheck size={20} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-[18px] font-bold">Refund Information</h2>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { method: 'Original Payment', time: '3–5 Business Days', desc: 'Credit/debit card, UPI, Net Banking' },
                    { method: 'COD (Bank Transfer)', time: '5–7 Business Days', desc: 'Bank account details required' },
                    { method: 'Wallet', time: 'Instant', desc: 'VASTRA Wallet credit' },
                  ].map((item) => (
                    <div key={item.method} className="bg-[hsl(var(--card))] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
                      <p className="text-[13px] text-zinc-500 mb-1">{item.method}</p>
                      <p className="text-[16px] font-bold text-green-600">{item.time}</p>
                      <p className="text-[11px] text-zinc-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* ───── TAB: FORM ───── */}
          {activeTab === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {/* Eligibility Badge */}
              <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Check size={16} strokeWidth={3} className="text-green-600" />
                </span>
                <div>
                  <p className="text-[13px] font-bold text-green-700 dark:text-green-400">Eligible for Return</p>
                  <p className="text-[12px] text-green-600/70 dark:text-green-400/70">7 Days Return Window · Items must be unused with tags attached</p>
                </div>
              </div>

              {successMsg && (
                <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Check size={18} strokeWidth={2.5} className="text-green-600 shrink-0" />
                  <p className="text-[13px] font-semibold text-green-700 dark:text-green-400">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <h2 className="text-[16px] font-bold mb-6">Return Request Form</h2>

                {formError && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-lg p-3 mb-5 flex items-center gap-2">
                    <X size={14} strokeWidth={2.5} className="text-red-600 shrink-0" />
                    <span className="text-[12px] font-semibold text-red-600">{formError}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Order ID *</label>
                    <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. ORDER-12345" className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Product ID *</label>
                    <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="e.g. PROD-98765" className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Product Name *</label>
                    <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Product Image URL</label>
                    <input value={productImage} onChange={(e) => setProductImage(e.target.value)} placeholder="https://..." className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Size</label>
                    <input value={productSize} onChange={(e) => setProductSize(e.target.value)} placeholder="e.g. M, L, XL" className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                  <div>
                    <label className="text-[12px] font-semibold mb-1.5 block">Color</label>
                    <input value={productColor} onChange={(e) => setProductColor(e.target.value)} placeholder="e.g. Black" className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                </div>

                {/* Reason */}
                <div className="mb-5">
                  <label className="text-[12px] font-semibold mb-1.5 block">Reason for Return *</label>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-[hsl(var(--card))] text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]">
                    <option value="">Select a reason</option>
                    {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Description */}
                <div className="mb-5">
                  <label className="text-[12px] font-semibold mb-1.5 block">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the issue..." className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))] resize-none" />
                </div>

                {/* Image Upload */}
                <div className="mb-5">
                  <label className="text-[12px] font-semibold mb-1.5 block">Upload Images (URLs)</label>
                  <div className="flex gap-2 mb-2">
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste image URL" className="flex-1 h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                    <button type="button" onClick={handleAddImage} className="h-[44px] px-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[12px] font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer flex items-center gap-1.5">
                      <ImageIcon size={14} strokeWidth={1.5} /> Add
                    </button>
                  </div>
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {images.map((url, i) => (
                        <div key={i} className="relative group">
                          <img src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                            <X size={10} strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exchange Size */}
                <div className="mb-5">
                  <label className="text-[12px] font-semibold mb-1.5 block">Exchange Size (optional)</label>
                  <div className="flex gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <button key={s} type="button" onClick={() => setExchangeSize(exchangeSize === s ? '' : s)} className={`w-[52px] h-[44px] rounded-lg border text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
                        exchangeSize === s
                          ? 'bg-[hsl(var(--foreground))] text-[hsl(var(--background))] border-[hsl(var(--foreground))]'
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-[hsl(var(--foreground))]'
                      }`}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Pickup Address */}
                <div className="mb-6">
                  <label className="text-[12px] font-semibold mb-3 block">Pickup Address *</label>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input value={pickupStreet} onChange={(e) => setPickupStreet(e.target.value)} placeholder="Street Address *" className="sm:col-span-2 h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                    <input value={pickupCity} onChange={(e) => setPickupCity(e.target.value)} placeholder="City *" className="h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                    <input value={pickupState} onChange={(e) => setPickupState(e.target.value)} placeholder="State *" className="h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                    <input value={pickupPincode} onChange={(e) => setPickupPincode(e.target.value)} placeholder="Pincode *" className="h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                    <input value={pickupPhone} onChange={(e) => setPickupPhone(e.target.value)} placeholder="Phone *" className="h-[44px] px-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-transparent text-[13px] focus:outline-none focus:border-[hsl(var(--foreground))]" />
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full h-[52px] rounded-xl bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-[14px] font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                  {isSubmitting ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ───── TAB: HISTORY ───── */}
          {activeTab === 'history' && userInfo && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              {returnsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
                </div>
              ) : myReturns.length === 0 ? (
                <div className="text-center py-12 bg-[hsl(var(--card))] border border-zinc-200 dark:border-zinc-800 rounded-xl">
                  <RotateCcw size={32} strokeWidth={1.5} className="mx-auto mb-3 text-zinc-300" />
                  <p className="text-[16px] font-semibold mb-1">No return requests yet</p>
                  <p className="text-[13px] text-zinc-500">Start a return from the form above.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myReturns.map((ret: any) => {
                    const isExpanded = selectedReturn === ret._id;
                    const stepIdx = getStatusIndex(ret.status);
                    const isRejected = ret.status === 'rejected';
                    return (
                      <div key={ret._id} className="bg-[hsl(var(--card))] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
                        <button
                          onClick={() => setSelectedReturn(isExpanded ? null : ret._id)}
                          className="w-full flex items-center justify-between p-4 text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isRejected ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 'bg-green-100 dark:bg-green-900/20 text-green-600'
                            }`}>
                              {isRejected ? <X size={18} strokeWidth={2} /> : <RotateCcw size={18} strokeWidth={1.5} />}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold">{ret.productName}</p>
                              <p className="text-[12px] text-zinc-500">Order: {ret.orderId} · {new Date(ret.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[11px] font-bold px-3 py-1 rounded-lg ${
                              isRejected ? 'bg-red-100 dark:bg-red-900/20 text-red-600' :
                              ret.status === 'refund_completed' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
                              'bg-amber-100 dark:bg-amber-900/20 text-amber-600'
                            }`}>
                              {ret.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                            </span>
                            <ChevronDown size={16} strokeWidth={2} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </button>
                        <AnimatePresence>
                          {isExpanded && !isRejected && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800">
                              <div className="p-4 sm:p-5">
                                {/* Timeline */}
                                <div className="relative mb-5">
                                  {STATUS_STEPS.map((step, i) => {
                                    const isActive = i <= stepIdx;
                                    const isLast = i === STATUS_STEPS.length - 1;
                                    return (
                                      <div key={step.key} className="flex items-start gap-3 relative pb-5 last:pb-0">
                                        {!isLast && (
                                          <div className={`absolute left-[15px] top-[34px] w-[2px] h-[calc(100%-34px)] ${isActive ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                                        )}
                                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                                          isActive ? 'bg-green-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                        }`}>
                                          <step.icon size={14} strokeWidth={2.5} />
                                        </div>
                                        <div className="pt-1.5">
                                          <p className={`text-[13px] font-semibold ${isActive ? 'text-[hsl(var(--foreground))]' : 'text-zinc-400'}`}>{step.label}</p>
                                          {isActive && i === stepIdx && (
                                            <p className="text-[11px] text-green-600 font-medium mt-0.5">Current stage</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Details */}
                                <div className="grid sm:grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl p-4">
                                  <div>
                                    <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Reason</p>
                                    <p className="text-[13px] font-medium mt-0.5">{ret.reason}</p>
                                  </div>
                                  {ret.description && (
                                    <div>
                                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Description</p>
                                      <p className="text-[13px] font-medium mt-0.5">{ret.description}</p>
                                    </div>
                                  )}
                                  {ret.exchangeSize && (
                                    <div>
                                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Exchange Size</p>
                                      <p className="text-[13px] font-medium mt-0.5">{ret.exchangeSize}</p>
                                    </div>
                                  )}
                                  {ret.refundAmount != null && (
                                    <div>
                                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Refund Amount</p>
                                      <p className="text-[13px] font-medium mt-0.5 text-green-600 font-bold">₹{ret.refundAmount}</p>
                                    </div>
                                  )}
                                  {ret.pickupDate && (
                                    <div>
                                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Pickup Date</p>
                                      <p className="text-[13px] font-medium mt-0.5">{new Date(ret.pickupDate).toLocaleDateString()}</p>
                                    </div>
                                  )}
                                  {ret.adminRemarks && (
                                    <div className="sm:col-span-2">
                                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">Admin Remarks</p>
                                      <p className="text-[13px] font-medium mt-0.5 text-zinc-500 italic">{ret.adminRemarks}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        {isExpanded && isRejected && (
                          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <X size={16} strokeWidth={2.5} className="text-red-600 shrink-0" />
                                <span className="text-[13px] font-bold text-red-600">Return Request Rejected</span>
                              </div>
                              {ret.adminRemarks && <p className="text-[12px] text-red-600/70">{ret.adminRemarks}</p>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReturnsPage;
