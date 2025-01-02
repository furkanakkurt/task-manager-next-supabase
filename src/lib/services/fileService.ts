import { supabase } from '@/lib/supabase/client'
import { TaskAttachment } from '@/types'

export class FileService {
  private BUCKET_NAME = 'task-manager-task-attachments'

  async uploadFile(
    taskId: string,
    userId: string,
    file: File
  ): Promise<TaskAttachment> {
    // Generate a unique file path
    const filePath = `${userId}/${taskId}/${Date.now()}-${file.name}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(filePath)

    // Create attachment record
    const { data, error } = await supabase
      .from('task_attachments')
      .insert([
        {
          task_id: taskId,
          user_id: userId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          url: publicUrl,
        },
      ])
      .select()
      .single()

    if (error) {
      // If record creation fails, delete the uploaded file
      await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath])
      throw error
    }

    return data
  }

  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async deleteAttachment(attachment: TaskAttachment): Promise<void> {
    // Delete file from storage
    const { error: deleteFileError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([attachment.file_path])

    if (deleteFileError) throw deleteFileError

    // Delete record from database
    const { error: deleteRecordError } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', attachment.id)

    if (deleteRecordError) throw deleteRecordError
  }
} 