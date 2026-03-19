import { useEffect, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Titlebar } from '@/components/Titlebar'
import { Sidebar } from '@/components/Sidebar'
import { ForgeView }     from '@/components/modules/ForgeView'
import { WorkshopView }  from '@/components/modules/WorkshopView'
import { ArmoryView }    from '@/components/modules/ArmoryView'
import { CrucibleView }  from '@/components/modules/CrucibleView'
import { LabyrinthView } from '@/components/modules/LabyrinthView'
import { AcademyView }   from '@/components/academy/AcademyView'
import { BootSequence }  from '@/components/BootSequence'
import { useAppStore, type Module } from '@/lib/store'
import { useAcademyStore } from '@/lib/academyStore'

export type AppModule = Module | 'academy'

const moduleViews: Record<AppModule, React.ComponentType> = {
  forge:     ForgeView,
  workshop:  WorkshopView,
  armory:    ArmoryView,
  crucible:  CrucibleView,
  labyrinth: LabyrinthView,
  academy:   AcademyView,
}

export const moduleLabels: Record<AppModule, string> = {
  forge:     'FORGE',
  workshop:  'WORKSHOP',
  armory:    'ARMORY',
  crucible:  'CRUCIBLE',
  labyrinth: 'LABYRINTH',
  academy:   'ACADEMY',
}

const coreModuleKeys: Module[] = ['forge', 'workshop', 'armory', 'crucible', 'labyrinth']
const allModuleKeys: AppModule[] = [...coreModuleKeys, 'academy']

export default function App() {
  const { activeModule, setActiveModule, payloadCount, typhonStatus } = useAppStore()
  const { level, xp } = useAcademyStore()
  const [activeAppModule, setActiveAppModule] = useState<AppModule>(activeModule)
  const ViewComponent = moduleViews[activeAppModule]
  const [booted, setBooted] = useState(false)

  const handleBootComplete = useCallback(() => setBooted(true), [])

  const handleSetModule = useCallback((mod: AppModule) => {
    setActiveAppModule(mod)
    if (mod !== 'academy') {
      setActiveModule(mod as Module)
    }
  }, [setActiveModule])

  // Keyboard shortcuts: Ctrl+1-6 to switch modules
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey) {
        const idx = parseInt(e.key) - 1
        if (idx >= 0 && idx < allModuleKeys.length) {
          e.preventDefault()
          handleSetModule(allModuleKeys[idx])
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleSetModule])

  return (
    <>
      {!booted && <BootSequence onComplete={handleBootComplete} />}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: booted ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        className="h-screen flex flex-col bg-void-950 overflow-hidden relative hex-grid"
      >
        {/* Ambient purple radial glow — top center */}
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(176,38,255,0.07) 0%, transparent 70%)',
          }}
        />

        <Titlebar />

        <div className="flex flex-1 overflow-hidden relative z-10">
          <Sidebar activeAppModule={activeAppModule} onSetModule={handleSetModule} />

          {/* Module tab strip */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex items-center gap-0 border-b border-purple-dim/25 bg-void-900/40 backdrop-blur-md px-4 shrink-0">
              {allModuleKeys.map((mod, i) => {
                const isActive = activeAppModule === mod
                const isAcademy = mod === 'academy'
                return (
                  <button
                    key={mod}
                    onClick={() => handleSetModule(mod)}
                    className={`relative px-5 py-2.5 font-display text-[9px] tracking-[0.2em] transition-all duration-200
                      ${isActive
                        ? isAcademy
                          ? 'text-purple-bright bg-purple-core/10'
                          : 'text-purple-bright bg-purple-core/8'
                        : 'text-text-tertiary hover:text-text-secondary hover:bg-void-700/30'
                      }`}
                    title={`Ctrl+${i + 1}`}
                  >
                    {isActive && (
                      <div
                        className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t"
                        style={isAcademy
                          ? { background: '#b026ff', boxShadow: '0 0 6px rgba(176,38,255,0.8)' }
                          : { background: 'var(--tw-prose-code)', className: 'bg-purple-core glow-subtle' }
                        }
                      />
                    )}
                    {moduleLabels[mod]}
                    {isAcademy && xp > 0 && (
                      <span className="ml-1 font-mono text-[7px] text-purple-muted">
                        {level.toUpperCase()}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Active module */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeAppModule}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <ViewComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Status bar */}
        <div className="h-[24px] glass border-t border-purple-dim/20 flex items-center justify-between px-4 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                typhonStatus === 'online'
                  ? 'bg-status-success'
                  : typhonStatus === 'connecting'
                  ? 'bg-status-warning animate-pulse'
                  : 'bg-text-tertiary'
              }`}
            />
            <span className="font-mono text-[8px] tracking-wider text-text-tertiary">
              TYPHON: {typhonStatus.toUpperCase()}
            </span>
            <div className="w-px h-3 bg-purple-dim/30" />
            <span className="font-mono text-[8px] tracking-wider text-text-tertiary">
              ARMORY: {payloadCount} payloads
            </span>
            <div className="w-px h-3 bg-purple-dim/30" />
            <span className="font-mono text-[8px] tracking-wider text-text-tertiary">
              MODULE: {moduleLabels[activeAppModule]}
            </span>
            {activeAppModule === 'academy' && xp > 0 && (
              <>
                <div className="w-px h-3 bg-purple-dim/30" />
                <span className="font-mono text-[8px] tracking-wider" style={{ color: '#b026ff' }}>
                  ACADEMY: {xp.toLocaleString()} XP · {level.toUpperCase()}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[8px] tracking-wider text-text-tertiary">
              PHANTOM ECOSYSTEM
            </span>
            <div className="w-px h-3 bg-purple-dim/30" />
            <span className="font-display text-[7px] tracking-[0.3em] text-purple-muted font-bold">
              D.A.E.D.A.L.U.S.
            </span>
          </div>
        </div>
      </motion.div>
    </>
  )
}
