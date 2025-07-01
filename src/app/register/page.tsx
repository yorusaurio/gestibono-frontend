'use client'

import RegisterForm from '@/components/RegisterForm'

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-6 py-12">
      <div className="w-full max-w-7xl">
        <RegisterForm />
      </div>
    </main>
  )
}
