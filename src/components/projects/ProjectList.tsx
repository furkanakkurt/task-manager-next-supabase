'use client'

import { useState, useEffect } from 'react'
import { Project, ProjectInput } from '@/types'
import { ProjectService } from '@/lib/services/projectService'
import { useAuth } from '@/hooks/useAuth'
import ProjectForm from './ProjectForm'
import { useRouter } from 'next/navigation'

const projectService = new ProjectService()

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function ProjectList() {
  const { user } = useAuth()
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | undefined>()

  useEffect(() => {
    loadProjects()
  }, [])

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

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const updatedProject = await projectService.updateProject(projectId, { status: newStatus })
      setProjects(projects.map(p => p.id === projectId ? updatedProject : p))
    } catch (err) {
      console.error('Error updating project status:', err)
    }
  }

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await projectService.deleteProject(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('Error deleting project:', err)
    }
  }

  const handleCreateProject = async (data: ProjectInput) => {
    const newProject = await projectService.createProject(data)
    setProjects([newProject, ...projects])
  }

  const handleUpdateProject = async (data: ProjectInput) => {
    if (!editingProject) return
    const updatedProject = await projectService.updateProject(editingProject.id, data)
    setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p))
  }

  const openCreateForm = () => {
    setEditingProject(undefined)
    setIsFormOpen(true)
  }

  const openEditForm = (project: Project) => {
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingProject(undefined)
  }

  const navigateToProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (loading) return <div className="text-center py-4">Loading projects...</div>
  if (error) return <div className="text-red-600 text-center py-4">{error}</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No projects yet. Create your first project to get started!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigateToProject(project.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={project.status}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleStatusChange(project.id, e.target.value as Project['status'])
                    }}
                    className={`text-sm rounded-full px-3 py-1 font-medium ${statusColors[project.status]}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'No description provided'}
              </p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      openEditForm(project)
                    }}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(project.id)
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectForm
        isOpen={isFormOpen}
        onCancel={closeForm}
        onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
        initialData={editingProject}
      />
    </div>
  )
} 