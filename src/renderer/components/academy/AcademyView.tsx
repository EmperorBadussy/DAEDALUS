import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Star, Lock, Zap, Trophy, Flame, CheckCircle2 } from 'lucide-react'
import {
  useAcademyStore,
  TRACKS,
  ACHIEVEMENT_DEFS,
  getLevelProgress,
  getNextLevel,
  LEVEL_THRESHOLDS,
  LEVEL_ORDER,
  streakMultiplier,
  type TrackId,
} from '@/lib/academyStore'
import { CourseTrack } from './CourseTrack'
import { Onboarding } from './Onboarding'
import { playXPGain, playLevelUp, playAchievementUnlock } from '@/lib/academySounds'

// ── Floating XP Pop ───────────────────────────────────────────────────────────

function FloatingXP({ amount, onDone }: { amount: number; onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -60, scale: 1.15 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      onAnimationComplete={onDone}
      className="pointer-events-none fixed bottom-28 right-10 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[12px] font-bold tracking-wider"
      style={{
        background: 'rgba(176,38,255,0.18)',
        border: '1px solid rgba(176,38,255,0.5)',
        color: '#c084fc',
        boxShadow: '0 0 16px rgba(176,38,255,0.35)',
      }}
    >
      <Zap size={13} />
      +{amount} XP
    </motion.div>
  )
}

// ── Skill Tree Path ───────────────────────────────────────────────────────────

const PATH_POSITIONS = [
  { x: 50, y: 10 },
  { x: 25, y: 30 },
  { x: 65, y: 50 },
  { x: 30, y: 70 },
  { x: 60, y: 88 },
]

function SkillTreePath({
  onSelect,
  completedLessons,
  completedChallenges,
}: {
  onSelect: (id: TrackId) => void
  completedLessons: string[]
  completedChallenges: string[]
}) {
  return (
    <div className="relative w-full" style={{ height: 420 }}>
      {/* SVG dotted connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {PATH_POSITIONS.map((pos, i) => {
          if (i === 0) return null
          const prev = PATH_POSITIONS[i - 1]
          return (
            <motion.line
              key={i}
              x1={prev.x} y1={prev.y}
              x2={pos.x} y2={pos.y}
              stroke="rgba(176,38,255,0.35)"
              strokeWidth="0.4"
              strokeDasharray="1 1.5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            />
          )
        })}
      </svg>

      {/* Nodes */}
      {TRACKS.map((track, i) => {
        const pos = PATH_POSITIONS[i]
        const completedL = track.lessons.filter(l => completedLessons.includes(l.id)).length
        const completedC = track.challenges.filter(c => completedChallenges.includes(c.id)).length
        const total = track.lessons.length + track.challenges.length
        const done = completedL + completedC === total
        const progress = total > 0 ? (completedL + completedC) / total : 0
        const isCurrent = progress > 0 && !done

        return (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 + 0.2, type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Pulse ring for current track */}
            {isCurrent && (
              <motion.div
                animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2"
                style={{ borderColor: track.color, margin: -6 }}
              />
            )}

            <motion.button
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(track.id as TrackId)}
              className="relative flex flex-col items-center gap-1.5 group"
            >
              {/* Node circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  borderColor: done ? track.color : isCurrent ? `${track.color}80` : 'rgba(176,38,255,0.2)',
                  background: done
                    ? `${track.color}20`
                    : isCurrent
                    ? `${track.color}10`
                    : 'rgba(10,0,15,0.7)',
                  boxShadow: done
                    ? `0 0 20px ${track.color}40, 0 0 40px ${track.color}15`
                    : isCurrent
                    ? `0 0 12px ${track.color}30`
                    : undefined,
                }}
              >
                {done ? (
                  <CheckCircle2 size={22} style={{ color: track.color }} />
                ) : progress === 0 ? (
                  <Lock size={18} className="text-text-tertiary opacity-50" />
                ) : (
                  <span className="font-display text-[10px] font-bold" style={{ color: track.color }}>
                    {Math.round(progress * 100)}%
                  </span>
                )}
              </div>

              {/* Progress ring overlay */}
              {progress > 0 && !done && (
                <svg
                  className="absolute top-0 left-0 w-14 h-14 pointer-events-none"
                  viewBox="0 0 56 56"
                  style={{ transform: 'rotate(-90deg)' }}
                >
                  <circle cx="28" cy="28" r="26" fill="none" stroke={`${track.color}20`} strokeWidth="2" />
                  <motion.circle
                    cx="28" cy="28" r="26"
                    fill="none"
                    stroke={track.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - progress) }}
                    transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 + 0.4 }}
                  />
                </svg>
              )}

              {/* Label below node */}
              <div className="text-center mt-0.5">
                <p
                  className="font-display text-[8px] tracking-[0.15em] font-bold"
                  style={{ color: done || isCurrent ? track.color : '#555570' }}
                >
                  {track.name.split(' ')[0]}
                </p>
                <p className="font-mono text-[7px] text-text-tertiary">
                  {completedL}/{track.lessons.length}L · {completedC}/{track.challenges.length}C
                </p>
              </div>
            </motion.button>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Main AcademyView ──────────────────────────────────────────────────────────

