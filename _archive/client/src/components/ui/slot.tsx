import React from 'react'

interface SlotProps {
  children?: React.ReactNode
  className?: string
}

export const Slot = React.forwardRef<HTMLDivElement, SlotProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }
)

Slot.displayName = "Slot"
