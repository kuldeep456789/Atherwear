import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Truck, Headphones, Search, Mail, 
  ClipboardList, Package, MapPin, CheckCircle2,
  MessageSquare, PhoneCall, ChevronRight
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
    navigate(`/orders/${orderId.trim()}`);
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white font-sans selection:bg-[#d4af37] selection:text-black">
      {/* Container */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 py-12 lg:py-20 space-y-8 lg:space-y-12">
        
        {/* Top Section */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* Left Hero */}
          <div className="w-full lg:w-1/2 pt-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight uppercase">
              Track Your Order
            </h1>
            <p className="text-zinc-400 text-base sm:text-lg max-w-md mb-12">
              Track your VASTRA order in real time and know exactly when it will arrive.
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
            <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              {/* Decorative element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37] opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
                  <Package className="text-[#d4af37] w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-wide uppercase">WHERE IS MY ORDER?</h2>
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
                      className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border border-zinc-800 rounded-xl text-sm font-medium focus:outline-none focus:border-[#d4af37]/50 transition-colors placeholder:text-zinc-600"
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



        {/* Delivery Partners */}
        <div className="bg-[#111111] border border-zinc-800 rounded-2xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
              <Package size={20} strokeWidth={1.5} className="text-white" />
            </div>
            <h2 className="text-[18px] font-bold text-white tracking-wide">Delivery Partners</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {['Delhivery', 'Blue Dart', 'DTDC', 'Xpressbees', 'Ekart'].map((courier) => (
              <div key={courier} className="bg-[#1a1a1a] border border-zinc-800 rounded-xl p-4 text-center hover:bg-zinc-800/50 transition-colors">
                <CheckCircle2 strokeWidth={1.5} className="w-8 h-8 mx-auto mb-3 text-zinc-500" />
                <span className="text-[11px] font-bold text-white tracking-wider">{courier}</span>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
};

export default TrackOrderPage;
