import { useState, useEffect, useCallback } from 'react';
import { Banknote, TrendingUp, TrendingDown, RefreshCw, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi, type AnalyticsData } from '../../services/adminApi';

export default function AdminCommissionFinance() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.analytics.get();
      setAnalytics(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  const totalRevenue = analytics?.monthlyRevenue?.reduce((s, m) => s + m.revenue, 0) ?? 0;
  const lastMonth = analytics?.monthlyRevenue?.slice(-1)[0]?.revenue ?? 0;
  const prevMonth = analytics?.monthlyRevenue?.slice(-2)[0]?.revenue ?? 0;
  const revenueChange = prevMonth > 0 ? (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1) : '0';
  const isUp = lastMonth >= prevMonth;


  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Finance & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Track revenue, orders, and financial performance</p>
        </div>
        <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-[#0050cb] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchAnalytics} className="mt-3 text-[#0050cb] text-sm underline">Retry</button>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <SummaryCard
              icon={Banknote} label="Lifetime Revenue"
              value={`₹${totalRevenue.toLocaleString()}`}
              trend={`${isUp ? '+' : ''}${revenueChange}% vs last month`}
              isUp={isUp}
            />
            <SummaryCard
              icon={TrendingUp} label="This Month"
              value={`₹${lastMonth.toLocaleString()}`}
              trend="Current month revenue"
              isUp={true}
            />
            <SummaryCard
              icon={BarChart2} label="Avg Order Value"
              value={analytics?.revenueByDay && analytics.revenueByDay.length > 0
                ? `₹${Math.round(analytics.revenueByDay.reduce((s, d) => s + d.revenue, 0) / analytics.revenueByDay.reduce((s, d) => s + d.count, 0)).toLocaleString()}`
                : '₹0'}
              trend="Last 30 days"
              isUp={true}
            />
            <SummaryCard
              icon={TrendingDown} label="Total Orders (30d)"
              value={String(analytics?.revenueByDay?.reduce((s, d) => s + d.count, 0) ?? 0)}
              trend="Paid orders in 30 days"
              isUp={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Bar Chart (Last 30 days) */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Daily Revenue (Last 30 Days)</h2>
              {analytics?.revenueByDay && analytics.revenueByDay.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.revenueByDay}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                      <XAxis 
                        dataKey="_id" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#888' }} 
                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#888' }}
                        tickFormatter={(val) => `₹${(val / 1000)}k`}
                      />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="revenue" fill="#0050cb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex items-center justify-center h-40 text-gray-400 text-sm">No revenue data yet</div>
              )}
            </div>

            {/* Orders by Status */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Orders by Status</h2>
              <div className="space-y-4">
                {analytics?.ordersByStatus?.map((stat) => {
                  const total = analytics.ordersByStatus.reduce((s, x) => s + x.count, 0);
                  const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                  const color = stat._id === 'delivered' ? 'bg-green-500' : stat._id === 'cancelled' ? 'bg-red-400' : stat._id === 'shipped' ? 'bg-blue-500' : 'bg-orange-400';
                  return (
                    <div key={stat._id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize text-gray-700">{stat._id}</span>
                        <span className="font-bold text-gray-900">{stat.count} ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                {!analytics?.ordersByStatus?.length && (
                  <div className="text-gray-400 text-sm text-center py-8">No data yet</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Customers */}
          {analytics?.topCustomers && analytics.topCustomers.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Customers by Revenue</h2>
              </div>
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-xs font-mono text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {analytics.topCustomers.map((c, i) => {
                    const name = c.user
                      ? ((c.user as any).name || (c.user as any).email || 'Unknown')
                      : 'Unknown';
                    return (
                      <tr key={String(c._id)} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#0050cb] flex items-center justify-center text-white font-bold text-xs">
                              {String(i + 1)}
                            </div>
                            <span className="font-medium text-gray-900">{name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{c.orderCount}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">₹{c.totalSpent.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, trend, isUp }: any) {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <span className={`text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
          {isUp ? <TrendingUp className="h-3 w-3 inline mr-1" /> : <TrendingDown className="h-3 w-3 inline mr-1" />}
        </span>
      </div>
      <p className="text-gray-500 font-mono text-[10px] uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className="text-xs text-gray-400 mt-1">{trend}</p>
    </div>
  );
}
