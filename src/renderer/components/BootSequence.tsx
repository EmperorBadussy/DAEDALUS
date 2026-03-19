import { useState, useEffect, useRef } from 'react'

interface BootLine {
  text: string
  type: 'hex' | 'cmd' | 'ok' | 'warn' | 'art' | 'progress' | 'blank' | 'header' | 'divider'
  delay: number
}

const BOOT_SCRIPT: BootLine[] = [
  { text: '', type: 'blank', delay: 250 },
  { text: '0xFFFF0000  DAEDALUS BIOS v1.0.0 — PHANTOM SYSTEMS', type: 'hex', delay: 100 },
  { text: '0xFFFF0040  CPU: Payload Forge Engine — initialized', type: 'hex', delay: 80 },
  { text: '0xFFFF0080  RAM: Armory buffer allocated — 512MB', type: 'hex', delay: 80 },
  { text: '0xFFFF00C0  CRYPT: Template engine — READY', type: 'hex', delay: 80 },
  { text: '0xFFFF0100  NET: Crucible HTTP stack — UP', type: 'hex', delay: 80 },
  { text: '0xFFFF0140  STORE: Labyrinth encoder chain — LOADED', type: 'hex', delay: 180 },
  { text: '', type: 'blank', delay: 300 },

  { text: '══════════════════════════════════════════════════════════', type: 'divider', delay: 120 },
  { text: '[KERNEL] Initializing DAEDALUS workbench...', type: 'cmd', delay: 250 },
  { text: '[KERNEL] Loading exploit construction modules...', type: 'cmd', delay: 200 },
  { text: '[  OK  ] Cryptographic encoder subsystem ready', type: 'ok', delay: 100 },
  { text: '[  OK  ] Template variable engine loaded', type: 'ok', delay: 100 },
  { text: '[  OK  ] HTTP request forge armed', type: 'ok', delay: 100 },
  { text: '[  OK  ] Payload armory indexed', type: 'ok', delay: 150 },
  { text: '', type: 'blank', delay: 500 },

  { text: '  ██████╗  █████╗ ███████╗██████╗  █████╗ ██╗     ██╗   ██╗███████╗', type: 'art', delay: 70 },
  { text: '  ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██║     ██║   ██║██╔════╝', type: 'art', delay: 70 },
  { text: '  ██║  ██║███████║█████╗  ██║  ██║███████║██║     ██║   ██║███████╗', type: 'art', delay: 70 },
  { text: '  ██║  ██║██╔══██║██╔══╝  ██║  ██║██╔══██║██║     ██║   ██║╚════██║', type: 'art', delay: 70 },
  { text: '  ██████╔╝██║  ██║███████╗██████╔╝██║  ██║███████╗╚██████╔╝███████║', type: 'art', delay: 70 },
  { text: '  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚══════╝ ╚═════╝╚══════╝', type: 'art', delay: 280 },
  { text: '', type: 'blank', delay: 150 },
  { text: '  Dynamic Autonomous Exploit Development & Arsenal Loading Unified System', type: 'header', delay: 450 },
  { text: '  ───────────────────────────────────────────────────────────────────────', type: 'divider', delay: 500 },
  { text: '', type: 'blank', delay: 250 },

  { text: '[FORGE]  Verifying payload construction toolkit...', type: 'cmd', delay: 350 },
  { text: '', type: 'blank', delay: 80 },
  { text: '  ┌─ FORGE ─────────────────────────────────────┐', type: 'cmd', delay: 120 },
  { text: '  │  XSS template engine ........... v4.2   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  SQLi UNION builder ............. v3.1   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  SSRF probe generator ........... v2.8   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  Variable interpolation engine .. v1.9   [READY]  │', type: 'ok', delay: 100 },
  { text: '  └──────────────────────────────────────────────────┘', type: 'cmd', delay: 150 },
  { text: '  ┌─ LABYRINTH ──────────────────────────────────┐', type: 'cmd', delay: 120 },
  { text: '  │  base64 encoder ................. v1.0   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  URL encoder (single/double) .... v1.0   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  HTML entity encoder ............ v1.0   [READY]  │', type: 'ok', delay: 100 },
  { text: '  │  Hex / Unicode / Reverse ........ v1.0   [READY]  │', type: 'ok', delay: 100 },
  { text: '  └──────────────────────────────────────────────────┘', type: 'cmd', delay: 200 },
  { text: '', type: 'blank', delay: 200 },

  { text: '[ARMORY] Scanning payload database...', type: 'cmd', delay: 300 },
  { text: '         ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  13%', type: 'progress', delay: 180 },
  { text: '         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  45%', type: 'progress', delay: 180 },
  { text: '         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  72%', type: 'progress', delay: 180 },
  { text: '         ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%', type: 'progress', delay: 250 },
  { text: '[  OK  ] 8 payloads indexed — XSS / SQLi / SSRF / SSTI / Auth', type: 'ok', delay: 150 },
  { text: '', type: 'blank', delay: 300 },

  { text: '┌══════════════════════════════════════════════════════┐', type: 'divider', delay: 120 },
  { text: '║                                                      ║', type: 'divider', delay: 60 },
  { text: '║   DAEDALUS v1.0.0          THE MASTER CRAFTSMAN     ║', type: 'art', delay: 120 },
  { text: '║                                                      ║', type: 'divider', delay: 60 },
  { text: '║   STATUS .......... OPERATIONAL                      ║', type: 'warn', delay: 100 },
  { text: '║   MODULES ......... 5 / 5 LOADED                     ║', type: 'warn', delay: 100 },
  { text: '║   FORGE ........... ARMED                            ║', type: 'warn', delay: 100 },
  { text: '║   LABYRINTH ....... READY                            ║', type: 'warn', delay: 100 },
  { text: '║   ARMORY .......... 8 PAYLOADS                       ║', type: 'warn', delay: 120 },
  { text: '║                                                      ║', type: 'divider', delay: 60 },
  { text: '╚══════════════════════════════════════════════════════╝', type: 'divider', delay: 500 },
  { text: '', type: 'blank', delay: 300 },
  { text: '[SYSTEM] All modules loaded. The craftsman awaits your design.', type: 'ok', delay: 1500 },
]

