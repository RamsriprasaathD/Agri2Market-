'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const formatStatus = (status?: string) =>
  status
    ? status
        .toLowerCase()
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : 'Unknown';

interface ProductDetail {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  unit: string;
  quantity: number;
  price: number;
  minimumOrder?: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  images: { id: string; url: string; createdAt: string }[];
  orders: {
    id: string;
    status: string;
    quantity: number;
    totalPrice: number;
    createdAt: string;
    buyer: { id: string; name: string; email: string };
  }[];
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string | string[] }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const productId = rawId && rawId !== 'undefined' ? rawId : null;

  useEffect(() => {
    if (!productId) {
      if (rawId === 'undefined') {
        setError('Invalid listing identifier.');
        setProduct(null);
        setLoading(false);
      }
      return;
    }

    const controller = new AbortController();

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${productId}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setError('This product is no longer available or may have been removed.');
          setProduct(null);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load product');
        }

        setProduct(data.product as ProductDetail);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Product detail fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unexpected error');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [productId, rawId]);

  const sortedImages = useMemo(
    () => (product?.images ?? []).slice().sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [product?.images]
  );
  const heroImage = sortedImages[0];
  const galleryImages = sortedImages.slice(1);

  if (loading) {
    return (
      <div className="relative min-h-screen px-6 py-16 text-[var(--oilseed-stem)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.26),transparent_52%),radial-gradient(circle_at_85%_90%,rgba(63,125,79,0.2),transparent_55%)]" />
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-2 text-xs uppercase tracking-[0.35em]">
            Loading product details…
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    const message = error ?? 'This product is currently unavailable.';
    return (
      <div className="relative min-h-screen px-6 py-16 text-[var(--oilseed-stem)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.26),transparent_52%),radial-gradient(circle_at_85%_90%,rgba(63,125,79,0.2),transparent_55%)]" />
        <div className="mx-auto max-w-4xl">
          <Card className="border-rose-200/60 bg-rose-50 text-rose-800">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">We couldn’t load this listing</h2>
              <p className="text-sm">{message}</p>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.back()}>
                  ← Go back
                </Button>
                <Button variant="ghost" href="/products">
                  Return to marketplace
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen px-6 py-12 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.26),transparent_52%),radial-gradient(circle_at_85%_90%,rgba(63,125,79,0.2),transparent_55%)]" />

      <div className="mx-auto max-w-5xl">
        <Card className="overflow-hidden p-0">
          {heroImage ? (
            <div className="relative">
              <img
                src={heroImage.url}
                alt={`${product.title} primary image`}
                className="h-80 w-full object-cover sm:h-96"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent">
                <div className="mx-auto flex max-w-4xl flex-col gap-4 px-6 pb-6 pt-12 text-white sm:px-10">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.35em]">
                    <span className="rounded-full bg-white/20 px-3 py-1">Marketplace listing</span>
                    <span className="rounded-full bg-white/10 px-3 py-1">{product.category}</span>
                  </div>
                  <h1 className="text-3xl font-semibold sm:text-4xl">{product.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full bg-white/20 px-4 py-1 font-medium">
                      ₹{product.price.toFixed(2)} / {product.unit}
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]">
                      {formatStatus(product.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-3 bg-[var(--surface-muted)] text-center">
              <span className="text-4xl">🌾</span>
              <p className="text-sm text-[var(--oilseed-stem)]/70">No images uploaded for this listing yet.</p>
            </div>
          )}

          <div className="space-y-10 px-6 py-8 sm:px-10 sm:py-10">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                {product.description && (
                  <p className="max-w-3xl text-sm leading-relaxed text-[var(--oilseed-stem)]/80">{product.description}</p>
                )}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  {[
                    {
                      label: 'Available',
                      value: `${product.quantity} ${product.unit}`,
                    },
                    {
                      label: 'Minimum order',
                      value: product.minimumOrder ? `${product.minimumOrder} ${product.unit}` : 'Flexible',
                    },
                    {
                      label: 'Created on',
                      value: formatDateTime(product.createdAt),
                    },
                    {
                      label: 'Last updated',
                      value: formatDateTime(product.updatedAt),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-[var(--oilseed-stem)]/12 bg-[var(--surface-muted)] p-4 text-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]/65">
                        {item.label}
                      </p>
                      <p className="mt-2 text-base font-semibold text-[var(--oilseed-char)]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => router.back()}>
                  ← Back
                </Button>
                <Button variant="ghost" href="/products">
                  All listings
                </Button>
                <Button variant="secondary" href="/orders">
                  View my orders
                </Button>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]/65">
                  Gallery
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {galleryImages.map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-2xl border border-[var(--oilseed-stem)]/12">
                      <img src={image.url} alt={`${product.title} gallery image`} className="h-32 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-6">
                <div className="rounded-3xl border border-[var(--oilseed-stem)]/12 bg-[var(--surface-primary)] p-6 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]/65">
                    Seller details
                  </h2>
                  <p className="mt-3 text-lg font-semibold text-[var(--oilseed-char)]">{product.farmer.name}</p>
                  <Link
                    href={`mailto:${product.farmer.email}`}
                    className="mt-1 inline-flex text-sm font-medium text-[var(--oilseed-forest)] underline-offset-4 hover:underline"
                  >
                    {product.farmer.email}
                  </Link>
                  {product.farmer.phone && (
                    <p className="text-sm text-[var(--oilseed-stem)]/75">{product.farmer.phone}</p>
                  )}
                  <p className="mt-4 text-xs text-[var(--oilseed-stem)]/60">
                    Connect directly with the seller to finalise logistics, payment terms, and shipping.
                  </p>
                </div>

                <div className="rounded-3xl border border-[var(--oilseed-stem)]/12 bg-[var(--surface-primary)] p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-stem)]/65">
                      Recent orders
                    </h2>
                    <span className="text-xs text-[var(--oilseed-stem)]/60">
                      {product.orders.length ? `${product.orders.length} recorded` : 'No orders yet'}
                    </span>
                  </div>
                  {product.orders.length ? (
                    <ul className="mt-4 space-y-3">
                      {product.orders.map((order) => (
                        <li
                          key={order.id}
                          className="rounded-2xl border border-[var(--oilseed-stem)]/10 bg-[var(--surface-muted)] px-4 py-3"
                        >
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--oilseed-char)]">
                                <span>#{order.id.slice(0, 6)}</span>
                                <span className="rounded-full bg-[var(--surface-highlight)] px-3 py-0.5 text-xs font-semibold text-[var(--oilseed-char)]">
                                  {formatStatus(order.status)}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--oilseed-stem)]/75">
                                {order.quantity} {product.unit} • ₹{order.totalPrice.toFixed(2)} • {order.buyer.name}
                              </p>
                            </div>
                            <p className="text-xs text-[var(--oilseed-stem)]/60">{formatDateTime(order.createdAt)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-[var(--oilseed-stem)]/75">
                      This listing hasn’t received any orders yet. Be the first to place one.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl border border-[var(--oilseed-stem)]/12 bg-[var(--surface-highlight)]/35 p-6 text-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--oilseed-char)]">
                    Quick facts
                  </h2>
                  <ul className="mt-4 space-y-2 text-[var(--oilseed-stem)]/80">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-xs">•</span>
                      <span>Carefully verified produce sourced from trusted farmers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-xs">•</span>
                      <span>Coordinate delivery, payment mode, and packaging directly with the seller.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 text-xs">•</span>
                      <span>Save this page or share the link with procurement teammates for quick approvals.</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-dashed border-[var(--oilseed-stem)]/20 bg-[var(--surface-muted)] p-6 text-xs text-[var(--oilseed-stem)]/65">
                  Looking for pricing trends? Our analytics module captures price history over time and demand forecasts
                  (coming soon) so you can plan purchases confidently.
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
