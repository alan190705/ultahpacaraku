import { useState, useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'

export default function LockScreen({ onUnlock }) {
  const [entered, setEntered] = useState('')
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)

  const pin = CONFIG.pin || '1234'
  const pinLength = pin.length

  useEffect(() => {
    if (entered.length !== pinLength) return

    if (entered === pin) {
      setSuccess(true)

      const colors = ['#e8909c', '#c8312e', '#fdf8f3', '#f8c8d4', '#e8b33e']
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors,
      })
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.7 },
          colors,
        })
      }, 250)
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.7 },
          colors,
        })
      }, 500)

      setTimeout(() => onUnlock(), 1400)
    } else {
      setError(true)
      setTimeout(() => {
        setError(false)
        setEntered('')
      }, 700)
    }
  }, [entered, pin, pinLength, onUnlock])

  const pressKey = (num) => {
    if (error || success) return
    if (entered.length >= pinLength) return
    setEntered((prev) => prev + num)
  }

  const pressDelete = () => {
    if (error || success) return
    setEntered((prev) => prev.slice(0, -1))
  }

  return (
    <div className={`lock-scrap ${success ? 'unlocked' : ''} ${error ? 'shake' : ''}`}>
      {/* === GRID PAPER === */}
      <div className="lock-grid" aria-hidden="true" />

      {/* === TARTAN BORDER === */}
      <div className="lock-tartan-top" aria-hidden="true" />
      <div className="lock-tartan-bottom" aria-hidden="true" />

      {/* === STIKER DEKORASI === */}
      <div className="lock-sticker lock-sticker-1" aria-hidden="true">🌸</div>
      <div className="lock-sticker lock-sticker-2" aria-hidden="true">✨</div>
      <div className="lock-sticker lock-sticker-3" aria-hidden="true">💕</div>
      <div className="lock-sticker lock-sticker-4" aria-hidden="true">⭐</div>
      <div className="lock-sticker lock-sticker-5" aria-hidden="true">🎀</div>

      {/* === GEMBOK + WASHI TAPE === */}
      <div className="lock-icon-wrap">
        <div className="lock-tape" aria-hidden="true" />
        <div className="lock-icon">
          <svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="lockHeartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e8909c" />
                <stop offset="100%" stopColor="#c8312e" />
              </linearGradient>
              <linearGradient id="lockShackleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f8c8d4" />
                <stop offset="100%" stopColor="#e8909c" />
              </linearGradient>
            </defs>

            {/* Shackle */}
            <path
              d="M 30 55 L 30 35 Q 30 15 50 15 Q 70 15 70 35 L 70 55"
              fill="none"
              stroke="url(#lockShackleGrad)"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Body — hati */}
            <path
              d="M 50 130
                 C 20 105, 10 80, 20 65
                 C 30 50, 50 55, 50 75
                 C 50 55, 70 50, 80 65
                 C 90 80, 80 105, 50 130 Z"
              fill="url(#lockHeartGrad)"
              stroke="#c8312e"
              strokeWidth="2"
            />

            {/* Keyhole */}
            <circle cx="50" cy="88" r="6" fill="#fdf8f3" />
            <path d="M 50 94 L 46 108 L 54 108 Z" fill="#fdf8f3" />

            {/* Highlight */}
            <ellipse cx="35" cy="80" rx="4" ry="2" fill="rgba(255,255,255,0.6)" />
          </svg>

          {/* Kunci di samping */}
          <div className="lock-key" aria-hidden="true">
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="none" stroke="#e8909c" strokeWidth="3" />
              <circle cx="12" cy="12" r="3" fill="#e8909c" />
              <rect x="18" y="10" width="20" height="4" fill="#e8909c" />
              <rect x="32" y="14" width="4" height="6" fill="#e8909c" />
              <rect x="26" y="14" width="4" height="4" fill="#e8909c" />
            </svg>
          </div>
        </div>
      </div>

      {/* === TEKS === */}
      <div className="lock-text">
        <p className="lock-from">{CONFIG.pinFrom || 'From: Someone'}</p>
        <p className="lock-for">{CONFIG.pinFor || 'For: You'}</p>
        <p className="lock-hint">{CONFIG.pinHint || 'a little secret...'}</p>
      </div>

      {/* === DOTS === */}
      <div className="lock-dots">
        {Array.from({ length: pinLength }).map((_, i) => (
          <span
            key={i}
            className={`lock-dot ${i < entered.length ? 'filled' : ''}`}
          />
        ))}
      </div>

      {/* === ERROR === */}
      {error && (
        <p className="lock-error">{CONFIG.pinWrong || 'Coba lagi ya 💕'}</p>
      )}

      {/* === NUMPAD === */}
      <div className="lock-pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            className="lock-key-btn"
            onClick={() => pressKey(String(n))}
            disabled={error || success}
          >
            {n}
          </button>
        ))}
        <button className="lock-key-btn lock-key-empty" disabled />
        <button
          className="lock-key-btn"
          onClick={() => pressKey('0')}
          disabled={error || success}
        >
          0
        </button>
        <button
          className="lock-key-btn lock-key-delete"
          onClick={pressDelete}
          disabled={error || success}
          aria-label="Hapus"
        >
          ⌫
        </button>
      </div>
    </div>
  )
}