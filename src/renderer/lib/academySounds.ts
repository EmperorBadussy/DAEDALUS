// ── DAEDALUS Academy Sound Engine ─────────────────────────────────────────────
// Web Audio API synth — no external assets, pure synthesis

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function masterGain(ac: AudioContext, vol = 0.18): GainNode {
  const g = ac.createGain()
  g.gain.value = vol
  g.connect(ac.destination)
  return g
}

// ── playXPGain — rising two-note chime ────────────────────────────────────────
export function playXPGain(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.14)
    const t = ac.currentTime

    const freqs = [523.25, 783.99] // C5, G5
    freqs.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const env = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      env.gain.setValueAtTime(0, t + i * 0.08)
      env.gain.linearRampToValueAtTime(0.9, t + i * 0.08 + 0.015)
      env.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.3)
      osc.connect(env)
      env.connect(mg)
      osc.start(t + i * 0.08)
      osc.stop(t + i * 0.08 + 0.35)
    })
  } catch {}
}

// ── playLevelUp — triumphant fanfare ─────────────────────────────────────────
export function playLevelUp(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.16)
    const t = ac.currentTime

    const melody = [
      { f: 392, d: 0.0 }, // G4
      { f: 523.25, d: 0.12 }, // C5
      { f: 659.25, d: 0.24 }, // E5
      { f: 783.99, d: 0.36 }, // G5
      { f: 1046.5, d: 0.54 }, // C6 — held
    ]

    melody.forEach(({ f, d }) => {
      const osc = ac.createOscillator()
      const env = ac.createGain()
      osc.type = d < 0.5 ? 'triangle' : 'sine'
      osc.frequency.value = f
      const isLast = d >= 0.5
      env.gain.setValueAtTime(0, t + d)
      env.gain.linearRampToValueAtTime(1, t + d + 0.02)
      env.gain.exponentialRampToValueAtTime(0.001, t + d + (isLast ? 0.7 : 0.22))
      osc.connect(env)
      env.connect(mg)
      osc.start(t + d)
      osc.stop(t + d + (isLast ? 0.75 : 0.25))
    })
  } catch {}
}

// ── playChallengeComplete — success chime ─────────────────────────────────────
export function playChallengeComplete(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.15)
    const t = ac.currentTime

    // Major arpeggio C-E-G + high shimmer
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const env = ac.createGain()
      osc.type = i < 3 ? 'triangle' : 'sine'
      osc.frequency.value = freq
      env.gain.setValueAtTime(0, t + i * 0.09)
      env.gain.linearRampToValueAtTime(0.85, t + i * 0.09 + 0.015)
      env.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.4)
      osc.connect(env)
      env.connect(mg)
      osc.start(t + i * 0.09)
      osc.stop(t + i * 0.09 + 0.45)
    })
  } catch {}
}

// ── playChallengeFail — subtle descending tone ────────────────────────────────
export function playChallengeFail(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.1)
    const t = ac.currentTime

    const osc = ac.createOscillator()
    const env = ac.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(330, t)
    osc.frequency.linearRampToValueAtTime(220, t + 0.3)
    env.gain.setValueAtTime(0.6, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.35)
    osc.connect(env)
    env.connect(mg)
    osc.start(t)
    osc.stop(t + 0.4)
  } catch {}
}

// ── playAchievementUnlock — special glittery unlock sound ─────────────────────
export function playAchievementUnlock(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.15)
    const t = ac.currentTime

    // Sparkling high harmonics
    const sparkle = [880, 1108.73, 1318.51, 1760, 2093]
    sparkle.forEach((freq, i) => {
      const osc = ac.createOscillator()
      const env = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const delay = i * 0.055
      env.gain.setValueAtTime(0, t + delay)
      env.gain.linearRampToValueAtTime(0.7, t + delay + 0.01)
      env.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5)
      osc.connect(env)
      env.connect(mg)
      osc.start(t + delay)
      osc.stop(t + delay + 0.55)
    })

    // Low base hit
    const bass = ac.createOscillator()
    const bassEnv = ac.createGain()
    bass.type = 'sine'
    bass.frequency.setValueAtTime(220, t)
    bass.frequency.exponentialRampToValueAtTime(110, t + 0.3)
    bassEnv.gain.setValueAtTime(0.5, t)
    bassEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    bass.connect(bassEnv)
    bassEnv.connect(mg)
    bass.start(t)
    bass.stop(t + 0.45)
  } catch {}
}

// ── playMiniChallengeBonus — quick bonus chime ────────────────────────────────
export function playMiniChallengeBonus(): void {
  try {
    const ac = getCtx()
    const mg = masterGain(ac, 0.12)
    const t = ac.currentTime

    const osc = ac.createOscillator()
    const env = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(659.25, t)
    osc.frequency.linearRampToValueAtTime(1046.5, t + 0.12)
    env.gain.setValueAtTime(0.7, t)
    env.gain.exponentialRampToValueAtTime(0.001, t + 0.25)
    osc.connect(env)
    env.connect(mg)
    osc.start(t)
    osc.stop(t + 0.3)
  } catch {}
}
