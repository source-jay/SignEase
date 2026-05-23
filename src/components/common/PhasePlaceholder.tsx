import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'

interface PhasePlaceholderProps {
  icon: LucideIcon
  title: string
  description: string
  phase: string
}

export function PhasePlaceholder({
  icon,
  title,
  description,
  phase,
}: PhasePlaceholderProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          action={
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
              Coming in {phase}
            </span>
          }
        />
      </CardContent>
    </Card>
  )
}
