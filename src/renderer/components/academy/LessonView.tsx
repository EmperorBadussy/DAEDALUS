import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, CheckCircle2, Code2, Lightbulb, Zap, BookOpen,
  FlaskConical, ChevronRight,
} from 'lucide-react'
import { useAcademyStore, type LessonDef, type LessonSection } from '@/lib/academyStore'
import { playXPGain, playMiniChallengeBonus, playChallengeFail } from '@/lib/academySounds'

// ── Per-lesson mini challenges ────────────────────────────────────────────────

interface MiniQ {
  question: string
  choices: string[]
  correct: number
  explanation: string
}

const MINI_CHALLENGES: Record<string, MiniQ> = {
  'forge-1': {
    question: 'Which XSS type is stored in the database and affects every user who views the page?',
    choices: ['Reflected XSS', 'Stored XSS', 'DOM-based XSS', 'Blind XSS'],
    correct: 1,
    explanation: 'Stored XSS persists in the DB and executes for all visitors — no interaction required beyond visiting.',
  },
  'forge-2': {
    question: 'What technique appends a second query result to read from a different table?',
    choices: ['Blind SQLi', 'Error-based SQLi', 'UNION SELECT injection', 'Stacked queries'],
    correct: 2,
    explanation: 'UNION SELECT appends a second result set — column count and types must match.',
  },
  'forge-3': {
    question: 'Which AWS endpoint does SSRF commonly target to steal cloud credentials?',
    choices: ['http://internal-api/', 'http://169.254.169.254/latest/meta-data/', 'http://localhost:8080/admin', 'http://0.0.0.0/'],
    correct: 1,
    explanation: 'AWS IMDSv1 at 169.254.169.254 exposes IAM credentials without authentication.',
  },
  'armory-1': {
    question: 'Which OWASP Top 10 2021 category ranked #1 (most prevalent)?',
    choices: ['Injection', 'Broken Access Control', 'Cryptographic Failures', 'SSRF'],
    correct: 1,
    explanation: 'A01: Broken Access Control — 94% of applications had some form of it.',
  },
  'armory-2': {
    question: 'What CVSS score range is classified as Critical?',
    choices: ['7.0–8.9', '6.0–7.9', '9.0–10.0', '8.0–9.9'],
    correct: 2,
    explanation: 'Critical = 9.0–10.0. High = 7.0–8.9. Medium = 4.0–6.9.',
  },
  'armory-3': {
    question: 'What should every strong bug report include?',
    choices: [
      'Steps to Reproduce, PoC, Impact, Remediation',
      'Just a screenshot',
      'CVSS score only',
      'A Metasploit module',
    ],
    correct: 0,
    explanation: 'Summary, Steps to Reproduce, PoC, Impact, and Remediation are required sections.',
  },
  'crucible-1': {
    question: 'Which HTTP header prevents browsers from rendering a page inside a frame?',
    choices: ['Content-Security-Policy', 'X-Content-Type-Options', 'X-Frame-Options', 'Strict-Transport-Security'],
    correct: 2,
    explanation: 'X-Frame-Options: DENY prevents clickjacking by disallowing framing.',
  },
  'crucible-2': {
    question: 'What JWT algorithm attack sets the algorithm to "none" to bypass signature verification?',
    choices: ['RS256→HS256 confusion', 'alg:none attack', 'HMAC brute-force', 'Header injection'],
    correct: 1,
    explanation: 'alg:none removes signature verification entirely — any payload is accepted.',
  },
  'crucible-3': {
    question: 'What is IDOR short for?',
    choices: ['Internal Data Object Reference', 'Insecure Direct Object Reference', 'Indirect Domain Object Routing', 'Invalid Data Object Request'],
    correct: 1,
    explanation: 'Insecure Direct Object Reference — replacing a resource ID to access another user\'s data.',
  },
  'labyrinth-1': {
    question: 'What is Base64 encoding used for?',
    choices: ['Encrypting sensitive data', 'Data transport / representation without security guarantees', 'Hashing passwords', 'Signing JWTs'],
    correct: 1,
    explanation: 'Base64 is transport encoding — NOT security. Anyone can decode it trivially.',
  },
  'labyrinth-2': {
    question: 'Why does double URL-encoding bypass some WAFs?',
    choices: [
      'It makes the payload longer',
      'WAFs decode once and see a benign string; the app decodes again revealing the payload',
      'The WAF cannot handle hex characters',
      'Double encoding encrypts the payload',
    ],
    correct: 1,
    explanation: 'WAF sees %253C (benign), app decodes twice: %253C → %3C → <',
  },
  'labyrinth-3': {
    question: 'Which alternative XSS vector avoids the <script> tag entirely?',
    choices: ['<style>alert(1)</style>', '<img src=x onerror=alert(1)>', '<link href=alert(1)>', '<meta content=alert(1)>'],
    correct: 1,
    explanation: '<img onerror> fires when an image fails to load — no script tag needed.',
  },
  'recon-1': {
    question: 'Which passive technique uses certificate transparency logs to find subdomains?',
    choices: ['massdns brute-force', 'VHOST fuzzing with ffuf', 'crt.sh queries', 'Nmap scanning'],
    correct: 2,
    explanation: 'crt.sh indexes CT logs — free, no scanning needed, fully passive.',
  },
  'recon-2': {
    question: 'Which port running Redis is often unauthenticated and directly exploitable?',
    choices: ['3306', '27017', '6379', '8443'],
    correct: 2,
    explanation: 'Redis (6379) is notoriously often deployed without authentication.',
  },
  'recon-3': {
    question: 'What is the first step in the asset discovery framework?',
    choices: ['JavaScript analysis', 'Directory discovery', 'Root domains + IP ranges', 'Parameter discovery'],
    correct: 2,
    explanation: 'Start with scope definition: root domains and IP ranges from WHOIS/ASN lookups.',
  },
}

