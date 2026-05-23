import {
  Calendar,
  Check,
  ClipboardCopy,
  Clock,
  Download,
  Edit2,
  FileDown,
  FileText,
  Filter,
  Heart,
  Info,
  RotateCcw,
  Save,
  Search,
  Star,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTranslationHistory } from '@/hooks/useTranslationHistory'
import { useTextToSpeech } from '@/hooks/useTextToSpeech'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'favorites' | 'offline'

export function HistoryPage() {
  const history = useTranslationHistory()
  const tts = useTextToSpeech()

  // ── State ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState('')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // ── Search & Filter Logic ────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let result = history.records

    // Apply Filter Tab
    if (activeFilter === 'favorites') {
      result = result.filter(r => r.is_favorite)
    } else if (activeFilter === 'offline') {
      result = result.filter(r => r.id.startsWith('offline-'))
    }

    // Apply Search Query
    const query = searchQuery.trim().toLowerCase()
    if (query) {
      result = result.filter(
        record =>
          record.sentence.toLowerCase().includes(query) ||
          record.words.some(word => word.toLowerCase().includes(query)) ||
          record.notes.toLowerCase().includes(query),
      )
    }

    return result
  }, [history.records, activeFilter, searchQuery])

  // ── Actions ──────────────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (confirm('Are you sure you want to delete this translation?')) {
        await history.remove(id)
      }
    },
    [history],
  )

  const handleClearAll = useCallback(async () => {
    if (
      confirm(
        'Are you sure you want to delete all translation history in this view? This cannot be undone.',
      )
    ) {
      await history.clear()
    }
  }, [history])

  const toggleFavorite = useCallback(
    async (id: string, currentVal: boolean) => {
      await history.update(id, { is_favorite: !currentVal })
    },
    [history],
  )

  // ── Notes Editing ────────────────────────────────────────────────────────
  const startEditingNote = useCallback((id: string, currentNote: string) => {
    setEditingNoteId(id)
    setNoteDraft(currentNote)
  }, [])

  const saveNote = useCallback(
    async (id: string) => {
      await history.update(id, { notes: noteDraft.trim() })
      setEditingNoteId(null)
      setNoteDraft('')
    },
    [history, noteDraft],
  )

  const cancelEditingNote = useCallback(() => {
    setEditingNoteId(null)
    setNoteDraft('')
  }, [])

  // ── Export Functionality ──────────────────────────────────────────────────
  const exportAsJSON = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredRecords, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `signease_history_${activeFilter}_export.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setShowExportMenu(false)
  }, [filteredRecords, activeFilter])

  const exportAsCSV = useCallback(() => {
    const headers = ['ID', 'Date', 'Sentence', 'Words', 'Duration (Seconds)', 'Favorite', 'Notes']
    const rows = filteredRecords.map(r => [
      r.id,
      r.created_at,
      `"${r.sentence.replace(/"/g, '""')}"`,
      `"${r.words.join(', ')}"`,
      r.duration_seconds,
      r.is_favorite ? 'Yes' : 'No',
      `"${r.notes.replace(/"/g, '""')}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', encodedUri)
    downloadAnchor.setAttribute('download', `signease_history_${activeFilter}_export.csv`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setShowExportMenu(false)
  }, [filteredRecords, activeFilter])

  // ── Formatting helpers ───────────────────────────────────────────────────
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <PageHeader
          title="History & Favorites"
          description="Review, search, annotate, and export your translation recordings."
        />
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {/* Export Dropdown */}
          {filteredRecords.length > 0 && (
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="gap-2 h-9 bg-card hover:bg-muted text-foreground transition-all"
              >
                <Download className="size-4 text-muted-foreground" />
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border bg-card shadow-lg z-50 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={exportAsJSON}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-all flex items-center gap-2"
                  >
                    <FileText className="size-3.5 text-primary" />
                    Export as JSON
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-foreground transition-all flex items-center gap-2"
                  >
                    <FileDown className="size-3.5 text-emerald-500" />
                    Export as CSV
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Delete All Button */}
          {filteredRecords.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-2 h-9 transition-colors ml-auto sm:ml-0"
            >
              <Trash2 className="size-4" />
              Clear View
            </Button>
          )}
        </div>
      </div>

      {/* ── Offline Status Banner ─────────────────────────────────────────── */}
      {!history.isAvailable && (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-sm flex items-start gap-3 shadow-sm animate-pulse">
          <Info className="size-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Local Offline Sandbox Active</p>
            <p className="mt-0.5 opacity-90 leading-relaxed text-xs">
              Translations are temporarily saved in local browser sandboxes. Connect your Supabase
              database to activate permanent cross-device sync.
            </p>
          </div>
        </div>
      )}

      {/* ── Controls Layout: Tabs, Search, Count ─────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Filters Tab */}
          <div className="flex rounded-xl bg-card border border-border p-1 gap-1 self-start sm:self-auto shadow-sm">
            {(['all', 'favorites', 'offline'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide transition-all duration-200 capitalize',
                  activeFilter === tab
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {tab === 'all' ? 'All' : tab === 'favorites' ? '★ Favorites' : 'Offline'}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search statements, gestures, or customized notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 h-10 bg-card border-border rounded-xl focus-visible:ring-primary shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-muted"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Counter Summary */}
        <div className="flex justify-between items-center px-1 text-xs text-muted-foreground">
          <span>
            Displaying {filteredRecords.length} of {history.records.length} saved translations
          </span>
          {searchQuery && <span>Search active</span>}
        </div>
      </div>

      {/* ── Main Data View ──────────────────────────────────────────────── */}
      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-3xl bg-card/30 backdrop-blur-sm min-h-[320px]">
          <div className="p-4 bg-muted/60 rounded-full text-muted-foreground mb-4">
            <Filter className="size-10 stroke-[1.5]" />
          </div>
          <h3 className="text-lg font-bold text-foreground">No Translations Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 leading-relaxed">
            {activeFilter === 'favorites'
              ? 'Mark translation entries with a star to pin them to your favorites library.'
              : activeFilter === 'offline'
                ? 'Offline entries will collect here when Supabase database is not loaded.'
                : 'Start translating in the live board and hit Save to list records here.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRecords.map(record => {
            const isEditing = editingNoteId === record.id
            const hasNote = record.notes && record.notes.trim().length > 0

            return (
              <Card
                key={record.id}
                className={cn(
                  'overflow-hidden border border-border/60 bg-card hover:border-primary/20 hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group',
                  record.is_favorite && 'border-amber-500/20 bg-amber-500/[0.01]',
                )}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Top Header Card Info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      {/* Meta information indicators */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-muted-foreground/80" />
                          <span>{formatDate(record.created_at)}</span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-muted-foreground/80" />
                          <span>{formatTime(record.created_at)}</span>
                        </div>
                        <div className="size-1 rounded-full bg-border" />
                        <div className="flex items-center gap-1.5">
                          <FileText className="size-3.5 text-muted-foreground/80" />
                          <span>{formatDuration(record.duration_seconds)}</span>
                        </div>
                        {record.id.startsWith('offline-') && (
                          <>
                            <div className="size-1 rounded-full bg-border" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase">
                              Offline Cache
                            </span>
                          </>
                        )}
                      </div>

                      {/* Main translation output sentence */}
                      <p className="text-xl font-bold text-foreground leading-snug tracking-tight">
                        {record.sentence}
                      </p>

                      {/* Word list tags breakdown */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {record.words.map((word, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-secondary/15 text-secondary border border-secondary/20 shadow-sm"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Quick Favorites Star Selector */}
                    <button
                      onClick={() => toggleFavorite(record.id, record.is_favorite)}
                      className={cn(
                        'p-2 rounded-xl transition-all border shadow-sm duration-300 scale-100 hover:scale-105 active:scale-95',
                        record.is_favorite
                          ? 'bg-amber-400/10 text-amber-500 border-amber-400/30'
                          : 'bg-card text-muted-foreground border-border hover:bg-muted',
                      )}
                      title={record.is_favorite ? 'Remove Favorite' : 'Save to Favorites'}
                    >
                      <Star
                        className={cn(
                          'size-4 transition-transform duration-300',
                          record.is_favorite ? 'fill-amber-500 scale-110' : 'fill-none',
                        )}
                      />
                    </button>
                  </div>

                  {/* Notes Segment */}
                  <div className="pt-3 border-t border-border/50">
                    {isEditing ? (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <textarea
                          placeholder="Type custom translation notes or context tags here..."
                          value={noteDraft}
                          onChange={e => setNoteDraft(e.target.value)}
                          className="w-full min-h-[70px] p-2.5 text-xs rounded-lg border border-border bg-muted/20 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                          maxLength={300}
                        />
                        <div className="flex justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={cancelEditingNote}
                            className="h-8 text-xs px-2.5 text-muted-foreground"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => saveNote(record.id)}
                            className="h-8 text-xs px-3 bg-primary text-white flex items-center gap-1.5"
                          >
                            <Save className="size-3.5" />
                            Save Note
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        {hasNote ? (
                          <div className="bg-muted/30 border border-border/40 rounded-xl p-3 text-xs text-foreground flex-1 flex gap-2">
                            <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="space-y-1">
                              <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wide">
                                Annotations & Notes
                              </p>
                              <p className="italic text-muted-foreground/90 leading-relaxed font-medium">
                                "{record.notes}"
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground/60 italic flex items-center">
                            No annotations saved yet.
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditingNote(record.id, record.notes)}
                          className="h-7 text-xs px-2.5 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 flex items-center gap-1.5"
                        >
                          <Edit2 className="size-3" />
                          {hasNote ? 'Edit' : 'Add Note'}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Actions footer (playback, delete, copy) */}
                  <div className="flex items-center gap-2 justify-end pt-2 border-t border-border/40 shrink-0">
                    {/* Speak playback */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => tts.speak(record.sentence)}
                      className={cn(
                        'size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground',
                        tts.isSpeaking && 'text-primary animate-pulse',
                      )}
                      title="TTS Playback"
                    >
                      <Volume2 className="size-3.5" />
                    </Button>

                    {/* Copy to clipboard */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(record.sentence, record.id)}
                      className="size-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                      title="Copy translation"
                    >
                      {copiedId === record.id ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <ClipboardCopy className="size-3.5" />
                      )}
                    </Button>

                    {/* Delete entry */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(record.id)}
                      className="size-8 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                      title="Delete Entry"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
