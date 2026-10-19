import { useState, useEffect, useRef, useCallback } from 'react'
import { CONFIG } from '../config'

/**
 * CinematicIntro — Fullscreen romantic opening dengan Morph Transition.
 *
 * Timeline (beat-based):
 *   0.0s  — Pitch black
 *   0.3s  — Embers glow
 *   1.0s  — Title reveal (letter-by-letter)
 *   2.0s  — Tagline + ornament lines
 *   2.8s  — Heart pulse
 *   3.8s  — Linger
 *   4.8s  — Morph (atau lebih lambat kalau nama panjang, lihat MORPH_AT)
 *   +1.25s — Unmount
 *
 * Perubahan:
 *   - Tidak ada lagi jalan pintas reduced-motion di JS (penyebab intro langsung
 *     selesai di HP). Penyesuaiannya ditangani CSS.
 *   - Morph tidak akan mulai sebelum huruf terakhir nama selesai muncul.
 *   - Ketukan/tombol skip baru aktif setelah nama selesai muncul.
 *   - onDone dipegang lewat ref, jadi timeline tidak ter-reset kalau parent
 *     mengirim fungsi baru di tiap render.
 */

const PHASE_INIT   = 0
const PHASE_GLOW   = 1
const PHASE_TITLE  = 2
const PHASE_TAG    = 3
const PHASE_HEART  = 4
const PHASE_LINGER = 5
const PHASE_MORPH  = 6
const PHASE_DONE   = 7

const MORPH_DURATION = 1250

// === TUNING NAMA ===
const TITLE_START   = 1000 // ms, harus sama dengan delay dasar di style huruf
const CHAR_STAGGER  = 40   // ms antar huruf
const CHAR_DURATION = 900  // perkiraan lama animasi satu huruf (ms)
const LINGER_AFTER_NAME = 1800 // jeda setelah nama selesai, sebelum morph (ms)

function seededParticles(count = 24) {
  const out = []
  let seed = 42
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }
  for (let i = 0; i < count; i++) {
    out.push({
      left: 5 + rnd() * 90,
      top: 8 + rnd() * 84,
      size: 2 + rnd() * 2.5,
      delay: rnd() * 1.2,
      duration: 2.6 + rnd() * 1.4,
    })
  }
  return out
}

export default function CinematicIntro({ onDone }) {
  const [phase, setPhase] = useState(PHASE_INIT)
  const timersRef = useRef([])
  const isMorphingRef = useRef(false)
  const preloadedRef = useRef(false)
  const skipReadyRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const nama = CONFIG.nama || ''
  const titleEnd =
    TITLE_START + Math.max(nama.length - 1, 0) * CHAR_STAGGER + CHAR_DURATION
  const MORPH_AT = Math.max(4800, titleEnd + LINGER_AFTER_NAME)

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    timersRef.current = []
  }, [])

  // === 1. PRELOAD IMAGES ===
  useEffect(() => {
    const images = [
      CONFIG.fotoHero,
      CONFIG.fotoFinal,
      ...(CONFIG.photos || []).map((p) => p.src),
    ].filter(Boolean)

    if (images.length === 0) {
      preloadedRef.current = true
      return
    }

    let count = 0
    const onImgLoad = () => {
      count++
      if (count >= images.length) preloadedRef.current = true
    }

    images.forEach((src) => {
      const img = new Image()
      img.onload = onImgLoad
      img.onerror = onImgLoad
      img.src = src
    })

    // Safety fallback: maksimal 5 detik
    const fallbackTimer = setTimeout(() => {
      preloadedRef.current = true
    }, 5000)
    return () => clearTimeout(fallbackTimer)
  }, [])

  // === 2. MORPH TRIGGER (preload-aware) ===
  const startMorph = useCallback(() => {
    if (isMorphingRef.current) return
    isMorphingRef.current = true
    clearAllTimers()

    const go = () => {
      setPhase(PHASE_MORPH)
      const doneTimer = setTimeout(() => {
        setPhase(PHASE_DONE)
        onDoneRef.current?.()
      }, MORPH_DURATION)
      timersRef.current.push(doneTimer)
    }

    if (preloadedRef.current) {
      go()
      return
    }

    const waitStart = Date.now()
    const checkInterval = setInterval(() => {
      if (preloadedRef.current || Date.now() - waitStart > 1500) {
        clearInterval(checkInterval)
        go()
      }
    }, 60)
    timersRef.current.push(checkInterval)
  }, [clearAllTimers])

  // === 3. TIMELINE (jalan sama di semua perangkat) ===
  useEffect(() => {
    const schedule = (fn, delay) => {
      const id = setTimeout(fn, delay)
      timersRef.current.push(id)
    }

    schedule(() => setPhase(PHASE_GLOW),   300)
    schedule(() => setPhase(PHASE_TITLE),  TITLE_START)
    schedule(() => setPhase(PHASE_TAG),    2000)
    schedule(() => setPhase(PHASE_HEART),  2800)
    schedule(() => setPhase(PHASE_LINGER), 3800)
    schedule(() => { skipReadyRef.current = true }, titleEnd)
    schedule(() => startMorph(), MORPH_AT)

    return () => clearAllTimers()
  }, [startMorph, clearAllTimers, titleEnd, MORPH_AT])

  // === 4. KEYBOARD SKIP ===
  useEffect(() => {
    const onKey = (e) => {
      if (
        ['Enter', ' ', 'Escape'].includes(e.key) &&
        skipReadyRef.current &&
        !isMorphingRef.current
      ) {
        e.preventDefault()
        startMorph()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [startMorph])

  // === 5. TAP SKIP (baru aktif setelah nama selesai) ===
  const handleUserTap = () => {
    if (skipReadyRef.current && !isMorphingRef.current) startMorph()
  }

  if (phase === PHASE_DONE) return null

  const particles = seededParticles(24)

  return (
    <div
      className={[
        'cine-intro',
        phase >= PHASE_GLOW   ? 'cine-glow'     : '',
        phase >= PHASE_TITLE  ? 'cine-name'     : '',
        phase >= PHASE_TAG    ? 'cine-tag'      : '',
        phase >= PHASE_HEART  ? 'cine-heart-on' : '',
        phase >= PHASE_MORPH  ? 'cine-morph'    : '',
      ].filter(Boolean).join(' ')}
      onClick={handleUserTap}
      role="button"
      tabIndex={0}
      aria-label="Ketuk atau tekan Enter untuk melanjutkan"
    >
      <div className="cine-vignette" />

      <div className="cine-letterbox cine-letterbox-top" aria-hidden="true" />
      <div className="cine-letterbox cine-letterbox-bottom" aria-hidden="true" />

      <div className="cine-grain" aria-hidden="true" />

      <div className="cine-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            className="cine-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      <div className="cine-center">
        <div className="cine-line cine-line-top" />

        <p className="cine-pretitle">a film about us</p>

        <h1 className="cine-title" aria-label={nama}>
          {nama.split('').map((ch, i) => (
            <span
              key={i}
              className="cine-title-char"
              style={{ animationDelay: `${TITLE_START + i * CHAR_STAGGER}ms` }}
              aria-hidden="true"
            >
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>

        <p className="cine-subtitle">sebuah cerita tentang kita...</p>

        <div className="cine-heart" aria-hidden="true">♥</div>

        <div className="cine-line cine-line-bottom" />
      </div>

      <p className="cine-date">{CONFIG.tanggalFull || '2026'}</p>

      <span className="cine-skip-hint">ketuk untuk lanjut</span>
    </div>
  )
}