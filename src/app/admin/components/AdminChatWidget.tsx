'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { X, Send, Bot } from 'lucide-react'

export default function AdminChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  
  // Volvemos a usar sendMessage que es el método correcto en tu versión de @ai-sdk/react
  const { messages, sendMessage, status } = useChat()

  const isLoading = status === 'submitted' || status === 'streaming'
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const textToSend = inputMessage
    setInputMessage('')

    await sendMessage({ text: textToSend })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 px-5 py-3.5 rounded-full shadow-xl transition-all duration-200 active:scale-95 cursor-pointer font-medium text-sm group"
        >
          <Bot className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span>Asistente IA</span>
        </button>
      )}

      {isOpen && (
        <div className="flex flex-col w-[90vw] sm:w-[380px] h-[520px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-zinc-100">
                  Luminares IA
                </h3>
                <p className="text-[10px] text-slate-400 dark:text-zinc-400">Asistente administrativo</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.length === 0 && (
              <div className="text-center text-slate-400 dark:text-zinc-500 my-auto py-12 px-4 space-y-2">
                <Bot className="w-8 h-8 mx-auto opacity-40" />
                <p>👋 ¡Hola! Pregúntame sobre turnos, caja o stock del centro de estética.</p>
              </div>
            )}

            {messages.map((m) => {
              // Extraemos el texto correctamente de las partes (parts) que maneja esta versión
              const textContent = m.parts
                ? m.parts.map((p: any) => (p.type === 'text' ? p.text : '')).join('')
                : ''

              return (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                      m.role === 'user'
                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{textContent}</div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu consulta..."
              disabled={isLoading}
              className="flex-1 px-3 py-2.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 text-xs focus:ring-2 focus:ring-slate-900 dark:focus:ring-zinc-400 focus:outline-none transition disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-medium text-xs rounded-xl transition disabled:opacity-50 cursor-pointer flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}