const PURPLE_KEYWORDS = new Set([
  'DAEDALUS', 'OPERATIONAL', 'ARMED', 'READY', 'LOADED', 'PHANTOM',
  'OK', '5 / 5', '8 PAYLOADS', 'MASTER', 'CRAFTSMAN', 'SYSTEM',
  'FORGE', 'LABYRINTH', 'ARMORY', '100%',
])

function ScrambleText({ text, duration = 700 }: { text: string; duration?: number }) {
  const [revealed, setRevealed] = useState(0)
  const chars = '▓▒░█▄▀■□◆◇○●╬╪╫┼┤├┴┬│─ABCDEFabcdef0123456789!@#$%&'

  useEffect(() => {
    let frame = 0
    const totalFrames = Math.ceil(duration / 28)
    const interval = setInterval(() => {
      frame++
      setRevealed(frame / totalFrames)
      if (frame >= totalFrames) clearInterval(interval)
    }, 28)
    return () => clearInterval(interval)
  }, [text, duration])

  const elements: React.ReactNode[] = []
  let i = 0
  while (i < text.length) {
    const revealedUpTo = Math.floor(revealed * text.length)

    if (i < revealedUpTo) {
      let matchedKw = ''
      for (const kw of PURPLE_KEYWORDS) {
        if (text.substring(i, i + kw.length) === kw) {
          matchedKw = kw
          break
        }
      }
      if (matchedKw) {
        elements.push(
          <span key={i} style={{ color: '#c084fc', textShadow: '0 0 8px rgba(176,38,255,0.8), 0 0 20px rgba(176,38,255,0.4)' }}>
            {matchedKw}
          </span>
        )
        i += matchedKw.length
      } else {
        elements.push(<span key={i}>{text[i]}</span>)
        i++
      }
    } else {
      if (text[i] === ' ') {
        elements.push(<span key={i}> </span>)
      } else {
        elements.push(
          <span key={i} style={{ opacity: 0.35 }}>
            {chars[Math.floor(Math.random() * chars.length)]}
          </span>
        )
      }
      i++
    }
  }

  return <>{elements}</>
}

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const [phase, setPhase] = useState<'black' | 'crt' | 'boot' | 'waiting'>('black')
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Phase timing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('crt'), 400)
    const t2 = setTimeout(() => setPhase('boot'), 1800)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Boot line sequencer
  useEffect(() => {
    if (phase !== 'boot') return
    timeoutsRef.current = []

    let cum = 0
    for (let i = 0; i < BOOT_SCRIPT.length; i++) {
      cum += (i === 0 ? 200 : BOOT_SCRIPT[i - 1].delay)
      const t = setTimeout(() => {
        setVisibleLines(i + 1)
        if (containerRef.current) {
          containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
      }, cum)
      timeoutsRef.current.push(t)
    }

    cum += BOOT_SCRIPT[BOOT_SCRIPT.length - 1].delay
    const tWait = setTimeout(() => setPhase('waiting'), cum)
    timeoutsRef.current.push(tWait)

    return () => timeoutsRef.current.forEach(clearTimeout)
  }, [phase])

  // Enter key handler
  useEffect(() => {
    if (phase !== 'waiting') return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onComplete()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [phase, onComplete])

  if (phase === 'black') {
    return <div className="fixed inset-0 z-50 bg-black" />
  }

  if (phase === 'crt') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div
          style={{
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent 5%, #b026ff 30%, #c084fc 50%, #b026ff 70%, transparent 95%)',
            boxShadow: '0 0 30px rgba(176,38,255,0.7), 0 0 80px rgba(176,38,255,0.4), 0 0 150px rgba(176,38,255,0.2)',
            animation: 'daedalus-crt-expand 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        />
        <style>{`
          @keyframes daedalus-crt-expand {
            0%   { transform: scaleX(0) scaleY(0.002); opacity: 0.8; }
            35%  { transform: scaleX(1) scaleY(0.002); opacity: 1; }
            55%  { transform: scaleX(1) scaleY(0.003); opacity: 1; }
            100% { transform: scaleX(1) scaleY(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Purple matrix rain */}
      <PurpleRain />
      {/* CRT scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0px, rgba(0,0,0,0.14) 1px, transparent 1px, transparent 3px)' }}
      />
      {/* CRT vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)' }}
      />
      {/* Purple ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(176,38,255,0.06) 0%, transparent 70%)' }}
      />

      {/* Terminal content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-8 py-6 z-10 relative"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', lineHeight: '1.7' }}
      >
        {BOOT_SCRIPT.slice(0, visibleLines).map((line, i) => {
          let color = '#555570'
          let extra: React.CSSProperties = {}

          switch (line.type) {
            case 'hex':     color = 'rgba(108,40,217,0.7)'; break
            case 'art':     color = '#b026ff'; extra = { textShadow: '0 0 8px rgba(176,38,255,0.6)', fontWeight: 'bold' }; break
            case 'header':  color = '#c084fc'; extra = { letterSpacing: '0.12em', fontSize: '11px' }; break
            case 'ok':      color = '#00ff88'; break
            case 'warn':    color = '#a78bfa'; break
            case 'progress':color = 'rgba(176,38,255,0.75)'; break
            case 'cmd':     color = '#8b5cf6'; break
            case 'divider': color = 'rgba(61,7,110,0.8)'; break
          }

          const isLast = i === visibleLines - 1

          return (
            <div key={i} style={{ color, ...extra, transition: 'opacity 0.2s' }}>
              {isLast && line.text ? (
                <ScrambleText
                  text={line.text}
                  duration={line.type === 'art' ? 850 : line.type === 'header' ? 1100 : line.type === 'warn' ? 650 : 550}
                />
              ) : (
                line.text || '\u00A0'
              )}
            </div>
          )
        })}

        {/* Cursor */}
        {phase === 'boot' && visibleLines < BOOT_SCRIPT.length && (
          <span
            className="inline-block w-[8px] h-[16px] ml-1 align-middle"
            style={{
              background: '#b026ff',
              boxShadow: '0 0 8px rgba(176,38,255,0.7)',
              animation: 'daedalus-blink 800ms step-end infinite',
            }}
          />
        )}

        {phase === 'waiting' && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <div style={{ height: '1px', width: '12rem', background: 'linear-gradient(90deg, transparent, rgba(176,38,255,0.5), transparent)' }} />
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '11px',
                letterSpacing: '0.4em',
                color: '#b026ff',
                textShadow: '0 0 10px rgba(176,38,255,0.7), 0 0 30px rgba(176,38,255,0.4)',
                animation: 'daedalus-pulse 2s ease-in-out infinite',
              }}
            >
              PRESS ENTER TO INITIALIZE
            </div>
            <span
              className="inline-block w-[10px] h-[18px]"
              style={{
                background: '#b026ff',
                boxShadow: '0 0 12px rgba(176,38,255,0.9)',
                animation: 'daedalus-blink 600ms step-end infinite',
              }}
            />
          </div>
        )}

        <style>{`
          @keyframes daedalus-blink {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0; }
          }
          @keyframes daedalus-pulse {
            0%, 100% { opacity: 0.55; }
            50%       { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}

function PurpleRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = window.innerWidth * dpr
    canvas.height = window.innerHeight * dpr
    ctx.scale(dpr, dpr)

    const cols = Math.floor(window.innerWidth / 14)
    const drops: number[] = new Array(cols).fill(0).map(() => Math.random() * -100)
    const chars = '01アイウエカキクケコサシスセタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロ'

    let animId: number
    function draw() {
      ctx!.fillStyle = 'rgba(0,0,0,0.065)'
      ctx!.fillRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * 14
        const alpha = 0.1 + Math.random() * 0.12
        ctx!.fillStyle = `rgba(176,38,255,${alpha})`
        ctx!.font = '12px monospace'
        ctx!.fillText(char, i * 14, y)
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.45 + Math.random() * 0.45
      }
      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-50"
      style={{ width: '100%', height: '100%' }}
    />
  )
}
