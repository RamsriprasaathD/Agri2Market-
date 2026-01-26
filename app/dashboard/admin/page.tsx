'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsResponse, usersResponse] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/admin?endpoint=users'),
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users?.slice(0, 5) || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Failed to logout:', error);
    } finally {
      setLoggingOut(false);
      router.push('/login');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-transparent text-[var(--oilseed-stem)]">
        <div className="rounded-full border border-[var(--oilseed-stem)]/20 px-5 py-2 text-sm uppercase tracking-[0.35em]">
          Loading admin dashboard…
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-6 py-12 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_12%,rgba(242,201,76,0.28),transparent_52%),radial-gradient(circle_at_86%_90%,rgba(63,125,79,0.2),transparent_55%)]" />

      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--oilseed-forest)]">
            Admin control center
          </span>
          <h1 className="text-3xl font-semibold text-[var(--oilseed-char)] sm:text-4xl">
            Manage users, products, and systems
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Logout'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-forest)]">Total Revenue</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">
              ₹{analytics?.totalRevenue?.toFixed(2) || '0.00'}
            </p>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-forest)]">Total Orders</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-stem)]">{analytics?.totalOrders || 0}</p>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-forest)]">Total Users</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-stem)]">{analytics?.totalUsers || 0}</p>
          </Card>

          <Card className="border-[var(--oilseed-gold)]/60 bg-[var(--surface-highlight)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-char)]">Products</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">{analytics?.totalProducts || 0}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">Recent Users</h3>
            <div className="space-y-3">
              {users.length ? (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-primary)] p-3 shadow-sm">
                    <div>
                      <p className="font-semibold text-[var(--oilseed-char)]">{user.name}</p>
                      <p className="text-sm text-[var(--oilseed-stem)]/75">{user.email}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                        user.role === 'admin'
                          ? 'bg-rose-100 text-rose-700'
                          : user.role === 'farmer'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-sky-100 text-sky-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--oilseed-stem)]/25 bg-[var(--surface-muted)] p-6 text-sm text-[var(--oilseed-stem)]/75">
                  No users found
                </div>
              )}
            </div>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">System Status</h3>
            <div className="space-y-3">
              {[{ label: 'Database' }, { label: 'ML Service' }, { label: 'Email Service' }].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-primary)] p-3 shadow-sm">
                  <span className="font-semibold text-[var(--oilseed-char)]">{item.label}</span>
                  <span className="text-sm font-semibold text-[var(--oilseed-forest)]">Online</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button href="/admin/users">Manage Users</Button>
          <Button variant="secondary" href="/admin/products">Manage Products</Button>
          <Button variant="ghost" href="/admin/settings">System Settings</Button>
        </div>
      </div>
    </div>
  );
}
