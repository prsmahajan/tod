'use client'

import { Toaster as Sonner } from 'sonner'

const ThemedToaster = () => {
  return (
    <Sonner
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
        },
        className: 'themed-toast',
        descriptionClassName: 'text-[var(--color-text-secondary)]',
      }}
      style={{
        '--normal-bg': 'var(--color-card-bg)',
        '--normal-border': 'var(--color-border)',
        '--normal-text': 'var(--color-text-primary)',
        '--success-bg': 'var(--color-card-bg)',
        '--success-border': 'rgb(34 197 94 / 0.3)',
        '--success-text': 'rgb(34 197 94)',
        '--error-bg': 'var(--color-card-bg)',
        '--error-border': 'rgb(239 68 68 / 0.3)',
        '--error-text': 'rgb(239 68 68)',
        '--warning-bg': 'var(--color-card-bg)',
        '--warning-border': 'rgb(234 179 8 / 0.3)',
        '--warning-text': 'rgb(234 179 8)',
      } as React.CSSProperties}
    />
  )
}

export { ThemedToaster }