// ── Interactive Widgets ────────────────────────────────────────────────────────

function XSSWidget() {
  const [input, setInput] = useState('')

  const wouldExecute = input.length > 0 && (
    /<script[\s>]/i.test(input) ||
    /on\w+\s*=/i.test(input) ||
    /javascript:/i.test(input)
  )
  const encoded = input ? input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') : ''

  return (
    <div className="space-y-2 mt-2">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder='Try: <img src=x onerror=alert(1)>'
        className="w-full bg-void-800 border border-purple-dim/25 rounded-lg px-3 py-2 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-dim/60"
      />
      {input && (
        <div className="rounded-lg border border-void-600 bg-void-900/80 p-3 space-y-1.5">
          <p className="font-mono text-[8px] text-text-tertiary tracking-wider">MOCK BROWSER OUTPUT</p>
          <div className="h-px bg-purple-dim/20" />
          <p className="font-mono text-[9px] text-green-300 break-all">{encoded}</p>
          <div className={`flex items-center gap-2 mt-2 px-2 py-1 rounded border font-mono text-[8px] ${
            wouldExecute ? 'border-red-500/40 bg-red-500/8 text-red-300' : 'border-green-500/40 bg-green-500/8 text-green-300'
          }`}>
            {wouldExecute ? '⚠ Would execute (HTML-encoded output prevents it)' : '✓ Safe — no executable patterns detected'}
          </div>
        </div>
      )}
    </div>
  )
}

