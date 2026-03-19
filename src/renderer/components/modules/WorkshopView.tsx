import { motion } from 'framer-motion'
import { Wrench, Plus, Columns2, GitCompare } from 'lucide-react'

const tabLanguages = ['HTML', 'JavaScript', 'SQL', 'Python', 'PHP', 'Bash']

export function WorkshopView() {
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
          <div className="w-8 h-8 rounded-lg bg-violet-core/15 border border-violet-dim/50 flex items-center justify-center">
            <Wrench size={16} className="text-violet-bright" />
          </div>
          <div>
            <h1 className="font-display text-sm font-bold tracking-[0.2em] text-violet-vivid text-glow">
              WORKSHOP
            </h1>
            <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
              Code Editor — Monaco-powered raw payload editing, 20+ languages
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-void-800/50 border border-purple-dim/30 font-display text-[9px] tracking-wider text-text-secondary hover:border-purple-core/50 hover:text-purple-bright transition-all"
            title="Split view"
          >
            <Columns2 size={12} />
            SPLIT
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-void-800/50 border border-purple-dim/30 font-display text-[9px] tracking-wider text-text-secondary hover:border-purple-core/50 hover:text-purple-bright transition-all"
            title="Diff view"
          >
            <GitCompare size={12} />
            DIFF
          </button>
        </div>
      </div>

      {/* Editor tabs */}
      <div className="flex items-center gap-1 border-b border-purple-dim/20 pb-0">
        <button className="px-4 py-2 font-mono text-[10px] text-purple-bright border-b-2 border-purple-core -mb-px bg-purple-core/5 tracking-wider">
          untitled-1.js
        </button>
        <button className="px-4 py-2 font-mono text-[10px] text-text-tertiary hover:text-text-secondary tracking-wider">
          xss-polyglot.html
        </button>
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-void-700 text-text-tertiary hover:text-purple-bright transition-colors ml-1">
          <Plus size={12} />
        </button>
      </div>

      {/* Editor placeholder */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden">
        {/* Language bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-purple-dim/20 shrink-0">
          <div className="flex items-center gap-2">
            {tabLanguages.map((lang) => (
              <button
                key={lang}
                className={`px-2 py-0.5 rounded font-mono text-[9px] tracking-wider transition-all ${
                  lang === 'JavaScript'
                    ? 'bg-purple-core/20 text-purple-bright border border-purple-core/40'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px] text-text-tertiary">Ln 1, Col 1</span>
        </div>

        {/* Code area */}
        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed scanline relative">
          <div className="flex gap-4">
            {/* Line numbers */}
            <div className="flex flex-col text-text-tertiary text-right select-none shrink-0" style={{ minWidth: '2rem' }}>
              {Array.from({ length: 12 }, (_, i) => (
                <span key={i} className="text-[10px] leading-5">{i + 1}</span>
              ))}
            </div>
            {/* Code */}
            <div className="flex-1 text-text-primary">
              <div className="leading-5">
                <span className="text-violet-vivid">{'// '}</span>
                <span className="text-text-secondary">DAEDALUS WORKSHOP — payload editor</span>
              </div>
              <div className="leading-5">
                <span className="text-violet-vivid">{'// '}</span>
                <span className="text-text-secondary">Monaco Editor will be mounted here</span>
              </div>
              <div className="leading-5">&nbsp;</div>
              <div className="leading-5">
                <span className="text-purple-bright">const</span>
                <span className="text-text-primary">{' payload '}</span>
                <span className="text-violet-bright">{'= '}</span>
                <span className="text-status-success">{`'<img src=x onerror=alert(1)>'`}</span>
                <span className="text-text-primary">;</span>
              </div>
              <div className="leading-5">&nbsp;</div>
              <div className="leading-5">
                <span className="text-purple-bright">const</span>
                <span className="text-text-primary">{' encoded '}</span>
                <span className="text-violet-bright">{'= '}</span>
                <span className="text-purple-bright">encodeURIComponent</span>
                <span className="text-text-primary">(payload);</span>
              </div>
              <div className="leading-5">&nbsp;</div>
              <div className="leading-5">
                <span className="text-violet-vivid">{'// '}</span>
                <span className="text-text-secondary">Select code → "Convert to Template" → FORGE</span>
              </div>
              <div className="leading-5">
                <span className="text-violet-vivid">{'// '}</span>
                <span className="text-text-secondary">Ctrl+E: open FORGE payload in WORKSHOP</span>
              </div>
              <div className="leading-5">
                <span className="text-violet-vivid">{'// '}</span>
                <span className="text-text-secondary">Ctrl+S: save to ARMORY</span>
              </div>
              <div className="leading-5">&nbsp;</div>
              <div className="leading-5 flex items-center gap-1">
                <span className="text-text-primary">|</span>
                <span className="inline-block w-[2px] h-[14px] bg-purple-core animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-purple-dim/20 shrink-0">
          <span className="font-mono text-[9px] text-text-tertiary">JavaScript • UTF-8 • CRLF</span>
          <span className="font-mono text-[9px] text-text-tertiary">
            Ctrl+K: command palette &nbsp;|&nbsp; Ctrl+Shift+S: save to ARMORY
          </span>
        </div>
      </div>
    </motion.div>
  )
}
