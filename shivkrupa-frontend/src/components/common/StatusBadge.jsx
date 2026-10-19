import React from 'react'
import { cn, getStatusColor } from '../../utils/helpers'

const StatusBadge = ({ status, className }) => {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
      getStatusColor(status),
      className
    )}>
      {status}
    </span>
  )
}

export default StatusBadge
