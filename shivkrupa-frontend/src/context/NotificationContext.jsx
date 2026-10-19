import React, { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Quotation Received',
      message: 'Quotation QT-2026-0012 has been sent for your review.',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: '2',
      title: 'Order Update',
      message: 'Your order ORD-2026-0045 has entered production.',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      title: 'Design Approved',
      message: 'Your wardrobe design has been approved by the design team.',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      {
        id: Date.now().toString(),
        ...notification,
        read: false,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ])
  }, [])

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export default NotificationContext
