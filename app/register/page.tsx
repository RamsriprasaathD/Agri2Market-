'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as 'farmer' | 'buyer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login?message=Registration successful');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(242,201,76,0.25),transparent_45%),radial-gradient(circle_at_82%_90%,rgba(63,125,79,0.2),transparent_55%)]" />
      <div className="w-full max-w-2xl space-y-10">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--oilseed-forest)]">
            Join Agri2Market+
          </span>
          <h2 className="text-3xl font-semibold text-[var(--oilseed-char)] sm:text-4xl">
            Create your account
          </h2>
          <p className="text-sm text-[var(--oilseed-stem)]/75">
            Already onboard?{' '}
            <Link href="/login" className="font-semibold text-[var(--oilseed-forest)] hover:text-[var(--oilseed-char)]">
              Sign in instead
            </Link>
          </p>
        </div>

        <Card className="border-[var(--surface-highlight)]/70 bg-[var(--surface-primary)] text-[var(--oilseed-stem)]">
          <form className="grid gap-6" onSubmit={handleSubmit}>
            <Input
              type="text"
              name="name"
              label="Full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <Input
              type="email"
              name="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid gap-3">
              <label className="block text-xs font-semibold uppercase tracking-[0.28em] text-[var(--oilseed-gold)]">
                Account Type <span className="text-red-500">*</span>
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { value: 'farmer', label: 'Farmer', description: 'List produce, monitor sales & inventory' },
                  { value: 'buyer', label: 'Buyer', description: 'Source high-quality oilseeds from trusted farms' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        role: option.value as 'farmer' | 'buyer',
                      }))
                    }
                    className={`rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      formData.role === option.value
                        ? 'border-[var(--oilseed-gold)] bg-[var(--surface-highlight)] shadow-[0_12px_24px_rgba(242,201,76,0.25)]'
                        : 'border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] hover:border-[var(--oilseed-gold)]/40 hover:bg-[var(--surface-primary)]'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[var(--oilseed-char)]">{option.label}</p>
                    <p className="text-xs text-[var(--oilseed-stem)]/75">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
            
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
