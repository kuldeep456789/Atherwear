import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Download, Edit, Trash, Package, RefreshCw } from 'lucide-react';
import { adminApi, type AdminProduct } from '../../services/adminApi';

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.products.list();
      setProducts(data.products ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete product "${name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      await adminApi.products.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err: any) {
      alert(err?.message ?? 'Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category?.name || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store's inventory and categories.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchProducts} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0050cb] text-white rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-sm">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#0050cb] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-48">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchProducts} className="mt-3 text-[#0050cb] text-sm underline">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium w-10">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Price</th>
                  <th className="px-6 py-4 font-medium">Stock</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filtered.map((p) => {
                  const isDeleting = deletingId === p._id;
                  const isOutOfStock = p.stock === 0;
                  const status = p.isActive ? (isOutOfStock ? 'Out of Stock' : 'Active') : 'Draft';
                  
                  return (
                    <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-100 text-gray-400`}>
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 max-w-[200px] truncate">{p.name}</p>
                            <p className="text-[11px] text-gray-500 mt-0.5">SKU: {p._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{p.category?.name || '—'}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">₹{(p.discountPrice || p.price).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`${isOutOfStock ? 'text-red-600 font-medium' : 'text-gray-900'}`}>{p.stock} in stock</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isOutOfStock ? 'bg-red-100 text-red-700' : 
                          !p.isActive ? 'bg-gray-100 text-gray-700' : 
                          'bg-green-100 text-green-700'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 text-gray-400 hover:text-[#0050cb] hover:bg-blue-50 rounded transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={isDeleting}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Package className="h-8 w-8 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No products found</p>
              </div>
            )}
          </div>
        )}
        
        {!loading && !error && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
            <span>Showing {filtered.length} of {products.length} results</span>
          </div>
        )}
      </div>
    </div>
  );
}
