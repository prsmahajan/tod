'use client'

import React, { useRef, useState, useCallback } from 'react'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  hoverColor?: string
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'md', hoverColor, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [rippleStyle, setRippleStyle] = useState<React.CSSProperties>({})
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setRippleStyle({
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%) scale(0)',
      })

      // Trigger animation on next frame
      requestAnimationFrame(() => {
        setRippleStyle({
          left: `${x}px`,
          top: `${y}px`,
          transform: 'translate(-50%, -50%) scale(2.5)',
        })
        setIsHovering(true)
      })
    }, [])

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setRippleStyle({
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%) scale(0)',
      })
      setIsHovering(false)
    }, [])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current
      if (!button || !isHovering) return

      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setRippleStyle(prev => ({
        ...prev,
        left: `${x}px`,
        top: `${y}px`,
      }))
    }, [isHovering])

    // Variant styles
    const variantStyles = {
      primary: {
        base: 'bg-[var(--color-text-primary)] text-[var(--color-bg)]',
        ripple: hoverColor || 'rgba(255,255,255,0.2)',
      },
      secondary: {
        base: 'bg-[var(--color-card-bg)] text-[var(--color-text-primary)] border border-[var(--color-border)]',
        ripple: hoverColor || 'var(--color-text-primary)',
      },
      outline: {
        base: 'bg-transparent text-[var(--color-text-primary)] border border-[var(--color-border)]',
        ripple: hoverColor || 'var(--color-text-primary)',
      },
      ghost: {
        base: 'bg-transparent text-[var(--color-text-secondary)]',
        ripple: hoverColor || 'var(--color-border)',
      },
    }

    // Size styles
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-5 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    }

    const currentVariant = variantStyles[variant]

    return (
      <button
        ref={(node) => {
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        className={`
          relative overflow-hidden rounded-full font-medium
          transition-all duration-500 ease-out
          cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
          ${currentVariant.base}
          ${sizeStyles[size]}
          ${className}
        `}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        {...props}
      >
        {/* Ripple effect */}
        <span
          className="absolute rounded-full pointer-events-none transition-transform duration-500 ease-out"
          style={{
            ...rippleStyle,
            width: '100%',
            height: '100%',
            aspectRatio: '1',
            background: variant === 'primary'
              ? 'rgba(255,255,255,0.15)'
              : `color-mix(in srgb, ${currentVariant.ripple} 10%, transparent)`,
            opacity: isHovering ? 1 : 0,
          }}
        />
        {/* Content */}
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

MagneticButton.displayName = 'MagneticButton'

export { MagneticButton }
