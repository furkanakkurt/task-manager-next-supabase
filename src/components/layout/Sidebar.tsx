'use client'

import { useState, useEffect } from 'react'
import { Category } from '@/types'
import { CategoryService } from '@/lib/services/categoryService'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categoryService = new CategoryService()

interface SidebarProps {
  onCategorySelect?: (categoryId: string | null) => void
  selectedCategory: string | null
}

export default function Sidebar({ onCategorySelect, selectedCategory }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    if (!user) return
    try {
      const data = await categoryService.getCategories(user.id)
      setCategories(data)
    } catch (err) {
      setError('Failed to load categories')
      console.error('Error loading categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId)
    onCategorySelect?.(categoryId)
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim() || !user) return

    try {
      const newCategory = await categoryService.createCategory({
        name: newCategoryName.trim(),
        user_id: user.id
      })
      setCategories([...categories, newCategory])
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (err) {
      console.error('Error creating category:', err)
    }
  }

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200 p-6">
      <nav className="space-y-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Navigation</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`block px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                  pathname === '/' 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                All Tasks
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className={`block px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                  pathname.startsWith('/projects')
                    ? 'bg-indigo-100 text-indigo-700 font-medium'
                    : 'text-gray-900 hover:bg-gray-100'
                }`}
              >
                Projects
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Categories</h2>
            <button
              onClick={() => setShowNewCategory(true)}
              className="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-100 rounded-md hover:bg-indigo-200 transition-colors duration-200"
            >
              Add New
            </button>
          </div>

          {showNewCategory && (
            <form onSubmit={handleCreateCategory} className="mb-4">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900 placeholder-gray-500 mb-2"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowNewCategory(false)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-sm font-medium text-gray-700">Loading categories...</div>
          ) : error ? (
            <div className="text-sm font-medium text-red-600">{error}</div>
          ) : (
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => handleCategorySelect(null)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                    selectedCategoryId === null
                      ? 'bg-indigo-100 text-indigo-700 font-medium'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                      selectedCategoryId === category.id
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </div>
  )
} 