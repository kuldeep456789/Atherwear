import { useState } from 'react';
import { Banknote, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';

export default function AdminCommissionFinance() {
  const [commissionRate, setCommissionRate] = useState('15');
  const [minPayout, setMinPayout] = useState('500');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Commission & Finance</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Track earnings, payouts, and commission settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Financial overview */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-6">
            <h2 className="text-sm font-bold text-[#2B2118] mb-4">Payout Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Earnings', value: '₹12,45,000', icon: Banknote, change: '+18%', up: true },
                { label: 'Pending Payouts', value: '₹1,20,000', icon: IndianRupee, change: '-5%', up: false },
                { label: 'This Month', value: '₹2,15,000', icon: TrendingUp, change: '+12%', up: true },
                { label: 'Last Month', value: '₹1,90,000', icon: TrendingDown, change: '-3%', up: false },
              ].map((item) => (
                <div key={item.label} className="bg-[#F5F1EA] rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <item.icon className="h-4 w-4 text-[#8A7F72]" strokeWidth={1.5} />
                    <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${item.up ? 'text-green-600' : 'text-red-500'}`}>
                      {item.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {item.change}
                    </span>
                  </div>
                  <p className="text-lg font-black text-[#2B2118]">{item.value}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72] mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-6">
            <h2 className="text-sm font-bold text-[#2B2118] mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F5F1EA] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[#2B2118]">Order #ORD-{5000 + i}</p>
                    <p className="text-xs text-[#8A7F72]">{new Date(Date.now() - i * 86400000).toLocaleDateString()}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-700">+₹{(Math.random() * 2000 + 500).toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Commission settings */}
        <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-6 h-fit">
          <h2 className="text-sm font-bold text-[#2B2118] mb-6">Commission Settings</h2>

          <div className="space-y-6">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8A7F72] mb-2">
                Commission Rate (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-24 px-3 py-2 bg-[#F5F1EA] border border-[#E5DDD3] rounded-lg text-sm text-[#2B2118] focus:outline-none focus:ring-2 focus:ring-[#B08D57]/30"
                />
                <span className="text-sm text-[#5C5246]">% per sale</span>
              </div>
              <p className="text-xs text-[#8A7F72] mt-1.5">Percentage deducted from each sale as platform commission</p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#8A7F72] mb-2">
                Minimum Payout (₹)
              </label>
              <input
                type="number"
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                className="w-24 px-3 py-2 bg-[#F5F1EA] border border-[#E5DDD3] rounded-lg text-sm text-[#2B2118] focus:outline-none focus:ring-2 focus:ring-[#B08D57]/30"
              />
              <p className="text-xs text-[#8A7F72] mt-1.5">Minimum balance before payout is processed</p>
            </div>

            <div className="border-t border-[#EFE8DE] pt-6">
              <h3 className="text-xs font-bold text-[#2B2118] mb-3">Payout Schedule</h3>
              <div className="bg-[#F5F1EA] rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#5C5246]">Frequency</span>
                  <span className="font-medium text-[#2B2118]">Weekly (Every Monday)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C5246]">Next Payout</span>
                  <span className="font-medium text-[#2B2118]">{new Date(Date.now() + 86400000 * (8 - new Date().getDay())).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5C5246]">Processing Time</span>
                  <span className="font-medium text-[#2B2118]">2-3 Business Days</span>
                </div>
              </div>
            </div>

            <button className="w-full py-3 bg-[#2B2118] text-white rounded-lg text-[11px] font-semibold uppercase tracking-wider hover:bg-[#3D3228] transition-colors cursor-pointer">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
