import React from 'react'
import { cn, getStatusColor } from '../../utils/helpers'

const Badge = ({ children, status, className, variant }) => {
  if (status) {
    return (
      <span className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        getStatusColor(status),
        className
      )}>
        {children}
      </span>
    )
  }

  const variants = {
    primary: 'bg-charcoal-800 text-white',
    secondary: 'bg-charcoal-100 text-charcoal-700',
    accent: 'bg-amber-accent text-white',
    outline: 'border border-charcoal-300 text-charcoal-600',
  }

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant] || variants.secondary,
      className
    )}>
      {children}
    </span>
  )
}

export default Badge
