import { forwardRef, useId } from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const generatedId = useId()
    const textareaId = props.id || generatedId
    const errorId = error ? `${textareaId}-error` : undefined
    const helperId = helperText ? `${textareaId}-helper` : undefined
    const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined

    const textareaClasses = `input ${error ? 'input--error' : ''} ${className}`.trim()

    return (
      <div className="form-field">
        {label && (
          <label htmlFor={textareaId} className="form-field__label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={textareaClasses}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          rows={props.rows || 4}
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

TextArea.displayName = 'TextArea'

export default TextArea
export type { TextAreaProps }
