import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Zap, Swords, ChevronRight, X } from 'lucide-react'
import { useAcademyStore } from '@/lib/academyStore'

// ── Step data ─────────────────────────────────────────────────────────────────

const STEPS = [
  {
    id: 0,
    icon: GraduationCap,
    title: 'Welcome to the Academy',
    subtitle: 'Your hacker training ground',
    body: 'DAEDALUS Academy is a gamified security training system. Work through lessons on XSS, SQLi, SSRF, CVSS scoring, WAF evasion, and more — then prove your skills with live challenges.',
    accent: '#b026ff',
    demo: 'icon-glow',
  },
  {
    id: 1,
    icon: Zap,
    title: 'Complete Lessons to Earn XP',
    subtitle: 'Level up from Novice to Master',
    body: 'Every lesson and challenge awards XP. Your streak multiplies your earnings — log in daily and keep your fire burning. Reach 10,000 XP to become a Master.',
    accent: '#a855f7',
    demo: 'xp-bar',
  },
  {
    id: 2,
    icon: Swords,
    title: 'Take On Challenges',
    subtitle: 'Put your skills to the test',
    body: 'Each track has hands-on challenges: bypass WAF filters, decode obfuscated payloads, identify IDORs, and more. Hints cost XP — try without them for maximum reward.',
    accent: '#ff6b35',
    demo: 'challenge-preview',
  },
]

// ── XP Bar Demo ───────────────────────────────────────────────────────────────

