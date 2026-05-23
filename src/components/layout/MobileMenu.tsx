import { useEffect } from 'react'

import { AppSidebar } from '@/components/layout/AppSidebar'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 animate-in fade-in"
        aria-label="Close menu"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-y-0 left-0 w-[min(100%,20rem)] shadow-xl',
          'animate-in slide-in-from-left duration-200',
        )}
      >
        <AppSidebar onNavigate={onClose} />
      </div>
    </div>
  )
}
