'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const role = data.user?.role ?? data.role;

        switch (role) {
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'farmer':
            router.push('/dashboard/farmer');
            break;
          case 'buyer':
          default:
            router.push('/dashboard/buyer');
            break;
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.28),transparent_50%),radial-gradient(circle_at_85%_90%,rgba(63,125,79,0.2),transparent_55%)]" />
      <div className="w-full max-w-md space-y-10">
        <div className="space-y-3 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--oilseed-stem)]/15 bg-[var(--surface-muted)] px-4 py-1 text-xs uppercase tracking-[0.4em] text-[var(--oilseed-forest)]">
            Welcome back
          </span>
          <h2 className="text-3xl font-semibold text-[var(--oilseed-char)] sm:text-4xl">
            Sign in to your account
          </h2>
          <p className="text-sm text-[var(--oilseed-stem)]/75">
            Or{' '}
            <Link href="/register" className="font-semibold text-[var(--oilseed-forest)] hover:text-[var(--oilseed-char)]">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="border-[var(--surface-highlight)]/70 bg-[var(--surface-primary)] text-[var(--oilseed-stem)]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              type="email"
              name="email"
              label="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              type="password"
              name="password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-[var(--oilseed-forest)] underline-offset-4 hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
