import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Star, Lock, ChevronRight, Zap, Trophy, Flame } from 'lucide-react'
import {
  useAcademyStore,
  TRACKS,
  ACHIEVEMENT_DEFS,
  getLevelProgress,
  getNextLevel,
  LEVEL_THRESHOLDS,
  LEVEL_ORDER,
  type TrackId,
} from '@/lib/academyStore'
import { CourseTrack } from './CourseTrack'

export function AcademyView() {
  const { xp, level, completedLessons, completedChallenges, achievements, streak } = useAcademyStore()
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null)

  const progress = getLevelProgress(xp)
  const nextLevel = getNextLevel(xp)
  const currentIdx = LEVEL_ORDER.indexOf(level)

  if (selectedTrack) {
    const track = TRACKS.find(t => t.id === selectedTrack)!
    return <CourseTrack track={track} onBack={() => setSelectedTrack(null)} />
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-void-950 p-6 gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-core/15 border border-purple-dim flex items-center justify-center">
          <GraduationCap size={18} className="text-purple-core" />
        </div>
        <div>
          <h1 className="font-display text-[11px] tracking-[0.25em] text-purple-bright font-bold">DAEDALUS ACADEMY</h1>
          <p className="font-mono text-[9px] text-text-tertiary tracking-wider">GAMIFIED SECURITY TRAINING SYSTEM</p>
        </div>
        {streak > 0 && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <Flame size={13} className="text-orange-400" />
            <span className="font-mono text-[9px] text-orange-300 tracking-wider">{streak} STREAK</span>
          </div>
        )}
      </div>

      {/* XP Bar + Level */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-purple-dim/30 bg-void-900/60 backdrop-blur-sm p-5 overflow-hidden"
      >
        {/* HUD corners */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-purple-core/60 rounded-tl" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-purple-core/60 rounded-tr" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-purple-core/60 rounded-bl" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-purple-core/60 rounded-br" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-purple-core" />
              <span
                className="font-display text-[13px] tracking-[0.15em] font-black"
                style={{ color: '#b026ff', textShadow: '0 0 12px rgba(176,38,255,0.8)' }}
              >
                {level.toUpperCase()}
              </span>
            </div>
            <div className="w-px h-4 bg-purple-dim/30" />
            <span className="font-mono text-[10px] text-text-secondary">
              {xp.toLocaleString()} XP
            </span>
          </div>
          {nextLevel && (
            <span className="font-mono text-[9px] text-text-tertiary">
              {(LEVEL_THRESHOLDS[nextLevel] - xp).toLocaleString()} XP to {nextLevel}
            </span>
          )}
        </div>

        {/* Level progression dots */}
        <div className="flex items-center gap-2 mb-3">
          {LEVEL_ORDER.map((lvl, i) => (
            <div key={lvl} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    i <= currentIdx ? 'bg-purple-core' : 'bg-void-700 border border-purple-dim/30'
                  }`}
                  style={i <= currentIdx ? { boxShadow: '0 0 6px rgba(176,38,255,0.6)' } : {}}
                />
                <span className="font-mono text-[7px] text-text-tertiary tracking-wider">{lvl.slice(0, 3).toUpperCase()}</span>
              </div>
              {i < LEVEL_ORDER.length - 1 && (
                <div className={`h-px w-8 ${i < currentIdx ? 'bg-purple-core' : 'bg-void-700'} mb-2`} />
              )}
            </div>
          ))}
        </div>

        {/* XP Progress bar */}
        <div className="relative h-2 rounded-full bg-void-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, #7c3aed, #b026ff, #d946ef)',
              boxShadow: '0 0 8px rgba(176,38,255,0.6)',
            }}
          />
          <motion.div
            animate={{ x: ['0%', '100%', '0%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-y-0 w-8 opacity-40"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
          />
        </div>
      </motion.div>

      {/* Achievements row */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={13} className="text-yellow-400" />
          <span className="font-display text-[9px] tracking-[0.2em] text-text-secondary">ACHIEVEMENTS</span>
          <span className="font-mono text-[8px] text-text-tertiary ml-auto">{achievements.length}/{ACHIEVEMENT_DEFS.length}</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {ACHIEVEMENT_DEFS.map((ach) => {
            const unlocked = achievements.includes(ach.id)
            return (
              <motion.div
                key={ach.id}
                title={`${ach.name}: ${ach.description}`}
                whileHover={{ scale: 1.08 }}
                className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border cursor-default transition-all duration-200 ${
                  unlocked
                    ? 'border-yellow-400/50 bg-yellow-400/8'
                    : 'border-purple-dim/20 bg-void-900/40 opacity-40'
                }`}
                style={unlocked ? { boxShadow: '0 0 12px rgba(250,204,21,0.25)' } : {}}
              >
                {!unlocked && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
                    <Lock size={10} className="text-text-tertiary" />
                  </div>
                )}
                <span className="text-[14px]">{ach.icon}</span>
                <span className={`font-mono text-[7px] tracking-wider ${unlocked ? 'text-yellow-300' : 'text-text-tertiary'}`}>
                  {ach.name.toUpperCase()}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Course tracks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star size={13} className="text-purple-core" />
          <span className="font-display text-[9px] tracking-[0.2em] text-text-secondary">COURSE TRACKS</span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {TRACKS.map((track, i) => {
            const completedL = track.lessons.filter(l => completedLessons.includes(l.id)).length
            const completedC = track.challenges.filter(c => completedChallenges.includes(c.id)).length
            const totalL = track.lessons.length
            const totalC = track.challenges.length
            const trackXP = [
              ...track.lessons.filter(l => completedLessons.includes(l.id)).map(l => l.xpReward),
              ...track.challenges.filter(c => completedChallenges.includes(c.id)).map(c => c.xpReward),
            ].reduce((a, b) => a + b, 0)
            const allDone = completedL === totalL && completedC === totalC

            return (
              <motion.button
                key={track.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, duration: 0.25 }}
                whileHover={{ scale: 1.01, x: 2 }}
                onClick={() => setSelectedTrack(track.id)}
                className="relative text-left rounded-xl border bg-void-900/50 backdrop-blur-sm p-4 transition-all duration-200 group overflow-hidden"
                style={{
                  borderColor: allDone ? `${track.color}60` : 'rgba(176,38,255,0.15)',
                  boxShadow: allDone ? `0 0 20px ${track.color}20` : undefined,
                }}
              >
                {/* HUD brackets */}
                <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l rounded-tl" style={{ borderColor: `${track.color}80` }} />
                <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r rounded-tr" style={{ borderColor: `${track.color}80` }} />
                <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l rounded-bl" style={{ borderColor: `${track.color}80` }} />
                <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r rounded-br" style={{ borderColor: `${track.color}80` }} />

                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at center, ${track.color}08 0%, transparent 70%)` }}
                />

                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="font-display text-[11px] tracking-[0.15em] font-bold"
                        style={{ color: track.color }}
                      >
                        {track.name.toUpperCase()}
                      </span>
                      {allDone && (
                        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded border" style={{ color: track.color, borderColor: `${track.color}50`, background: `${track.color}10` }}>
                          COMPLETE
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[9px] text-text-tertiary mb-3">{track.description}</p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-purple-core" />
                        <span className="font-mono text-[9px] text-text-secondary">{completedL}/{totalL} lessons</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full" style={{ backgroundColor: track.color }} />
                        <span className="font-mono text-[9px] text-text-secondary">{completedC}/{totalC} challenges</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Zap size={9} style={{ color: track.color }} />
                        <span className="font-mono text-[9px]" style={{ color: track.color }}>{trackXP} XP</span>
                      </div>
                    </div>

                    {/* Track progress bar */}
                    <div className="mt-2 h-1 rounded-full bg-void-800 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((completedL + completedC) / (totalL + totalC)) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.07 }}
                        className="h-full rounded-full"
                        style={{ background: track.color, boxShadow: `0 0 4px ${track.color}60` }}
                      />
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-text-tertiary group-hover:text-purple-bright transition-colors ml-3 mt-1 shrink-0" />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
