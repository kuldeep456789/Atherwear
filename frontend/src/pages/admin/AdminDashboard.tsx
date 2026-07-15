import { useEffect, useState } from 'react';
import { Users, ShoppingBag, RotateCcw, IndianRupee, TrendingUp, TrendingDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  pendingReturns: number;
  totalRevenue: number;
};

export default function AdminDashboard() {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, change: '+12%', trend: 'up' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, change: '+8%', trend: 'up' },
    { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, icon: IndianRupee, change: '+15%', trend: 'up' },
    { label: 'Pending Returns', value: stats.pendingReturns, icon: RotateCcw, change: '-3%', trend: 'down' },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#2B2118] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Dashboard</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Welcome back, {userInfo?.firstName || 'Admin'}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm border border-[#EFE8DE]">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#F5F1EA] flex items-center justify-center">
                <card.icon className="h-5 w-5 text-[#2B2118]" strokeWidth={1.5} />
              </div>
              <span className={`flex items-center gap-1 text-xs font-semibold ${card.trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {card.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-black text-[#2B2118]">{card.value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A7F72] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[#2B2118]">Recent Orders</h2>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#B08D57]">Last 5 orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EFE8DE]">
                <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Order ID</th>
                <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Customer</th>
                <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Amount</th>
                <th className="pb-3 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Status</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="border-b border-[#F5F1EA] last:border-0">
                  <td className="py-3 text-sm font-medium text-[#2B2118]">#ORD-{1000 + i}</td>
                  <td className="py-3 text-sm text-[#5C5246]">Customer {i}</td>
                  <td className="py-3 text-sm font-semibold text-[#2B2118]">₹{(Math.random() * 5000 + 500).toFixed(0)}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      ['paid', 'pending', 'shipped', 'delivered', 'cancelled'][i % 5] === 'paid'
                        ? 'bg-green-50 text-green-700'
                        : ['paid', 'pending', 'shipped', 'delivered', 'cancelled'][i % 5] === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      {['paid', 'pending', 'shipped', 'delivered', 'cancelled'][i % 5]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
