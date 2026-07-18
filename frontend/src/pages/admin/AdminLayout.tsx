import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, Users, RotateCcw, MessageSquare, Banknote,
  Search as SearchIcon, Bell, Settings, Menu, X, Loader2, Store
} from 'lucide-react';
import type { RootState } from '../../store/store';
import { adminApi, type AdminUser, type AdminOrder } from '../../services/adminApi';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/commission-finance', label: 'Finance', icon: Banknote },
  { to: '/admin/returns', label: 'Return Requests', icon: RotateCcw },
  { to: '/admin/customer-issues', label: 'Customer Issues', icon: MessageSquare },
  { to: '/admin/hero-banner', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search State
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{ users: AdminUser[]; orders: AdminOrder[] }>({ users: [], orders: [] });

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Handle ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search API Call
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ users: [], orders: [] });
        setSearching(false);
        return;
      }
      
      try {
        setSearching(true);
        const res = await adminApi.search(searchQuery.trim());
        setSearchResults(res);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isActive = (item: typeof navItems[number]) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };



  return (
    <div className="flex min-h-screen bg-[#f8f9ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-[#213145] flex flex-col z-50 text-[#cbdbf5] w-[260px] transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}
      >
        <div className="px-6 py-6 lg:py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">VASTRA</h1>
            <p className="text-xs font-mono text-[#cbdbf5] opacity-60 uppercase tracking-widest mt-1">Enterprise Admin</p>
          </div>
          <button 
            className="lg:hidden text-white/70 hover:text-white p-2 -mr-2 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-none transition-all duration-200 ${
                isActive(item)
                  ? 'bg-white/10 text-[#dae1ff] border-l-4 border-[#0066ff] font-bold'
                  : 'font-medium hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={isActive(item) ? 2 : 1.5} />
              <span className="text-[15px] font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full py-2.5 mb-3 bg-[#0066ff] text-white font-medium text-sm rounded-lg hover:bg-[#0052cc] focus:outline-none focus:ring-2 focus:ring-[#0066ff]/50 transition-all cursor-pointer shadow-sm">
            Support
          </button>
          <div className="space-y-1">
            <button className="w-full flex items-center px-3 py-2.5 gap-3 font-medium text-[#cbdbf5] hover:text-white hover:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 transition-all cursor-pointer">
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">Notifications</span>
            </button>
            <Link
              to="/"
              className="w-full flex items-center px-3 py-2.5 gap-3 font-medium text-[#cbdbf5] hover:text-green-400 hover:bg-green-400/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400/20 transition-all cursor-pointer"
            >
              <Store className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">Back to Store</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-w-0 transition-all duration-300">
        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 h-16 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8">
            <button 
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} strokeWidth={2} />
            </button>
            
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 hidden sm:block">Overview</h2>
            
            <div className="relative group hidden md:block">
              <div className="flex items-center">
                <SearchIcon className="absolute left-3 h-4 w-4 text-gray-400" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  className="pl-10 pr-12 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm w-48 lg:w-64 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
                />
                <span className="absolute right-3 text-[10px] font-bold opacity-60 border px-1 rounded bg-white pointer-events-none">⌘K</span>
              </div>

              {/* Search Dropdown */}
              {searchOpen && searchQuery.trim() !== '' && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 flex flex-col max-h-[400px]"
                >
                  {searching ? (
                    <div className="p-4 flex items-center justify-center text-gray-500 gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Searching...
                    </div>
                  ) : searchResults.users.length === 0 && searchResults.orders.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="overflow-y-auto py-2">
                      {searchResults.orders.length > 0 && (
                        <div className="mb-2">
                          <h4 className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Orders</h4>
                          <ul>
                            {searchResults.orders.map(order => (
                              <li key={order._id}>
                                <Link 
                                  to="/admin/orders" 
                                  className="block px-4 py-2 hover:bg-[#0066ff]/5 transition-colors"
                                  onClick={() => setSearchOpen(false)}
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">#{order._id?.slice(-6).toUpperCase()}</span>
                                    <span className="text-xs text-gray-500 capitalize">{order.status}</span>
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                                    {(order.userId as unknown as AdminUser)?.name || (order.userId as unknown as AdminUser)?.email || 'Unknown User'}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {searchResults.users.length > 0 && (
                        <div>
                          <h4 className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Customers</h4>
                          <ul>
                            {searchResults.users.map(user => (
                              <li key={user._id}>
                                <Link 
                                  to="/admin/users" 
                                  className="block px-4 py-2 hover:bg-[#0066ff]/5 transition-colors"
                                  onClick={() => setSearchOpen(false)}
                                >
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.name || 'No Name'}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                                    {user.email}
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            

          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-base font-medium text-gray-900 leading-tight">{userInfo?.firstName || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">SUPER ADMIN</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0066ff] flex items-center justify-center text-white font-bold border border-gray-200 text-sm sm:text-base">
                {(userInfo?.firstName?.[0] || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="p-4 sm:p-6 lg:p-10 flex-1 max-w-[1600px] mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
