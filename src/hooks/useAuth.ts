import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  console.log('Auth Context State:', {
    hasUser: !!context.user,
    userDetails: context.user ? {
      id: context.user.id,
      email: context.user.email,
      role: context.user.role
    } : null,
    hasProfile: !!context.profile,
    profileDetails: context.profile ? {
      id: context.profile.id,
      fullName: context.profile.full_name
    } : null,
    isLoading: context.loading
  })

  return context
} 