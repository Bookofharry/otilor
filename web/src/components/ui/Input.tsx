import { forwardRef, useId } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const generatedId = useId()
    const inputId = props.id || generatedId
    const errorId = error ? `${inputId}-error` : undefined
    const helperId = helperText ? `${inputId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

    const inputClasses = `input ${error ? 'input--error' : ''} ${className}`.trim()

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={inputId} className="form-field__label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          {...props}
        />
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

Input.displayName = 'Input'

export default Input
export type { InputProps }
