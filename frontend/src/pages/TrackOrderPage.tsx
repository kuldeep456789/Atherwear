import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Truck, Headphones, Search, 
  Package, CheckCircle2
} from 'lucide-react';

const TrackOrderPage = () => {
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError('Invalid Token / Order ID');
      return;
    }
    setError('');
    // Remove # symbol if the user pasted it (e.g. #87E5CE9F), since # breaks the URL route
    navigate(`/orders/${orderId.trim().replace(/^#/, '')}`);
  };

  return (
    <div className="bg-[#FAFAFA] dark:bg-[#0a0a0a] min-h-screen text-[hsl(var(--foreground))] font-sans selection:bg-[#d4af37] selection:text-black relative overflow-hidden">
      {/* Premium Decorative Background Glows */}
      <div className="absolute top-0 inset-x-0 h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-20 w-96 h-96 bg-[#d4af37]/20 dark:bg-[#d4af37]/10 rounded-full blur-[120px] opacity-70" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-zinc-300/40 dark:bg-zinc-800/30 rounded-full blur-[100px] opacity-60" />
      </div>

      {/* Container */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 py-12 lg:py-24 space-y-8 lg:space-y-12">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* Left Hero */}
          <div className="w-full lg:w-1/2 pt-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 mb-6">
              <Package size={14} className="text-[#d4af37]" />
              <span className="text-[11px] font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-400">Order Tracking</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black leading-[1.1] mb-6 tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500">
              Track Your<br />Order
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg sm:text-xl max-w-md mb-14 leading-relaxed font-medium">
              Track your VASTRA order in real time and know exactly when it will arrive at your doorstep.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <ShieldCheck className="text-[#d4af37] mb-3 w-6 h-6" />
                <h3 className="font-semibold text-sm mb-1">Secure & Safe</h3>
                <p className="text-zinc-500 text-xs">Your information is always protected</p>
              </div>
              <div>
                <Truck className="text-[#d4af37] mb-3 w-6 h-6" />
                <h3 className="font-semibold text-sm mb-1">Real-time Updates</h3>
                <p className="text-zinc-500 text-xs">Track your order every step of the way</p>
              </div>
              <div>
                <Headphones className="text-[#d4af37] mb-3 w-6 h-6" />
                <h3 className="font-semibold text-sm mb-1">24×7 Support</h3>
                <p className="text-zinc-500 text-xs">We're here to help you anytime</p>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 rounded-[32px] p-8 sm:p-12 shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <Package className="text-[#d4af37] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide uppercase text-[#111111] dark:text-white">WHERE IS MY ORDER?</h2>
                  <p className="text-sm text-zinc-400 mt-1">Enter your order ID to track your package in real time.</p>
                </div>
              </div>

              <form onSubmit={handleTrack} className="space-y-6 relative z-10">
                <div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="w-6 h-4 border border-[#d4af37]/50 rounded-[2px] bg-[#d4af37]/10"></div>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter Order ID (e.g. AE-123456)"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-transparent border border-zinc-300 dark:border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder:text-zinc-500 text-[#111111] dark:text-white"
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-red-500 text-xs font-semibold mt-2 ml-1">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b68945] via-[#d4af37] to-[#e4c985] text-black text-sm font-bold tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.15)]"
                >
                  <Search size={16} strokeWidth={2.5} />
                  TRACK ORDER
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
