import { useEffect } from 'react'
import { CONFIG } from '../config'

export default function ProfileModal({ onClose, photosCount = 0 }) {
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const highlights = [
    { label: 'Story', emoji: '📖' },
    { label: 'Favorite', emoji: '❤️' },
    { label: 'Trips', emoji: '✈️' },
    { label: 'Food', emoji: '🍜' },
    { label: 'Random', emoji: '✨' },
  ]

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-panel" onClick={(e) => e.stopPropagation()}>
        <div className="profile-header">
          <h3 className="profile-title">👤 Profil</h3>
          <button className="profile-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="profile-body">
          {/* AVATAR */}
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <img src={CONFIG.fotoHero} alt="avatar" />
            </div>
          </div>

          {/* USERNAME */}
          <p className="profile-username">maharani.oktapia</p>
          <p className="profile-tagline">💕 Capturing moments with @kamu</p>

          {/* STATS */}
          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{photosCount}</strong>
              <span>Post</span>
            </div>
            <div className="profile-stat">
              <strong>1.2K</strong>
              <span>Followers</span>
            </div>
            <div className="profile-stat">
              <strong>142</strong>
              <span>Following</span>
            </div>
          </div>

          {/* BIO */}
          <div className="profile-bio">
            <p>📍 Jakarta, Indonesia</p>
            <p>🎂 Ultah 23 Oktober</p>
            <p>💕 Bersama kamu selamanya</p>
          </div>

          {/* HIGHLIGHTS */}
          <div className="profile-highlights">
            {highlights.map((h, i) => (
              <div key={i} className="profile-highlight">
                <div className="profile-highlight-circle">
                  <span>{h.emoji}</span>
                </div>
                <span className="profile-highlight-label">{h.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}