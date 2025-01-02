import { supabase } from '@/lib/supabase/client'
import { Task, TaskInput, TaskAttachment } from '@/types'
import { RealtimeChannel } from '@supabase/supabase-js'

export class TaskService {
  private realtimeChannel: RealtimeChannel | null = null

  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(id, name),
        attachments:task_attachments(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async createTask(taskData: TaskInput): Promise<Task> {
    const { data, error } = await supabase.from('tasks').insert(taskData).select().single()
    if (error) throw error
    return data
  }

  async updateTask(taskId: string, userId: string, updates: Partial<TaskInput>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', userId)
      .select(`
        *,
        category:categories(id, name)
      `)
      .single()

    if (error) throw error
    return data
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId)

    if (error) throw error
  }

  async updateTaskStatus(taskId: string, userId: string, status: Task['status']): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTasksByCategory(userId: string, categoryId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        category:categories(id, name),
        attachments:task_attachments(*)
      `)
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  subscribeToTasks(userId: string, onChange: (payload: {
    new: Task | null
    old: Task | null
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  }) => void) {
    this.realtimeChannel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          onChange({
            new: payload.new as Task,
            old: payload.old as Task,
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          })
        }
      )
      .subscribe()

    return () => {
      if (this.realtimeChannel) {
        supabase.removeChannel(this.realtimeChannel)
      }
    }
  }

  async uploadTaskFile(taskId: string, file: File, userId: string): Promise<TaskAttachment> {
    const filePath = `${userId}/${taskId}/${file.name}`
    
    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('task-manager-task-attachments')
      .upload(filePath, file)
    if (uploadError) throw uploadError

    // Create attachment record
    const { data: attachment, error: attachmentError } = await supabase
      .from('task_attachments')
      .insert({
        task_id: taskId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        user_id: userId
      })
      .select()
      .single()
    
    if (attachmentError) {
      // If attachment record creation fails, delete the uploaded file
      await supabase.storage
        .from('task-manager-task-attachments')
        .remove([filePath])
      throw attachmentError
    }

    return attachment
  }

  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
    if (error) throw error
    return data
  }

  async deleteTaskAttachment(attachmentId: string, userId: string): Promise<void> {
    // Get the attachment first to get the file path
    const { data: attachment, error: fetchError } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('task-manager-task-attachments')
      .remove([attachment.file_path])

    if (storageError) throw storageError

    // Delete the attachment record
    const { error: deleteError } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachmentId)
      .eq('user_id', userId)

    if (deleteError) throw deleteError
  }

  async getSignedUrl(filePath: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from('task-manager-task-attachments')
      .createSignedUrl(filePath, 3600)
    if (error) throw error
    return data.signedUrl
  }
} 