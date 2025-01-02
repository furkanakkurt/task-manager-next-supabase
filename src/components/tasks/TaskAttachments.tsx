'use client'

import { useState } from 'react'
import { TaskAttachment } from '@/types'
import { FileService } from '@/lib/services/fileService'

const fileService = new FileService()

interface TaskAttachmentsProps {
  taskId: string
  userId: string
  attachments: TaskAttachment[]
  onAttachmentAdded: (attachment: TaskAttachment) => void
  onAttachmentDeleted: (attachmentId: string) => void
}

export default function TaskAttachments({
  taskId,
  userId,
  attachments,
  onAttachmentAdded,
  onAttachmentDeleted,
}: TaskAttachmentsProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const attachment = await fileService.uploadFile(taskId, userId, file)
      onAttachmentAdded(attachment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (attachment: TaskAttachment) => {
    try {
      await fileService.deleteAttachment(attachment)
      onAttachmentDeleted(attachment.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Attachments
        </label>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            {uploading ? 'Uploading...' : 'Add File'}
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {attachments.length > 0 && (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-md">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="flex items-center justify-between py-3 px-4 hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-800 truncate"
                  >
                    {attachment.file_name}
                  </a>
                  <span className="text-xs text-gray-500">
                    ({formatFileSize(attachment.file_size)})
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Added {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(attachment)}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
} 