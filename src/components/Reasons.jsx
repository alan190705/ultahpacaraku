import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function Reasons() {
  const reasons = CONFIG.reasons || []

  // Rotasi beda-beda per card
  const rotations = ['rotate(-1.5deg)', 'rotate(1.5deg)', 'rotate(1deg)', 'rotate(-2deg)', 'rotate(2deg)', 'rotate(-1deg)']
  const tapeRotations = ['rotate(-4deg)', 'rotate(3deg)', 'rotate(-2deg)', 'rotate(4deg)', 'rotate(-3deg)', 'rotate(2deg)']

  // Nomor romawi
  const romanNums = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']

  return (
    <section className="reasons-scrap">

      {/* === GRID PAPER === */}
      <div className="reasons-grid-bg" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      <div className="reasons-tartan-top" aria-hidden="true" />
      <div className="reasons-tartan-bottom" aria-hidden="true" />

      {/* === STIKER === */}
      <div className="reasons-sticker reasons-sticker-1" aria-hidden="true">💝</div>
      <div className="reasons-sticker reasons-sticker-2" aria-hidden="true">✨</div>
      <div className="reasons-sticker reasons-sticker-3" aria-hidden="true">💕</div>
      <div className="reasons-sticker reasons-sticker-4" aria-hidden="true">🎀</div>
      <div className="reasons-sticker reasons-sticker-5" aria-hidden="true">⭐</div>

      {/* === KONTEN === */}
      <div className="reasons-content-scrap">

        {/* Judul */}
        <Reveal>
          <div className="reasons-title-wrap">
            <div className="reasons-title-tape" aria-hidden="true" />
            <h2 className="reasons-title-scrap">Alasan Aku Sayang Kamu</h2>
            <p className="reasons-tagline-scrap">hal-hal kecil yang bikin aku jatuh cinta 💗</p>
          </div>
        </Reveal>

        {/* Grid Reasons */}
        <div className="reasons-grid">
          {reasons.map((r, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div
                className="reasons-note"
                style={{ transform: rotations[i % rotations.length] }}
              >
                {/* Washi tape di atas */}
                <div
                  className="reasons-note-tape"
                  style={{ transform: `translateX(-50%) ${tapeRotations[i % tapeRotations.length]}` }}
                  aria-hidden="true"
                />

                {/* Nomor romawi di pojok */}
                <span className="reasons-note-num">
                  {romanNums[i] || (i + 1)}
                </span>

                {/* Icon emoji gede */}
                <div className="reasons-note-icon">{r.icon}</div>

                {/* Title */}
                <h3 className="reasons-note-title">{r.title}</h3>

                {/* Text */}
                <p className="reasons-note-text">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}