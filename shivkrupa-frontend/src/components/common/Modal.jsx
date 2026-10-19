import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Modal = ({ isOpen, onClose, title, children, size = 'md', footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={cn(
        'relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden',
        'animate-in fade-in zoom-in-95 duration-200',
        sizes[size]
      )}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal-100">
            <h3 className="text-lg font-semibold text-charcoal-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-charcoal-100 transition-colors"
            >
              <X className="w-5 h-5 text-charcoal-500" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-charcoal-100 bg-charcoal-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
