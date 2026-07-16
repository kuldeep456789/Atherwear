import { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, Settings, Plus, X, AlertCircle } from 'lucide-react';
import { adminApi, type StoreSettings } from '../../services/adminApi';

export default function AdminHeroBanner() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newBannerUrl, setNewBannerUrl] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminApi.settings.get();
      setSettings(data.settings);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      setError(null);
      const data = await adminApi.settings.update(settings);
      setSettings(data.settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addBanner = () => {
    const url = newBannerUrl.trim();
    if (!url || !settings) return;
    setSettings(prev => prev ? { ...prev, heroBannerImages: [...(prev.heroBannerImages ?? []), url] } : prev);
    setNewBannerUrl('');
  };

  const removeBanner = (idx: number) => {
    if (!settings) return;
    setSettings(prev => prev ? {
      ...prev,
      heroBannerImages: prev.heroBannerImages.filter((_, i) => i !== idx)
    } : prev);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#0050cb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Store Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your store details, banners, and preferences</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchSettings} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#0050cb] text-white rounded text-sm font-medium hover:opacity-90 transition-opacity shadow-sm disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✓ Settings saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="h-5 w-5 text-[#0050cb]" />
            <h2 className="text-base font-semibold text-gray-900">Store Details</h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Store Name</label>
            <input
              type="text"
              value={settings?.storeName ?? ''}
              onChange={(e) => setSettings(p => p ? { ...p, storeName: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Store Email</label>
            <input
              type="email"
              value={settings?.storeEmail ?? ''}
              onChange={(e) => setSettings(p => p ? { ...p, storeEmail: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Currency</label>
            <select
              value={settings?.currency ?? 'INR'}
              onChange={(e) => setSettings(p => p ? { ...p, currency: e.target.value } : p)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Free Shipping Threshold (₹)</label>
            <input
              type="number"
              value={settings?.freeShippingThreshold ?? 499}
              onChange={(e) => setSettings(p => p ? { ...p, freeShippingThreshold: Number(e.target.value) } : p)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">Disables storefront for customers</p>
            </div>
            <button
              onClick={() => setSettings(p => p ? { ...p, maintenanceMode: !p.maintenanceMode } : p)}
              className={`w-11 h-6 rounded-full transition-colors ${settings?.maintenanceMode ? 'bg-orange-500' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-0.5 ${settings?.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Hero Banner Images */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-gray-900">Hero Banner Images</h2>
          <p className="text-xs text-gray-500">Paste image URLs to add to the hero banner slideshow.</p>

          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={newBannerUrl}
              onChange={(e) => setNewBannerUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addBanner()}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
            />
            <button
              onClick={addBanner}
              className="px-3 py-2 bg-[#0050cb] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {(settings?.heroBannerImages ?? []).map((url, i) => (
              <div key={i} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg group">
                <img src={url} alt={`Banner ${i + 1}`} className="w-16 h-10 object-cover rounded border border-gray-200 shrink-0" onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
                <p className="flex-1 text-xs text-gray-600 truncate">{url}</p>
                <button onClick={() => removeBanner(i)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            {(settings?.heroBannerImages ?? []).length === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No banner images added yet</p>
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Social Media Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['instagram', 'facebook', 'twitter', 'youtube'].map(platform => (
              <div key={platform}>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5 capitalize">{platform}</label>
                <input
                  type="url"
                  placeholder={`https://${platform}.com/yourstore`}
                  value={settings?.socialLinks?.[platform] ?? ''}
                  onChange={(e) => setSettings(p => p ? {
                    ...p, socialLinks: { ...p.socialLinks, [platform]: e.target.value }
                  } : p)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
