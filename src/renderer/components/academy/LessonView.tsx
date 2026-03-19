import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, Code2, Lightbulb, Zap, BookOpen } from 'lucide-react'
import { useAcademyStore, type LessonDef, type LessonSection } from '@/lib/academyStore'

interface LessonViewProps {
  lesson: LessonDef
  trackColor: string
  trackName: string
  onBack: () => void
  onNext?: () => void
}

function InteractiveWidget({ type }: { type: LessonSection['interactiveType'] }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')

  const run = useCallback(() => {
    if (!input) return
    if (type === 'encode-base64') {
      try { setOutput(btoa(input) ) } catch { setOutput('[Error: non-latin1 chars]') }
    } else if (type === 'url-encode') {
      setOutput(encodeURIComponent(input))
    } else if (type === 'xss-reflect') {
      const div = document.createElement('div')
      div.textContent = input
      setOutput(div.innerHTML)
    }
  }, [input, type])

  return (
    <div className="rounded-lg border border-purple-dim/30 bg-void-900/60 p-3 mt-2">
      <div className="flex gap-2 mb-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder="Enter input..."
          className="flex-1 bg-void-800 border border-purple-dim/25 rounded px-2.5 py-1.5 font-mono text-[10px] text-text-primary placeholder-text-tertiary focus:outline-none focus:border-purple-dim/60"
        />
        <button
          onClick={run}
          className="px-3 py-1.5 rounded bg-purple-core/15 border border-purple-dim/40 font-mono text-[9px] text-purple-bright hover:bg-purple-core/25 transition-all"
        >
          RUN
        </button>
      </div>
      {output && (
        <div className="bg-void-800/80 rounded px-3 py-2 font-mono text-[10px] text-green-300 break-all">
          {output}
        </div>
      )}
    </div>
  )
}

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
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-3 rounded-full bg-purple-core" />
            <span className="font-mono text-[9px] text-purple-bright">{section.label}</span>
          </div>
          <InteractiveWidget type={section.interactiveType} />
        </div>
      )
    default:
      return null
  }
}

export function LessonView({ lesson, trackColor, trackName, onBack, onNext }: LessonViewProps) {
  const { completedLessons, completeLesson } = useAcademyStore()
  const [markingComplete, setMarkingComplete] = useState(false)
  const [justCompleted, setJustCompleted] = useState(false)

  const isDone = completedLessons.includes(lesson.id)

  const handleComplete = async () => {
    if (isDone || markingComplete) return
    setMarkingComplete(true)
    await new Promise(r => setTimeout(r, 300))
    completeLesson(lesson.id)
    setMarkingComplete(false)
    setJustCompleted(true)
    setTimeout(() => setJustCompleted(false), 2000)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-void-950 p-6">
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
