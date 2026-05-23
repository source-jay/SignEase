import {
  Brain,
  Camera,
  ChevronRight,
  Eraser,
  HelpCircle,
  Info,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAIChat } from '@/hooks/useAIChat'
import { cn } from '@/lib/utils'

// Contextual prompt suggestions for users
const SUGGESTIONS = [
  {
    label: 'How do I train a new sign?',
    icon: Brain,
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    label: 'Troubleshoot camera / PWA blocks',
    icon: Camera,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    label: 'How does ASL scale normalization work?',
    icon: Sparkles,
    color: 'text-secondary bg-secondary/10 border-secondary/20',
  },
  {
    label: 'ASL Learning guide & tips',
    icon: HelpCircle,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  },
]

// ── Lightweight, High-Fidelity Markdown Parser ──────────────────────────────
function parseMarkdown(text: string) {
  const paragraphs = text.split(/\n\n+/)

  return paragraphs.map((para, pIdx) => {
    // Process bullet points
    if (para.trim().startsWith('- ') || para.trim().startsWith('* ')) {
      const items = para
        .split('\n')
        .filter(line => line.trim().startsWith('- ') || line.trim().startsWith('* '))
        .map(line => line.trim().substring(2))

      return (
        <ul key={pIdx} className="list-disc pl-5 my-2 space-y-1 text-sm leading-relaxed">
          {items.map((item, iIdx) => (
            <li key={iIdx}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      )
    }

    // Standard paragraph
    return (
      <p key={pIdx} className="text-sm leading-relaxed mb-2.5 last:mb-0">
        {parseInlineMarkdown(para)}
      </p>
    )
  })
}

function parseInlineMarkdown(text: string) {
  // Bold tokens (**text**)
  const boldRegex = /\*\*([^*]+)\*\*/g
  // Inline code block tokens (`code`)
  const codeRegex = /`([^`]+)`/g

  // 1. Process inline code blocks
  let parts: (string | JSX.Element)[] = [text]

  // Apply bold regex mapping
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part
    const subParts = []
    let lastIdx = 0
    let match

    while ((match = boldRegex.exec(part)) !== null) {
      if (match.index > lastIdx) {
        subParts.push(part.substring(lastIdx, match.index))
      }
      subParts.push(
        <strong key={`bold-${match.index}`} className="font-extrabold text-foreground">
          {match[1]}
        </strong>,
      )
      lastIdx = boldRegex.lastIndex
    }

    if (lastIdx < part.length) {
      subParts.push(part.substring(lastIdx))
    }

    return subParts
  })

  // Apply inline code block mapping
  parts = parts.flatMap(part => {
    if (typeof part !== 'string') return part
    const subParts = []
    let lastIdx = 0
    let match

    while ((match = codeRegex.exec(part)) !== null) {
      if (match.index > lastIdx) {
        subParts.push(part.substring(lastIdx, match.index))
      }
      subParts.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono font-bold text-primary border border-border"
        >
          {match[1]}
        </code>,
      )
      lastIdx = codeRegex.lastIndex
    }

    if (lastIdx < part.length) {
      subParts.push(part.substring(lastIdx))
    }

    return subParts
  })

  return parts
}

// ── Main Page Component ──────────────────────────────────────────────────────
export function ChatPage() {
  const chat = useAIChat()

  // ── State ────────────────────────────────────────────────────────────────
  const [inputVal, setInputVal] = useState('')

  // Refs for scroll locking
  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on message load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chat.messages, chat.isSending])

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputVal.trim()
    if (!text || chat.isSending) return
    setInputVal('')
    await chat.sendMessage(text)
  }, [inputVal, chat])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleSend()
    }
  }

  const selectSuggestion = useCallback(
    async (label: string) => {
      if (chat.isSending) return
      await chat.sendMessage(label)
    },
    [chat],
  )

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col lg:h-[calc(100svh-12rem)] lg:min-h-[500px] h-auto min-h-0 gap-4 max-w-6xl mx-auto pb-20 lg:pb-0">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="AI Assistant"
          description="Instant setup assistance, onboarding support, and sign language learning companion."
        />
        <Button
          variant="outline"
          size="sm"
          onClick={chat.clearChat}
          disabled={chat.messages.length <= 1 || chat.isLoading}
          className="text-muted-foreground hover:text-destructive border-border hover:bg-destructive/5 shrink-0 gap-1.5 h-9"
          title="Clear active chat log"
        >
          <Eraser className="size-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </Button>
      </div>

      {/* ── Offline Sandbox notification ─────────────────────────────────── */}
      {!chat.isAvailable && (
        <div className="px-4 py-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2 shadow-sm shrink-0">
          <Info className="size-4 shrink-0" />
          <span>
            <strong>Local Storage active</strong>. Chat messages are running fully offline and
            sandboxed in this browser.
          </span>
        </div>
      )}

      {/* ── Main Chat Layout ─────────────────────────────────────────────── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 min-h-0">
        {/* Chat Feed Interface Card */}
        <Card className="flex flex-col overflow-hidden border border-border/50 bg-card shadow-sm rounded-2xl h-full">
          {/* Scrollable message frame */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ contentVisibility: 'auto' }}
          >
            {chat.messages.map(msg => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex w-full items-start gap-3 animate-in fade-in duration-200',
                    isUser ? 'justify-end' : 'justify-start',
                  )}
                >
                  {/* Left avatar icon for AI */}
                  {!isUser && (
                    <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                      <Sparkles className="size-4" />
                    </div>
                  )}

                  {/* Speech Bubble */}
                  <div
                    className={cn(
                      'max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl border shadow-sm text-foreground',
                      isUser
                        ? 'bg-primary text-white border-primary/30 rounded-tr-none'
                        : 'bg-muted/30 border-border/50 rounded-tl-none',
                    )}
                  >
                    {isUser ? (
                      <p className="text-sm font-semibold leading-relaxed break-words">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="space-y-1 break-words prose prose-sm dark:prose-invert">
                        {parseMarkdown(msg.content)}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Response Loader */}
            {chat.isSending && (
              <div className="flex items-start gap-3 animate-in fade-in duration-200">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <Sparkles className="size-4" />
                </div>
                <div className="bg-muted/30 border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground font-semibold animate-pulse">
                    AI Assistant is thinking...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Contextual suggestions pane on bottom (if feed is small/fresh) */}
          {chat.messages.length <= 2 && !chat.isSending && (
            <div className="px-4 py-3 border-t border-border/40 bg-muted/10 space-y-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Suggested Context Prompts
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTIONS.map(s => {
                  const Icon = s.icon
                  return (
                    <button
                      key={s.label}
                      onClick={() => selectSuggestion(s.label)}
                      className={cn(
                        'flex items-center gap-2.5 p-2.5 rounded-xl border text-left text-xs font-semibold',
                        'hover:scale-[1.01] active:scale-95 transition-all duration-150',
                        s.color,
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{s.label}</span>
                      <ChevronRight className="size-3.5 ml-auto opacity-60" />
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* User message input panel */}
          <div className="p-3 border-t border-border/50 bg-muted/20 flex gap-2 items-center">
            <Input
              placeholder={chat.isSending ? 'AI is replying...' : 'Ask me anything about SignEase...'}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={chat.isSending}
              className="bg-card border-border rounded-xl focus-visible:ring-primary shadow-sm h-10 flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputVal.trim() || chat.isSending}
              className="h-10 px-4 rounded-xl shadow-md bg-primary hover:bg-primary/95 text-white gap-2"
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </Card>

        {/* Right Sidebar: Contextual Help & Troubleshooting Guides */}
        <div className="hidden lg:flex flex-col gap-4 overflow-y-auto">
          {/* Troubleshooting Guidelines card */}
          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Camera className="size-5" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">
                  Troubleshooting
                </h4>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground pl-1">
                <li className="leading-relaxed">
                  🔒 <strong>Camera Permission:</strong> If camera state shows 'denied', reset permissions by clicking the lock icon on the browser address bar and enable camera stream access.
                </li>
                <li className="leading-relaxed">
                  ⚡ <strong>WebGL Acceleration:</strong> MediaPipe processes faster when GPU acceleration is active. Verify hardware speedups are on.
                </li>
                <li className="leading-relaxed">
                  ⚠️ <strong>Offline Mode:</strong> Database history writes sync to cloud Supabase tables automatically when connection is active, or store in fallback browser sandbox.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* AI Onboarding Steps guide card */}
          <Card className="border border-border/50 bg-card rounded-2xl shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-secondary">
                <MessageSquare className="size-5" />
                <h4 className="font-extrabold text-sm uppercase tracking-wider">
                  Onboarding Guides
                </h4>
              </div>
              <ul className="text-xs space-y-2 text-muted-foreground pl-1">
                <li className="leading-relaxed">
                  1️⃣ <strong>Train Model:</strong> Navigate to the `/train` page, record 30-50 frames per distinct gesture, and compile via TensorFlow.js.
                </li>
                <li className="leading-relaxed">
                  2️⃣ <strong>Translate Screen:</strong> Navigate to `/translate`, gesture into camera view, and activate <strong>Auto-speak</strong> or log into <strong>Sentence Builder</strong>.
                </li>
                <li className="leading-relaxed">
                  3️⃣ <strong>Review History:</strong> Navigate to `/history` to star favorites, annotate personal notes, or export to CSV files.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
