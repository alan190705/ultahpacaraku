import { useRef, useState, useEffect } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function VideoMessage() {
  const videoRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [activeMemory, setActiveMemory] = useState(null)

  // === ROW DATA ===
  const memories = CONFIG.photos || []
  const songs = (CONFIG.songs || []).filter((s) => s.spotifyId)
  const watchAgain = CONFIG.watchAgain || []
  const because = CONFIG.becauseYouLoved || []

  // === SYNC STATE VIDEO ===
  useEffect(() => {
    const v = videoRef.current
    if (!v) return

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      v.currentTime = 0
    }
    const onErr = () => setHasError(true)

    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('ended', onEnded)
    v.addEventListener('error', onErr)

    return () => {
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('ended', onEnded)
      v.removeEventListener('error', onErr)
    }
  }, [])

  // === LOCK BODY SCROLL ===
  useEffect(() => {
    if (playing) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [playing])

  // === ESC KEY ===
  useEffect(() => {
    if (!playing) return
    const onKey = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [playing])

  // === HANDLE PLAY ===
  const handlePlay = async () => {
    const v = videoRef.current
    if (!v) return

    if (v.paused) {
      setPlaying(true)
      try {
        if (v.requestFullscreen) await v.requestFullscreen()
        else if (v.webkitRequestFullscreen) await v.webkitRequestFullscreen()
        else if (v.mozRequestFullScreen) await v.mozRequestFullScreen()
      } catch {}
      v.play().catch(() => {
        setPlaying(false)
        setHasError(true)
      })
    } else {
      v.pause()
      setPlaying(false)
      if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
  }

  // === HANDLE CLOSE ===
  const handleClose = () => {
    const v = videoRef.current
    if (v) { v.pause(); v.currentTime = 0 }
    setPlaying(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }

  return (
    <section className="netflix-section">
      {/* === NAVBAR === */}
      <div className="netflix-navbar">
        <span className="netflix-logo">N</span>
        <span className="netflix-nav-item active">Home</span>
        <span className="netflix-nav-item">TV Shows</span>
        <span className="netflix-nav-item">Movies</span>
        <span className="netflix-nav-item">My List</span>
      </div>

      {/* === VIDEO HERO === */}
      <Reveal>
        <div className="netflix-hero">
          <video
            ref={videoRef}
            src={CONFIG.videoUrl}
            poster={CONFIG.videoPoster}
            playsInline
            preload="metadata"
            className={`netflix-video ${playing ? 'cinema' : ''}`}
          />

          {!playing && !hasError && (
            <div className="netflix-overlay" onClick={handlePlay}>
              <div className="netflix-overlay-content">
                <p className="netflix-series-label">
                  <span className="netflix-n">N</span> SERIES
                </p>
                <h1 className="netflix-title">
                  {CONFIG.happyBirthday || 'Happy Birthday'}
                </h1>
                <p className="netflix-meta-line">
                  2026 · Untuk kamu · 1 Season
                </p>
                <div className="netflix-actions">
                  <button
                    type="button"
                    className="netflix-btn-play"
                    onClick={(e) => { e.stopPropagation(); handlePlay() }}
                  >
                    ▶ Play
                  </button>
                  <button
                    type="button"
                    className="netflix-btn-icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    + <span>My List</span>
                  </button>
                  <button
                    type="button"
                    className="netflix-btn-icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ℹ <span>Info</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {hasError && (
            <div className="netflix-overlay">
              <div className="netflix-overlay-content">
                <p style={{ color: '#f5efe4', fontSize: '0.9rem' }}>
                  ⚠️ Video gak bisa di-load
                </p>
              </div>
            </div>
          )}

          {playing && (
            <button
              type="button"
              className="cinema-close-btn"
              onClick={handleClose}
              aria-label="Tutup"
            >
              ✕
            </button>
          )}

          {playing && (
            <button
              type="button"
              className="netflix-pause-btn"
              onClick={handlePlay}
              aria-label="Pause"
            >
              ⏸
            </button>
          )}
        </div>
      </Reveal>

      {/* === ROW 1: My Memories === */}
      {memories.length > 0 && (
        <div className="netflix-row">
          <h3 className="netflix-row-title">My Memories</h3>
          <div className="netflix-row-scroll">
            {memories.map((m, i) => (
              <button
                key={i}
                type="button"
                className="netflix-card"
                onClick={() => setActiveMemory(m)}
              >
                <img src={m.src} alt={m.caption} loading="lazy" />
                <div className="netflix-card-overlay">
                  <span className="netflix-card-play">▶</span>
                </div>
                <div className="netflix-card-meta">
                  <p className="netflix-card-caption">{m.caption}</p>
                  <div className="netflix-card-badge">★ 9.5</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === ROW 2: Our Songs — Spotify Embed === */}
      {songs.length > 0 && (
        <div className="netflix-row">
          <h3 className="netflix-row-title">Our Songs</h3>
          <div className="netflix-row-scroll netflix-row-songs">
            {songs.map((s, i) => (
              <div key={i} className="spotify-embed-card">
                <iframe
                  src={`https://open.spotify.com/embed/track/${s.spotifyId}?utm_source=generator&theme=0`}
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={`${s.title} - ${s.artist}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === ROW 3: Watch It Again === */}
      {watchAgain.length > 0 && (
        <div className="netflix-row">
          <h3 className="netflix-row-title">Watch It Again</h3>
          <div className="netflix-row-scroll">
            {watchAgain.map((m, i) => (
              <button
                key={i}
                type="button"
                className="netflix-card netflix-card-tall"
                onClick={() => setActiveMemory(m)}
              >
                <img src={m.src} alt={m.caption} loading="lazy" />
                <div className="netflix-card-overlay">
                  <span className="netflix-card-play">▶</span>
                </div>
                <div className="netflix-card-progress">
                  <div
                    className="netflix-card-progress-fill"
                    style={{ width: `${40 + i * 12}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === ROW 4: Because You Loved === */}
      {because.length > 0 && (
        <div className="netflix-row netflix-row-last">
          <h3 className="netflix-row-title">Because You Loved</h3>
          <div className="netflix-row-scroll">
            {because.map((m, i) => (
              <button
                key={i}
                type="button"
                className="netflix-card netflix-card-wide"
                onClick={() => setActiveMemory(m)}
              >
                <img src={m.src} alt={m.caption} loading="lazy" />
                <div className="netflix-card-overlay">
                  <span className="netflix-card-play">▶</span>
                </div>
                <p className="netflix-card-caption-bottom">{m.caption}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === LIGHTBOX === */}
      {activeMemory && (
        <div className="lightbox" onClick={() => setActiveMemory(null)}>
          <div className="lb-card" onClick={(e) => e.stopPropagation()}>
            <img src={activeMemory.src} alt={activeMemory.caption} />
            <p>{activeMemory.caption}</p>
          </div>
        </div>
      )}
    </section>
  )
}