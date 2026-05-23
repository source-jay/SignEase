import { ChevronDown, HelpCircle } from 'lucide-react'
import { useState } from 'react'

import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME, APP_VERSION } from '@/utils/constants'
import { cn } from '@/lib/utils'

const faqs = [
  {
    q: 'How do I start translating?',
    a: 'Open the Translate tab and allow camera access when prompted. Full translation arrives in Phase 4–7.',
  },
  {
    q: 'Which sign language is supported?',
    a: 'SignEase launches with American Sign Language (ASL), with more languages planned.',
  },
  {
    q: 'How do I change text size or theme?',
    a: 'Go to Settings from the menu or Profile → Settings to adjust theme, contrast, and text scale.',
  },
  {
    q: 'Can I use SignEase offline?',
    a: 'Basic cached features will work offline in a later phase. You need internet for sign-in and sync.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-base font-medium"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {q}
        <ChevronDown
          className={cn(
            'size-5 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>
      {open && (
        <p className="pb-4 text-muted-foreground animate-in fade-in slide-in-from-top-1">
          {a}
        </p>
      )}
    </div>
  )
}

export function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help & Support"
        description="FAQs, tutorials, and app information"
      />

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <HelpCircle className="size-6" aria-hidden />
            <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          </div>
          {faqs.map((item) => (
            <FaqItem key={item.q} {...item} />
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        {APP_NAME} v{APP_VERSION}
      </p>
    </div>
  )
}
