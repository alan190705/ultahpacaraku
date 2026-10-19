import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { CONFIG, SCRAPBOOK_INTRO } from '../config'

/**
 * ScrapbookIntro — Romantic Digital Scrapbook Opening.
 *
 * Perubahan:
 *   - Intro baru menutup SETELAH tulisan ucapan selesai (morph dihitung dari
 *     waktu ucapan muncul + durasi tulisan + jeda).
 *   - Tidak ada lagi cabang reduce-motion di JS yang memotong intro.
 *   - onDone dipegang lewat ref supaya timeline tidak ter-reset saat parent
 *     render ulang.
 */

const PHASE_LOADING = 0
const PHASE_CLOSED  = 1
const PHASE_OPEN    = 2
const PHASE_PHOTOS  = 3
const PHASE_DECOR   = 4
const PHASE_GREET   = 5
const PHASE_MORPH   = 6
const PHASE_DONE    = 7

// === DURASI (ms) — samakan dengan CSS (patch #6 dan #7) ===
// Tulisan ucapan selesai ±2.5s setelah kelas sb-greet muncul (baris 3 selesai
// di 1700 + 800ms). Kalau kamu ubah angka di CSS, ubah juga di sini.
const GREET_DURATION = 2600
const GREET_LINGER   = 2000 // jeda setelah tulisan selesai, sebelum intro menutup

// Timeline (ms)
const T = {
  closed:  600,
  open:    1800,   // buku mulai terbuka (selesai ±4.3s)
  photos:  4000,   // foto mulai muncul satu per satu
  decor:   6200,
  greet:   7400,
}
T.morph = T.greet + GREET_DURATION + GREET_LINGER // ±12 detik

