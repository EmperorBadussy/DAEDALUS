import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Timer, Lightbulb, Send, CheckCircle2, XCircle, Zap, Star,
  Shield, AlertTriangle, Gauge,
} from 'lucide-react'
import { useAcademyStore, type ChallengeDef } from '@/lib/academyStore'
import { playChallengeComplete, playChallengeFail, playAchievementUnlock } from '@/lib/academySounds'

interface ChallengeViewProps {
  challenge: ChallengeDef
  trackColor: string
  trackName: string
  onBack: () => void
}

const HINT_COST = 5
const HINT_GLOW_SECS = 30

// ── Similarity helpers ─────────────────────────────────────────────────────────

function jaccardSim(a: string, b: string): number {
  if (!a || !b) return 0
  const sa = new Set(a.toLowerCase().split(''))
  const sb = new Set(b.toLowerCase().split(''))
  const inter = new Set([...sa].filter(c => sb.has(c)))
  const union = new Set([...sa, ...sb])
  return inter.size / union.size
}

function fuzzyScore(input: string, answer: string | ((s: string) => boolean)): number {
  if (!input.trim()) return 0
  if (typeof answer === 'function') {
    // For function answers, check if it passes
    if (answer(input.trim())) return 1
    // Partial scoring: keyword overlap
    const keywords = ['union', 'select', 'alert', 'script', 'onerror', 'xss', 'injection', 'payload', '1337', 'api', '%25', 'legacy', 'none', 'hs256']
    const matches = keywords.filter(k => input.toLowerCase().includes(k))
    return Math.min(matches.length * 0.15, 0.85)
  }
  if (typeof answer === 'string') {
    if (input.trim().toLowerCase() === answer.toLowerCase()) return 1
    return jaccardSim(input, answer)
  }
  return 0
}

function warmthLabel(score: number): { label: string; color: string } {
  if (score >= 1.0) return { label: 'CORRECT!', color: '#00ff88' }
  if (score >= 0.7) return { label: 'VERY CLOSE', color: '#22d3ee' }
  if (score >= 0.45) return { label: 'GETTING WARMER', color: '#a3e635' }
  if (score >= 0.2) return { label: 'LUKEWARM', color: '#facc15' }
  return { label: 'COLD', color: '#6b7280' }
}

// ── WAF Bypass Simulator ───────────────────────────────────────────────────────

