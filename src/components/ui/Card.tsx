import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  footer?: ReactNode
}

export function Card({ title, footer, className = '', children, ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`} {...props}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  )
}