function Base64Widget() {
  const [input, setInput] = useState('')
  const encoded = input ? (() => { try { return btoa(input) } catch { return '[non-latin1 chars]' } })() : ''
  const urlEncoded = input ? encodeURIComponent(input) : ''

  return (
    <div className="space-y-2 mt-2">
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder='Type to encode in real-time...'
        className="w-full bg-void-800 border border-purple-dim/25 rounded-lg px-3 py-2 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-dim/60"
      />
      {input && (
        <div className="space-y-1.5">
          <div className="rounded-lg bg-void-900/80 border border-purple-dim/20 p-2.5">
            <p className="font-mono text-[7px] text-text-tertiary tracking-wider mb-1">BASE64</p>
            <p className="font-mono text-[9px] text-purple-bright break-all">{encoded}</p>
          </div>
          <div className="rounded-lg bg-void-900/80 border border-purple-dim/20 p-2.5">
            <p className="font-mono text-[7px] text-text-tertiary tracking-wider mb-1">URL ENCODED</p>
            <p className="font-mono text-[9px] text-green-300 break-all">{urlEncoded}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function SQLiWidget() {
  const [username, setUsername] = useState("' OR '1'='1")

  const baseQuery = `SELECT * FROM users WHERE username = '${username}' AND password = 'hunter2'`
  const isInjected = /['";]/.test(username) || /\bOR\b|\bAND\b|\bUNION\b/i.test(username)

  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <p className="font-mono text-[8px] text-text-tertiary tracking-wider mb-1">USERNAME INPUT</p>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="admin"
            className="w-full bg-void-800 border border-purple-dim/25 rounded-lg px-3 py-2 font-mono text-[10px] text-red-300 placeholder-text-tertiary focus:outline-none focus:border-purple-dim/60"
          />
        </div>
      </div>
      <div className="rounded-lg bg-void-900/80 border border-purple-dim/20 p-3">
        <p className="font-mono text-[7px] text-text-tertiary tracking-wider mb-1.5">RESULTING SQL QUERY</p>
        <p className="font-mono text-[9px] leading-relaxed break-all">
          <span className="text-purple-bright">SELECT * FROM users WHERE username = </span>
          <span className={isInjected ? 'text-red-300' : 'text-green-300'}>'{username}'</span>
          <span className="text-purple-bright"> AND password = 'hunter2'</span>
        </p>
      </div>
      {isInjected && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/40 bg-red-500/8 font-mono text-[8px] text-red-300"
        >
          ⚠ Injection detected — query logic has been modified
        </motion.div>
      )}
    </div>
  )
}

function InteractiveWidget({ type }: { type: LessonSection['interactiveType'] }) {
  if (type === 'xss-reflect') return <XSSWidget />
  if (type === 'encode-base64') return <Base64Widget />
  if (type === 'url-encode') return <Base64Widget />
  if (type === 'sqli-builder') return <SQLiWidget />
  return null
}

// ── Section renderer ──────────────────────────────────────────────────────────

function SectionBlock({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'heading':
      return (
        <h3 className="font-display text-[11px] tracking-[0.15em] text-purple-bright font-bold mt-5 mb-2">
          {section.text}
        </h3>
      )
    case 'paragraph':
      return (
        <p className="font-mono text-[10px] text-text-secondary leading-relaxed mb-3">
          {section.text}
        </p>
      )
    case 'code':
      return (
        <div className="relative rounded-lg bg-void-900 border border-purple-dim/20 mb-4 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-purple-dim/15 bg-void-950/50">
            <Code2 size={10} className="text-purple-core" />
            <span className="font-mono text-[7px] tracking-wider text-text-tertiary">TERMINAL</span>
            <div className="flex gap-1 ml-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            </div>
          </div>
          <pre className="p-4 font-mono text-[9px] text-green-300 leading-relaxed overflow-x-auto whitespace-pre-wrap break-words">
            {section.text}
          </pre>
        </div>
      )
    case 'note':
      return (
        <div className="flex gap-2.5 rounded-lg border border-yellow-400/25 bg-yellow-400/5 p-3 mb-4">
          <Lightbulb size={13} className="text-yellow-400 shrink-0 mt-0.5" />
          <p className="font-mono text-[9px] text-yellow-200/80 leading-relaxed">{section.text}</p>
        </div>
      )
    case 'interactive':
      return (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <FlaskConical size={11} className="text-purple-core" />
            <span className="font-mono text-[9px] text-purple-bright">{section.label}</span>
          </div>
          <div className="rounded-lg border border-purple-dim/30 bg-void-900/60 p-3">
            <InteractiveWidget type={section.interactiveType} />
          </div>
        </div>
      )
    default:
      return null
  }
}

// ── Mini Challenge ─────────────────────────────────────────────────────────────

interface MiniChallengeProps {
  lessonId: string
  trackColor: string
  alreadyDone: boolean
  onBonusXP: (amount: number) => void
}

function MiniChallenge({ lessonId, trackColor, alreadyDone, onBonusXP }: MiniChallengeProps) {
  const q = MINI_CHALLENGES[lessonId]
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const bonusXP = 10

  if (!q || alreadyDone) return null

  const isCorrect = selected === q.correct
  const canSubmit = selected !== null && !submitted

  const handleSubmit = () => {
    if (!canSubmit) return
    setSubmitted(true)
    if (isCorrect) {
      playMiniChallengeBonus()
      onBonusXP(bonusXP)
    } else {
      playChallengeFail()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-5 rounded-xl border border-purple-dim/30 bg-void-900/60 p-4 overflow-hidden"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 rounded-full" style={{ backgroundColor: trackColor }} />
        <span className="font-display text-[9px] tracking-[0.2em] text-purple-bright">QUICK CHECK</span>
        <span className="ml-auto font-mono text-[8px] text-text-tertiary">+{bonusXP} XP bonus</span>
      </div>

      <p className="font-mono text-[10px] text-text-secondary leading-relaxed mb-3">{q.question}</p>

      <div className="space-y-2 mb-3">
        {q.choices.map((choice, i) => {
          let borderColor = 'rgba(176,38,255,0.2)'
          let bg = 'rgba(10,0,15,0.4)'
          let textColor = '#8888aa'

          if (submitted) {
            if (i === q.correct) { borderColor = 'rgba(0,255,136,0.5)'; bg = 'rgba(0,255,136,0.06)'; textColor = '#00ff88' }
            else if (i === selected && !isCorrect) { borderColor = 'rgba(255,51,102,0.5)'; bg = 'rgba(255,51,102,0.06)'; textColor = '#ff6694' }
          } else if (selected === i) {
            borderColor = `${trackColor}60`
            bg = `${trackColor}10`
            textColor = trackColor
          }

          return (
            <button
              key={i}
              disabled={submitted}
              onClick={() => !submitted && setSelected(i)}
              className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-200 font-mono text-[9px]"
              style={{ borderColor, background: bg, color: textColor }}
            >
              <span className="w-4 h-4 rounded flex items-center justify-center border text-[8px] shrink-0" style={{ borderColor, color: textColor }}>
                {String.fromCharCode(65 + i)}
              </span>
              {choice}
            </button>
          )
        })}
      </div>

      {/* Submit / result */}
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.button
            key="submit"
            onClick={handleSubmit}
            disabled={!canSubmit}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-[9px] tracking-wider transition-all disabled:opacity-40"
            style={{
              borderColor: canSubmit ? `${trackColor}50` : 'rgba(176,38,255,0.2)',
              background: canSubmit ? `${trackColor}12` : 'transparent',
              color: canSubmit ? trackColor : '#555570',
            }}
          >
            <ChevronRight size={12} />
            SUBMIT
          </motion.button>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-lg border p-3 ${isCorrect ? 'border-green-500/40 bg-green-500/6' : 'border-red-500/40 bg-red-500/6'}`}
          >
            <p className={`font-mono text-[9px] font-bold mb-1 ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
              {isCorrect ? `✓ CORRECT — +${bonusXP} XP` : '✗ INCORRECT'}
            </p>
            <p className="font-mono text-[8px] text-text-secondary">{q.explanation}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── LessonView ─────────────────────────────────────────────────────────────────

interface LessonViewProps {
  lesson: LessonDef
  trackColor: string
  trackName: string
  onBack: () => void
  onNext?: () => void
}

export function LessonView({ lesson, trackColor, trackName, onBack, onNext }: LessonViewProps) {
  const { completedLessons, completeLesson, addXP } = useAcademyStore()
  const [markingComplete, setMarkingComplete] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [xpFloat, setXpFloat] = useState<{ amount: number; key: number } | null>(null)
  const [miniDone, setMiniDone] = useState(false)

  const isDone = completedLessons.includes(lesson.id)

  const spawnXPFloat = (amount: number) => {
    setXpFloat({ amount, key: Date.now() })
    setTimeout(() => setXpFloat(null), 1200)
  }

  const handleBonusXP = (amount: number) => {
    addXP(amount)
    spawnXPFloat(amount)
    setMiniDone(true)
  }

  const handleComplete = async () => {
    if (isDone || markingComplete) return
    setMarkingComplete(true)
    await new Promise(r => setTimeout(r, 300))
    completeLesson(lesson.id)
    playXPGain()
    setMarkingComplete(false)
    setJustCompleted(true)
    spawnXPFloat(lesson.xpReward)
    setTimeout(() => setJustCompleted(false), 2500)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-void-950 p-6 relative">
      {/* Floating XP */}
      <AnimatePresence>
        {xpFloat && (
          <motion.div
            key={xpFloat.key}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -70, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
            className="pointer-events-none fixed bottom-28 right-12 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-[12px] font-bold tracking-wider"
            style={{
              background: 'rgba(176,38,255,0.18)',
              border: '1px solid rgba(176,38,255,0.5)',
              color: '#c084fc',
              boxShadow: '0 0 16px rgba(176,38,255,0.35)',
            }}
          >
            <Zap size={13} />
            +{xpFloat.amount} XP
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
        <span className="font-mono text-[9px]" style={{ color: trackColor }}>{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-xl border border-purple-dim/20 bg-void-900/50 p-5 mb-5 overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl" style={{ borderColor: `${trackColor}80` }} />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr" style={{ borderColor: `${trackColor}80` }} />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={14} style={{ color: trackColor }} />
              <h1 className="font-display text-[14px] tracking-[0.1em] font-black text-text-primary">
                {lesson.title}
              </h1>
              {isDone && <CheckCircle2 size={14} style={{ color: trackColor }} />}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[8px] text-text-tertiary">{lesson.estimatedMins} min read</span>
              <div className="w-px h-3 bg-purple-dim/25" />
              <div className="flex items-center gap-1">
                <Zap size={9} style={{ color: trackColor }} />
                <span className="font-mono text-[8px]" style={{ color: trackColor }}>{lesson.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1"
      >
        {lesson.content.map((section, i) => (
          <SectionBlock key={i} section={section} />
        ))}
      </motion.div>

      {/* Mini Challenge — shown before "Mark Complete" */}
      <MiniChallenge
        lessonId={lesson.id}
        trackColor={trackColor}
        alreadyDone={isDone}
        onBonusXP={handleBonusXP}
      />

      {/* Footer actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-dim/15">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-dim/25 text-text-tertiary hover:text-text-secondary hover:border-purple-dim/40 transition-all font-mono text-[9px] tracking-wider"
        >
          <ArrowLeft size={12} />
          BACK TO TRACK
        </button>

        <div className="flex items-center gap-2">
          {!isDone && (
            <motion.button
              onClick={handleComplete}
              disabled={markingComplete}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-[9px] tracking-wider transition-all overflow-hidden"
              style={{
                background: justCompleted ? 'rgba(0,255,136,0.15)' : 'rgba(176,38,255,0.15)',
                border: `1px solid ${justCompleted ? 'rgba(0,255,136,0.4)' : 'rgba(176,38,255,0.4)'}`,
                color: justCompleted ? '#00ff88' : '#b026ff',
                boxShadow: justCompleted ? '0 0 16px rgba(0,255,136,0.3)' : '0 0 8px rgba(176,38,255,0.2)',
              }}
            >
              {/* Shimmer on the button */}
              <motion.div
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-y-0 w-6 opacity-20 pointer-events-none"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}
              />
              {justCompleted ? (
                <>
                  <CheckCircle2 size={13} />
                  +{lesson.xpReward} XP EARNED!
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  MARK COMPLETE
                </>
              )}
            </motion.button>
          )}
          {isDone && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg border font-mono text-[9px] tracking-wider" style={{ borderColor: `${trackColor}40`, color: trackColor }}>
              <CheckCircle2 size={13} />
              COMPLETED
            </div>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-dim/25 text-text-secondary hover:text-purple-bright hover:border-purple-dim/50 transition-all font-mono text-[9px] tracking-wider"
            >
              NEXT LESSON
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
