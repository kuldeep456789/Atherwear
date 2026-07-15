import { useState } from 'react';

const statusFlow = ['requested', 'approved', 'pickup_scheduled', 'picked_up', 'quality_check', 'refund_initiated', 'refund_completed'];
const statusColors: Record<string, string> = {
  requested: 'bg-amber-50 text-amber-700',
  approved: 'bg-blue-50 text-blue-700',
  pickup_scheduled: 'bg-purple-50 text-purple-700',
  picked_up: 'bg-indigo-50 text-indigo-700',
  quality_check: 'bg-cyan-50 text-cyan-700',
  refund_initiated: 'bg-orange-50 text-orange-700',
  refund_completed: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-600',
};

const mockReturns = Array.from({ length: 8 }, (_, i) => ({
  id: `RET-${3000 + i}`,
  product: `Product ${i + 1}`,
  customer: `Customer ${i + 1}`,
  reason: ['Size issue', 'Defective item', 'Wrong product', 'Quality issue'][i % 4],
  status: statusFlow[i % statusFlow.length],
  date: new Date(Date.now() - i * 86400000 * 2).toLocaleDateString(),
}));

export default function AdminReturnRequests() {
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const filtered = selectedStatus
    ? mockReturns.filter((r) => r.status === selectedStatus)
    : mockReturns;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Return Requests</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Track and manage customer returns and refunds</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Requests', value: mockReturns.length, color: 'text-[#2B2118]' },
          { label: 'Pending', value: mockReturns.filter((r) => r.status === 'requested').length, color: 'text-amber-700' },
          { label: 'Completed', value: mockReturns.filter((r) => r.status === 'refund_completed').length, color: 'text-green-700' },
          { label: 'Rejected', value: mockReturns.filter((r) => r.status === 'rejected').length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-[#EFE8DE]">
            <p className="text-2xl font-black text-[#2B2118]">{stat.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EFE8DE] bg-[#F5F1EA]/50">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Return ID</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Product</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Customer</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Reason</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Date</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ret) => (
                <tr key={ret.id} className="border-b border-[#F5F1EA] last:border-0 hover:bg-[#F5F1EA]/30 transition-colors">
                  <td className="px-5 py-4 text-sm font-medium text-[#2B2118]">{ret.id}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{ret.product}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{ret.customer}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{ret.reason}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{ret.date}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[ret.status] || 'bg-zinc-50 text-zinc-600'}`}>
                      {ret.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-[11px] font-semibold uppercase tracking-wider text-[#B08D57] hover:text-[#2B2118] transition-colors cursor-pointer">
                      Process
                    </button>
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
