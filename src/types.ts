export interface TaskInput {
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  due_date: string
  category_id: string | null
  project_id: string | null
  user_id: string
}

export interface Task extends Omit<TaskInput, 'project_id'> {
  id: string
  project_id: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProjectInput {
  name: string
  description: string | null
  status: Project['status']
  user_id: string
} 