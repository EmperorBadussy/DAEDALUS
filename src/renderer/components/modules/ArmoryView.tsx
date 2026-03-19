import { motion } from 'framer-motion'
import { Archive, Star, Search, Download, Upload, Trash2, Copy } from 'lucide-react'
import { useArmoryStore, useAppStore, type ArmoryPayload } from '@/lib/store'

const severityColor: Record<string, string> = {
  low:      'text-status-info border-status-info/30',
  medium:   'text-status-warning border-status-warning/30',
  high:     'text-purple-bright border-purple-bright/30',
  critical: 'text-status-error border-status-error/30',
}

const categoryColor: Record<string, string> = {
  xss:   'text-purple-bright bg-purple-core/10',
  sqli:  'text-violet-vivid bg-violet-core/10',
  ssrf:  'text-purple-bright bg-purple-core/10',
  ssti:  'text-violet-vivid bg-violet-core/10',
  xxe:   'text-purple-bright bg-purple-core/10',
  idor:  'text-violet-vivid bg-violet-core/10',
  auth:  'text-status-error bg-status-error/10',
}

export function ArmoryView() {
  const {
    payloads, searchQuery, selectedId,
    setSearchQuery, setSelectedId, deletePayload,
  } = useArmoryStore()
  const { setPayloadCount } = useAppStore()

  const filtered = payloads.filter((p) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.severity.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q)
    )
  })

  const selected: ArmoryPayload | undefined = payloads.find((p) => p.id === selectedId)

  const handleDelete = (id: string) => {
    deletePayload(id)
    setPayloadCount(payloads.length - 1)
  }

  const handleCopy = () => {
    if (selected) navigator.clipboard.writeText(selected.content).catch(() => {})
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
            <Archive size={16} className="text-purple-core" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-purple-bright text-glow">
              ARMORY
            </h1>
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
              Payload Catalog — Searchable library with detail view
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-void-800/50 border border-purple-dim/30 font-display text-[9px] tracking-wider text-text-secondary hover:border-purple-core/50 hover:text-purple-bright transition-all">
            <Upload size={11} />
            IMPORT
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-void-800/50 border border-purple-dim/30 font-display text-[9px] tracking-wider text-text-secondary hover:border-purple-core/50 hover:text-purple-bright transition-all">
            <Download size={11} />
            EXPORT
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-void-800/50 border border-purple-dim/30 rounded-lg px-3 py-2">
          <Search size={13} className="text-text-tertiary shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payloads, tags, categories..."
            className="flex-1 bg-transparent font-mono text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
          />
        </div>
        <span className="font-mono text-[10px] text-text-tertiary shrink-0">
          {filtered.length} / {payloads.length}
        </span>
      </div>

      {/* Main split: list + detail */}
      <div className="flex-1 grid grid-cols-[1fr_300px] gap-4 min-h-0">
        {/* Payload list */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="flex items-center px-4 py-2 border-b border-purple-dim/20 shrink-0">
            <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
              {filtered.length} payloads
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 && (
              <div className="flex items-center justify-center h-full text-text-tertiary font-mono text-xs">
                No results
              </div>
            )}
            {filtered.map((p) => {
              const isActive = p.id === selectedId
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex items-center gap-3 px-4 py-3 border-b border-purple-dim/10 cursor-pointer transition-all group
                    ${isActive ? 'bg-purple-core/8 border-l-2 border-l-purple-core' : 'hover:bg-purple-core/5'}`}
                >
                  <Star
                    size={12}
                    className={p.favorite ? 'text-purple-bright fill-current shrink-0' : 'text-text-tertiary shrink-0'}
                  />
                  <div className="flex-1 min-w-0">
                    <span className={`font-mono text-xs truncate block transition-colors ${isActive ? 'text-purple-bright' : 'text-text-primary group-hover:text-purple-bright'}`}>
                      {p.name}
                    </span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-display tracking-wider shrink-0 ${categoryColor[p.category] || 'text-text-tertiary bg-void-700'}`}>
                    {p.category}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono shrink-0 ${severityColor[p.severity] || 'text-text-tertiary border-text-tertiary/30'}`}>
                    {p.severity}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(p.id) }}
                    className="opacity-0 group-hover:opacity-100 text-text-tertiary hover:text-status-error transition-all shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="glass-card flex flex-col p-4 gap-3 overflow-auto">
          {selected ? (
            <>
              <div className="font-display text-[9px] tracking-[0.2em] text-purple-bright uppercase">
                Detail
              </div>
              <div className="flex flex-col gap-2">
                <div>
                  <div className="font-mono text-[9px] text-text-tertiary mb-1">Name</div>
                  <div className="font-mono text-xs text-text-primary">{selected.name}</div>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-text-tertiary mb-1">Category</div>
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-display tracking-wider ${categoryColor[selected.category] || 'text-text-tertiary bg-void-700'}`}>
                    {selected.category.toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-mono text-[9px] text-text-tertiary mb-1">Severity</div>
                  <span className={`font-mono text-[10px] ${severityColor[selected.severity]?.split(' ')[0] || 'text-text-secondary'}`}>
                    {selected.severity}
                  </span>
                </div>
              </div>

              <div className="border-t border-purple-dim/20 pt-3">
                <div className="font-display text-[9px] tracking-[0.15em] text-text-tertiary uppercase mb-2">
                  Content
                </div>
                <div className="bg-void-900/60 rounded p-2 font-mono text-[10px] text-purple-bright border border-purple-dim/20 break-all">
                  {selected.content}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-purple-dim/20">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 px-3 py-1.5 rounded font-display text-[9px] tracking-wider bg-purple-core/15 border border-purple-core/40 text-purple-bright hover:bg-purple-core/25 transition-all"
                >
                  <Copy size={10} />
                  Copy
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="px-3 py-1.5 rounded font-display text-[9px] tracking-wider bg-crimson-dim/30 border border-crimson-core/30 text-crimson-core hover:bg-crimson-core/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-text-tertiary font-mono text-xs">
              Select a payload
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
