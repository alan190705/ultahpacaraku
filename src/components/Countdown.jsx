import { useEffect, useState } from 'react'
import { CONFIG } from '../config'

function getTimeLeft(target) {
  const diff = new Date(target) - new Date()
  if (diff <= 0) return null
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export default function Countdown() {
  const [time, setTime] = useState(() => getTimeLeft(CONFIG.tanggalLahir))

  useEffect(() => {
    const t = setInterval(() => setTime(getTimeLeft(CONFIG.tanggalLahir)), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="countdown-scrap">

      {/* === GRID PAPER === */}
      <div className="countdown-grid" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      <div className="countdown-tartan-top" aria-hidden="true" />
      <div className="countdown-tartan-bottom" aria-hidden="true" />

      {/* === STIKER === */}
      <div className="countdown-sticker countdown-sticker-1" aria-hidden="true">⏰</div>
      <div className="countdown-sticker countdown-sticker-2" aria-hidden="true">✨</div>
      <div className="countdown-sticker countdown-sticker-3" aria-hidden="true">💕</div>
      <div className="countdown-sticker countdown-sticker-4" aria-hidden="true">🎀</div>
      <div className="countdown-sticker countdown-sticker-5" aria-hidden="true">⭐</div>

      {/* === KONTEN === */}
      <div className="countdown-content-scrap">

        {/* Judul */}
        <div className="countdown-title-wrap">
          <div className="countdown-title-tape" aria-hidden="true" />
          <h2 className="countdown-title-scrap">
            {time ? 'Menuju Hari Spesial' : 'Hari Ini Hari Kamu 🎉'}
          </h2>
          <p className="countdown-tagline-scrap">
            {time ? 'Tinggal sedikit lagi...' : 'Selamat ulang tahun, cintaku 💗'}
          </p>
        </div>

        {/* 4 Sticker Note — Hari / Jam / Menit / Detik */}
        {time ? (
          <div className="countdown-notes">
            <div className="cd-note" style={{ transform: 'rotate(-3deg)' }}>
              <div className="cd-note-tape" aria-hidden="true" />
              <span className="cd-num-scrap">
                {String(time.days).padStart(2, '0')}
              </span>
              <span className="cd-label-scrap">Hari</span>
            </div>

            <div className="cd-note" style={{ transform: 'rotate(2deg)' }}>
              <div className="cd-note-tape" aria-hidden="true" />
              <span className="cd-num-scrap">
                {String(time.hours).padStart(2, '0')}
              </span>
              <span className="cd-label-scrap">Jam</span>
            </div>

            <div className="cd-note" style={{ transform: 'rotate(-2deg)' }}>
              <div className="cd-note-tape" aria-hidden="true" />
              <span className="cd-num-scrap">
                {String(time.minutes).padStart(2, '0')}
              </span>
              <span className="cd-label-scrap">Menit</span>
            </div>

            <div className="cd-note" style={{ transform: 'rotate(3deg)' }}>
              <div className="cd-note-tape" aria-hidden="true" />
              <span className="cd-num-scrap">
                {String(time.seconds).padStart(2, '0')}
              </span>
              <span className="cd-label-scrap">Detik</span>
            </div>
          </div>
        ) : (
          <div className="countdown-done">
            <span className="countdown-done-emoji">🎂</span>
            <p className="countdown-done-text">
              Selamat ulang tahun ya sayang!
            </p>
          </div>
        )}

      </div>
    </section>
  )
}