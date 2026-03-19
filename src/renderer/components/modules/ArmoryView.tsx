import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive, Star, Search, Download, Upload, Copy, Check, ChevronRight,
  Globe, Monitor, Terminal, Apple, Shield, ShieldAlert, ShieldOff, ShieldCheck,
  Code2, Database, FileCode2, FolderOpen, Braces, Wifi, Cog, X,
  ExternalLink, Tag, Filter,
} from 'lucide-react'
import { useArmoryStore, useAppStore, type ArmoryPayload } from '@/lib/store'
import {
  CATEGORY_META, type PayloadCategory,
  getCategories, getSubcategories, searchPayloads, PAYLOAD_DATABASE,
} from '@/lib/payloadDatabase'

// ── Color maps ──────────────────────────────────────────────────────────────

const severityColor: Record<string, { text: string; border: string; bg: string }> = {
  low:      { text: 'text-status-info',    border: 'border-status-info/30',    bg: 'bg-status-info/10' },
  medium:   { text: 'text-status-warning', border: 'border-status-warning/30', bg: 'bg-status-warning/10' },
  high:     { text: 'text-purple-bright',  border: 'border-purple-bright/30',  bg: 'bg-purple-bright/10' },
  critical: { text: 'text-status-error',   border: 'border-status-error/30',   bg: 'bg-status-error/10' },
}

const platformIcons: Record<string, { icon: typeof Globe; label: string }> = {
  web:     { icon: Globe,    label: 'Web' },
  windows: { icon: Monitor,  label: 'Windows' },
  linux:   { icon: Terminal, label: 'Linux' },
  macos:   { icon: Apple,    label: 'macOS' },
}

const categoryIcons: Record<string, typeof Code2> = {
  xss: Code2,
  sqli: Database,
  cmdi: Terminal,
  ssrf: Globe,
  xxe: FileCode2,
  lfi: FolderOpen,
  ssti: Braces,
  auth: ShieldOff,
  revshell: Wifi,
  lolbins: Cog,
}

// ── Component ───────────────────────────────────────────────────────────────

