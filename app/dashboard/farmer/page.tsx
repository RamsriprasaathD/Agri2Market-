'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { PriceChart } from '@/components/charts/PriceChart';
import { Button } from '@/components/ui/Button';

export default function FarmerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [analyticsResponse] = await Promise.all([
        fetch('/api/analytics'),
      ]);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData.analytics);
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
          Loading dashboard…
        </div>
      </div>
    );
  }

  const averageOrderValue = (analytics?.totalRevenue || 0) / Math.max(analytics?.totalOrders || 0, 1);

  return (
    <div className="relative min-h-screen px-6 py-12 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.25),transparent_50%),radial-gradient(circle_at_84%_90%,rgba(63,125,79,0.2),transparent_55%)]" />

      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--oilseed-forest)]">
            Farmer cockpit
          </span>
          <h1 className="text-3xl font-semibold text-[var(--oilseed-char)] sm:text-4xl">Manage your products and track sales</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Logout'}
            </Button>
            <Button href="/products/new">Add New Product</Button>
            <Button variant="secondary" href="/products">Manage Products</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-forest)]">Total Revenue</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">₹{(analytics?.totalRevenue ?? 0).toFixed(2)}</p>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Total Orders</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-char)]">{analytics?.totalOrders ?? 0}</p>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Active Products</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-char)]">{analytics?.totalProducts ?? 0}</p>
          </Card>

          <Card className="border-[var(--oilseed-gold)]/60 bg-[var(--surface-highlight)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-char)]">Average Order Value</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">₹{averageOrderValue.toFixed(2)}</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[var(--surface-highlight)]/70 bg-[var(--surface-primary)]">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">Price trend</h3>
            <div className="rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] p-4">
              <PriceChart
                data={[
                  { date: '2024-01', price: 120 },
                  { date: '2024-02', price: 135 },
                  { date: '2024-03', price: 125 },
                  { date: '2024-04', price: 140 },
                ]}
              />
            </div>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">Top Products</h3>
            <div className="space-y-3">
              {analytics?.topProducts?.length ? (
                analytics.topProducts.slice(0, 5).map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-primary)] p-3 shadow-sm">
                    <div>
                      <p className="font-semibold text-[var(--oilseed-char)]">{product.name ?? product.title}</p>
                      <p className="text-sm text-[var(--oilseed-stem)]/75">{product.quantity} units</p>
                    </div>
                    <p className="text-sm font-semibold text-[var(--oilseed-forest)]">₹{Number(product.price ?? 0).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--oilseed-stem)]/25 bg-[var(--surface-muted)] p-6 text-sm text-[var(--oilseed-stem)]/75">
                  No products available
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
