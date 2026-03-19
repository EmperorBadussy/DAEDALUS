import { Minus, Square, X } from 'lucide-react'

export function Titlebar() {
  return (
    <div className="drag h-[36px] flex items-center justify-between bg-void-950/90 backdrop-blur-xl border-b border-purple-dim/40 px-4 shrink-0">
      <div className="flex items-center gap-3 no-drag">
        <div className="w-2 h-2 rounded-full bg-purple-core relative pulse-dot" />
        <span className="font-display text-[10px] font-bold tracking-[0.3em] text-purple-bright">
          DAEDALUS
        </span>
        <span className="font-mono text-[8px] text-text-tertiary tracking-wider">
          v0.1.0
        </span>
        <span className="font-mono text-[7px] text-purple-muted/60 tracking-widest uppercase ml-1">
          Payload Workbench
        </span>
      </div>

      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={() => window.daedalus.windowMinimize()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-void-700 transition-colors"
        >
          <Minus size={12} className="text-text-secondary" />
        </button>
        <button
          onClick={() => window.daedalus.windowMaximize()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-void-700 transition-colors"
        >
          <Square size={10} className="text-text-secondary" />
        </button>
        <button
          onClick={() => window.daedalus.windowClose()}
          className="w-8 h-7 flex items-center justify-center rounded hover:bg-purple-core/20 transition-colors group"
        >
          <X size={12} className="text-text-secondary group-hover:text-purple-core" />
        </button>
      </div>
    </div>
  )
}
