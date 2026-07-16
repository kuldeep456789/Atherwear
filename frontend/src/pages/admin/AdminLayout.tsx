import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, Users, RotateCcw, MessageSquare, Banknote,
  LogOut, Search, Bell, Settings
} from 'lucide-react';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Customers', icon: Users },
  { to: '/admin/returns', label: 'Return Requests', icon: RotateCcw },
  { to: '/admin/customer-issues', label: 'Customer Issues', icon: MessageSquare },
  { to: '/admin/commission-finance', label: 'Finance', icon: Banknote },
  { to: '/admin/hero-banner', label: 'Settings', icon: Settings },
];

const SIDEBAR_WIDTH = 260;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  const isActive = (item: typeof navItems[number]) => {
    if (item.end) return location.pathname === item.to;
    return location.pathname.startsWith(item.to);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full bg-[#213145] flex flex-col z-50 text-[#cbdbf5]"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="px-6 py-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">VASTRA</h1>
          <p className="text-xs font-mono text-[#cbdbf5] opacity-60 uppercase tracking-widest mt-1">Enterprise Admin</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
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
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="w-full py-2.5 mb-4 bg-[#0066ff] text-white font-medium text-sm rounded-lg hover:opacity-90 transition-opacity">
            Support
          </button>
          <div className="space-y-1">
            <button className="w-full flex items-center px-4 py-2.5 gap-3 font-medium hover:text-white transition-colors">
              <Bell className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">Notifications</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2.5 gap-3 font-medium hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col" style={{ marginLeft: SIDEBAR_WIDTH }}>
        {/* Top Header */}
        <header className="flex justify-between items-center px-10 h-16 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-8">
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
            <div className="relative flex items-center group hidden md:flex">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-12 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#0066ff]/20 focus:border-[#0066ff]"
              />
              <span className="absolute right-3 text-[10px] font-bold opacity-60 border px-1 rounded bg-white">⌘K</span>
            </div>
            <nav className="hidden lg:flex gap-6">
              <span className="text-[#0050cb] font-bold border-b-2 border-[#0050cb] pb-1 text-sm cursor-pointer">Overview</span>
              <span className="text-gray-500 font-medium hover:text-[#0050cb] transition-all text-sm cursor-pointer">Reports</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{userInfo?.firstName || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase">SUPER ADMIN</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#0066ff] flex items-center justify-center text-white font-bold border border-gray-200">
                {(userInfo?.firstName?.[0] || 'A').toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="p-10 flex-1 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
