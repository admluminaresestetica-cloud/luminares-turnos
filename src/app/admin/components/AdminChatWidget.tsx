'use client'

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Send, Bot, Trash2, Sparkles, User, GripHorizontal } from 'lucide-react'

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
  
  // Posición inicial por defecto (esquina inferior derecha)
  const [position, setPosition] = useState({ x: 16, y: 16 })
  const [isDragging, setIsDragging] = useState(false)
  
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  })

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

  // Cancelar arrastre con la tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDragging) {
        setIsDragging(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isDragging])

  // Lógica de movimiento global en ventana para fluidez total en PC y Celular
  useEffect(() => {
    if (!isDragging) return

    const handlePointerMove = (e: PointerEvent) => {
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      const widgetWidth = isOpen ? 400 : 120
      const widgetHeight = isOpen ? 520 : 60

      const newX = Math.max(10, Math.min(window.innerWidth - widgetWidth, dragRef.current.initialX - dx))
      const newY = Math.max(10, Math.min(window.innerHeight - widgetHeight, dragRef.current.initialY - dy))

      setPosition({ x: newX, y: newY })
    }

    const handlePointerUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      const maxAllowedY = window.innerHeight - 560
      if (position.y < maxAllowedY) {
        setPosition(prev => ({ ...prev, y: Math.max(16, maxAllowedY) }))
      }
    }
  }, [messages, isOpen, isLoading])

  const handleClearHistory = () => {
    setMessages([])
    sessionStorage.removeItem(STORAGE_KEY)
  }

  const startDrag = (e: React.PointerEvent) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    }
    setIsDragging(true)
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
    <div 
      style={{ right: `${position.x}px`, bottom: `${position.y}px` }}
      className="fixed z-[9999] flex flex-col items-end justify-end"
    >
      {/* Botón flotante cerrado */}
      {!isOpen && (
        <button
          type="button"
          onPointerDown={startDrag}
          onClick={() => {
            if (!isDragging) setIsOpen(true)
          }}
          style={{ touchAction: 'none' }}
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3.5 rounded-full shadow-2xl transition-transform duration-150 active:scale-95 cursor-grab active:cursor-grabbing font-medium text-sm group border border-slate-700 select-none"
        >
          <Bot className="w-5 h-5 transition-transform group-hover:scale-110 text-teal-400 pointer-events-none" />
          <span className="pointer-events-none">Lumin IA</span>
        </button>
      )}

      {/* Ventana abierta del chat */}
      {isOpen && (
        <div className="flex flex-col w-[90vw] sm:w-[400px] h-[520px] max-h-[75vh] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 select-none">
          
          {/* Header (Única zona de arrastre para evitar bloqueos al scrollear el chat o escribir) */}
          <div 
            onPointerDown={startDrag}
            className="flex items-center justify-between px-4 py-3 bg-slate-100 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-800 shrink-0 cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              <GripHorizontal className="w-4 h-4 text-slate-400" />
              <div className="relative">
                <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-800 dark:text-zinc-100 flex items-center gap-1">
                  Luminares IA <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearHistory}
                title="Limpiar conversación"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Cerrar ventana"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Barra de Filtros de Búsqueda Exclusiva */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mr-1">Filtro:</span>
            {['todos', 'productos', 'reservas', 'caja', 'pedidos'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setModo(item)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-medium capitalize transition cursor-pointer whitespace-nowrap ${
                  modo === item
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Mensajes (Área de scroll totalmente libre en celulares y PC) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 dark:text-zinc-500 my-auto py-4 px-2 space-y-2">
                <div className="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">¡Hola! ¿En qué te ayudo hoy?</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Consultá precios, turnos o movimientos rápidamente.</p>
                </div>
                
                <div className="pt-1 flex flex-wrap gap-1 justify-center">
                  <button 
                    onClick={() => { setModo('reservas'); enviarTexto('¿Qué reservas hay para hoy y mañana?'); }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-lg text-[10px] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    📅 Ver reservas
                  </button>
                  <button 
                    onClick={() => { setModo('productos'); enviarTexto('¿Qué productos hay con stock bajo?'); }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-lg text-[10px] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    📦 Stock bajo
                  </button>
                  <button 
                    onClick={() => { setModo('caja'); enviarTexto('¿Cómo están los movimientos de caja recientes?'); }}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 rounded-lg text-[10px] text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer"
                  >
                    💰 Ver caja
                  </button>
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 items-end ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400 shrink-0 mb-1">
                    <Bot className="w-3 h-3" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed shadow-sm overflow-hidden text-xs ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium rounded-br-sm'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 rounded-bl-sm border border-slate-200/60 dark:border-zinc-700/50'
                  }`}
                >
                  {m.role === 'assistant' ? (
                    <div className="prose prose-xs dark:prose-invert max-w-none overflow-x-auto [&>p]:mb-1 [&>ul]:list-disc [&>ul]:pl-3 [&>table]:w-full [&>table]:text-[10px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{m.content}</div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-700 dark:text-zinc-300 shrink-0 mb-1">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-end justify-start">
                <div className="w-5 h-5 rounded-full bg-slate-900 dark:bg-zinc-700 flex items-center justify-center text-teal-400 shrink-0 mb-1">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-3 py-2 rounded-2xl rounded-bl-sm text-[11px] animate-pulse flex items-center gap-1.5 border border-slate-200/60">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" />
                  Buscando en {modo}...
                </div>
              </div>
            )}

            {error && (
              <div className="p-2.5 bg-red-50 dark:bg-red-950/50 border border-red-200 text-red-600 rounded-xl text-[10px]">
                Error: {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex gap-2 items-center shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Preguntar sobre ${modo}...`}
              disabled={isLoading}
              style={{ touchAction: 'manipulation' }}
              className="flex-1 px-3 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 text-xs focus:ring-2 focus:ring-slate-900 focus:outline-none transition disabled:opacity-50 shadow-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:text-zinc-900 text-white font-medium rounded-xl transition disabled:opacity-40 cursor-pointer flex items-center justify-center shadow-md shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}