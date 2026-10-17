import { useState, useEffect } from 'react'
import { CONFIG } from '../config'

export default function Opening({ onOpen }) {
  const [leaving, setLeaving] = useState(false)
  const [blooming, setBlooming] = useState(false)

  // Auto trigger bunga & stiker pas load
  useEffect(() => {
    const t = setTimeout(() => setBlooming(true), 500)
    return () => clearTimeout(t)
  }, [])

  const go = () => {
    setLeaving(true)
    setTimeout(onOpen, 1000)
  }

  return (
    <div className={`opening-scrap ${leaving ? 'leave' : ''}`}>

      {/* === GRID PAPER === */}
      <div className="opening-grid" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      <div className="opening-tartan-top" aria-hidden="true" />
      <div className="opening-tartan-bottom" aria-hidden="true" />

      {/* === STIKER DEKORASI === */}
      <div className="opening-sticker opening-sticker-1" aria-hidden="true">🌸</div>
      <div className="opening-sticker opening-sticker-2" aria-hidden="true">✨</div>
      <div className="opening-sticker opening-sticker-3" aria-hidden="true">💕</div>
      <div className="opening-sticker opening-sticker-4" aria-hidden="true">🎀</div>
      <div className="opening-sticker opening-sticker-5" aria-hidden="true">⭐</div>
      <div className="opening-sticker opening-sticker-6" aria-hidden="true">🌷</div>

      {/* === BUNGA JATUH === */}
      {blooming && (
        <div className="petals-layer" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => {
            const left = (i * 5) % 100 + Math.random() * 4
            const delay = Math.random() * 1.2
            const duration = 4 + Math.random() * 3
            const size = 14 + Math.random() * 14
            const rotateStart = (i * 47) % 360
            const swayAmount = -50 + Math.random() * 100
            const emoji = ['🌸', '🌺', '🌷', '💮', '🏵️'][i % 5]
            return (
              <span
                key={i}
                className="petal"
                style={{
                  left: `${left}%`,
                  fontSize: `${size}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  '--rot-start': `${rotateStart}deg`,
                  '--sway': `${swayAmount}px`,
                }}
              >
                {emoji}
              </span>
            )
          })}
        </div>
      )}

      {/* === KONTEN UTAMA === */}
      <div className="opening-content-scrap">

        {/* Washi tape di atas */}
        <div className="opening-tape" aria-hidden="true" />

        {/* Label kecil */}
        <p className="opening-label-scrap">A FILM FOR</p>

        {/* Nama pacar */}
        <h1 className="opening-name-scrap">
          {CONFIG.nama}
        </h1>

        {/* Tagline */}
        <p className="opening-tagline-scrap">
          Sebuah kisah yang belum selesai...
        </p>

        {/* Tombol PLAY */}
        <button className="opening-btn-scrap" onClick={go}>
          ▶ Play
        </button>

      </div>
    </div>
  )
}