export function AcademyView() {
  const {
    xp, level, completedLessons, completedChallenges, achievements, streak,
    xpGainQueue, popXPGain,
  } = useAcademyStore()
  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null)
  const prevLevelRef = useRef(level)

  const progress = getLevelProgress(xp)
  const nextLevel = getNextLevel(xp)
  const currentIdx = LEVEL_ORDER.indexOf(level)
  const mult = streakMultiplier(streak)

  // Level-up sound
  useEffect(() => {
    if (level !== prevLevelRef.current) {
      playLevelUp()
      prevLevelRef.current = level
    }
  }, [level])

  // XP gain sound
  useEffect(() => {
    if (xpGainQueue.length > 0) {
      playXPGain()
    }
  }, [xpGainQueue.length])

  if (selectedTrack) {
    const track = TRACKS.find(t => t.id === selectedTrack)!
    return <CourseTrack track={track} onBack={() => setSelectedTrack(null)} />
  }

  return (
    <>
      <Onboarding />

      {/* Floating XP pops */}
      <AnimatePresence>
        {xpGainQueue.slice(0, 1).map((amt, _) => (
          <FloatingXP key={`${amt}-${Date.now()}`} amount={amt} onDone={popXPGain} />
        ))}
      </AnimatePresence>

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

          {/* Streak badge */}
          {streak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30"
            >
              <Flame size={13} className="text-orange-400" />
              <div>
                <span className="font-mono text-[9px] text-orange-300 tracking-wider">{streak} STREAK</span>
                {mult > 1 && (
                  <span className="font-mono text-[7px] text-orange-400/70 tracking-wider ml-1.5">{mult.toFixed(1)}× XP</span>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* XP Bar + Level */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-xl border border-purple-dim/30 bg-void-900/60 backdrop-blur-sm p-5 overflow-hidden"
        >
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

          {/* XP Progress bar with shimmer */}
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
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-y-0 w-12 opacity-40"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
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

        {/* Skill tree path */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Star size={13} className="text-purple-core" />
            <span className="font-display text-[9px] tracking-[0.2em] text-text-secondary">SKILL PATH</span>
            <span className="font-mono text-[8px] text-text-tertiary ml-auto">click a node to enter</span>
          </div>

          <div className="relative rounded-xl border border-purple-dim/20 bg-void-900/40 overflow-hidden">
            {/* Hex grid background */}
            <div className="absolute inset-0 hex-grid opacity-40 pointer-events-none" />

            <SkillTreePath
              onSelect={setSelectedTrack}
              completedLessons={completedLessons}
              completedChallenges={completedChallenges}
            />
          </div>

          {/* Track legend */}
          <div className="grid grid-cols-5 gap-2 mt-3">
            {TRACKS.map(track => {
              const completedL = track.lessons.filter(l => completedLessons.includes(l.id)).length
              const completedC = track.challenges.filter(c => completedChallenges.includes(c.id)).length
              const total = track.lessons.length + track.challenges.length
              const allDone = completedL + completedC === total
              return (
                <motion.button
                  key={track.id}
                  whileHover={{ scale: 1.03 }}
                  onClick={() => setSelectedTrack(track.id as TrackId)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-200"
                  style={{
                    borderColor: allDone ? `${track.color}50` : 'rgba(176,38,255,0.12)',
                    background: allDone ? `${track.color}08` : 'transparent',
                  }}
                >
                  <span className="font-display text-[7px] tracking-wider font-bold" style={{ color: track.color }}>
                    {track.name.split(' ')[0]}
                  </span>
                  <div className="h-0.5 w-full rounded-full bg-void-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${total > 0 ? ((completedL + completedC) / total) * 100 : 0}%`,
                        background: track.color,
                      }}
                    />
                  </div>
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
