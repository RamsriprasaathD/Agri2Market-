'use client';

import { useState, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

const MAX_UPLOADS = 6;
const MAX_FILE_SIZE_MB = 5;

interface FormState {
  title: string;
  description: string;
  category: string;
  unit: string;
  quantity: string;
  minimumOrder: string;
  price: string;
}

const defaultState: FormState = {
  title: '',
  description: '',
  category: '',
  unit: 'kg',
  quantity: '',
  minimumOrder: '',
  price: '',
};

export default function NewProductPage() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      if (error) setError(null);
    };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));

    if (files.length === 0) {
      event.target.value = '';
      return;
    }

    setError(null);
    setSuccess(null);

    const combined = [...selectedImages, ...files];

    if (combined.length > MAX_UPLOADS) {
      setError(`You can upload up to ${MAX_UPLOADS} images per product.`);
    }

    setSelectedImages(combined.slice(0, MAX_UPLOADS));
    event.target.value = '';
  };

  const handleImageRemove = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (selectedImages.length === 0) {
      setError('Please upload at least one product image.');
      setSubmitting(false);
      return;
    }

    if (selectedImages.some((file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024)) {
      setError(`Each image must be ${MAX_FILE_SIZE_MB}MB or smaller.`);
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.set('title', form.title.trim());
      formData.set('category', form.category.trim());
      formData.set('unit', form.unit.trim());
      formData.set('quantity', form.quantity.trim());
      formData.set('price', form.price.trim());

      if (form.description.trim()) {
        formData.set('description', form.description.trim());
      }

      if (form.minimumOrder.trim()) {
        formData.set('minimumOrder', form.minimumOrder.trim());
      }

      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create product');
      }

      setSuccess('Product created successfully. Redirecting to your products…');
      setForm(defaultState);
      setSelectedImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => router.push('/products?scope=farmer'), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-emerald-900">List a new product</h1>
          <p className="text-base text-emerald-700/80">
            Share fresh oilseed by-products with buyers across the marketplace. Provide accurate details for
            transparent trading.
          </p>
        </div>

        <Card className="shadow-lg border border-emerald-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Product title"
                name="title"
                value={form.title}
                onChange={handleChange('title')}
                placeholder="Cold-pressed Sunflower Cake"
                required
              />

              <Input
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange('category')}
                placeholder="Sunflower"
                required
              />

              <Input
                label="Unit"
                name="unit"
                value={form.unit}
                onChange={handleChange('unit')}
                placeholder="kg"
                required
              />

              <Input
                label="Available quantity"
                name="quantity"
                type="number"
                min="0"
                step="0.1"
                value={form.quantity}
                onChange={handleChange('quantity')}
                placeholder="500"
                required
              />

              <Input
                label="Minimum order (optional)"
                name="minimumOrder"
                type="number"
                min="0"
                step="0.1"
                value={form.minimumOrder}
                onChange={handleChange('minimumOrder')}
                placeholder="50"
              />

              <Input
                label="Price per unit (₹)"
                name="price"
                type="number"
                min="0"
                step="0.1"
                value={form.price}
                onChange={handleChange('price')}
                placeholder="125"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Description</label>
              <textarea
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange('description')}
                className="w-full rounded-md border border-emerald-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Describe product quality, processing method, storage, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-900 mb-1">Product images</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full rounded-md border border-emerald-200 px-3 py-2 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-800 hover:file:bg-emerald-200"
              />
              <p className="mt-2 text-xs text-emerald-700/70">
                Upload up to {MAX_UPLOADS} images (max {MAX_FILE_SIZE_MB}MB each). The first image will be used as the
                catalogue cover.
              </p>
              {selectedImages.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                  {selectedImages.map((file, index) => (
                    <li
                      key={`${file.name}-${file.lastModified}`}
                      className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50/60 px-3 py-2"
                    >
                      <span className="truncate pr-3">
                        {file.name}{' '}
                        <span className="text-xs text-emerald-700/70">
                          ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 hover:text-emerald-900"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button type="submit" disabled={submitting} className="w-full sm:w-auto disabled:opacity-70">
                {submitting ? 'Publishing…' : 'Publish product'}
              </Button>
              <Link href="/products?scope=farmer" className="text-sm font-medium text-emerald-800 hover:underline">
                View my products
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
