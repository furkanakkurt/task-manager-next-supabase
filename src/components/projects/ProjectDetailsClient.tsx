'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Project, Task, TaskInput } from '@/types'
import { ProjectService } from '@/lib/services/projectService'
import { TaskService } from '@/lib/services/taskService'
import { CategoryService } from '@/lib/services/categoryService'
import AppLayout from '@/components/layout/AppLayout'
import TaskList from '@/components/tasks/TaskList'
import ProjectForm from '@/components/projects/ProjectForm'
import TaskForm from '@/components/tasks/TaskForm'
import ConfirmDialog from '@/components/common/ConfirmDialog'
import LoadingSpinner from '@/components/common/LoadingSpinner'

const projectService = new ProjectService()
const taskService = new TaskService()
const categoryService = new CategoryService()

interface ProjectDetailsClientProps {
  projectId: string
}

const statusColors = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800'
}

export default function ProjectDetailsClient({ projectId }: ProjectDetailsClientProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditFormOpen, setIsEditFormOpen] = useState(false)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [selectedStatus, setSelectedStatus] = useState<Task['status'] | 'all'>('all')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (!user) return
    
    const loadData = async () => {
      setLoading(true)
      try {
        const [projectData, projectTasks, categoriesData] = await Promise.all([
          projectService.getProject(projectId),
          projectService.getProjectTasks(projectId),
          categoryService.getCategories(user.id)
        ])

        if (!projectData) {
          setError('Project not found')
          return
        }

        setProject(projectData)
        setTasks(projectTasks)
        setCategories(categoriesData)
      } catch (err) {
        setError('Failed to load project')
        console.error('Error loading project:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to project changes
    const projectSubscription = projectService.subscribeToProjects((payload) => {
      if (payload.new?.id === projectId) {
        setProject(payload.new as Project)
      }
    })

    // Subscribe to task changes for this project
    const taskSubscription = projectService.subscribeToProjectTasks(projectId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setTasks((prev) => [payload.new as Task, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setTasks((prev) =>
          prev.map((task) => (task.id === payload.new.id ? payload.new as Task : task))
        )
      } else if (payload.eventType === 'DELETE') {
        setTasks((prev) => prev.filter((task) => task.id !== payload.old.id))
      }
    })

    return () => {
      projectSubscription.unsubscribe()
      taskSubscription.unsubscribe()
    }
  }, [projectId, user])

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project || !user) return

    try {
      const updatedProject = await projectService.updateProject(project.id, {
        ...project,
        status: newStatus
      })
      setProject(updatedProject)
    } catch (err) {
      console.error('Error updating project status:', err)
    }
  }

  const handleProjectUpdate = async (data: Partial<Project>) => {
    if (!project || !user) return

    try {
      const updatedProject = await projectService.updateProject(project.id, data)
      setProject(updatedProject)
      setIsEditFormOpen(false)
    } catch (err) {
      console.error('Error updating project:', err)
    }
  }

  const handleProjectDelete = async () => {
    if (!project || !user) return

    try {
      await projectService.deleteProject(project.id)
      router.push('/projects')
    } catch (err) {
      console.error('Error deleting project:', err)
    }
  }

  const handleTaskCreate = async (taskData: TaskInput) => {
    if (!user || !project) return

    try {
      await taskService.createTask({
        ...taskData,
        project_id: project.id,
        user_id: user.id
      })
      setIsTaskFormOpen(false)
    } catch (err) {
      console.error('Error creating task:', err)
    }
  }

  const filteredTasks = tasks.filter(task => 
    selectedStatus === 'all' ? true : task.status === selectedStatus
  )

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'completed').length,
    inProgress: tasks.filter(task => task.status === 'in_progress').length,
    todo: tasks.filter(task => task.status === 'pending').length,
  }

  const progressPercentage = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  return (
    <AppLayout onCategorySelect={() => {}} selectedCategory={null}>
      {loading ? (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : error ? (
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
          <div className="text-red-600 text-center">
            <p className="text-xl font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : project ? (
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="mt-2 text-gray-600">{project.description}</p>
              <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-gray-500">Progress:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 w-48">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-700 font-medium">{progressPercentage}%</span>
                </div>
                <div className="mt-2 flex space-x-4 text-sm">
                  <span className="text-gray-500">Tasks:</span>
                  <span className="text-gray-700">{taskStats.total} total</span>
                  <span className="text-green-700">{taskStats.completed} completed</span>
                  <span className="text-blue-700">{taskStats.inProgress} in progress</span>
                  <span className="text-gray-700">{taskStats.todo} to do</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={project.status}
                onChange={(e) => handleStatusChange(e.target.value as Project['status'])}
                className={`text-sm rounded-full px-3 py-1 font-medium ${
                  statusColors[project.status]
                }`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setIsEditFormOpen(true)}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Edit Project
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-800"
              >
                Delete Project
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as Task['status'] | 'all')}
                  className="text-sm rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Done</option>
                </select>
              </div>
              <button
                onClick={() => setIsTaskFormOpen(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Task
              </button>
            </div>

            <TaskList
              tasks={filteredTasks}
              categories={categories}
              onStatusChange={(taskId, status) => {
                taskService.updateTaskStatus(taskId, user!.id, status)
              }}
              onDelete={(taskId) => {
                taskService.deleteTask(taskId, user!.id)
              }}
              onEdit={(task) => {
                // Handle edit task
              }}
            />
          </div>

          {isEditFormOpen && (
            <ProjectForm
              isOpen={isEditFormOpen}
              onCancel={() => setIsEditFormOpen(false)}
              onSubmit={handleProjectUpdate}
              initialData={project}
            />
          )}

          {isTaskFormOpen && (
            <TaskForm
              isOpen={isTaskFormOpen}
              onCancel={() => setIsTaskFormOpen(false)}
              onSubmit={handleTaskCreate}
              categories={categories}
              projectId={project.id}
            />
          )}

          <ConfirmDialog
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleProjectDelete}
            title="Delete Project"
            message="Are you sure you want to delete this project? This action cannot be undone."
            confirmText="Delete"
          />
        </div>
      ) : null}
    </AppLayout>
  )
} 