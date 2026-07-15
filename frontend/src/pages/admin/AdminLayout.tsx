import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, Package, Users, RotateCcw, MessageSquare, Banknote, Image,
  LogOut, ChevronRight,
} from 'lucide-react';
import type { RootState } from '../../store/store';
import { logout } from '../../store/slices/authSlice';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/returns', label: 'Return Requests', icon: RotateCcw },
  { to: '/admin/customer-issues', label: 'Customer Issues', icon: MessageSquare },
  { to: '/admin/commission-finance', label: 'Commission & Finance', icon: Banknote },
  { to: '/admin/hero-banner', label: 'Hero Banner', icon: Image },
];

const SIDEBAR_WIDTH = 220;

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
    <div className="flex min-h-screen bg-[#F5F1EA]" style={{ fontFamily: "'Outfit', 'Space Grotesk', sans-serif" }}>
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-screen bg-[#F5F1EA] border-r border-[#E5DDD3] flex flex-col z-50"
        style={{ width: SIDEBAR_WIDTH }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-[#E5DDD3]">
          <Link to="/admin" className="text-xl font-black tracking-tight text-[#2B2118]">
            VASTRA
          </Link>
          <span className="ml-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B08D57]">Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive(item)
                  ? 'bg-[#2B2118] text-white'
                  : 'text-[#5C5246] hover:bg-[#E5DDD3] hover:text-[#2B2118]'
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="text-[11px] font-semibold uppercase tracking-wider">{item.label}</span>
              {isActive(item) && <ChevronRight className="h-3 w-3 ml-auto" strokeWidth={2} />}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-[#E5DDD3]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2B2118] flex items-center justify-center text-xs font-bold text-white uppercase">
              {(userInfo?.firstName?.[0] || 'A').toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[#2B2118] truncate">
                {userInfo?.firstName || 'Admin'}
              </p>
              <p className="text-[10px] text-[#8A7F72] truncate">{userInfo?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider text-[#8A7F72] hover:bg-[#E5DDD3] hover:text-[#2B2118] transition-all duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
