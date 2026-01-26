'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';

interface ProductCard {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  unit: string;
  quantity: number;
  minimumOrder?: number | null;
  price: number;
  farmer: {
    id: string;
    name: string;
    email: string;
  };
  images: { id: string; url: string }[];
  orders?: Array<{
    id: string;
    status: string;
    createdAt: string;
    totalPrice: number;
    buyer: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

const categories = ['Sunflower', 'Groundnut', 'Mustard', 'Coconut', 'Sesame'];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scope = searchParams.get('scope') ?? 'market';
  const category = searchParams.get('category') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (scope) params.set('scope', scope);
        if (category) params.set('category', category);
        if (minPrice) params.set('minPrice', minPrice);
        if (maxPrice) params.set('maxPrice', maxPrice);

        const response = await fetch(`/api/products?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? 'Failed to load products');
        }

        setProducts(data.products ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [scope, category, minPrice, maxPrice]);

  const handleFilterChange = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    router.replace(`/products?${next.toString()}`);
  };

  const isFarmerView = scope === 'farmer';

  const headerTitle = isFarmerView ? 'My Product Catalogue' : 'Marketplace Listings';
  const headerSubtitle = isFarmerView
    ? 'Edit existing lots, review recent orders, and keep inventory updated.'
    : 'Browse verified oilseed by-products sourced from trusted farmers.';

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/70">Agri2Market+</p>
            <h1 className="text-3xl font-semibold text-emerald-900">{headerTitle}</h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-800/80">{headerSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterChange('scope', isFarmerView ? '' : 'farmer')}
              className="rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 transition-colors hover:bg-emerald-100"
            >
              {isFarmerView ? 'View marketplace' : 'Switch to my catalogue'}
            </button>
            {isFarmerView && (
              <Button href="/products/new" className="rounded-full px-6 uppercase tracking-[0.2em]">
                + Add Product
              </Button>
            )}
          </div>
        </div>

        <Card className="border border-emerald-100 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Category</label>
              <select
                value={category}
                onChange={(event) => handleFilterChange('category', event.target.value)}
                className="mt-2 w-full rounded-md border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="">All categories</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Min price"
              name="minPrice"
              value={minPrice}
              onChange={(event) => handleFilterChange('minPrice', event.target.value)}
              placeholder="0"
              type="number"
              min="0"
            />

            <Input
              label="Max price"
              name="maxPrice"
              value={maxPrice}
              onChange={(event) => handleFilterChange('maxPrice', event.target.value)}
              placeholder="500"
              type="number"
              min="0"
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-sm text-emerald-800">Loading products…</p>
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-md border border-emerald-200 bg-white px-6 py-12 text-center text-sm text-emerald-800">
            {isFarmerView ? (
              <>
                <p>You haven’t listed any products yet.</p>
                <Link href="/products/new" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline">
                  List your first product
                </Link>
              </>
            ) : (
              <p>No products match your filters right now. Try adjusting the filters or check back soon.</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Card key={product.id} className="flex h-full flex-col border border-emerald-100">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-emerald-900">{product.title}</h2>
                    <p className="text-xs uppercase tracking-[0.3em] text-emerald-700/70">{product.category}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                    ₹{product.price.toFixed(2)} / {product.unit}
                  </span>
                </div>

                {product.description && (
                  <p className="mt-3 text-sm text-emerald-800/80 line-clamp-3">{product.description}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-emerald-900/90">
                  <div className="rounded-lg bg-emerald-50/60 px-3 py-2">
                    <p className="font-semibold">Available</p>
                    <p>{product.quantity} {product.unit}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 px-3 py-2">
                    <p className="font-semibold">Minimum order</p>
                    <p>{product.minimumOrder ? `${product.minimumOrder} ${product.unit}` : 'Flexible'}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 px-3 py-2">
                    <p className="font-semibold">Seller</p>
                    <p>{product.farmer.name}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50/60 px-3 py-2">
                    <p className="font-semibold">Contact</p>
                    <p className="break-all text-emerald-700">{product.farmer.email}</p>
                  </div>
                </div>

                {product.images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {product.images.slice(0, 3).map((image) => (
                      <div key={image.id} className="overflow-hidden rounded-md border border-emerald-100">
                        <img
                          src={image.url}
                          alt={`${product.title} preview`}
                          className="h-20 w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {isFarmerView && product.orders && product.orders.length > 0 && (
                  <div className="mt-5 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/70">
                      Recent orders
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      {product.orders.map((order) => (
                        <li key={order.id} className="line-clamp-1 text-emerald-900">
                          #{order.id.slice(0, 6)} • {order.buyer.name} • {order.status.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button variant="outline" className="text-xs uppercase tracking-[0.3em]" href={`/products/${product.id}`}>
                    View details
                  </Button>
                  <span className="text-xs text-emerald-700/80">
                    Managed by <span className="font-semibold">{product.farmer.name}</span>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