function XPBarDemo() {
  return (
    <div className="w-full mt-4 space-y-3">
      {/* Level progression dots */}
      <div className="flex items-center gap-1 justify-between px-1">
        {['NOV', 'APP', 'PRA', 'EXP', 'MAS'].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <motion.div
              animate={{
                backgroundColor: i <= 1 ? '#b026ff' : '#190030',
                boxShadow: i <= 1 ? '0 0 8px rgba(176,38,255,0.7)' : 'none',
              }}
              transition={{ delay: i * 0.15, duration: 0.4 }}
              className="w-2.5 h-2.5 rounded-full border border-purple-dim/40"
            />
            <span className="font-mono text-[7px] text-text-tertiary">{label}</span>
          </div>
        ))}
      </div>

      {/* XP bar */}
      <div className="relative h-3 rounded-full bg-void-800 overflow-hidden border border-purple-dim/20">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '35%' }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: 'linear-gradient(90deg, #7c3aed, #b026ff, #d946ef)' }}
        />
        {/* Shimmer */}
        <motion.div
          animate={{ x: ['-100%', '400%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 1 }}
          className="absolute inset-y-0 w-12 opacity-50"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
        />
      </div>

      <div className="flex justify-between">
        <span className="font-mono text-[9px] text-purple-bright">APPRENTICE</span>
        <span className="font-mono text-[8px] text-text-tertiary">1500 / 2000 XP to PRACTITIONER</span>
      </div>

      {/* Streak badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.0 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-orange-500/40 bg-orange-500/10 w-fit"
      >
        <span className="text-[14px]">🔥</span>
        <span className="font-mono text-[9px] text-orange-300">5 DAY STREAK — 1.5× XP MULTIPLIER</span>
      </motion.div>
    </div>
  )
}

// ── Challenge Preview Demo ────────────────────────────────────────────────────

function ChallengePreviewDemo() {
  return (
    <div className="w-full mt-4 space-y-2">
      <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Swords size={12} className="text-red-400" />
          <span className="font-mono text-[8px] text-red-300 tracking-wider">WAF FILTER (REGEX): &lt;script</span>
        </div>
        <p className="font-mono text-[9px] text-text-secondary leading-relaxed">
          Bypass the filter — inject XSS without a <code className="text-red-300">&lt;script&gt;</code> tag.
        </p>
      </div>
      <div className="flex gap-2">
        <motion.div
          animate={{ borderColor: ['rgba(176,38,255,0.3)', 'rgba(0,255,136,0.5)', 'rgba(176,38,255,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex-1 rounded-lg border bg-void-800/60 px-3 py-2 font-mono text-[9px] text-green-300"
        >
          &lt;img src=x onerror=alert(1)&gt;
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-green-500/40 bg-green-500/8 font-mono text-[8px] text-green-300"
        >
          WAF: BYPASSED
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-500/40 bg-green-500/8"
      >
        <span className="font-mono text-[9px] text-green-300">✓ CHALLENGE COMPLETE — +150 XP</span>
      </motion.div>
    </div>
  )
}

// ── Main Onboarding ───────────────────────────────────────────────────────────

export function Onboarding() {
  const { onboardingComplete, setOnboardingComplete } = useAcademyStore()
  const [step, setStep] = useState(0)
  const [leaving, setLeaving] = useState(false)

  if (onboardingComplete) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const finish = () => {
    setLeaving(true)
    setTimeout(() => setOnboardingComplete(), 350)
  }

  const next = () => {
    if (isLast) finish()
    else setStep(s => s + 1)
  }

  const IconComp = current.icon

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="onboarding-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10,0,15,0.85)', backdropFilter: 'blur(8px)' }}
        >
          {/* Skip button */}
          <button
            onClick={finish}
            className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-dim/30 text-text-tertiary hover:text-text-secondary hover:border-purple-dim/50 transition-all font-mono text-[9px] tracking-wider"
          >
            <X size={11} />
            SKIP
          </button>

          {/* Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 60, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-[520px] max-w-[90vw] rounded-2xl border bg-void-900/95 p-8 overflow-hidden"
              style={{
                borderColor: `${current.accent}40`,
                boxShadow: `0 0 60px ${current.accent}18, 0 0 120px ${current.accent}08`,
              }}
            >
              {/* HUD corners */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-2xl" style={{ borderColor: `${current.accent}80` }} />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-2xl" style={{ borderColor: `${current.accent}80` }} />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-2xl" style={{ borderColor: `${current.accent}80` }} />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-2xl" style={{ borderColor: `${current.accent}80` }} />

              {/* Ambient glow */}
              <div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${current.accent}0a 0%, transparent 60%)` }}
              />

              {/* Icon */}
              <motion.div
                className="relative mx-auto mb-6 w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${current.accent}18`, border: `1px solid ${current.accent}40` }}
                animate={{ boxShadow: [`0 0 10px ${current.accent}30`, `0 0 25px ${current.accent}60`, `0 0 10px ${current.accent}30`] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <IconComp size={28} style={{ color: current.accent }} />
              </motion.div>

              {/* Text */}
              <div className="text-center mb-2">
                <p className="font-mono text-[9px] text-text-tertiary tracking-[0.3em] mb-1">
                  STEP {step + 1} OF {STEPS.length}
                </p>
                <h2
                  className="font-display text-[16px] tracking-[0.12em] font-black mb-1"
                  style={{ color: current.accent, textShadow: `0 0 16px ${current.accent}60` }}
                >
                  {current.title.toUpperCase()}
                </h2>
                <p className="font-mono text-[9px] text-text-tertiary tracking-wider">{current.subtitle.toUpperCase()}</p>
              </div>

              <p className="font-mono text-[10px] text-text-secondary leading-relaxed text-center mt-3 mb-2">
                {current.body}
              </p>

              {/* Step demo */}
              {step === 1 && <XPBarDemo />}
              {step === 2 && <ChallengePreviewDemo />}

              {/* Step dots */}
              <div className="flex items-center justify-center gap-2 mt-6 mb-5">
                {STEPS.map((s, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      width: i === step ? 24 : 8,
                      backgroundColor: i === step ? current.accent : i < step ? `${current.accent}60` : '#190030',
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-1.5 rounded-full"
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-3">
                <motion.button
                  onClick={next}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-mono text-[10px] tracking-[0.15em] font-bold transition-all"
                  style={{
                    background: `${current.accent}20`,
                    border: `1px solid ${current.accent}60`,
                    color: current.accent,
                    boxShadow: `0 0 16px ${current.accent}25`,
                  }}
                >
                  {isLast ? 'START TRAINING' : 'NEXT'}
                  <ChevronRight size={14} />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
