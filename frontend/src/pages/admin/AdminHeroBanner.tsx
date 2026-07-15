import { useState } from 'react';
import { Image, Upload, Trash2 } from 'lucide-react';

const initialBanners = [
  { id: 1, title: 'Summer Collection 2025', active: true, image: '/hero-1.jpg' },
  { id: 2, title: 'New Arrivals', active: true, image: '/hero-2.jpg' },
  { id: 3, title: 'Premium Essentials', active: false, image: '/hero-3.jpg' },
];

export default function AdminHeroBanner() {
  const [banners, setBanners] = useState(initialBanners);

  const toggleBanner = (id: number) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)),
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Hero Banner</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Manage the homepage hero banner slides</p>
      </div>

      {/* Active banners summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Banners', value: banners.length, color: 'text-[#2B2118]' },
          { label: 'Active', value: banners.filter((b) => b.active).length, color: 'text-green-700' },
          { label: 'Inactive', value: banners.filter((b) => !b.active).length, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-[#EFE8DE]">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Banner list */}
      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {/* Image preview */}
              <div className="w-full sm:w-48 h-32 bg-[#F5F1EA] flex items-center justify-center shrink-0">
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.classList.add('flex');
                    }}
                  />
                ) : (
                  <Image className="h-8 w-8 text-[#E5DDD3]" strokeWidth={1} />
                )}
              </div>

              {/* Details */}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2B2118]">{banner.title}</h3>
                    <p className="text-xs text-[#8A7F72] mt-1">Banner #{banner.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={banner.active}
                        onChange={() => toggleBanner(banner.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#E5DDD3] rounded-full peer peer-checked:bg-[#2B2118] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                    <button className="p-2 rounded-lg hover:bg-red-50 text-[#8A7F72] hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F5F1EA] text-[#2B2118] text-[11px] font-semibold uppercase tracking-wider hover:bg-[#E5DDD3] transition-colors cursor-pointer">
                    <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Replace Image
                  </button>
                  <button className="px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-[#B08D57] hover:bg-[#F5F1EA] transition-colors cursor-pointer">
                    Edit Text
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add new banner */}
      <button className="mt-6 w-full py-4 border-2 border-dashed border-[#E5DDD3] rounded-xl text-[11px] font-semibold uppercase tracking-wider text-[#8A7F72] hover:border-[#B08D57] hover:text-[#2B2118] transition-all duration-200 bg-white hover:bg-[#F5F1EA] cursor-pointer">
        + Add New Banner
      </button>
    </div>
  );
}
