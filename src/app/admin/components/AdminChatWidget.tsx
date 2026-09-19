'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Send, Bot, Trash2, Sparkles, User, HelpCircle } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const STORAGE_KEY = 'luminares_chat_history'

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modo, setModo] = useState<string>('todos')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) {
        setMessages(JSON.parse(saved))
      }
    } catch (e) {
      console.error('Error al recuperar el historial del chat:', e)
    }
  }, [])

  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      } else {
        sessionStorage.removeItem(STORAGE_KEY)
      }
    } catch (e) {
      console.error('Error al guardar el historial del chat:', e)
    }
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isLoading])

  const handleClearHistory = () => {
    setMessages([])
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const enviarTexto = async (textoAEnviar: string) => {
    if (!textoAEnviar.trim() || isLoading) return

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: textoAEnviar }
    const newMessages = [...messages, userMessage]
    
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          modo: modo 
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al conectar con la IA')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || 'Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    enviarTexto(input)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-medium text-sm group border border-slate-700"
        >
          <Bot className="w-5 h-5 transition-transform group-hover:scale-110 text-teal-400" />
          <span>Lumin IA</span>
        </button>
      )}

      {isOpen && (
        <div className="flex flex-col w-[92vw] sm:w-[400px] h-[600px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-zinc-800/80 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                  Luminares IA <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-400">Asistente administrativo inteligente</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Limpiar conversación"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-2 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Filtros de Búsqueda Exclusiva */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-0.5">
              Filtro:
            </span>
            {['todos', 'productos', 'reservas', 'caja', 'pedidos'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setModo(item)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium capitalize transition cursor-pointer whitespace-nowrap ${
                  modo === item
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700/60'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 dark:text-zinc-500 my-auto py-8 px-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-zinc-300">¡Hola! ¿En qué te ayudo hoy?</p>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5">Consultá precios, turnos o movimientos rápidamente.</p>
                </div>
                
                {/* Sugerencias rápidas */}
                <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
                  <button 
                    onClick={() => { setModo('reservas'); enviarTexto('¿Qué reservas hay para hoy y mañana?'); }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-[11px] text-slate-600 dark:text-zinc-300 transition cursor-pointer border border-slate-200 dark:border-zinc-700"
                  >
                    📅 Ver reservas
                  </button>
                  <button 
                    onClick={() => { setModo('productos'); enviarTexto('¿Qué productos hay con stock bajo?'); }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-[11px] text-slate-600 dark:text-zinc-300 transition cursor-pointer border border-slate-200 dark:border-zinc-700"
                  >
                    📦 Stock bajo
                  </button>
                  <button 
                    onClick={() => { setModo('caja'); enviarTexto('¿Cómo están los movimientos de caja recientes?'); }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-[11px] text-slate-600 dark:text-zinc-300 transition cursor-pointer border border-slate-200 dark:border-zinc-700"
                  >
                    💰 Ver caja
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 items-end ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400 shrink-0 mb-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 leading-relaxed shadow-sm overflow-hidden ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-br-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-sm border border-slate-200/60 dark:border-zinc-700/50'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-xs dark:prose-invert max-w-none overflow-x-auto [&>p]:mb-1.5 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:space-y-1 [&>table]:w-full [&>table]:text-[11px] [&>table]:border-collapse">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 mb-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-end justify-start">
                <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400 shrink-0 mb-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-4 py-2.5 rounded-2xl rounded-bl-sm text-xs animate-pulse flex items-center gap-2 border border-slate-200/60 dark:border-zinc-700/50">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                  Buscando en {modo}...
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 rounded-xl text-[11px]">
                Error: {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Preguntar sobre ${modo}...`}
              disabled={isLoading}
              className="flex-1 px-3.5 py-3 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-400 focus:outline-none transition disabled:opacity-50 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium rounded-2xl transition disabled:opacity-40 cursor-pointer flex items-center justify-center shadow-md shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}