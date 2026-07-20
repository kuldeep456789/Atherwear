import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Truck, Search } from 'lucide-react';

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
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-[hsl(var(--foreground))] leading-none">
            TRACK ORDER
          </h1>
        </div>
      </div>

      {/* Track form */}
      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-10 sm:py-14">
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
            {error && (
              <p className="text-red-500 font-bold text-sm tracking-widest">{error}</p>
            )}
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
