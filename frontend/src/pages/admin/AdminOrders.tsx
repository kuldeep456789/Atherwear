import { useState } from 'react';
import { Search, Package } from 'lucide-react';

const statusFilters = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];
const statusColors: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  shipped: 'bg-blue-50 text-blue-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
};

const mockOrders = Array.from({ length: 15 }, (_, i) => ({
  id: `#ORD-${2000 + i}`,
  customer: `Customer ${i + 1}`,
  email: `customer${i + 1}@email.com`,
  amount: `₹${(Math.random() * 8000 + 1000).toFixed(0)}`,
  status: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'][i % 5],
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

export default function AdminOrders() {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = mockOrders.filter(
    (o) =>
      (activeTab === 'All' || o.status === activeTab.toLowerCase()) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Orders</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Manage and track all customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-[#F5F1EA] rounded-lg p-1">
            {statusFilters.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-[#2B2118] text-white shadow-sm'
                    : 'text-[#5C5246] hover:text-[#2B2118]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7F72]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F5F1EA] border border-[#E5DDD3] rounded-lg text-sm text-[#2B2118] placeholder:text-[#8A7F72] focus:outline-none focus:ring-2 focus:ring-[#B08D57]/30 w-56"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EFE8DE] bg-[#F5F1EA]/50">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Order ID</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Customer</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Amount</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Date</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id} className="border-b border-[#F5F1EA] last:border-0 hover:bg-[#F5F1EA]/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#2B2118]">{order.id}</td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-[#2B2118]">{order.customer}</p>
                      <p className="text-xs text-[#8A7F72]">{order.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-[#2B2118]">{order.amount}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{order.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[order.status] || 'bg-zinc-50 text-zinc-600'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-[11px] font-semibold uppercase tracking-wider text-[#B08D57] hover:text-[#2B2118] transition-colors cursor-pointer">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <Package className="h-8 w-8 mx-auto mb-3 text-[#E5DDD3]" strokeWidth={1} />
            <p className="text-sm text-[#8A7F72]">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}
