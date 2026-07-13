import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, PackageCheck, Truck, Search, ChevronDown } from 'lucide-react';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
        <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
          <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
          <ChevronRight size={10} strokeWidth={3} className="mx-2" />
          <Link to="/track-order" className="hover:text-[hsl(var(--foreground))] transition-colors">TRACK ORDER</Link>
          <ChevronRight size={10} strokeWidth={3} className="mx-2" />
          <span className="text-[hsl(var(--foreground))]">#{orderId}</span>
        </div>

        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 text-center">
          <span className="text-7xl block mb-6">📦</span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">ORDER #{orderId}</h1>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-950/30 border-2 border-green-600 text-green-700 dark:text-green-400 text-sm font-black tracking-widest mb-8">
            <PackageCheck size={18} strokeWidth={2.5} />
            IN TRANSIT
          </div>

          {/* Tracking timeline */}
          <div className="text-left border-2 border-black dark:border-white p-8 sm:p-10 mt-8">
            {[
              { label: 'Order Placed', time: 'Jun 28, 2026', done: true },
              { label: 'Order Confirmed', time: 'Jun 28, 2026', done: true },
              { label: 'Shipped', time: 'Jun 30, 2026', done: true },
              { label: 'Out for Delivery', time: 'Expected Jul 2', done: false },
              { label: 'Delivered', time: '—', done: false },
            ].map((step, idx) => (
              <div key={step.label} className="flex gap-4 pb-6 last:pb-0 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    step.done
                      ? 'bg-[hsl(var(--foreground))] border-[hsl(var(--foreground))]'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {step.done && <div className="w-2 h-2 rounded-full bg-[hsl(var(--background))]" />}
                  </div>
                  {idx < 4 && (
                    <div className={`w-0.5 flex-1 min-h-[24px] ${
                      step.done ? 'bg-[hsl(var(--foreground))]' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`} />
                  )}
                </div>
                <div className="pb-4">
                  <p className={`text-sm font-bold tracking-wider ${step.done ? '' : 'text-zinc-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5 normal-case">{step.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="mt-8 px-8 py-4 border-2 border-black dark:border-white text-xs font-black tracking-widest hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] transition-colors cursor-pointer"
          >
            TRACK ANOTHER ORDER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--background))] min-h-screen text-[hsl(var(--foreground))] uppercase">
      {/* Breadcrumbs */}
      <div className="w-full border-b-2 border-black dark:border-white px-6 sm:px-10 py-4 flex items-center text-xs font-bold tracking-widest text-zinc-500">
        <Link to="/" className="hover:text-[hsl(var(--foreground))] transition-colors">HOME</Link>
        <ChevronRight size={10} strokeWidth={3} className="mx-2" />
        <span className="text-[hsl(var(--foreground))]">TRACK ORDER</span>
      </div>

      {/* Header */}
      <div className="w-full border-b-2 border-black dark:border-white">
        <div className="max-w-[1920px] mx-auto px-6 sm:px-10 py-10 sm:py-14">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[hsl(var(--foreground))] leading-none">
            TRACK ORDER
          </h1>
        </div>
      </div>

      {/* Track form */}
      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-16 sm:py-20">
        <div className="border-2 border-black dark:border-white p-8 sm:p-12">
          <div className="flex items-center gap-4 mb-8">
            <Truck size={32} strokeWidth={2} />
            <div>
              <h2 className="text-xl font-black tracking-tight">WHERE IS MY ORDER?</h2>
              <p className="text-sm text-zinc-500 normal-case tracking-normal mt-1">
                Enter your order ID to track your package in real time.
              </p>
            </div>
          </div>

          <form onSubmit={handleTrack} className="space-y-4">
            <div className="border-2 border-black dark:border-white flex">
              <input
                type="text"
                placeholder="ORDER ID (e.g. AE-12345)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 px-4 py-4 bg-transparent text-sm font-bold tracking-widest focus:outline-none placeholder:text-zinc-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-sm font-black tracking-widest border-2 border-black dark:border-white hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={16} strokeWidth={2.5} />
              TRACK ORDER
            </button>
          </form>

          <p className="text-xs text-zinc-500 mt-6 text-center normal-case">
            Orders placed more than 30 days ago may not appear here. <br />
            <Link to="/contact" className="underline hover:text-[hsl(var(--foreground))] font-bold">Contact us</Link> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