function WafBypassSimulator({
  filter, value, onChange,
}: {
  filter?: string
  value: string
  onChange: (v: string) => void
}) {
  const passes = filter ? !new RegExp(filter, 'i').test(value) : true
  const hasAlert = /alert\s*\(/i.test(value)

  return (
    <div className="space-y-3">
      {filter && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/5 p-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield size={11} className="text-red-400" />
            <span className="font-mono text-[8px] text-red-300 tracking-wider">WAF FILTER (REGEX)</span>
          </div>
          <code className="font-mono text-[10px] text-red-200">{filter}</code>
        </div>
      )}
      <div>
        <label className="font-mono text-[9px] text-text-tertiary tracking-wider block mb-1.5">YOUR PAYLOAD</label>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
          placeholder="Craft your bypass payload..."
          className="w-full bg-void-800 border border-purple-dim/25 rounded-lg px-3 py-2 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-dim/60 resize-none"
        />
      </div>
      <div className="flex gap-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border font-mono text-[8px] tracking-wider ${passes ? 'border-green-500/40 bg-green-500/8 text-green-300' : 'border-red-500/40 bg-red-500/8 text-red-300'}`}>
          <Shield size={10} />
          WAF: {passes ? 'BYPASSED' : 'BLOCKED'}
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border font-mono text-[8px] tracking-wider ${hasAlert ? 'border-green-500/40 bg-green-500/8 text-green-300' : 'border-void-600 bg-void-800 text-text-tertiary'}`}>
          <AlertTriangle size={10} />
          XSS: {hasAlert ? 'ACTIVE' : 'INACTIVE'}
        </div>
      </div>
    </div>
  )
}

// ── Confidence Meter ──────────────────────────────────────────────────────────

function ConfidenceMeter({ score }: { score: number }) {
  const { label, color } = warmthLabel(score)
  const pct = Math.round(score * 100)

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Gauge size={11} style={{ color }} />
          <span className="font-mono text-[8px] tracking-wider" style={{ color }}>{label}</span>
        </div>
        <span className="font-mono text-[8px] text-text-tertiary">{pct}%</span>
      </div>
      <div className="relative h-1.5 rounded-full bg-void-800 overflow-hidden">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, #7c3aed, ${color})` }}
        />
        {score > 0.05 && (
          <motion.div
            animate={{ x: ['0%', '100%', '0%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-y-0 w-6 opacity-30"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
          />
        )}
      </div>
    </div>
  )
}

// ── Main ChallengeView ────────────────────────────────────────────────────────

export function ChallengeView({ challenge, trackColor, trackName, onBack }: ChallengeViewProps) {
  const { completedChallenges, xp, completeChallenge, addXP } = useAcademyStore()
  const [answer, setAnswer] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const [hintsUsed, setHintsUsed] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState<boolean | null>(null)
  const [showHints, setShowHints] = useState(false)
  const [xpPopup, setXpPopup] = useState<number | null>(null)
  const [hintGlowing, setHintGlowing] = useState(false)
  const [achievementPopup, setAchievementPopup] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isDone = completedChallenges.includes(challenge.id)

  const confidenceScore = submitted ? (correct ? 1 : 0) : fuzzyScore(answer, challenge.answer)
  const { color: borderColor } = warmthLabel(confidenceScore)

  // Timer
  useEffect(() => {
    if (!isDone) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isDone])

  // Auto-hint glow after 30 seconds
  useEffect(() => {
    if (isDone || submitted) return
    hintTimerRef.current = setTimeout(() => {
      setHintGlowing(true)
    }, HINT_GLOW_SECS * 1000)
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current) }
  }, [isDone, submitted])

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleRevealHint = (idx: number) => {
    if (hintsUsed.includes(idx)) return
    if (xp - hintsUsed.length * HINT_COST < HINT_COST) return
    addXP(-HINT_COST)
    setHintsUsed(prev => [...prev, idx])
    setHintGlowing(false)
  }

  const handleSubmit = useCallback(() => {
    if (submitted || isDone) return
    if (timerRef.current) clearInterval(timerRef.current)
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    setSubmitted(true)

    let isCorrect = false
    if (typeof challenge.answer === 'function') {
      isCorrect = challenge.answer(answer.trim())
    } else {
      isCorrect = answer.trim().toLowerCase() === challenge.answer.toLowerCase()
    }

    setCorrect(isCorrect)

    if (isCorrect) {
      const hintPenalty = hintsUsed.length * HINT_COST
      const awardedXP = Math.max(challenge.xpReward - hintPenalty, Math.floor(challenge.xpReward * 0.3))
      completeChallenge(challenge.id, awardedXP, elapsed)
      playChallengeComplete()
      setXpPopup(awardedXP)
      setTimeout(() => setXpPopup(null), 3000)

      // First blood achievement popup
      if (completedChallenges.length === 0) {
        playAchievementUnlock()
        setAchievementPopup(true)
        setTimeout(() => setAchievementPopup(false), 3000)
      }
    } else {
      playChallengeFail()
    }
  }, [answer, challenge, elapsed, hintsUsed, isDone, submitted, completeChallenge, completedChallenges.length])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'Enter') handleSubmit()
  }

  const pulseBorderStyle = !submitted && answer.trim() ? {
    boxShadow: `0 0 0 1.5px ${borderColor}60, 0 0 12px ${borderColor}20`,
    borderColor: `${borderColor}50`,
    transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
  } : {}

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-void-950 p-6">
      {/* XP popup */}
      <AnimatePresence>
        {xpPopup !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="fixed top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-[11px] tracking-wider font-bold pointer-events-none"
            style={{
              background: 'rgba(0,255,136,0.15)',
              border: '1px solid rgba(0,255,136,0.5)',
              color: '#00ff88',
              boxShadow: '0 0 20px rgba(0,255,136,0.4)',
            }}
          >
            <Zap size={14} />
            +{xpPopup} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement popup */}
      <AnimatePresence>
        {achievementPopup && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-28 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-[10px] tracking-wider pointer-events-none"
            style={{
              background: 'rgba(250,204,21,0.12)',
              border: '1px solid rgba(250,204,21,0.4)',
              color: '#fde047',
              boxShadow: '0 0 24px rgba(250,204,21,0.3)',
            }}
          >
            <span className="text-[18px]">🩸</span>
            <div>
              <p className="font-bold">ACHIEVEMENT UNLOCKED</p>
              <p className="text-[8px] text-yellow-200/70">First Blood</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-dim/25 text-text-tertiary hover:text-purple-bright hover:border-purple-dim/50 transition-all duration-200 font-mono text-[9px] tracking-wider"
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        <div className="w-px h-4 bg-purple-dim/25" />
        <span className="font-mono text-[9px] text-text-tertiary">{trackName}</span>
        <span className="font-mono text-[9px] text-purple-dim">/</span>
        <span className="font-mono text-[9px]" style={{ color: trackColor }}>{challenge.title}</span>
        {!isDone && (
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded border border-purple-dim/30 bg-void-900">
            <Timer size={10} className="text-purple-bright" />
            <span className="font-mono text-[9px] text-purple-bright tabular-nums">{formatTime(elapsed)}</span>
          </div>
        )}
      </div>

      {/* Challenge header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-purple-dim/20 bg-void-900/50 p-5 mb-4 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: `${trackColor}80` }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: `${trackColor}80` }} />

        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="font-display text-[14px] tracking-[0.1em] font-black text-text-primary">{challenge.title}</h1>
          <div className="flex gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < challenge.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-void-600'} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: trackColor }} />
            <span className="font-mono text-[8px]" style={{ color: trackColor }}>{challenge.xpReward} XP base reward</span>
          </div>
          <div className="flex items-center gap-1 text-text-tertiary font-mono text-[8px]">
            <Lightbulb size={9} />
            {hintsUsed.length}/{challenge.hints.length} hints used (−{HINT_COST} XP each)
          </div>
        </div>

        <p className="font-mono text-[10px] text-text-secondary leading-relaxed whitespace-pre-line">
          {challenge.description}
        </p>
      </motion.div>

      {/* Input area */}
      {!isDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          {challenge.type === 'waf-bypass' ? (
            <div>
              <WafBypassSimulator
                filter={challenge.filterRegex}
                value={answer}
                onChange={setAnswer}
              />
              {answer.trim() && !submitted && <ConfidenceMeter score={confidenceScore} />}
            </div>
          ) : (
            <div>
              <label className="font-mono text-[9px] text-text-tertiary tracking-wider block mb-1.5">YOUR ANSWER</label>
              {challenge.type === 'encoding' || challenge.type === 'surface' ? (
                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={4}
                  placeholder={
                    challenge.type === 'encoding' ? 'Enter the encoded/decoded payload...' :
                    challenge.type === 'surface' ? 'List attack vectors separated by commas...' :
                    'Enter your answer...'
                  }
                  className="w-full bg-void-800 rounded-lg px-3 py-2.5 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none resize-none border transition-all"
                  style={pulseBorderStyle}
                />
              ) : (
                <input
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={
                    challenge.type === 'cvss' ? 'Enter CVSS score (e.g. 9.8)' :
                    challenge.type === 'cwe' ? 'Enter CWE number (e.g. 22)' :
                    challenge.type === 'idor' ? 'Enter the request (e.g. GET /api/...)' :
                    'Enter your answer...'
                  }
                  className="w-full bg-void-800 rounded-lg px-3 py-2.5 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none border transition-all"
                  style={pulseBorderStyle}
                />
              )}
              {answer.trim() && !submitted && <ConfidenceMeter score={confidenceScore} />}
              <p className="font-mono text-[8px] text-text-tertiary mt-1">Ctrl+Enter to submit</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Hints panel */}
      <div className="mb-4">
        <motion.button
          animate={hintGlowing && !showHints ? {
            boxShadow: ['0 0 0px rgba(250,204,21,0)', '0 0 12px rgba(250,204,21,0.5)', '0 0 0px rgba(250,204,21,0)'],
            color: ['#555570', '#fde047', '#555570'],
          } : {}}
          transition={hintGlowing ? { duration: 2, repeat: Infinity } : {}}
          onClick={() => { setShowHints(h => !h); setHintGlowing(false) }}
          className="flex items-center gap-2 font-mono text-[9px] text-text-tertiary hover:text-yellow-300 transition-colors tracking-wider rounded px-1"
        >
          <Lightbulb size={12} className={showHints ? 'text-yellow-400' : hintGlowing ? 'text-yellow-400' : ''} />
          {showHints ? 'HIDE HINTS' : 'SHOW HINTS'} (−{HINT_COST} XP each)
          {hintGlowing && !showHints && (
            <span className="font-mono text-[7px] text-yellow-400/70 animate-pulse">← click for a nudge</span>
          )}
        </motion.button>

        <AnimatePresence>
          {showHints && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex flex-col gap-2">
                {challenge.hints.map((hint, i) => (
                  <div key={i} className="rounded-lg border border-yellow-400/20 bg-yellow-400/5">
                    {hintsUsed.includes(i) ? (
                      <div className="flex gap-2.5 p-3">
                        <Lightbulb size={12} className="text-yellow-400 shrink-0 mt-0.5" />
                        <p className="font-mono text-[9px] text-yellow-200/80 leading-relaxed">{hint}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRevealHint(i)}
                        className="w-full flex items-center justify-between p-3 hover:bg-yellow-400/8 transition-colors rounded-lg"
                      >
                        <span className="font-mono text-[9px] text-yellow-400/60 tracking-wider">HINT {i + 1} — REVEAL (−{HINT_COST} XP)</span>
                        <Lightbulb size={11} className="text-yellow-400/40" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Result display */}
      <AnimatePresence>
        {submitted && correct !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`rounded-xl border p-4 mb-4 ${
              correct ? 'border-green-500/40 bg-green-500/8' : 'border-red-500/40 bg-red-500/8'
            }`}
          >
            <div className="flex items-center gap-3">
              {correct ? (
                <CheckCircle2 size={22} className="text-green-400 shrink-0" />
              ) : (
                <XCircle size={22} className="text-red-400 shrink-0" />
              )}
              <div>
                <p className={`font-display text-[11px] tracking-[0.15em] font-bold ${correct ? 'text-green-300' : 'text-red-300'}`}>
                  {correct ? 'CORRECT! CHALLENGE COMPLETE' : 'INCORRECT — TRY AGAIN'}
                </p>
                <p className="font-mono text-[9px] text-text-tertiary mt-0.5">
                  {correct
                    ? `Completed in ${formatTime(elapsed)} — ${Math.max(challenge.xpReward - hintsUsed.length * HINT_COST, Math.floor(challenge.xpReward * 0.3))} XP awarded`
                    : 'Review the hints and refine your answer.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isDone && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/6 p-4 mb-4 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-400 shrink-0" />
          <p className="font-mono text-[9px] text-green-300 tracking-wider">CHALLENGE ALREADY COMPLETED</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-purple-dim/15">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-dim/25 text-text-tertiary hover:text-text-secondary hover:border-purple-dim/40 transition-all font-mono text-[9px] tracking-wider"
        >
          <ArrowLeft size={12} />
          BACK TO TRACK
        </button>

        {!isDone && !(submitted && correct) && (
          <motion.button
            onClick={handleSubmit}
            disabled={!answer.trim()}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-[9px] tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: answer.trim() ? `${trackColor}18` : undefined,
              border: `1px solid ${answer.trim() ? `${trackColor}50` : 'rgba(176,38,255,0.2)'}`,
              color: answer.trim() ? trackColor : '#666',
              boxShadow: answer.trim() ? `0 0 10px ${trackColor}20` : undefined,
            }}
          >
            <Send size={12} />
            SUBMIT ANSWER
          </motion.button>
        )}

        {submitted && !correct && (
          <button
            onClick={() => { setSubmitted(false); setCorrect(null) }}
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-purple-dim/30 text-purple-bright font-mono text-[9px] tracking-wider hover:border-purple-dim/60 transition-all"
          >
            TRY AGAIN
          </button>
        )}
      </div>
    </div>
  )
}
