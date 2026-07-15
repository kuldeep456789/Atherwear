import { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';

type Issue = {
  id: string;
  customer: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved';
  date: string;
};

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-50 text-zinc-600',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-orange-50 text-orange-700',
  urgent: 'bg-red-50 text-red-600',
};

const statusColors: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
};

const mockIssues: Issue[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ISS-${4000 + i}`,
  customer: `Customer ${i + 1}`,
  subject: ['Order not delivered', 'Wrong size received', 'Payment issue', 'Product quality complaint', 'Refund delay', 'Shipping address change', 'Cancel order request', 'Damaged product', 'Missing items', 'Exchange request'][i],
  priority: (['low', 'medium', 'high', 'urgent'] as const)[i % 4],
  status: (['open', 'in_progress', 'resolved'] as const)[i % 3],
  date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
}));

export default function AdminCustomerIssues() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const filtered = mockIssues.filter(
    (iss) =>
      (filter === 'all' || iss.status === filter) &&
      (iss.subject.toLowerCase().includes(search.toLowerCase()) ||
        iss.customer.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Customer Issues</h1>
        <p className="text-sm text-[#8A7F72] mt-1">View and resolve customer support tickets</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1 bg-[#F5F1EA] rounded-lg p-1">
            {(['all', 'open', 'in_progress', 'resolved'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3.5 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filter === tab
                    ? 'bg-[#2B2118] text-white shadow-sm'
                    : 'text-[#5C5246] hover:text-[#2B2118]'
                }`}
              >
                {tab === 'in_progress' ? 'In Progress' : tab}
              </button>
            ))}
          </div>
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7F72]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#F5F1EA] border border-[#E5DDD3] rounded-lg text-sm text-[#2B2118] placeholder:text-[#8A7F72] focus:outline-none focus:ring-2 focus:ring-[#B08D57]/30 w-56"
            />
          </div>
        </div>
      </div>

      {/* Issues list */}
      <div className="space-y-3">
        {filtered.map((issue) => (
          <div key={issue.id} className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-5 hover:border-[#D5CDBF] transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-lg bg-[#F5F1EA] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertCircle className="h-5 w-5 text-[#8A7F72]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[#8A7F72]">{issue.id}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${priorityColors[issue.priority]}`}>
                      {issue.priority}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${statusColors[issue.status]}`}>
                      {issue.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-[#2B2118]">{issue.subject}</h3>
                  <p className="text-xs text-[#8A7F72] mt-1">
                    {issue.customer} &middot; {issue.date}
                  </p>
                </div>
              </div>
              <button className="ml-4 px-3 py-1.5 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-[#B08D57] hover:bg-[#F5F1EA] hover:text-[#2B2118] transition-all duration-200 shrink-0 cursor-pointer">
                View
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#8A7F72]">No issues found</p>
          </div>
        )}
      </div>
    </div>
  );
}
