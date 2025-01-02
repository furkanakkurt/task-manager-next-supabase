'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Task, Category } from '@/types'
import { TaskService } from '@/lib/services/taskService'
import { CategoryService } from '@/lib/services/categoryService'
import TaskList from '@/components/tasks/TaskList'
import TaskForm from '@/components/tasks/TaskForm'
import AppLayout from '@/components/layout/AppLayout'

const taskService = new TaskService()
const categoryService = new CategoryService()

export default function Home() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [tasksData, categoriesData] = await Promise.all([
          selectedCategory
            ? taskService.getTasksByCategory(user.id, selectedCategory)
            : taskService.getTasks(user.id),
          categoryService.getCategories(user.id)
        ])

        setTasks(tasksData)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Subscribe to task changes
    const unsubscribe = taskService.subscribeToTasks(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setTasks((prev) => [payload.new as Task, ...prev])
      } else if (payload.eventType === 'UPDATE') {
        setTasks((prev) =>
          prev.map((task) => (task.id === payload.new?.id ? payload.new as Task : task))
        )
      } else if (payload.eventType === 'DELETE') {
        setTasks((prev) => prev.filter((task) => task.id !== payload.old?.id))
      }
    })

    return () => {
      unsubscribe()
    }
  }, [user, selectedCategory])

  const handleCreateTask = async (taskData: any) => {
    if (!user) return

    try {
      await taskService.createTask({
        ...taskData,
        user_id: user.id
      })
      setIsTaskFormOpen(false)
    } catch (error) {
      console.error('Error creating task:', error)
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!user || !editingTask) return

    try {
      await taskService.updateTask(editingTask.id, user.id, {
        ...taskData,
        user_id: user.id
      })
      setEditingTask(undefined)
      setIsTaskFormOpen(false)
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    if (!user) return

    try {
      await taskService.updateTaskStatus(taskId, user.id, status)
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!user) return

    try {
      await taskService.deleteTask(taskId, user.id)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsTaskFormOpen(true)
  }

  return (
    <AppLayout onCategorySelect={setSelectedCategory} selectedCategory={selectedCategory}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <button
            onClick={() => {
              setEditingTask(undefined)
              setIsTaskFormOpen(true)
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            New Task
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            categories={categories}
            onStatusChange={handleUpdateTaskStatus}
            onDelete={handleDeleteTask}
            onEdit={handleEdit}
          />
        )}

        <TaskForm
          isOpen={isTaskFormOpen}
          onCancel={() => {
            setIsTaskFormOpen(false)
            setEditingTask(undefined)
          }}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          categories={categories}
          initialData={editingTask}
        />
      </div>
    </AppLayout>
  )
}
