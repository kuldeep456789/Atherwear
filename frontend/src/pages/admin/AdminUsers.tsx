import { useState } from 'react';
import { Search } from 'lucide-react';

const mockUsers = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@email.com`,
  phone: `+91 98765${String(40000 + i).slice(1)}`,
  role: i === 0 ? 'admin' : 'customer',
  status: i % 4 === 0 ? 'inactive' : 'active',
  joined: new Date(Date.now() - i * 86400000 * 3).toLocaleDateString(),
}));

export default function AdminUsers() {
  const [search, setSearch] = useState('');

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black tracking-tight text-[#2B2118]">Users</h1>
        <p className="text-sm text-[#8A7F72] mt-1">Manage registered customers and their accounts</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] p-5 mb-6">
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7F72]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F5F1EA] border border-[#E5DDD3] rounded-lg text-sm text-[#2B2118] placeholder:text-[#8A7F72] focus:outline-none focus:ring-2 focus:ring-[#B08D57]/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EFE8DE] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#EFE8DE] bg-[#F5F1EA]/50">
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Name</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Email</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Phone</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Role</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Status</th>
                <th className="px-5 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#8A7F72]">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-[#F5F1EA] last:border-0 hover:bg-[#F5F1EA]/30 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B2118] flex items-center justify-center text-xs font-bold text-white uppercase">
                        {user.name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#2B2118]">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{user.email}</td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{user.phone}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      user.role === 'admin'
                        ? 'bg-[#2B2118] text-white'
                        : 'bg-[#F5F1EA] text-[#5C5246]'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      user.status === 'active'
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-[#5C5246]">{user.joined}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
