import { useEffect, useState } from 'react'
import { CONFIG } from '../config'

export default function LoadingScreen({ onDone }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const images = [
      CONFIG.fotoHero,
      CONFIG.fotoFinal,
      ...(CONFIG.photos || []).map((p) => p.src),
    ].filter(Boolean)

    const MIN_DURATION = 3200
    const startTime = Date.now()

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min((elapsed / MIN_DURATION) * 100, 100)
      setProgress(Math.round(pct))
    }, 30)

    let loaded = 0
    let done = false

    const finish = () => {
      if (done) return
      done = true
      clearInterval(progressInterval)
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, MIN_DURATION - elapsed)
      setTimeout(() => {
        setProgress(100)
        setTimeout(onDone, 800)
      }, remaining)
    }

    const timeout = setTimeout(finish, 6000)

    if (images.length === 0) {
      finish()
      return () => {
        clearTimeout(timeout)
        clearInterval(progressInterval)
      }
    }

    images.forEach((src) => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        if (loaded === images.length) {
          clearTimeout(timeout)
          finish()
        }
      }
      img.src = src
    })

    return () => {
      clearTimeout(timeout)
      clearInterval(progressInterval)
    }
  }, [onDone])

  return (
    <div className="loading-scrapbook">
      {/* Grid paper */}
      <div className="loading-grid" aria-hidden="true" />

      {/* Tartan border atas-bawah */}
      <div className="loading-tartan-top" aria-hidden="true" />
      <div className="loading-tartan-bottom" aria-hidden="true" />

      {/* Stiker dekorasi */}
      <div className="loading-sticker loading-sticker-1" aria-hidden="true">🌸</div>
      <div className="loading-sticker loading-sticker-2" aria-hidden="true">✨</div>
      <div className="loading-sticker loading-sticker-3" aria-hidden="true">💕</div>
      <div className="loading-sticker loading-sticker-4" aria-hidden="true">⭐</div>
      <div className="loading-sticker loading-sticker-5" aria-hidden="true">🎀</div>

      {/* Washi tape */}
      <div className="loading-tape" aria-hidden="true" />

      {/* Konten */}
      <div className="loading-content-scrap">
        <p className="loading-hello">Hi, cantik!</p>

        <h1 className="loading-name-scrap">
          {CONFIG.nama}
        </h1>

        <p className="loading-tagline-scrap">
          Menyiapkan kejutan buat kamu... 💌
        </p>

        {/* Progress bar */}
        <div className="loading-bar-wrap">
          <div className="loading-bar">
            <div
              className="loading-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="loading-percent">{progress}%</p>
        </div>
      </div>
    </div>
  )
}