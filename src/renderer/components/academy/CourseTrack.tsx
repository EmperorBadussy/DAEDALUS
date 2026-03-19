import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, Circle, Clock, Zap, Star, ChevronRight, Swords } from 'lucide-react'
import { useAcademyStore, type TrackId, type LessonDef, type ChallengeDef } from '@/lib/academyStore'
import { LessonView } from './LessonView'
import { ChallengeView } from './ChallengeView'

interface Track {
  id: TrackId
  name: string
  description: string
  color: string
  lessons: LessonDef[]
  challenges: ChallengeDef[]
}

interface CourseTrackProps {
  track: Track
  onBack: () => void
}

const difficultyLabels = { beginner: 'BEGINNER', intermediate: 'INTERMEDIATE', advanced: 'ADVANCED' }
const difficultyColors = { beginner: '#00ff88', intermediate: '#ffcc00', advanced: '#ff6b35' }

export function CourseTrack({ track, onBack }: CourseTrackProps) {
  const { completedLessons, completedChallenges } = useAcademyStore()
  const [activeLesson, setActiveLesson] = useState<LessonDef | null>(null)
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDef | null>(null)

  if (activeLesson) {
    const lessonIndex = track.lessons.findIndex(l => l.id === activeLesson.id)
    const nextLesson = track.lessons[lessonIndex + 1] ?? null
    return (
      <LessonView
        lesson={activeLesson}
        trackColor={track.color}
        trackName={track.name}
        onBack={() => setActiveLesson(null)}
        onNext={nextLesson ? () => setActiveLesson(nextLesson) : undefined}
      />
    )
  }

  if (activeChallenge) {
    return (
      <ChallengeView
        challenge={activeChallenge}
        trackColor={track.color}
        trackName={track.name}
        onBack={() => setActiveChallenge(null)}
      />
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-void-950 p-6 gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-dim/25 text-text-tertiary hover:text-purple-bright hover:border-purple-dim/50 transition-all duration-200 font-mono text-[9px] tracking-wider"
        >
          <ArrowLeft size={12} />
          BACK
        </button>
        <div className="w-px h-4 bg-purple-dim/25" />
        <div>
          <h2
            className="font-display text-[12px] tracking-[0.2em] font-bold"
            style={{ color: track.color, textShadow: `0 0 12px ${track.color}60` }}
          >
            {track.name.toUpperCase()}
          </h2>
          <p className="font-mono text-[9px] text-text-tertiary">{track.description}</p>
        </div>
      </div>

      {/* Lessons */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full" style={{ backgroundColor: track.color }} />
          <span className="font-display text-[9px] tracking-[0.2em] text-text-secondary">LESSONS</span>
          <span className="font-mono text-[8px] text-text-tertiary ml-auto">
            {track.lessons.filter(l => completedLessons.includes(l.id)).length}/{track.lessons.length} complete
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {track.lessons.map((lesson, i) => {
            const done = completedLessons.includes(lesson.id)
            const prevDone = i === 0 || completedLessons.includes(track.lessons[i - 1].id)

            return (
              <motion.button
                key={lesson.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3 }}
                onClick={() => setActiveLesson(lesson)}
                className="relative text-left flex items-center gap-4 rounded-lg border p-3.5 transition-all duration-200 group"
                style={{
                  borderColor: done ? `${track.color}40` : 'rgba(176,38,255,0.15)',
                  background: done ? `${track.color}06` : 'rgba(10,10,20,0.4)',
                }}
              >
                {/* Completion icon */}
                <div className="shrink-0">
                  {done ? (
                    <CheckCircle2 size={18} style={{ color: track.color }} />
                  ) : (
                    <Circle size={18} className="text-text-tertiary group-hover:text-purple-dim transition-colors" />
                  )}
                </div>

                {/* Lesson info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-mono text-[9px] tracking-wider ${done ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {lesson.title}
                    </span>
                    <span
                      className="font-mono text-[7px] px-1.5 py-0.5 rounded border"
                      style={{
                        color: difficultyColors[lesson.difficulty],
                        borderColor: `${difficultyColors[lesson.difficulty]}40`,
                        background: `${difficultyColors[lesson.difficulty]}10`,
                      }}
                    >
                      {difficultyLabels[lesson.difficulty]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Clock size={9} className="text-text-tertiary" />
                      <span className="font-mono text-[8px] text-text-tertiary">{lesson.estimatedMins} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={9} style={{ color: track.color }} />
                      <span className="font-mono text-[8px]" style={{ color: track.color }}>{lesson.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                <ChevronRight size={14} className="text-text-tertiary group-hover:text-purple-bright transition-colors shrink-0" />
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 rounded-full bg-red-400" />
          <span className="font-display text-[9px] tracking-[0.2em] text-text-secondary">CHALLENGES</span>
          <span className="font-mono text-[8px] text-text-tertiary ml-auto">
            {track.challenges.filter(c => completedChallenges.includes(c.id)).length}/{track.challenges.length} complete
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {track.challenges.map((challenge, i) => {
            const done = completedChallenges.includes(challenge.id)

            return (
              <motion.button
                key={challenge.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (track.lessons.length + i) * 0.05 }}
                whileHover={{ x: 3 }}
                onClick={() => setActiveChallenge(challenge)}
                className="relative text-left flex items-center gap-4 rounded-lg border p-3.5 transition-all duration-200 group overflow-hidden"
                style={{
                  borderColor: done ? 'rgba(250,100,50,0.4)' : 'rgba(176,38,255,0.15)',
                  background: done ? 'rgba(250,100,50,0.05)' : 'rgba(10,10,20,0.4)',
                }}
              >
                <div className="shrink-0">
                  {done ? (
                    <Swords size={18} className="text-orange-400" />
                  ) : (
                    <Swords size={18} className="text-text-tertiary group-hover:text-orange-400 transition-colors" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-mono text-[9px] tracking-wider ${done ? 'text-text-secondary' : 'text-text-primary'}`}>
                      {challenge.title}
                    </span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          size={8}
                          className={s < challenge.difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-void-600'}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Zap size={9} className="text-orange-400" />
                      <span className="font-mono text-[8px] text-orange-400">{challenge.xpReward} XP</span>
                    </div>
                    <span className="font-mono text-[8px] text-text-tertiary uppercase">{challenge.type}</span>
                  </div>
                </div>

                <ChevronRight size={14} className="text-text-tertiary group-hover:text-orange-400 transition-colors shrink-0" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
