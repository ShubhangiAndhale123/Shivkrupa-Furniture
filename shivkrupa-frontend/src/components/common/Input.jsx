import React from 'react'
import { cn } from '../../utils/helpers'

const Input = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  containerClassName,
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
      <input
        ref={ref}
        className={cn(
          'input-field',
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

Input.displayName = 'Input'
export default Input
