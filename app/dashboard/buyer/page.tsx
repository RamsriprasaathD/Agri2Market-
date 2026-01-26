'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type BuyerAnalytics = {
  totalSpent: number;
  totalOrders: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    status: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
    product?: {
      id: string;
      title: string;
      unit: string;
      price: number;
      farmer?: { id: string; name: string | null };
    };
  }>;
  recommendedProducts: Array<{
    id: string;
    title: string;
    price: number;
    unit: string;
    farmer?: { id: string; name: string | null };
    images?: Array<{ id: string; url: string }>;
  }>;
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const formatCurrency = (value?: number | null) =>
  currencyFormatter.format(value ?? 0);

const formatStatus = (status?: string | null) => {
  if (!status) return 'Unknown';
  return status
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatDate = (date?: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function BuyerDashboard() {
  const [analytics, setAnalytics] = useState<BuyerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/analytics');

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as { analytics: BuyerAnalytics };
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Unable to load dashboard data right now. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  return (
    <div className="relative min-h-screen px-6 py-12 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.25),transparent_50%),radial-gradient(circle_at_85%_88%,rgba(63,125,79,0.18),transparent_55%)]" />

      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--oilseed-forest)]">
            Buyer dashboard
          </span>
          <h1 className="text-3xl font-semibold text-[var(--oilseed-char)] sm:text-4xl">
            Browse products and manage your orders
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Signing out…' : 'Logout'}
            </Button>
            <Button href="/products">Browse Marketplace</Button>
            <Button variant="secondary" href="/orders">
              View All Orders
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-rose-200/60 bg-rose-50 text-rose-800">
            <p>{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Total Spent</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">
              {formatCurrency(analytics?.totalSpent)}
            </p>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Total Orders</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-char)]">
              {analytics?.totalOrders ?? 0}
            </p>
          </Card>

          <Card className="border-[var(--oilseed-gold)]/60 bg-[var(--surface-highlight)]">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-char)]">Average Order Value</h3>
            <p className="mt-3 text-3xl font-bold text-[var(--oilseed-forest)]">
              {formatCurrency(analytics?.averageOrderValue)}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {analytics?.recentOrders?.length ? (
                analytics.recentOrders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-primary)] p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-[var(--oilseed-char)]">
                          {order.product?.title ?? 'Untitled Product'}
                        </p>
                        <p className="text-sm text-[var(--oilseed-stem)]/80">
                          Quantity: {order.quantity} {order.product?.unit ?? ''}
                        </p>
                        <p className="text-sm text-[var(--oilseed-stem)]/80">
                          Status: {formatStatus(order.status)}
                        </p>
                        <p className="text-xs text-[var(--oilseed-stem)]/65 mt-1">
                          Ordered on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <p className="text-right text-lg font-semibold text-[var(--oilseed-forest)]">
                        {formatCurrency(order.totalPrice)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--oilseed-stem)]/25 bg-[var(--surface-muted)] p-6 text-sm text-[var(--oilseed-stem)]/75">
                  No orders yet. Start shopping to see them here.
                </div>
              )}
            </div>
          </Card>

          <Card className="border-[var(--surface-highlight)]/70">
            <h3 className="text-lg font-semibold text-[var(--oilseed-char)] mb-4">Recommended Products</h3>
            <div className="space-y-3">
              {analytics?.recommendedProducts?.length ? (
                analytics.recommendedProducts.map((product) => (
                  <div key={product.id} className="rounded-xl border border-[var(--oilseed-stem)]/15 bg-[var(--surface-primary)] p-4 shadow-sm">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-[var(--oilseed-char)]">{product.title}</p>
                        <p className="text-sm text-[var(--oilseed-stem)]/80">
                          Seller: {product.farmer?.name ?? 'Unknown Farmer'}
                        </p>
                      </div>
                      <p className="text-right text-lg font-semibold text-[var(--oilseed-forest)]">
                        {formatCurrency(product.price)}
                        <span className="ml-1 text-xs font-medium text-[var(--oilseed-stem)]/70">/ {product.unit}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--oilseed-stem)]/25 bg-[var(--surface-muted)] p-6 text-sm text-[var(--oilseed-stem)]/75">
                  No personalised suggestions yet. Browse the marketplace to discover products.
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
