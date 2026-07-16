import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { adminApi, type AdminReturn } from '../../services/adminApi';

const statusFlow = ['requested', 'approved', 'pickup_scheduled', 'picked_up', 'quality_check', 'refund_initiated', 'refund_completed', 'rejected'];
const statusColors: Record<string, string> = {
  requested: 'bg-orange-100 text-orange-700',
  approved: 'bg-blue-100 text-blue-700',
  pickup_scheduled: 'bg-purple-100 text-purple-700',
  picked_up: 'bg-indigo-100 text-indigo-700',
  quality_check: 'bg-cyan-100 text-cyan-700',
  refund_initiated: 'bg-amber-100 text-amber-700',
  refund_completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminReturnRequests() {
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.returns.list();
      setReturns(data.returns ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load returns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  const handleStatusChange = async (returnId: string, newStatus: string) => {
    try {
      setUpdatingId(returnId);
      await adminApi.returns.updateStatus(returnId, newStatus);
      setReturns(prev =>
        prev.map(r => r._id === returnId ? { ...r, status: newStatus } : r)
      );
    } catch (err: any) {
      alert(err?.message ?? 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = selectedStatus
    ? returns.filter((r) => r.status === selectedStatus)
    : returns;

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'requested').length,
    completed: returns.filter(r => r.status === 'refund_completed').length,
    rejected: returns.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Return Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track and manage customer returns and refunds</p>
        </div>
        <button onClick={fetchReturns} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-900', bg: 'bg-white' },
          { label: 'Pending', value: stats.pending, color: 'text-orange-600', bg: 'bg-white' },
          { label: 'Completed', value: stats.completed, color: 'text-green-600', bg: 'bg-white' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600', bg: 'bg-white' },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-5 shadow-sm border border-gray-200`}>
            <p className={`text-3xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filter tabs */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${!selectedStatus ? 'bg-[#0050cb] text-white' : 'text-gray-600 hover:bg-gray-200/50'}`}
          >
            All
          </button>
          {statusFlow.map(s => (
            <button
              key={s}
              onClick={() => setSelectedStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${selectedStatus === s ? 'bg-[#0050cb] text-white' : 'text-gray-600 hover:bg-gray-200/50'}`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#0050cb] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchReturns} className="mt-3 text-[#0050cb] text-sm underline">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Return ID</th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Current Status</th>
                  <th className="px-6 py-4 font-medium">Update Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((ret) => {
                  const isUpdating = updatingId === ret._id;
                  const customer = ret.userId;
                  const customerName = customer
                    ? (customer.name || customer.email || 'Unknown')
                    : 'Unknown';

                  return (
                    <tr key={ret._id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">#{ret._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 truncate max-w-[120px]">{ret.productName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Order #{ret.orderId.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{customerName}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-[120px] truncate">{ret.reason}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{new Date(ret.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusColors[ret.status] ?? 'bg-gray-100 text-gray-700'}`}>
                          {ret.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isUpdating ? (
                          <div className="w-5 h-5 border-2 border-[#0050cb] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <select
                            value={ret.status}
                            onChange={(e) => handleStatusChange(ret._id, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#0050cb] cursor-pointer"
                          >
                            {statusFlow.map(s => (
                              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12">
                <RotateCcw className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No return requests found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
