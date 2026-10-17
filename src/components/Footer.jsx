import { useEffect } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function Footer() {
  // Fade-in musik pas masuk slide Footer — bikin nuansa "ending film"
  useEffect(() => {
    const audio = document.querySelector('audio')
    if (!audio) return

    const origVol = audio.volume
    const targetVol = 0.15
    let vol = origVol

    const fade = setInterval(() => {
      vol = Math.max(targetVol, vol - 0.01)
      audio.volume = vol
      if (vol <= targetVol) clearInterval(fade)
    }, 50)

    return () => {
      clearInterval(fade)
      audio.volume = origVol
    }
  }, [])

  return (
    <section className="final">
      {/* Background foto + efek Ken Burns */}
      <div
        className="final-bg ken-burns"
        style={
          CONFIG.fotoFinal
            ? { backgroundImage: `url(${CONFIG.fotoFinal})` }
            : {}
        }
      />

      {/* Overlay gelap */}
      <div className="final-overlay" />

      {/* Vignette sinematik */}
      <div className="final-vignette" />

      {/* Konten */}
      <div className="final-in">
        <Reveal>
          <p className="serif it fade-slow">
            Kalau suatu hari nanti kamu lupa betapa spesialnya kamu...
          </p>
        </Reveal>

        <Reveal delay={0.6}>
          <p className="serif it fade-slow">Datang lagi ke sini.</p>
        </Reveal>

        <Reveal delay={1.2}>
          <h1 className="big glow-pulse">I Love You ❤️</h1>
        </Reveal>

        <Reveal delay={1.6}>
          <p className="date">{CONFIG.tanggal}</p>
        </Reveal>
      </div>

      {/* Tombol replay */}
      <button
        className="btn ghost small replay-btn"
        onClick={() => window.location.reload()}
      >
        🔄 Putar dari awal
      </button>
    </section>
  )
}