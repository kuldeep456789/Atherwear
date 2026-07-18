import { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { useGetUserOrdersQuery } from '../store/slices/orderApiSlice';
import { useGetMyReturnsQuery } from '../store/slices/returnApiSlice';
import { Package, User, MapPin, Heart, Settings, LogOut, ChevronRight, ShoppingBag, Clock, CheckCircle, XCircle, Trash2, Plus, Pencil, Bell, Shield, Moon, Sun, Mail, Phone, MapPinHouse, Truck, RotateCcw } from 'lucide-react';
import { formatINR } from '../lib/currency';
import { useTheme } from '../context/ThemeContext';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Payment Pending', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', icon: Clock },
  processing:{ label: 'Processing',      color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',       icon: Package },
  shipped:   { label: 'Shipped',         color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800', icon: Truck },
  delivered: { label: 'Delivered',       color: 'text-green-700 dark:text-green-300',   bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',   icon: CheckCircle },
  confirmed: { label: 'Confirmed',       color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',       icon: CheckCircle },
  cancelled: { label: 'Cancelled',       color: 'text-red-700 dark:text-red-300',       bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',           icon: XCircle },
  refunded:  { label: 'Refunded',        color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800', icon: RotateCcw },
};

const PAGE_SIZE = 5;

const AccountPage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlistItems);
  const { theme, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const [page, setPage] = useState(1);
  const [fadeKey, setFadeKey] = useState(0);
  const prevTabRef = useRef(activeTab);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const { data: allOrders = [], isLoading: ordersLoading } = useGetUserOrdersQuery(undefined);
  const { data: myReturns = [] } = useGetMyReturnsQuery(undefined, { skip: !userInfo, pollingInterval: 3000 });

  useEffect(() => {
    if (prevTabRef.current !== activeTab) {
      prevTabRef.current = activeTab;
      setFadeKey((k) => k + 1);
    }
  }, [activeTab]);

  if (!userInfo) {
    return <Navigate to="/login?redirect=/account" replace />;
  }

  const setTab = (id: string) => {
    setSearchParams(id === 'orders' ? {} : { tab: id });
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(allOrders.length / PAGE_SIZE));
  const ordersData = {
    orders: allOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: allOrders.length,
  };

  const memberSince = (userInfo as any).createdAt
    ? new Date((userInfo as any).createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : new Date().getFullYear().toString();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0F0F10]">
      {/* ── Profile Header ── */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 dark:from-[#18181B] dark:via-[#1f1f23] dark:to-[#18181B] border-b border-zinc-200 dark:border-[#2A2A2A]">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-full bg-white/15 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-2 border-white/20 shadow-lg backdrop-blur-sm">
                {(userInfo.firstName?.[0] || userInfo.email?.[0] || 'U').toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-zinc-900 dark:border-[#18181B] flex items-center justify-center">
                <CheckCircle size={10} className="text-white" strokeWidth={3} />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                {userInfo.firstName} {userInfo.lastName}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-sm text-white/70">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} strokeWidth={1.5} />
                  {userInfo.email}
                </span>
                {userInfo.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} strokeWidth={1.5} />
                    {userInfo.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Clock size={14} strokeWidth={1.5} />
                  Member since {memberSince}
                </span>
              </div>
            </div>
            {/* Edit button */}
            <button onClick={() => setShowEditModal(true)} className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-all duration-200 border border-white/10 hover:border-white/20 active:scale-[0.97]">
              <Pencil size={15} strokeWidth={1.5} />
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ── Dashboard Body ── */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[240px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="space-y-1 lg:sticky lg:top-[130px] lg:self-start">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`relative flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] sm:text-base font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-white dark:bg-[#18181B] text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-[#2A2A2A]'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-[#18181B]/60 border border-transparent'
                  }`}
                >
                  {/* Left accent bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-zinc-900 dark:bg-white" />
                  )}
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
                  <span>{tab.label}</span>
                  {tab.id === 'wishlist' && wishlistItems.length > 0 && (
                    <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {wishlistItems.length}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-4 mt-3 border-t border-zinc-200 dark:border-[#2A2A2A]">
              <button
                onClick={() => dispatch(logout())}
                className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[15px] sm:text-base font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
              >
                <LogOut size={22} strokeWidth={1.5} className="shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <main className="min-h-[500px]">
            <div key={fadeKey} className="animate-fadeIn">
              {activeTab === 'orders' && (
                <section>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <h2 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 dark:text-white tracking-tight">Orders</h2>
                    {ordersData && ordersData.total > 0 && (
                      <span className="text-[15px] text-zinc-500 dark:text-zinc-400 font-medium">
                        {ordersData.total} order{ordersData.total !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {ordersLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-5 animate-pulse">
                          <div className="flex gap-4">
                            <div className="w-[72px] h-[88px] rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                            <div className="flex-1 space-y-3">
                              <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                              <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                              <div className="h-6 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : ordersData?.orders?.length > 0 ? (
                    <div className="space-y-4">
                      {ordersData.orders.map((order: any) => {
                        const orderReturn = myReturns.find((r: any) => r.orderId === order._id);
                        let displayStatusStr = order.status;
                        if (orderReturn && orderReturn.status === 'refunded') {
                          displayStatusStr = 'refunded';
                        }
                        const status = statusConfig[displayStatusStr] || statusConfig.pending;
                        const StatusIcon = status.icon;
                        const firstItem = order.items?.[0];
                        const itemCount = order.items?.reduce((a: number, i: any) => a + i.quantity, 0) || 0;

                        return (
                          <Link
                            key={order._id}
                            to={`/orders/${order._id}`}
                            className="group block rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-250"
                          >
                            <div className="p-5 sm:p-6">
                              <div className="flex items-start gap-4 sm:gap-5">
                                {/* Product image */}
                                <div className="relative shrink-0">
                                  {firstItem?.image ? (
                                    <div className="w-[72px] h-[88px] sm:w-[80px] sm:h-[100px] rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                      <img src={firstItem.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-[72px] h-[88px] sm:w-[80px] sm:h-[100px] rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800">
                                      <ShoppingBag size={24} className="text-zinc-300 dark:text-zinc-600" />
                                    </div>
                                  )}
                                  {order.items?.length > 1 && (
                                    <span className="absolute -top-2 -right-2 min-w-[22px] h-[22px] rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center px-1 shadow-sm border-2 border-white dark:border-[#18181B]">
                                      +{order.items.length - 1}
                                    </span>
                                  )}
                                </div>

                                {/* Order info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                    <div className="min-w-0">
                                      <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">
                                        Order #{order._id.slice(-8).toUpperCase()}
                                      </h3>
                                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                      <p className="mt-0.5 text-[13px] text-zinc-400 dark:text-zinc-500">
                                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                                        {order.paymentStatus === 'paid' ? ' · Paid online' : ' · Payment pending'}
                                      </p>
                                    </div>
                                    <div className="text-left sm:text-right shrink-0">
                                      <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                                        {formatINR(order.totalAmount || 0)}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status + action */}
                                  <div className="mt-4 flex flex-wrap items-center gap-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-semibold border ${status.bg} ${status.color}`}>
                                      <StatusIcon size={13} strokeWidth={2} />
                                      {status.label.toUpperCase()}
                                    </span>
                                    <span className="text-[13px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors font-medium">
                                      View details
                                      <ChevronRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-5">
                          <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page <= 1}
                            className="h-11 px-5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-11 h-11 rounded-xl text-sm font-semibold transition-all duration-200 ${
                                p === page
                                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                                  : 'border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                          <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages}
                            className="h-11 px-5 rounded-xl text-sm font-semibold border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#18181B] p-14 sm:p-16 text-center">
                      <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-5 border border-amber-200 dark:border-amber-800/30">
                        <ShoppingBag size={32} className="text-amber-500 dark:text-amber-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">No orders yet</h3>
                      <p className="text-base text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Your order history will appear here once you make your first purchase. Start exploring our collection!
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                          to="/"
                          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                          className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                        >
                          <ShoppingBag size={18} strokeWidth={2} />
                          Continue Shopping
                        </Link>
                        <Link
                          to="/cart"
                          className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[15px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]"
                        >
                          View Cart
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {activeTab === 'profile' && (
                <section className="space-y-6">
                  <h2 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 dark:text-white tracking-tight">Profile</h2>

                  {/* Personal Information */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Personal Information</h3>
                      <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">Manage your personal details and contact information.</p>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <ProfileField label="First Name" value={userInfo.firstName} />
                        <ProfileField label="Last Name" value={userInfo.lastName} />
                        <ProfileField label="Email" value={userInfo.email} icon={<Mail size={16} />} />
                        {userInfo.phone && <ProfileField label="Phone" value={userInfo.phone} icon={<Phone size={16} />} />}
                        <ProfileField label="Role" value={userInfo.role} />
                        <ProfileField label="Member Since" value={memberSince} icon={<Clock size={16} />} />
                      </div>
                    </div>
                  </div>

                  {/* Account Security */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Account Security</h3>
                      <p className="text-[15px] text-zinc-500 dark:text-zinc-400 mt-1">Update your password and secure your account.</p>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => setShowEditModal(true)} className="inline-flex items-center gap-2.5 h-[50px] px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] shadow-sm">
                          <Pencil size={16} strokeWidth={2} />
                          Edit Profile
                        </button>
                        <button onClick={() => setShowPasswordModal(true)} className="inline-flex items-center gap-2.5 h-[50px] px-6 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[15px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'addresses' && (
                <section className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 dark:text-white tracking-tight">Addresses</h2>
                    <button className="inline-flex items-center gap-2 h-[50px] px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] shadow-sm">
                      <Plus size={18} strokeWidth={2} />
                      Add New Address
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-6 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-250">
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[12px] font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          <MapPinHouse size={13} strokeWidth={2} />
                          HOME
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30">
                          <CheckCircle size={10} strokeWidth={3} />
                          DEFAULT
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold text-zinc-900 dark:text-white">Kuldeep Vyas</p>
                      <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        19 Residency Road<br />
                        Bengaluru, Karnataka 560025<br />
                        India
                      </p>
                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">+91 98765 43210</p>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200">
                          <Pencil size={14} strokeWidth={1.5} />
                          Edit
                        </button>
                        <button className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg text-[13px] font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200">
                          <Trash2 size={14} strokeWidth={1.5} />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Add new placeholder card */}
                    <button className="rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#18181B] p-6 flex flex-col items-center justify-center min-h-[220px] hover:border-zinc-400 dark:hover:border-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all duration-250 cursor-pointer group">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
                        <Plus size={24} className="text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
                      </div>
                      <p className="text-[15px] font-semibold text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">Add New Address</p>
                    </button>
                  </div>
                </section>
              )}

              {activeTab === 'wishlist' && (
                <section className="space-y-6">
                  <h2 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 dark:text-white tracking-tight">Wishlist</h2>

                  {wishlistItems.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-600 bg-white dark:bg-[#18181B] p-14 sm:p-16 text-center">
                      <div className="mx-auto w-[72px] h-[72px] rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-5 border border-red-200 dark:border-red-800/30">
                        <Heart size={32} className="text-red-400 dark:text-red-400" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Your wishlist is empty</h3>
                      <p className="text-base text-zinc-500 dark:text-zinc-400 mb-8 max-w-md mx-auto leading-relaxed">
                        Save items you love by tapping the heart icon. They'll stay here for when you're ready to buy.
                      </p>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2.5 h-[52px] px-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      >
                        <Heart size={18} strokeWidth={2} />
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Stats card */}
                      <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-6">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center border border-red-200 dark:border-red-800/30">
                              <Heart size={22} className="text-red-500 dark:text-red-400" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="text-[22px] font-bold text-zinc-900 dark:text-white">{wishlistItems.length}</p>
                              <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Saved items</p>
                            </div>
                          </div>
                          <Link
                            to="/"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="inline-flex items-center gap-2.5 h-[48px] px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[14px] font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] shadow-sm"
                          >
                            <ShoppingBag size={16} strokeWidth={2} />
                            Continue Shopping
                          </Link>
                        </div>
                      </div>

                      {/* Wishlist items grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {wishlistItems.map((item: any) => (
                          <div
                            key={item._id}
                            className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] p-4 hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-250"
                          >
                            <div className="flex gap-4">
                              <Link to={`/product/${item._id}`} className="w-24 h-28 sm:w-28 sm:h-32 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <img src={item.image || undefined} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                              </Link>
                              <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                                <div>
                                  <Link to={`/product/${item._id}`}>
                                    <h3 className="text-[15px] font-semibold text-zinc-900 dark:text-white line-clamp-2 hover:underline">{item.name}</h3>
                                  </Link>
                                  <p className="text-base font-bold mt-1.5 text-zinc-900 dark:text-white">
                                    {formatINR(item.discountPrice || item.price)}
                                  </p>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => {
                                      dispatch(addToCart({
                                        _id: item._id, name: item.name,
                                        price: item.discountPrice || item.price,
                                        image: item.image, qty: 1,
                                        variant: { color: 'Black', size: 'M' },
                                      }));
                                    }}
                                    className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-[12px] font-bold uppercase tracking-wider bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97]"
                                  >
                                    <ShoppingBag size={13} strokeWidth={2} />
                                    Add to Bag
                                  </button>
                                  <button
                                    onClick={() => dispatch(toggleWishlist(item))}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
                                    aria-label="Remove"
                                  >
                                    <Trash2 size={14} strokeWidth={1.5} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}

              {activeTab === 'settings' && (
                <section className="space-y-6">
                  <h2 className="text-[26px] sm:text-[30px] font-bold text-zinc-900 dark:text-white tracking-tight">Settings</h2>

                  {/* Account */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-250">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <User size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Account</h3>
                          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Manage your profile and security settings.</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => setShowEditModal(true)} className="inline-flex items-center gap-2 h-[50px] px-6 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[15px] font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.98] shadow-sm">
                          <Pencil size={16} strokeWidth={2} />
                          Edit Profile
                        </button>
                        <button onClick={() => setShowPasswordModal(true)} className="inline-flex items-center gap-2 h-[50px] px-6 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-[15px] font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98]">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-250">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Bell size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Notifications</h3>
                          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Choose what updates you'd like to receive.</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 space-y-4">
                      {[
                        { label: 'Order Updates', desc: 'Receive updates about your order status and delivery.' },
                        { label: 'Promotions & Offers', desc: 'Get notified about sales, new arrivals, and exclusive offers.' },
                        { label: 'Newsletter', desc: 'Monthly newsletter with style guides and curated picks.' },
                      ].map((item) => (
                        <label key={item.label} className="flex items-center justify-between py-2 cursor-pointer group">
                          <div>
                            <p className="text-[15px] font-semibold text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{item.label}</p>
                            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.desc}</p>
                          </div>
                          <div className="relative w-11 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer transition-colors group-hover:bg-zinc-300 dark:group-hover:bg-zinc-600">
                            <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-300 shadow-sm transition-transform" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Appearance */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-250">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          {theme === 'dark' ? <Moon size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} /> : <Sun size={20} className="text-zinc-600" strokeWidth={1.5} />}
                        </div>
                        <div>
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Appearance</h3>
                          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Toggle between light and dark themes.</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          {theme === 'dark' ? (
                            <Moon size={18} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                          ) : (
                            <Sun size={18} className="text-zinc-500" strokeWidth={1.5} />
                          )}
                          <span className="text-[15px] font-semibold text-zinc-900 dark:text-white">
                            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                          </span>
                        </div>
                        <button
                          onClick={toggleTheme}
                          className={`relative w-[52px] h-7 rounded-full transition-colors duration-300 ${
                            theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-300'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 flex items-center justify-center ${
                            theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
                          }`}>
                            {theme === 'dark' ? (
                              <Moon size={11} className="text-zinc-700" strokeWidth={2} />
                            ) : (
                              <Sun size={11} className="text-amber-500" strokeWidth={2} />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy */}
                  <div className="rounded-2xl border border-zinc-200 dark:border-[#2A2A2A] bg-white dark:bg-[#18181B] overflow-hidden hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all duration-250">
                    <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <Shield size={20} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
                        </div>
                        <div>
                          <h3 className="text-[18px] sm:text-[20px] font-bold text-zinc-900 dark:text-white">Privacy</h3>
                          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">Manage your data and account preferences.</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4 space-y-3">
                      <button className="w-full flex items-center justify-between py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-all duration-200 group">
                        <span className="text-[15px] font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">Delete Account</span>
                        <ChevronRight size={16} className="text-zinc-400 group-hover:text-red-500 transition-colors" />
                      </button>
                      <button
                        onClick={() => dispatch(logout())}
                        className="w-full flex items-center justify-between py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group"
                      >
                        <span className="text-[15px] font-medium text-red-500 dark:text-red-400">Sign Out</span>
                        <LogOut size={16} className="text-red-400" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </main>
        </div>
      </div>


      {/* Modals */}
      <EditProfileModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={userInfo} />
      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  );
};

const ProfileField = ({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 transition-colors">
    <p className="text-[13px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5 flex items-center gap-1.5">
      {icon && <span className="text-zinc-400">{icon}</span>}
      {label}
    </p>
    <p className="text-[16px] font-medium text-zinc-900 dark:text-white">{value}</p>
  </div>
);

export default AccountPage;
