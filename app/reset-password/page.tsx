'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid reset token');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successful');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
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
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 text-[var(--oilseed-stem)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,rgba(242,201,76,0.26),transparent_52%),radial-gradient(circle_at_85%_90%,rgba(63,125,79,0.2),transparent_55%)]" />
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-semibold text-[var(--oilseed-char)]">Reset your password</h2>
          <p className="mt-2 text-sm text-[var(--oilseed-stem)]/75">
            Or{' '}
            <Link href="/login" className="font-medium text-[var(--oilseed-forest)] underline-offset-4 hover:underline">
              sign in to your account
            </Link>
          </p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              type="password"
              name="newPassword"
              label="New password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              name="confirmPassword"
              label="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <div className="text-sm text-red-600">{error}</div>}

            {message && <div className="text-sm text-green-600">{message}</div>}

            <Button type="submit" disabled={loading || !token} className="w-full">
              {loading ? 'Resetting...' : 'Reset password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="relative min-h-screen flex items-center justify-center px-4 py-12 text-sm text-[var(--oilseed-stem)]">Loading reset form…</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
