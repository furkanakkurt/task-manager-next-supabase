'use client'

import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
  userName: string
}

export default function Navbar({ userName }: NavbarProps) {
  const { signOut } = useAuth()

  return (
    <nav className="bg-white shadow-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-gray-900 font-medium">Welcome, {userName}</span>
            <button
              onClick={() => signOut()}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 