'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validators';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/login', data);
      const { access_token, user, workspace } = response.data;
      setAuth(access_token, user, workspace?.id || null);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-500">Welcome back</p>
          <h1 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Or{' '}
            <Link href="/register" className="font-semibold text-indigo-600 dark:text-indigo-400">
              create a new account
            </Link>
          </p>
        </div>

        <Card className="space-y-6">
          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
              {error}
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <Input
              label="Email address"
              type="email"
              placeholder="Enter your email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
