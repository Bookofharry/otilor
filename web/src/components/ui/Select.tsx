import { forwardRef, useId } from 'react'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  onChange?: (value: string) => void
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, onChange, className = '', ...props }, ref) => {
    const generatedId = useId()
    const selectId = props.id || generatedId
    const errorId = error ? `${selectId}-error` : undefined
    const helperId = helperText ? `${selectId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

    const selectClasses = `input ${error ? 'input--error' : ''} ${className}`.trim()

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value)
    }

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={selectId} className="form-field__label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectClasses}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          onChange={handleChange}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={errorId} className="form-field__error" role="alert">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span id={helperId} className="form-field__helper">
            {helperText}
          </span>
        )}
      </div>
    )
  },
)

Select.displayName = 'Select'

export default Select
export type { SelectProps, SelectOption }
