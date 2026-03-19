import { Hammer, Wrench, Archive, FlaskConical, GitBranch, GraduationCap } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useAcademyStore } from '@/lib/academyStore'
import type { AppModule } from '@/App'

const navItems = [
  { id: 'forge'     as AppModule, label: 'FORGE',     icon: Hammer        },
  { id: 'workshop'  as AppModule, label: 'WORKSHOP',  icon: Wrench        },
  { id: 'armory'    as AppModule, label: 'ARMORY',    icon: Archive       },
  { id: 'crucible'  as AppModule, label: 'CRUCIBLE',  icon: FlaskConical  },
  { id: 'labyrinth' as AppModule, label: 'LABYRINTH', icon: GitBranch     },
  { id: 'academy'   as AppModule, label: 'ACADEMY',   icon: GraduationCap },
]

interface SidebarProps {
  activeAppModule: AppModule
  onSetModule: (mod: AppModule) => void
}

export function Sidebar({ activeAppModule, onSetModule }: SidebarProps) {
  const { typhonStatus } = useAppStore()
  const { xp } = useAcademyStore()

  return (
    <div className="w-[56px] h-full glass border-r border-purple-dim/25 flex flex-col items-center py-4 gap-2 shrink-0">
      {/* Logo mark */}
      <div className="w-8 h-8 rounded-lg bg-purple-core/10 border border-purple-dim flex items-center justify-center mb-4 glow-subtle">
        <span className="font-display text-[10px] font-black text-purple-core text-neon">D</span>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeAppModule === item.id
          const Icon = item.icon
          const isAcademy = item.id === 'academy'
          return (
            <button
              key={item.id}
              onClick={() => onSetModule(item.id)}
              className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 group
                ${isActive
                  ? isAcademy
                    ? 'bg-purple-core/20 text-purple-core'
                    : 'bg-purple-core/15 text-purple-core glow-subtle'
                  : isAcademy
                    ? 'text-purple-muted hover:text-purple-bright hover:bg-purple-core/10'
                    : 'text-text-tertiary hover:text-purple-bright hover:bg-void-700'
                }`}
              title={item.label}
              style={isActive && isAcademy ? { boxShadow: '0 0 10px rgba(176,38,255,0.4)' } : undefined}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 rounded-r"
                  style={isAcademy
                    ? { background: '#b026ff', boxShadow: '0 0 6px rgba(176,38,255,0.8)' }
                    : { background: '#b026ff' }
                  }
                />
              )}
              <Icon size={18} />
              {isAcademy && xp > 0 && (
                <div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#b026ff', boxShadow: '0 0 4px rgba(176,38,255,0.9)' }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* TYPHON connection status */}
      <div className="flex flex-col items-center gap-2 pt-4 border-t border-purple-dim/20">
        <div
          className="relative"
          title={`TYPHON: ${typhonStatus}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              typhonStatus === 'online'
                ? 'bg-status-success animate-pulse'
                : typhonStatus === 'connecting'
                ? 'bg-status-warning animate-pulse'
                : 'bg-text-tertiary'
            }`}
          />
        </div>
        <div className="font-mono text-[7px] text-text-tertiary tracking-wider">
          TPH
        </div>
      </div>
    </div>
  )
}