const MORPH_FADE = 1400 // samakan dengan transisi keluar di CSS (patch #6)

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function ScrapbookIntro({ onDone }) {
  const [phase, setPhase] = useState(PHASE_LOADING)
  const [preloaded, setPreloaded] = useState(false)
  const [photos, setPhotos] = useState([])
  const timersRef = useRef([])
  const isMorphingRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => {
      clearTimeout(id)
      clearInterval(id)
    })
    timersRef.current = []
  }, [])

  // === 1. PILIH FOTO & PRELOAD ===
  useEffect(() => {
    const sourcePhotos = (CONFIG.photos || []).filter((p) => p?.src)
    const count = Math.min(SCRAPBOOK_INTRO?.photoCount || 9, sourcePhotos.length)

    const step = Math.max(1, Math.floor(sourcePhotos.length / Math.max(count, 1)))
    const picked = []
    for (let i = 0; i < count; i++) {
      const idx = Math.min(i * step, sourcePhotos.length - 1)
      picked.push(sourcePhotos[idx])
    }

    if (picked.length === 0) {
      setPhotos([])
      setPreloaded(true)
      return
    }

    let loaded = 0
    const onLoad = () => {
      loaded++
      if (loaded >= picked.length) setPreloaded(true)
    }

    picked.forEach((p) => {
      const img = new Image()
      img.onload = onLoad
      img.onerror = onLoad
      img.src = p.src
    })

    setPhotos(picked)

    const fb = setTimeout(() => setPreloaded(true), 3000)
    return () => clearTimeout(fb)
  }, [])

  // === 2. MORPH TRIGGER ===
  const startMorph = useCallback(() => {
    if (isMorphingRef.current) return
    isMorphingRef.current = true
    clearAllTimers()

    setPhase(PHASE_MORPH)
    const doneTimer = setTimeout(() => {
      setPhase(PHASE_DONE)
      onDoneRef.current?.()
    }, MORPH_FADE)
    timersRef.current.push(doneTimer)
  }, [clearAllTimers])

  // === 3. TIMELINE (sama di semua perangkat) ===
  useEffect(() => {
    if (!preloaded) return

    const schedule = (fn, delay) => {
      const id = setTimeout(fn, delay)
      timersRef.current.push(id)
    }

    schedule(() => setPhase(PHASE_CLOSED), T.closed)
    schedule(() => setPhase(PHASE_OPEN),   T.open)
    schedule(() => setPhase(PHASE_PHOTOS), T.photos)
    schedule(() => setPhase(PHASE_DECOR),  T.decor)
    schedule(() => setPhase(PHASE_GREET),  T.greet)
    schedule(() => startMorph(),           T.morph)

    return () => clearAllTimers()
  }, [preloaded, startMorph, clearAllTimers])

  // === 4. KEYBOARD SKIP ===
  useEffect(() => {
    const onKey = (e) => {
      if (['Enter', ' ', 'Escape'].includes(e.key) && phase < PHASE_MORPH) {
        e.preventDefault()
        startMorph()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, startMorph])

  // === 5. GENERATE POSISI FOTO ===
  const photoLayout = useMemo(() => {
    const rnd = seededRandom(42)
    return photos.map((_, i) => ({
      rot: (rnd() - 0.5) * 14,
      offsetX: (rnd() - 0.5) * 10,
      offsetY: (rnd() - 0.5) * 8,
      delay: i * 120,
      tapeRot: (rnd() - 0.5) * 18,
    }))
  }, [photos])

  if (phase === PHASE_DONE) return null

  const isOpen = phase >= PHASE_OPEN
  const showPhotos = phase >= PHASE_PHOTOS
  const showDecor = phase >= PHASE_DECOR
  const showGreet = phase >= PHASE_GREET
  const isMorph = phase >= PHASE_MORPH

  const cfg = SCRAPBOOK_INTRO || {}
  const greetingName = cfg.greetingName || CONFIG.nama || ''

  return (
    <div
      className={[
        'sb-intro',
        isOpen     ? 'sb-open'     : '',
        showPhotos ? 'sb-photos'   : '',
        showDecor  ? 'sb-decor'    : '',
        showGreet  ? 'sb-greet'    : '',
        isMorph    ? 'sb-morph'    : '',
      ].filter(Boolean).join(' ')}
      role="dialog"
      aria-label="Scrapbook intro"
    >
      <div className="sb-paper-texture" aria-hidden="true" />
      <div className="sb-vignette" aria-hidden="true" />

      {!isMorph && (
        <button
          className="sb-skip"
          onClick={startMorph}
          type="button"
          aria-label="Skip intro"
        >
          Skip Intro →
        </button>
      )}

      {!preloaded && (
        <div className="sb-loading" aria-live="polite">
          <div className="sb-loading-heart">♡</div>
          <p>menyiapkan kenangan...</p>
        </div>
      )}

      {preloaded && (
        <div className="sb-album-wrap">
          <div className="sb-cover-back" aria-hidden="true" />

          <div className="sb-page sb-page-left">
            <div className="sb-page-lines" aria-hidden="true" />
            <span className="sb-page-num">1</span>
          </div>

          <div className="sb-page sb-page-right">
            <div className="sb-page-lines" aria-hidden="true" />

            <div className="sb-photos-wrap">
              {photos.map((p, i) => {
                const layout = photoLayout[i]
                return (
                  <div
                    key={i}
                    className="sb-polaroid"
                    style={{
                      '--rot': `${layout.rot}deg`,
                      '--tx': `${layout.offsetX}%`,
                      '--ty': `${layout.offsetY}%`,
                      '--delay': `${layout.delay}ms`,
                      '--tape-rot': `${layout.tapeRot}deg`,
                    }}
                  >
                    <span className="sb-tape" aria-hidden="true" />
                    <div className="sb-photo-frame">
                      <img
                        src={p.src}
                        alt={p.caption || ''}
                        loading="eager"
                        decoding="async"
                        draggable="false"
                      />
                    </div>
                    {p.caption && (
                      <span className="sb-caption">{p.caption}</span>
                    )}
                  </div>
                )
              })}
            </div>

            <svg className="sb-doodle sb-doodle-heart" viewBox="0 0 40 40" aria-hidden="true">
              <path d="M20 35 C10 25, 2 18, 8 10 C12 5, 18 6, 20 12 C22 6, 28 5, 32 10 C38 18, 30 25, 20 35 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            <svg className="sb-doodle sb-doodle-star" viewBox="0 0 30 30" aria-hidden="true">
              <path d="M15 2 L18 11 L27 11 L20 17 L23 26 L15 20 L7 26 L10 17 L3 11 L12 11 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>

            <svg className="sb-doodle sb-doodle-swirl" viewBox="0 0 60 30" aria-hidden="true">
              <path d="M5 15 Q15 5, 25 15 T45 15 T58 15" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>

            <span className="sb-page-num sb-page-num-right">2</span>
          </div>

          <div className="sb-cover-front" aria-hidden="true">
            <div className="sb-cover-inner">
              <span className="sb-cover-label">our memories</span>
              <span className="sb-cover-heart">♡</span>
              <span className="sb-cover-sub">a little scrapbook for you</span>
            </div>
          </div>

          <div className="sb-greeting" aria-live="polite">
            <p className="sb-greet-line sb-greet-line1">{cfg.greeting || 'Selamat Ulang Tahun'}</p>
            <p className="sb-greet-line sb-greet-line2">{greetingName}</p>
            <p className="sb-greet-line sb-greet-line3">{cfg.greetingSub || 'semoga bahagia selalu ya ♡'}</p>
          </div>
        </div>
      )}

      {preloaded && (
        <p className="sb-date-label" aria-hidden="true">
          {cfg.dateLabel || '2026'}
        </p>
      )}
    </div>
  )
}