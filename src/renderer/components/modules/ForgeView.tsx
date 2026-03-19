import { motion } from 'framer-motion'
import { Hammer, Layers, Variable, Eye, Wand2, Copy, Archive } from 'lucide-react'
import { useForgeStore, useArmoryStore, FORGE_TEMPLATES } from '@/lib/store'
import { useAppStore } from '@/lib/store'

export function ForgeView() {
  const { selectedTemplateId, variables, generatedPayload, setSelectedTemplate, setVariable } = useForgeStore()
  const { addPayload } = useArmoryStore()
  const { setActiveModule } = useAppStore()

  const currentTemplate = FORGE_TEMPLATES.find((t) => t.id === selectedTemplateId) ?? FORGE_TEMPLATES[0]

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPayload).catch(() => {})
  }

  const handleSaveToArmory = () => {
    addPayload({
      id: '',
      name: `${currentTemplate.name} — custom`,
      category: currentTemplate.category.toLowerCase(),
      severity: 'medium',
      favorite: false,
      content: generatedPayload,
    })
    setActiveModule('armory')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col overflow-hidden p-6 gap-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-core/15 border border-purple-dim/50 flex items-center justify-center">
          <Hammer size={16} className="text-purple-core" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold tracking-[0.2em] text-purple-bright text-glow">
            FORGE
          </h1>
          <p className="font-mono text-[10px] text-text-tertiary tracking-wider">
            Payload Builder — Template-driven construction with live preview
          </p>
        </div>
      </div>

      {/* Template Selector */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1">
          <Layers size={13} className="text-purple-muted" />
          <span className="font-display text-[9px] tracking-[0.25em] text-text-secondary uppercase">
            Template Selector
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FORGE_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === selectedTemplateId
            return (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`glass border rounded-lg p-3 text-left transition-all duration-200 group
                  ${isSelected
                    ? 'border-purple-core/70 bg-purple-core/12 glow-subtle'
                    : 'border-purple-dim/30 hover:border-purple-core/50 hover:bg-purple-core/5'
                  }`}
              >
                <div className={`font-display text-[11px] font-bold tracking-wider ${isSelected ? 'text-purple-bright text-glow' : 'text-purple-muted group-hover:text-purple-bright'}`}>
                  {tmpl.name}
                </div>
                <div className="font-mono text-[9px] text-text-tertiary mt-1">
                  {tmpl.category} template
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Variable Editor + Live Preview side by side */}
      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        {/* Variable Editor */}
        <div className="glass-card p-4 flex flex-col gap-3 overflow-auto">
          <div className="flex items-center gap-2">
            <Variable size={13} className="text-purple-muted" />
            <span className="font-display text-[9px] tracking-[0.25em] text-text-secondary uppercase">
              Variable Editor
            </span>
          </div>

          {/* Template raw */}
          <div className="bg-void-900/60 border border-purple-dim/20 rounded px-3 py-2 font-mono text-[10px] text-text-tertiary break-all">
            <span className="text-text-secondary">template: </span>
            {currentTemplate.template}
          </div>

          <div className="flex flex-col gap-3 flex-1">
            {Object.entries(variables).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-text-tertiary tracking-wider">
                  {`{{${key}}}`}
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setVariable(key, e.target.value)}
                  className="bg-void-800/50 border border-purple-dim/30 rounded px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-purple-core/60 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live Preview */}
        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye size={13} className="text-purple-muted" />
            <span className="font-display text-[9px] tracking-[0.25em] text-text-secondary uppercase">
              Live Preview
            </span>
          </div>
          <div className="flex-1 bg-void-900/60 rounded-lg border border-purple-core/25 p-3 font-mono text-xs text-purple-bright overflow-auto glow-border break-all">
            {generatedPayload || <span className="text-text-tertiary">Fill in variables above…</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-purple-core/15 border border-purple-dim/50 font-display text-[9px] tracking-wider text-purple-bright hover:bg-purple-core/25 hover:glow-subtle transition-all"
            >
              <Copy size={10} />
              COPY
            </button>
            <button
              onClick={handleSaveToArmory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-void-800/50 border border-purple-dim/30 font-display text-[9px] tracking-wider text-text-secondary hover:border-purple-core/50 hover:text-purple-bright transition-all"
            >
              <Archive size={10} />
              SAVE TO ARMORY
            </button>
          </div>
        </div>
      </div>

      {/* Quick-forge hint */}
      <div className="flex items-center gap-2 text-text-tertiary">
        <Wand2 size={11} />
        <span className="font-mono text-[9px] tracking-wider">
          Select a template → edit variables → copy or save to Armory
        </span>
      </div>
    </motion.div>
  )
}
