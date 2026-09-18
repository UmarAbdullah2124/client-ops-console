'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, LayoutDashboard } from 'lucide-react'

import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

const features = [
  'Real-time client and project tracking',
  'Role-based access for your whole team',
  'Built for enterprise-grade workflows',
]

const DEMO_PASSWORD = 'password123'

const demoAccounts = [
  { role: 'Admin', email: 'admin@clientops.dev' },
  { role: 'Manager', email: 'manager@clientops.dev' },
  { role: 'Viewer', email: 'viewer@clientops.dev' },
]

export default function LoginPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const fillDemoCredentials = (email: string) => {
    setValue('email', email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  const onSubmit = async (values: LoginValues) => {
    setFormError(null)
    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
    })

    if (!result || result.error) {
      setFormError('Invalid email or password')
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 md:flex">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="relative flex flex-1 flex-col justify-center p-12 text-white">
          <h1 className="text-5xl font-bold leading-tight">Client Ops Console</h1>
          <p className="mt-4 max-w-md text-xl leading-relaxed text-slate-300">
            Manage clients, projects, and invoices in one place
          </p>

          <ul className="mt-10 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-slate-200">
                <CheckCircle2 size={22} className="shrink-0 text-indigo-400" />
                <span className="text-base">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-white p-4 dark:bg-slate-950 md:w-1/2">
        <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 md:hidden">
              Client Ops Console
            </h1>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">Welcome back</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@clientops.dev"
                  {...register('email')}
                />
                <FieldError errors={errors.email ? [errors.email] : undefined} />
              </Field>

              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                />
                <FieldError errors={errors.password ? [errors.password] : undefined} />
              </Field>
            </FieldGroup>

            {formError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{formError}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>

        <div className="mt-6 w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Demo Credentials</h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Try any role below — all three share the password{' '}
            <code className="rounded bg-gray-200/70 px-1 py-0.5 font-mono dark:bg-slate-800">
              {DEMO_PASSWORD}
            </code>
            .
          </p>

          <ul className="mt-3 space-y-2">
            {demoAccounts.map((account) => (
              <li
                key={account.email}
                className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100">{account.role}</div>
                  <div className="truncate text-xs text-gray-500 dark:text-gray-400">{account.email}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:border-indigo-500/30 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                  onClick={() => fillDemoCredentials(account.email)}
                >
                  Use this
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
