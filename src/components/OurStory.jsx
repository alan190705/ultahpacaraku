import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function OurStory() {
  const story = CONFIG.story || []

  // Rotasi beda-beda biar scrapbook vibe
  const rotations = ['rotate(-1.5deg)', 'rotate(1deg)', 'rotate(-1deg)', 'rotate(2deg)', 'rotate(-2deg)', 'rotate(1.5deg)']
  const tapeRotations = ['rotate(-4deg)', 'rotate(3deg)', 'rotate(-2deg)', 'rotate(4deg)', 'rotate(-3deg)', 'rotate(2deg)']

  return (
    <section className="ourstory-scrap">

      {/* === GRID PAPER === */}
      <div className="ourstory-grid" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      {/* <div className="ourstory-tartan-top" aria-hidden="true" />
      <div className="ourstory-tartan-bottom" aria-hidden="true" /> */}

      {/* === STIKER === */}
      <div className="ourstory-sticker ourstory-sticker-1" aria-hidden="true">📖</div>
      <div className="ourstory-sticker ourstory-sticker-2" aria-hidden="true">✨</div>
      <div className="ourstory-sticker ourstory-sticker-3" aria-hidden="true">💕</div>
      <div className="ourstory-sticker ourstory-sticker-4" aria-hidden="true">🎀</div>
      <div className="ourstory-sticker ourstory-sticker-5" aria-hidden="true">⭐</div>

      {/* === KONTEN === */}
      <div className="ourstory-content-scrap">

        {/* Judul */}
        <Reveal>
          <div className="ourstory-title-wrap">
            <div className="ourstory-title-tape" aria-hidden="true" />
            <h2 className="ourstory-title-scrap">Our Story</h2>
            <p className="ourstory-tagline-scrap">cerita kita dari awal 💗</p>
          </div>
        </Reveal>

        {/* Timeline */}
        <div className="ourstory-timeline">
          {story.map((s, i) => (
            <Reveal
              key={i}
              delay={i * 0.12}
              className={`ourstory-item ${i % 2 === 0 ? 'l' : 'r'}`}
            >
              <div
                className="ourstory-note"
                style={{ transform: rotations[i % rotations.length] }}
              >
                {/* Washi tape di atas note */}
                <div
                  className="ourstory-note-tape"
                  style={{ transform: `translateX(-50%) ${tapeRotations[i % tapeRotations.length]}` }}
                  aria-hidden="true"
                />

                {/* Icon lingkaran */}
                <div className="ourstory-icon">{s.icon}</div>

                {/* Title */}
                <h3 className="ourstory-note-title">{s.title}</h3>

                {/* Text */}
                <p className="ourstory-note-text">{s.text}</p>

                {/* Nomor kecil di pojok */}
                <span className="ourstory-note-num">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Dot di timeline */}
              <div className="ourstory-dot">{s.icon}</div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}