import { motion } from 'framer-motion'
import { GitBranch, Plus, ArrowRight, Save, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react'
import { useLabyrinthStore } from '@/lib/store'
import { useEffect } from 'react'

// ── Real encoder functions ────────────────────────────────────────────────────

function applyEncoder(input: string, encoder: string): string {
  try {
    switch (encoder) {
      case 'base64-encode':
        return btoa(unescape(encodeURIComponent(input)))
      case 'url-encode':
        return encodeURIComponent(input)
      case 'double-url-encode':
        return encodeURIComponent(encodeURIComponent(input))
      case 'html-entities': {
        return input.replace(/[&<>"'`]/g, (c) => {
          const map: Record<string, string> = {
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;',
          }
          return map[c] ?? c
        })
      }
      case 'hex-encode':
        return Array.from(input).map((c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
      case 'unicode-escape':
        return Array.from(input).map((c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('')
      case 'reverse':
        return input.split('').reverse().join('')
      case 'base64-decode':
        return decodeURIComponent(escape(atob(input)))
      case 'url-decode':
        return decodeURIComponent(input)
      case 'html-decode':
        return input
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&#x60;/g, '`')
      case 'rot13':
        return input.replace(/[a-zA-Z]/g, (c) => {
          const base = c <= 'Z' ? 65 : 97
          return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
        })
      case 'uppercase':  return input.toUpperCase()
      case 'lowercase':  return input.toLowerCase()
      case 'null-byte':  return input + '\x00'
      default:           return input
    }
  } catch {
    return `[encode error: ${encoder}]`
  }
}

const AVAILABLE_ENCODERS = [
  'base64-encode',
  'base64-decode',
  'url-encode',
  'url-decode',
  'double-url-encode',
  'html-entities',
  'html-decode',
  'hex-encode',
  'unicode-escape',
  'reverse',
  'rot13',
  'uppercase',
  'lowercase',
  'null-byte',
]

export function LabyrinthView() {
  const {
    chainSteps, input, output,
    setInput, setOutput,
    addStep, removeStep, moveStep,
  } = useLabyrinthStore()

  // Recompute output whenever input or chain changes
  useEffect(() => {
    let result = input
    for (const step of chainSteps) {
      result = applyEncoder(result, step.encoder)
    }
    setOutput(result)
  }, [input, chainSteps, setOutput])

  const handleCopy = () => {
    navigator.clipboard.writeText(output).catch(() => {})
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden p-6 gap-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-core/15 border border-purple-dim/50 flex items-center justify-center">
            <GitBranch size={16} className="text-purple-core" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-purple-bright text-glow">
              LABYRINTH
            </h1>
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
              Encoding Pipeline — Chainable transforms with live preview
            </p>
          </div>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-core/15 border border-purple-core/40 font-display text-[9px] tracking-wider text-purple-bright hover:bg-purple-core/25 hover:glow-subtle transition-all">
          <Save size={11} />
          SAVE CHAIN
        </button>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_220px] gap-4 min-h-0">
        {/* Pipeline builder */}
        <div className="glass-card flex flex-col gap-4 p-5 overflow-auto">
          {/* Input */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
              Input
            </span>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              className="bg-void-900/60 border border-purple-dim/30 rounded-lg px-3 py-2 font-mono text-xs text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-core/60 transition-colors resize-none"
            />
          </div>

          {/* Down arrow */}
          <div className="flex justify-center">
            <ArrowRight size={14} className="text-purple-dim rotate-90" />
          </div>

          {/* Encoder chain */}
          <div className="flex flex-col gap-3">
            {chainSteps.length === 0 && (
              <div className="text-text-tertiary font-mono text-[10px] text-center py-2">
                No encoders — add one from the right panel
              </div>
            )}
            {chainSteps.map((step, i) => (
              <div key={step.id}>
                <div className="flex items-center gap-2 glass border border-purple-core/25 rounded-lg px-3 py-2.5 hover:border-purple-core/50 transition-all group">
                  <div className="w-5 h-5 rounded bg-purple-core/20 border border-purple-core/40 flex items-center justify-center shrink-0">
                    <span className="font-display text-[8px] text-purple-bright font-bold">{i + 1}</span>
                  </div>
                  <span className="font-mono text-xs text-purple-bright flex-1">{step.encoder}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => moveStep(step.id, 'up')}
                      disabled={i === 0}
                      className="text-text-tertiary hover:text-purple-bright disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={() => moveStep(step.id, 'down')}
                      disabled={i === chainSteps.length - 1}
                      className="text-text-tertiary hover:text-purple-bright disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="text-text-tertiary hover:text-status-error transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {i < chainSteps.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowRight size={12} className="text-purple-dim/60 rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Down arrow */}
          <div className="flex justify-center">
            <ArrowRight size={14} className="text-purple-dim rotate-90" />
          </div>

          {/* Output */}
          <div className="flex flex-col gap-2">
            <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
              Output
            </span>
            <div className="bg-void-900/60 border border-purple-core/25 rounded-lg px-3 py-2 font-mono text-xs text-purple-bright break-all min-h-[48px] glow-border">
              {output || <span className="text-text-tertiary opacity-60">…</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-core/15 border border-purple-core/40 font-display text-[9px] tracking-wider text-purple-bright hover:bg-purple-core/25 hover:glow-subtle transition-all"
              >
                <Copy size={10} />
                COPY OUTPUT
              </button>
            </div>
          </div>
        </div>

        {/* Right panel: encoder list */}
        <div className="glass-card flex flex-col gap-2 p-4 overflow-auto">
          <div className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase shrink-0 mb-1">
            Available Encoders
          </div>
          <div className="flex flex-col gap-1 overflow-auto">
            {AVAILABLE_ENCODERS.map((enc) => (
              <button
                key={enc}
                onClick={() => addStep(enc)}
                className="flex items-center justify-between text-left px-2 py-1.5 rounded font-mono text-[10px] text-text-secondary hover:text-purple-bright hover:bg-purple-core/10 transition-all group"
              >
                <span>{enc}</span>
                <Plus size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
