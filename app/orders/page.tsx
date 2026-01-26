'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface OrderListItem {
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
    farmer?: {
      id: string;
      name: string | null;
    } | null;
  } | null;
}

const statusColorMap: Record<string, string> = {
  delivered: 'bg-emerald-100 text-emerald-800',
  confirmed: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-800',
  shipped: 'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-rose-100 text-rose-700',
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
  const normalized = status.toLowerCase();
  return normalized
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const statusBadgeClasses = (status?: string | null) => {
  if (!status) return 'bg-gray-100 text-gray-600';
  const normalized = status.toLowerCase();
  return statusColorMap[normalized] ?? 'bg-gray-100 text-gray-600';
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BuyerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/orders');

      if (response.status === 401) {
        router.push('/login');
        router.refresh();
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = (await response.json()) as { orders: OrderListItem[] };
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Unable to load your orders right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const totalOrders = orders.length;
  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status?.toLowerCase() === 'delivered').length,
    [orders],
  );
  const inProgressOrders = useMemo(
    () => orders.filter((order) => order.status && ['pending', 'confirmed', 'shipped'].includes(order.status.toLowerCase())).length,
    [orders],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-transparent text-[var(--oilseed-stem)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--oilseed-fern)]/30 border-t-[var(--oilseed-fern)]" />
        <p className="text-sm text-[var(--oilseed-stem)]/70">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-6 py-10 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_12%,rgba(242,201,76,0.25),transparent_52%),radial-gradient(circle_at_86%_90%,rgba(63,125,79,0.2),transparent_55%)]" />

      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--oilseed-char)]">Your Orders</h1>
            <p className="text-sm text-[var(--oilseed-stem)]/75">Track every purchase you have made on Agri2Market+</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" href="/dashboard/buyer">
              Back to Dashboard
            </Button>
            <Button href="/products">Browse Marketplace</Button>
          </div>
        </div>

        {error && (
          <Card className="border border-rose-200 bg-rose-50 text-rose-800">
            <p>{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="border-[var(--surface-highlight)]/70">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Total Orders</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--oilseed-char)]">{totalOrders}</p>
          </Card>
          <Card className="border-[var(--surface-highlight)]/70">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">Delivered</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--oilseed-char)]">{deliveredOrders}</p>
          </Card>
          <Card className="border-[var(--surface-highlight)]/70">
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--oilseed-stem)]">In Progress</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--oilseed-char)]">{inProgressOrders}</p>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center text-[var(--oilseed-stem)]">
            <div className="rounded-full bg-[var(--oilseed-cream)] p-4">
              <span className="text-2xl">🧺</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[var(--oilseed-char)]">No orders yet</h2>
              <p className="mt-1 text-sm text-[var(--oilseed-stem)]/75">
                You haven&apos;t placed any orders. Explore our marketplace to get started.
              </p>
            </div>
            <Button href="/products">Browse Marketplace</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border border-[var(--surface-highlight)]/70 bg-[var(--surface-primary)] text-[var(--oilseed-stem)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-[var(--oilseed-char)]">
                        {order.product?.title ?? 'Untitled Product'}
                      </p>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClasses(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </div>
                    <div className="text-sm text-[var(--oilseed-stem)]/75">
                      <p>
                        Quantity: {order.quantity}{' '}
                        {order.product?.unit ?? ''}
                      </p>
                      <p>Placed on {formatDate(order.createdAt)}</p>
                      {order.product?.farmer?.name && (
                        <p>Farmer: {order.product.farmer.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--oilseed-stem)]/80">Total Paid</p>
                    <p className="text-xl font-semibold text-[var(--oilseed-forest)]">
                      {formatCurrency(order.totalPrice)}
                    </p>
                    {order.product?.id && (
                      <Link
                        href={`/products/${order.product.id}`}
                        className="text-sm font-medium text-[var(--oilseed-forest)] underline-offset-2 hover:underline"
                      >
                        View Product
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