export function ArmoryView() {
  const {
    payloads, searchQuery, selectedId,
    categoryFilter, subcategoryFilter, platformFilter, riskFilter,
    setSearchQuery, setSelectedId,
    setCategoryFilter, setSubcategoryFilter, setPlatformFilter, setRiskFilter,
    toggleFavorite,
  } = useArmoryStore()
  const { setPayloadCount } = useAppStore()

  const [copied, setCopied] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Category counts
  const categories = useMemo(() => getCategories(), [])
  const subcategories = useMemo(
    () => categoryFilter ? getSubcategories(categoryFilter) : [],
    [categoryFilter],
  )

  // Filter payloads
  const filtered = useMemo(() => {
    return searchPayloads(
      payloads, searchQuery, categoryFilter, subcategoryFilter, platformFilter, riskFilter,
    )
  }, [payloads, searchQuery, categoryFilter, subcategoryFilter, platformFilter, riskFilter])

  // Update status bar count
  useEffect(() => {
    setPayloadCount(payloads.length)
  }, [payloads.length, setPayloadCount])

  const selected: ArmoryPayload | undefined = payloads.find((p) => p.id === selectedId)

  const handleCopy = useCallback(() => {
    if (selected) {
      navigator.clipboard.writeText(selected.content).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }).catch(() => {})
    }
  }, [selected])

  const totalCount = payloads.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden p-4 gap-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-core/15 border border-purple-dim/50 flex items-center justify-center">
            <Archive size={16} className="text-purple-core" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-purple-bright text-glow">
              ARMORY
            </h1>
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
              {totalCount} payloads across {categories.length} categories
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-[9px] tracking-wider transition-all
              ${showFilters
                ? 'bg-purple-core/20 border border-purple-core/50 text-purple-bright'
                : 'bg-void-800/50 border border-purple-dim/30 text-text-secondary hover:border-purple-core/50 hover:text-purple-bright'
              }`}
          >
            <Filter size={11} />
            FILTERS
            {(platformFilter || riskFilter) && (
              <span className="ml-1 w-4 h-4 rounded-full bg-purple-core/30 text-[8px] flex items-center justify-center text-purple-bright">
                {(platformFilter ? 1 : 0) + (riskFilter ? 1 : 0)}
              </span>
            )}
          </button>
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

      {/* Search + filters bar */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-void-800/50 border border-purple-dim/30 rounded-lg px-3 py-2">
            <Search size={13} className="text-text-tertiary shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search payloads, tags, categories... (fuzzy matching)"
              className="flex-1 bg-transparent font-mono text-xs text-text-primary placeholder-text-tertiary focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-text-tertiary hover:text-text-primary">
                <X size={12} />
              </button>
            )}
          </div>
          <span className="font-mono text-[10px] text-text-tertiary shrink-0">
            {filtered.length} / {totalCount}
          </span>
        </div>

        {/* Filter chips row */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-3 pb-1">
                {/* Platform filters */}
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-[8px] tracking-widest text-text-tertiary uppercase mr-1">Platform:</span>
                  {(['web', 'windows', 'linux', 'macos'] as const).map((plat) => {
                    const PlatIcon = platformIcons[plat].icon
                    const active = platformFilter === plat
                    return (
                      <button
                        key={plat}
                        onClick={() => setPlatformFilter(plat)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono transition-all
                          ${active
                            ? 'bg-purple-core/20 border border-purple-core/50 text-purple-bright'
                            : 'bg-void-800/40 border border-purple-dim/20 text-text-tertiary hover:text-text-secondary hover:border-purple-dim/40'
                          }`}
                      >
                        <PlatIcon size={10} />
                        {platformIcons[plat].label}
                      </button>
                    )
                  })}
                </div>

                {/* Risk level filters */}
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-[8px] tracking-widest text-text-tertiary uppercase mr-1">Risk:</span>
                  {(['low', 'medium', 'high', 'critical'] as const).map((risk) => {
                    const active = riskFilter === risk
                    const sc = severityColor[risk]
                    return (
                      <button
                        key={risk}
                        onClick={() => setRiskFilter(risk)}
                        className={`px-2 py-1 rounded text-[9px] font-mono transition-all border
                          ${active
                            ? `${sc.bg} ${sc.border} ${sc.text}`
                            : 'bg-void-800/40 border-purple-dim/20 text-text-tertiary hover:text-text-secondary hover:border-purple-dim/40'
                          }`}
                      >
                        {risk.toUpperCase()}
                      </button>
                    )
                  })}
                </div>

                {/* Clear all */}
                {(platformFilter || riskFilter || categoryFilter) && (
                  <button
                    onClick={() => { setCategoryFilter(null); setPlatformFilter(null as any); setRiskFilter(null as any) }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono text-text-tertiary hover:text-status-error transition-all"
                  >
                    <X size={10} />
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main: category sidebar + list + detail */}
      <div className="flex-1 grid grid-cols-[180px_1fr_320px] gap-3 min-h-0">

        {/* Category sidebar */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="flex items-center px-3 py-2 border-b border-purple-dim/20 shrink-0">
            <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
              Categories
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            {/* All */}
            <button
              onClick={() => setCategoryFilter(null)}
              className={`w-full flex items-center justify-between px-3 py-2 text-left transition-all
                ${!categoryFilter ? 'bg-purple-core/10 border-l-2 border-l-purple-core' : 'hover:bg-purple-core/5 border-l-2 border-l-transparent'}`}
            >
              <span className={`font-display text-[9px] tracking-wider ${!categoryFilter ? 'text-purple-bright' : 'text-text-secondary'}`}>
                ALL
              </span>
              <span className="font-mono text-[9px] text-text-tertiary">{totalCount}</span>
            </button>

            {categories.map(({ category, count }) => {
              const meta = CATEGORY_META[category]
              const active = categoryFilter === category
              const CatIcon = categoryIcons[category] || Code2
              return (
                <div key={category}>
                  <button
                    onClick={() => setCategoryFilter(active ? null : category)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-all
                      ${active ? 'bg-purple-core/10 border-l-2 border-l-purple-core' : 'hover:bg-purple-core/5 border-l-2 border-l-transparent'}`}
                  >
                    <CatIcon size={12} className={active ? meta.color : 'text-text-tertiary'} />
                    <span className={`font-display text-[9px] tracking-wider flex-1 truncate ${active ? 'text-purple-bright' : 'text-text-secondary'}`}>
                      {meta.label.toUpperCase()}
                    </span>
                    <span className="font-mono text-[9px] text-text-tertiary">{count}</span>
                    {active && <ChevronRight size={10} className="text-purple-core" />}
                  </button>

                  {/* Subcategories */}
                  {active && subcategories.length > 1 && (
                    <div className="ml-5 border-l border-purple-dim/20">
                      {subcategories.map((sub) => {
                        const subActive = subcategoryFilter === sub
                        return (
                          <button
                            key={sub}
                            onClick={() => setSubcategoryFilter(subActive ? null : sub)}
                            className={`w-full flex items-center px-3 py-1.5 text-left transition-all
                              ${subActive ? 'text-purple-bright' : 'text-text-tertiary hover:text-text-secondary'}`}
                          >
                            <span className="font-mono text-[8px] truncate">{sub}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Payload list */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-purple-dim/20 shrink-0">
            <span className="font-display text-[9px] tracking-[0.2em] text-text-tertiary uppercase">
              {filtered.length} payloads
            </span>
            {categoryFilter && (
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-display tracking-wider ${CATEGORY_META[categoryFilter as PayloadCategory]?.color || ''} ${CATEGORY_META[categoryFilter as PayloadCategory]?.bgColor || ''}`}>
                {CATEGORY_META[categoryFilter as PayloadCategory]?.label?.toUpperCase() || categoryFilter.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-2">
                <Search size={20} className="opacity-30" />
                <span className="font-mono text-xs">No results found</span>
                <span className="font-mono text-[10px] opacity-50">Try different search terms or clear filters</span>
              </div>
            )}
            {filtered.map((p) => {
              const isActive = p.id === selectedId
              const sc = severityColor[p.severity] || severityColor.medium
              const catMeta = CATEGORY_META[p.category as PayloadCategory]
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 border-b border-purple-dim/10 cursor-pointer transition-all group
                    ${isActive ? 'bg-purple-core/8 border-l-2 border-l-purple-core' : 'hover:bg-purple-core/5 border-l-2 border-l-transparent'}`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id) }}
                    className="shrink-0"
                  >
                    <Star
                      size={12}
                      className={p.favorite ? 'text-purple-bright fill-current' : 'text-text-tertiary/40 hover:text-text-tertiary'}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={`font-mono text-[11px] truncate transition-colors ${isActive ? 'text-purple-bright' : 'text-text-primary group-hover:text-purple-bright'}`}>
                      {p.name}
                    </div>
                    {p.subcategory && (
                      <div className="font-mono text-[8px] text-text-tertiary truncate mt-0.5">
                        {p.subcategory}
                      </div>
                    )}
                  </div>
                  {/* Platform badges */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {p.platform?.map((plat) => {
                      const pi = platformIcons[plat]
                      if (!pi) return null
                      const PIcon = pi.icon
                      return (
                        <div key={plat} className="w-4 h-4 flex items-center justify-center" title={pi.label}>
                          <PIcon size={9} className="text-text-tertiary/60" />
                        </div>
                      )
                    })}
                  </div>
                  {!categoryFilter && catMeta && (
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-display tracking-wider shrink-0 ${catMeta.color} ${catMeta.bgColor}`}>
                      {catMeta.label.split(' ')[0].toUpperCase()}
                    </span>
                  )}
                  <span className={`px-1.5 py-0.5 rounded border text-[7px] font-mono shrink-0 ${sc.text} ${sc.border}`}>
                    {p.severity}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="glass-card flex flex-col overflow-hidden">
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Detail header */}
              <div className="px-4 py-3 border-b border-purple-dim/20 shrink-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-display text-[9px] tracking-[0.2em] text-purple-bright uppercase">
                    Detail
                  </div>
                  <div className="flex items-center gap-1">
                    {selected.platform?.map((plat) => {
                      const pi = platformIcons[plat]
                      if (!pi) return null
                      const PIcon = pi.icon
                      return (
                        <div
                          key={plat}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-void-800/50 border border-purple-dim/20"
                          title={pi.label}
                        >
                          <PIcon size={9} className="text-text-tertiary" />
                          <span className="font-mono text-[7px] text-text-tertiary">{pi.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="font-mono text-xs text-text-primary leading-snug">{selected.name}</div>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-2">
                  {CATEGORY_META[selected.category as PayloadCategory] && (
                    <span className={`px-2 py-0.5 rounded text-[8px] font-display tracking-wider ${CATEGORY_META[selected.category as PayloadCategory].color} ${CATEGORY_META[selected.category as PayloadCategory].bgColor}`}>
                      {CATEGORY_META[selected.category as PayloadCategory].label.toUpperCase()}
                    </span>
                  )}
                  {selected.subcategory && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-mono text-text-tertiary bg-void-700/50">
                      {selected.subcategory}
                    </span>
                  )}
                  {(() => {
                    const sc = severityColor[selected.severity]
                    return (
                      <span className={`px-2 py-0.5 rounded border text-[8px] font-mono ${sc.text} ${sc.border} ${sc.bg}`}>
                        {selected.severity.toUpperCase()}
                      </span>
                    )
                  })()}
                </div>

                {/* Description */}
                {selected.description && (
                  <div>
                    <div className="font-display text-[8px] tracking-[0.15em] text-text-tertiary uppercase mb-1">
                      Description
                    </div>
                    <div className="font-mono text-[10px] text-text-secondary leading-relaxed">
                      {selected.description}
                    </div>
                  </div>
                )}

                {/* Payload content */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-display text-[8px] tracking-[0.15em] text-text-tertiary uppercase">
                      Payload
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[9px] font-mono transition-all
                        ${copied
                          ? 'bg-status-success/20 border border-status-success/40 text-status-success'
                          : 'bg-purple-core/10 border border-purple-core/30 text-purple-bright hover:bg-purple-core/20'
                        }`}
                    >
                      {copied ? <Check size={10} /> : <Copy size={10} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="bg-void-950/80 rounded-lg p-3 font-mono text-[10px] text-purple-bright border border-purple-dim/20 overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all leading-relaxed">{selected.content}</pre>
                  </div>
                </div>

                {/* Tags */}
                {selected.tags && selected.tags.length > 0 && (
                  <div>
                    <div className="font-display text-[8px] tracking-[0.15em] text-text-tertiary uppercase mb-1.5">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-void-800/50 border border-purple-dim/15 text-[8px] font-mono text-text-tertiary hover:text-purple-bright hover:border-purple-core/30 transition-all"
                        >
                          <Tag size={7} />
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* References */}
                {selected.references && selected.references.length > 0 && (
                  <div>
                    <div className="font-display text-[8px] tracking-[0.15em] text-text-tertiary uppercase mb-1.5">
                      References
                    </div>
                    <div className="flex flex-col gap-1">
                      {selected.references.map((ref, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 font-mono text-[9px] text-text-tertiary"
                        >
                          <ExternalLink size={9} className="shrink-0" />
                          <span>{ref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-purple-dim/20 shrink-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-[9px] tracking-wider bg-purple-core/15 border border-purple-core/40 text-purple-bright hover:bg-purple-core/25 transition-all"
                >
                  {copied ? <Check size={10} /> : <Copy size={10} />}
                  {copied ? 'Copied!' : 'Copy Payload'}
                </button>
                <button
                  onClick={() => toggleFavorite(selected.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-display text-[9px] tracking-wider transition-all
                    ${selected.favorite
                      ? 'bg-purple-core/15 border border-purple-core/40 text-purple-bright'
                      : 'bg-void-800/50 border border-purple-dim/30 text-text-secondary hover:border-purple-core/50 hover:text-purple-bright'
                    }`}
                >
                  <Star size={10} className={selected.favorite ? 'fill-current' : ''} />
                  {selected.favorite ? 'Starred' : 'Star'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-text-tertiary gap-2">
              <Archive size={24} className="opacity-20" />
              <span className="font-mono text-xs">Select a payload</span>
              <span className="font-mono text-[10px] opacity-50">Choose from the list to view details</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
