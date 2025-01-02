'use client'

import { useState, useEffect } from 'react'
import { Task, Category, TaskAttachment } from '@/types'
import { TaskService } from '@/lib/services/taskService'
import { useAuth } from '@/hooks/useAuth'
import { FiPaperclip, FiTrash2, FiEdit2, FiFile } from 'react-icons/fi'

const taskService = new TaskService()

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  onEdit: (task: Task) => void
}

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'pending':
      return 'bg-gray-100 text-gray-800'
  }
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) {
    return '🖼️'
  } else if (fileType === 'application/pdf') {
    return '📄'
  } else {
    return '📎'
  }
}

export default function TaskList({
  tasks,
  categories,
  onStatusChange,
  onDelete,
  onEdit
}: TaskListProps) {
  const { user } = useAuth()
  const [uploadingTaskId, setUploadingTaskId] = useState<string | null>(null)
  const [signedUrls, setSignedUrls] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    const loadSignedUrls = async () => {
      const urls: { [key: string]: string } = {}
      for (const task of tasks) {
        if (task.attachments) {
          for (const attachment of task.attachments) {
            try {
              const signedUrl = await taskService.getSignedUrl(attachment.file_path)
              urls[attachment.id] = signedUrl
            } catch (err) {
              console.error('Error getting signed URL:', err)
            }
          }
        }
      }
      setSignedUrls(urls)
    }

    loadSignedUrls()
  }, [tasks])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    try {
      setUploadingTaskId(taskId)
      await taskService.uploadTaskFile(taskId, file, user.id)
    } catch (error) {
      console.error('Error uploading file:', error)
    } finally {
      setUploadingTaskId(null)
    }
  }

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null
    return categories.find(cat => cat.id === categoryId)?.name
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center space-x-3">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
                  className={`rounded-lg text-sm font-medium px-3 py-1.5 border-0 focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${getStatusColor(task.status)}`}
                >
                  <option value="pending">TO DO</option>
                  <option value="in_progress">IN PROGRESS</option>
                  <option value="completed">COMPLETED</option>
                </select>
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {task.title}
                </h3>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center space-x-4 text-sm">
                {task.due_date && (
                  <p className={`${
                    new Date(task.due_date) < new Date() && task.status !== 'completed'
                      ? 'text-red-600 font-medium'
                      : 'text-gray-500'
                  }`}>
                    Due: {new Date(task.due_date).toLocaleDateString()}
                  </p>
                )}
                {getCategoryName(task.category_id) && (
                  <p className="text-gray-500">
                    Category: <span className="font-medium text-gray-700">{getCategoryName(task.category_id)}</span>
                  </p>
                )}
                <div className="flex items-center space-x-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      data-task-id={task.id}
                      onChange={(e) => handleFileChange(e, task.id)}
                      accept="image/*,.pdf"
                    />
                    <button
                      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                        uploadingTaskId === task.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100'
                      }`}
                      onClick={() => {
                        const input = document.querySelector(`input[type="file"][data-task-id="${task.id}"]`) as HTMLInputElement
                        if (input) input.click()
                      }}
                      disabled={uploadingTaskId === task.id}
                    >
                      <FiPaperclip className="w-4 h-4 mr-1" />
                      {uploadingTaskId === task.id ? 'Uploading...' : 'Attach'}
                    </button>
                  </label>
                </div>
              </div>
              {task.attachments && task.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Attachments:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.attachments.map((attachment) => {
                      const signedUrl = signedUrls[attachment.id]
                      if (!signedUrl) return null

                      return (
                        <a
                          key={attachment.id}
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative"
                        >
                          {attachment.file_type.startsWith('image/') ? (
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:border-indigo-500 transition-colors">
                              <img
                                src={signedUrl}
                                alt={attachment.file_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors flex items-center justify-center bg-gray-50">
                              <span className="text-2xl">{getFileIcon(attachment.file_type)}</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity truncate">
                            {attachment.file_name}
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="ml-4 flex items-center space-x-3">
              <button
                onClick={() => onEdit(task)}
                className="px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 