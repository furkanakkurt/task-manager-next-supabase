'use client'

import { useEffect, useState } from 'react'
import { Task } from '@/types'

interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning'
  timestamp: Date
}

interface TaskNotificationProps {
  notification: Notification
  onDismiss: (id: string) => void
}

export function TaskNotification({ notification, onDismiss }: TaskNotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onDismiss(notification.id)
    }, 5000)

    return () => clearTimeout(timer)
  }, [notification.id, onDismiss])

  const bgColor = {
    success: 'bg-green-50 text-green-800',
    info: 'bg-blue-50 text-blue-800',
    warning: 'bg-yellow-50 text-yellow-800',
  }[notification.type]

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${bgColor} transition-opacity duration-300`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{notification.message}</p>
        <button
          onClick={() => onDismiss(notification.id)}
          className="ml-4 text-sm font-medium hover:opacity-75"
        >
          Dismiss
        </button>
      </div>
      <p className="text-xs mt-1 opacity-75">
        {notification.timestamp.toLocaleTimeString()}
      </p>
    </div>
  )
}

export function createTaskNotification(
  task: Task,
  eventType: 'INSERT' | 'UPDATE' | 'DELETE'
): Notification {
  const action = {
    INSERT: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
  }[eventType]

  return {
    id: Math.random().toString(36).substr(2, 9),
    message: `Task "${task.title}" has been ${action}`,
    type: eventType === 'DELETE' ? 'warning' : 'success',
    timestamp: new Date(),
  }
} 