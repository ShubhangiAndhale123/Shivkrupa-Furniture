import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils/helpers'

const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  className,
  containerClassName,
  placeholder = 'Select an option',
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
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'input-field appearance-none pr-10',
            error && 'border-red-300 focus:ring-red-200 focus:border-red-300',
            className
          )}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400 pointer-events-none" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="text-sm text-charcoal-500">{helperText}</p>}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
