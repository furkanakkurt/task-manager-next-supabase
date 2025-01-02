'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { ProjectService } from '@/lib/services/projectService'
import { useAuth } from '@/hooks/useAuth'
import AppLayout from '@/components/layout/AppLayout'
import ProjectForm from '@/components/projects/ProjectForm'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import Link from 'next/link'

const projectService = new ProjectService()

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function ProjectsPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)

  useEffect(() => {
    if (!user) return

    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects()
        setProjects(data)
      } catch (err) {
        setError('Failed to load projects')
        console.error('Error loading projects:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProjects()

    // Subscribe to project changes
    const subscription = projectService.subscribeToProjects((payload) => {
      if (payload.eventType === 'INSERT') {
        setProjects((prev) => [payload.new as Project, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setProjects((prev) =>
          prev.map((project) => (project.id === payload.new.id ? payload.new as Project : project))
        )
      } else if (payload.eventType === 'DELETE') {
        setProjects((prev) => prev.filter((project) => project.id !== payload.old.id))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const handleCreateProject = async (data: Partial<Project>) => {
    if (!user) return

    try {
      await projectService.createProject({
        ...data,
        user_id: user.id,
      })
      setIsCreateFormOpen(false)
    } catch (err) {
      console.error('Error creating project:', err)
    }
  }

  if (loading) {
    return (
      <AppLayout onCategorySelect={() => {}} selectedCategory={null}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout onCategorySelect={() => {}} selectedCategory={null}>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout onCategorySelect={() => {}} selectedCategory={null}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <button
            onClick={() => setIsCreateFormOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Project
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block group"
            >
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600">
                    {project.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                <div className="mt-4 text-sm text-gray-500">
                  Created {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {isCreateFormOpen && (
          <ProjectForm
            isOpen={isCreateFormOpen}
            onCancel={() => setIsCreateFormOpen(false)}
            onSubmit={handleCreateProject}
          />
        )}
      </div>
    </AppLayout>
  )
} 