import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { useGetUserOrdersQuery } from '../store/slices/orderApiSlice';
import { Package, User, MapPin, Heart, Settings, LogOut, ChevronRight, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';

const tabs = [
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Payment Pending', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed',       color: 'text-blue-700 dark:text-blue-300',     bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',       icon: CheckCircle },
  cancelled: { label: 'Cancelled',       color: 'text-red-700 dark:text-red-300',       bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',           icon: XCircle },
};

const getPaymentMethodLabel = (order: any) => {
  if (order?.paymentProvider === 'COD') {
    return 'Cash on Delivery';
  }

  return 'Razorpay Secure';
};

const PAGE_SIZE = 5;

const AccountPage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.wishlistItems.length);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';
  const [page, setPage] = useState(1);

  const { data: allOrders = [], isLoading: ordersLoading } = useGetUserOrdersQuery(undefined);

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

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Hey, {userInfo.firstName}
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {userInfo.email}{userInfo.phone ? ` · ${userInfo.phone}` : ''}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  <span>{tab.label}</span>
                  {tab.id === 'wishlist' && wishlistCount > 0 && (
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {wishlistCount}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => dispatch(logout())}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-all"
              >
                <LogOut size={18} strokeWidth={1.5} />
                <span>Sign out</span>
              </button>
            </div>
          </aside>

          {/* Main content */}
          <main className="min-h-[400px]">
            {activeTab === 'orders' && (
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Your orders</h2>
                  {ordersData && ordersData.total > 0 && (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {ordersData.total} order{ordersData.total !== 1 ? 's' : ''} total
                    </span>
                  )}
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-20 h-24 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-6 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                          </div>
                          <div className="text-right space-y-2">
                            <div className="h-5 w-16 rounded bg-zinc-200 dark:bg-zinc-800" />
                            <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : ordersData?.orders?.length > 0 ? (
                  <div className="space-y-4">
                    {ordersData.orders.map((order: any) => {
                      const status = statusConfig[order.status] || statusConfig.pending;
                      const StatusIcon = status.icon;
                      const itemCount = order.items?.reduce((a: number, i: any) => a + i.quantity, 0) || 0;

                      return (
                        <Link
                          key={order._id}
                          to={`/order/${order._id}`}
                          className="group block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all"
                        >
                          <div className="p-5 sm:p-6">
                            <div className="flex items-start gap-4 sm:gap-6">
                              {/* Order icon */}
                              <div className="relative shrink-0">
                                <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                  <ShoppingBag size={24} className="text-zinc-300 dark:text-zinc-600" />
                                </div>
                                {order.items?.length > 1 && (
                                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold flex items-center justify-center shadow-sm">
                                    +{order.items.length - 1}
                                  </span>
                                )}
                              </div>

                              {/* Order info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                                  <div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate max-w-[250px] sm:max-w-sm">
                                      Order #{order._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                                      {order.paymentProvider === 'COD'
                                        ? order.paymentStatus === 'paid'
                                          ? ' · COD collected'
                                          : ' · COD pending'
                                        : order.paymentStatus === 'paid'
                                          ? ' · Paid online'
                                          : ' · Payment pending'}
                                    </p>
                                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                      {getPaymentMethodLabel(order)}
                                    </p>
                                  </div>
                                  <div className="text-left sm:text-right">
                                    <p className="text-xl font-bold text-zinc-900 dark:text-white">
                                      ₹{order.totalAmount?.toLocaleString('en-IN') || '0'}
                                    </p>
                                  </div>
                                </div>

                                {/* Status badge + action */}
                                <div className="mt-4 flex flex-wrap items-center gap-3">
                                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${status.bg} ${status.color}`}>
                                    <StatusIcon size={13} strokeWidth={2} />
                                    {status.label.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                    View details
                                    <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
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
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Previous
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                              p === page
                                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                                : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                        <button
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                          className="px-4 py-2 rounded-lg text-sm font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-12 text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                      <ShoppingBag size={28} className="text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">No orders yet</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8 max-w-sm mx-auto">
                      Your order history will appear here once you make your first purchase.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Link
                        to="/cart"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-sm font-bold hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all shadow-md hover:shadow-lg"
                      >
                        <ShoppingBag size={17} />
                        Go to Cart
                      </Link>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                      >
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                )}
              </section>
            )}

            {activeTab === 'profile' && (
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Profile</h2>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <ProfileField label="First name" value={userInfo.firstName} />
                      <ProfileField label="Last name" value={userInfo.lastName} />
                      <ProfileField label="Email" value={userInfo.email} />
                      {userInfo.phone && <ProfileField label="Phone" value={userInfo.phone} />}
                      <ProfileField label="Role" value={userInfo.role} />
                      <ProfileField label="Member since" value={new Date().getFullYear().toString()} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'addresses' && (
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Addresses</h2>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <MapPin size={18} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Default delivery address</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          19 Residency Road<br />
                          Bengaluru, Karnataka 560025<br />
                          India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'wishlist' && (
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Wishlist</h2>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Heart size={18} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Saved items</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                          You have {wishlistCount} item{wishlistCount === 1 ? '' : 's'} in your wishlist.
                        </p>
                        <Link to="/wishlist" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                          View wishlist <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeTab === 'settings' && (
              <section>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Settings</h2>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                        <Settings size={18} className="text-zinc-500 dark:text-zinc-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">Preferences</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          Manage your notification and account preferences here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-zinc-900 dark:text-white">{value}</p>
  </div>
);

export default AccountPage;
