import React from 'react'
import { cn } from '../../utils/helpers'

const Card = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('card', className)}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = 'Card'
export default Card
