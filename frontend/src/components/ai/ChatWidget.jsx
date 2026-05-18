import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Sparkles, Trash2, Loader2 } from 'lucide-react'
import { useAiChat } from '@/hooks/useAi'
import { useAuthStore } from '@/store/authStore'
import { getApiError } from '@/lib/apiError'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'oson-chat-messages'

const SUGGESTIONS_BY_ROLE = {
  guest: [
    "Saytdan qanday foydalanaman?",
    "Ish izlash uchun nima qilishim kerak?",
    "Qanday qilib ro'yxatdan o'taman?",
  ],
  job_seeker: [
    "Rezyumemni qanday yaxshilash mumkin?",
    "Suhbatga qanday tayyorlanaman?",
    "Cover letter qanday yozaman?",
  ],
  employer: [
    "Yaxshi vakansiya qanday yoziladi?",
    "Nomzodlarni qanday topaman?",
    "Suhbatda nima so'rashim kerak?",
  ],
  admin: [
    "Saytda qanday funksiyalar bor?",
    "Foydalanuvchilarni qanday boshqaraman?",
    "Statistikani qayerdan ko'raman?",
  ],
}

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveMessages(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)))
  } catch { /* ignore */ }
}

function MarkdownText({ text }) {
  // Simple markdown: **bold** and bullet "- "
  const lines = text.split('\n')
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2">
              <span className="text-brand-500 shrink-0">•</span>
              <span dangerouslySetInnerHTML={{
                __html: line.slice(2).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
              }} />
            </div>
          )
        }
        if (!line.trim()) return <div key={i} className="h-2" />
        return (
          <p key={i} dangerouslySetInnerHTML={{
            __html: line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'),
          }} />
        )
      })}
    </div>
  )
}

function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(loadMessages)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chat = useAiChat()
  const role = useAuthStore((s) => s.user?.role) || 'guest'

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [open, messages.length])

  const sendMessage = (text) => {
    const content = text.trim()
    if (!content || chat.isPending) return

    const userMsg = { role: 'user', content }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')

    chat.mutate(
      { messages: next },
      {
        onSuccess: (data) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: data.reply },
          ])
        },
        onError: (error) => {
          setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: `❌ Xato: ${getApiError(error)}`, isError: true },
          ])
        },
      }
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClear = () => {
    if (!window.confirm('Suhbatni tozalashni tasdiqlaysizmi?')) return
    setMessages([])
    chat.reset()
  }

  const suggestions = SUGGESTIONS_BY_ROLE[role] || SUGGESTIONS_BY_ROLE.guest

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600 hover:scale-105 transition flex items-center justify-center group"
          aria-label="AI yordamchi"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[600px] max-h-[calc(100vh-2.5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">AI Yordamchi</div>
                <div className="text-xs text-white/80">SmartIsh bo'yicha</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
                  aria-label="Tozalash"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center mt-8">
                <div className="w-16 h-16 rounded-full bg-brand-100 mx-auto mb-3 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-brand-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Salom! 👋</h3>
                <p className="text-sm text-gray-500 mb-5 px-4">
                  Men sizga sayt va karyera bo'yicha yordam beraman. Savol bering!
                </p>
                <div className="space-y-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => sendMessage(s)}
                      className="block w-full text-left px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-3.5 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : m.isError
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  )}
                >
                  {m.role === 'assistant' && !m.isError ? (
                    <MarkdownText text={m.content} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}

            {chat.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI o'ylayapti...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Savolingizni yozing..."
                disabled={chat.isPending}
                className="flex-1 resize-none border border-gray-200 rounded-xl px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 max-h-32"
                style={{ minHeight: '40px' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || chat.isPending}
                className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center hover:bg-brand-600 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Yuborish"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 text-center">
              Powered by Google Gemini · Enter — yuborish
            </p>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
