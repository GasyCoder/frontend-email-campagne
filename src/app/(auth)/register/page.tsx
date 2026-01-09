'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validators';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/register', data);
      const { access_token, user, workspace } = response.data;
      setAuth(access_token, user, workspace?.id || null);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        setError(Object.values(validationErrors).flat().join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">
            Get started
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Or{' '}
            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <Card className="space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Name"
              placeholder="Your name"
              error={errors.name?.message}
              {...register('name')}
            />
            <Input
              label="Email address"
              type="email"
              placeholder="Email address"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Register'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
