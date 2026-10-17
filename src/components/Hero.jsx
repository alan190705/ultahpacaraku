import { CONFIG } from '../config'

export default function Hero() {
  const hasPhoto = !!CONFIG.fotoHero

  return (
    <section className="hero-scrap">

      {/* === GRID PAPER === */}
      <div className="hero-grid" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      <div className="hero-tartan-top" aria-hidden="true" />
      <div className="hero-tartan-bottom" aria-hidden="true" />

      {/* === STIKER === */}
      <div className="hero-sticker hero-sticker-1" aria-hidden="true">🌸</div>
      <div className="hero-sticker hero-sticker-2" aria-hidden="true">✨</div>
      <div className="hero-sticker hero-sticker-3" aria-hidden="true">💕</div>
      <div className="hero-sticker hero-sticker-4" aria-hidden="true">🎀</div>
      <div className="hero-sticker hero-sticker-5" aria-hidden="true">⭐</div>

      {/* === KONTEN === */}
      <div className="hero-content-scrap">

        {/* === POLAROID FOTO === */}
        <div className="hero-polaroid-wrap">
          {/* Washi tape di atas polaroid */}
          <div className="hero-polaroid-tape" aria-hidden="true" />

          <div className="hero-polaroid">
            {hasPhoto ? (
              <img
                src={CONFIG.fotoHero}
                alt="Foto kita"
                className="hero-polaroid-img"
              />
            ) : (
              <div className="hero-polaroid-no-img">
                <span>📸</span>
                <p>Taruh foto di config</p>
              </div>
            )}
          </div>

          {/* Caption handwriting di bawah foto */}
          <p className="hero-polaroid-caption">our favorite person 💗</p>
        </div>

        {/* === JUDUL === */}
        <p className="hero-eyebrow-scrap">A FILM ABOUT US · 2026</p>

        <h1 className="hero-title-scrap">
          Untuk kamu,
          <br />
          <em>yang paling berarti.</em>
        </h1>

        {/* === STICKER NOTE — META INFO === */}
        <div className="hero-note">
          <div className="hero-note-tape" aria-hidden="true" />
          <div className="hero-note-content">
            <div className="hero-note-item">
              <span className="hero-note-label">Nama</span>
              <span className="hero-note-value">{CONFIG.nama}</span>
            </div>
            <div className="hero-note-divider" />
            <div className="hero-note-item">
              <span className="hero-note-label">Usia</span>
              <span className="hero-note-value">{CONFIG.umur}</span>
            </div>
            <div className="hero-note-divider" />
            <div className="hero-note-item">
              <span className="hero-note-label">Tanggal</span>
              <span className="hero-note-value">{CONFIG.tanggal}</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}