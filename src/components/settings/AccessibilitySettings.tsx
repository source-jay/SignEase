import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { usePreferences } from '@/contexts/PreferencesContext'
import type { UserPreferences } from '@/types'
export function AccessibilitySettings() {
  const { preferences, updatePreferences, isSaving } = usePreferences()

  const setTheme = (theme: UserPreferences['theme']) => {
    void updatePreferences({ theme })
  }

  return (
    <div className="space-y-8">
      <fieldset className="space-y-3">
        <legend className="text-base font-semibold">Theme</legend>
        <p className="text-sm text-muted-foreground">
          Choose light, dark, or match your device
        </p>
        <div className="flex flex-wrap gap-2">
          {(['light', 'dark', 'system'] as const).map((value) => (
            <Button
              key={value}
              type="button"
              variant={preferences.theme === value ? 'default' : 'outline'}
              className="h-11 capitalize"
              onClick={() => setTheme(value)}
              disabled={isSaving}
            >
              {value}
            </Button>
          ))}
        </div>
      </fieldset>

      <div className="flex items-start gap-3 rounded-lg border border-border p-4">
        <Checkbox
          id="high-contrast"
          checked={preferences.highContrast}
          onCheckedChange={(checked) =>
            void updatePreferences({ highContrast: checked === true })
          }
          disabled={isSaving}
        />
        <div>
          <Label htmlFor="high-contrast" className="text-base">
            High contrast mode
          </Label>
          <p className="mt-1 text-sm text-muted-foreground">
            Increases contrast for better visibility (WCAG-friendly)
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="font-scale" className="text-base font-semibold">
          Text size — {preferences.fontScale.toFixed(1)}×
        </Label>
        <p className="text-sm text-muted-foreground">
          Scale interface text for readability
        </p>
        <input
          id="font-scale"
          type="range"
          min={0.9}
          max={1.4}
          step={0.1}
          value={preferences.fontScale}
          onChange={(e) =>
            void updatePreferences({ fontScale: Number(e.target.value) })
          }
          disabled={isSaving}
          className="h-3 w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Smaller</span>
          <span>Larger</span>
        </div>
      </div>

      {isSaving && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Saving preferences…
        </p>
      )}
    </div>
  )
}
