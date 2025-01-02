'use client'

import { useAuth } from '@/hooks/useAuth'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: React.ReactNode
  onCategorySelect: (categoryId: string | null) => void
  selectedCategory: string | null
}

export default function AppLayout({ 
  children, 
  onCategorySelect,
  selectedCategory 
}: AppLayoutProps) {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userName={profile?.full_name || 'User'} />
      <div className="flex">
        <Sidebar 
          onCategorySelect={onCategorySelect} 
          selectedCategory={selectedCategory}
        />
        <main className="flex-1 p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
} 