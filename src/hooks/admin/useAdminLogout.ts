'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export function useAdminLogout() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return { handleLogout }
}