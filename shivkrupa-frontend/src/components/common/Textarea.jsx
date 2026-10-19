import React from 'react'
import { cn } from '../../utils/helpers'

const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  containerClassName,
  rows = 4,
  ...props
}, ref) => {
  return (
    <div className={cn('space-y-1.5', containerClassName)}>
      {label && (
        <label className="block text-sm font-medium text-charcoal-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          'input-field resize-none',
          error && 'border-red-300 focus:ring-red-200 focus:border-red-300',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-charcoal-500">{helperText}</p>}
    </div>
  )
})

Textarea.displayName = 'Textarea'
export default Textarea
