import { Database } from './database.types'

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Derived types
export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  category_id: string | null
  project_id: string
  user_id: string
  created_at: string
  updated_at: string
  attachments?: TaskAttachment[]
}

export type TaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  user_id: string
  created_at: string
  updated_at: string
}

export type ProjectInput = Omit<Project, 'id' | 'created_at' | 'updated_at'>

export interface TaskAttachment {
  id: string
  task_id: string
  file_name: string
  file_path: string
  file_type: string
  created_at: string
  url?: string
}

// Task status and priority types
export type TaskStatus = Task['status']
export type TaskPriority = Task['priority']

// Form input types
export type CategoryInput = Omit<Category, 'id' | 'created_at' | 'updated_at'>

// State types
export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  categoryId?: string
  searchQuery?: string
  startDate?: string
  endDate?: string
}

export interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  timestamp: Date
} 