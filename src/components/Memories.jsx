import { useState } from 'react'
import { CONFIG } from '../config'
import CommentModal from './CommentModal'

// Default komen buat preview di bawah postingan
const buildDefaultComments = (photoIndex) => [
  { id: `d${photoIndex}-1`, user: 'kamu', text: 'Cantik banget 😍', time: '2 hari lalu', isMine: false },
  { id: `d${photoIndex}-2`, user: 'kamu', text: 'Aku sayang kamu ❤️', time: '3 hari lalu', isMine: false },
  { id: `d${photoIndex}-3`, user: 'kamu', text: 'Momen favorit aku 💕', time: '5 hari lalu', isMine: false },
]

export default function Memories() {
  const photos = CONFIG.photos || []
  const [likedPosts, setLikedPosts] = useState({})
  const [savedPosts, setSavedPosts] = useState({})
  const [heartBurst, setHeartBurst] = useState(null)
  const [activeComment, setActiveComment] = useState(null)

  // === CACHE KOMEN — buat preview di bawah postingan ===
  const [commentsCache, setCommentsCache] = useState(() => {
    const cache = {}
    photos.forEach((_, i) => {
      try {
        const saved = localStorage.getItem(`comments-${i}`)
        if (saved) {
          cache[i] = JSON.parse(saved)
        } else {
          cache[i] = buildDefaultComments(i)
        }
      } catch {
        cache[i] = buildDefaultComments(i)
      }
    })
    return cache
  })

  const toggleLike = (index) => {
    setLikedPosts((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const toggleSave = (index) => {
    setSavedPosts((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  const handleDoubleTap = (index) => {
    if (!likedPosts[index]) {
      setLikedPosts((prev) => ({ ...prev, [index]: true }))
    }
    setHeartBurst(index)
    setTimeout(() => setHeartBurst(null), 800)
  }

  const formatLikes = (index) => {
    const base = 100000 + index * 137
    return base.toLocaleString('id-ID')
  }

  const getTimeAgo = (index) => {
    const days = [7, 14, 21, 30, 45, 60, 90][index % 7]
    return `${days} hari yang lalu`
  }

  if (photos.length === 0) {
    return (
      <section className="ig-feed-empty">
        <p>Belum ada foto nih 📸</p>
      </section>
    )
  }

  return (
    <section className="ig-feed-section">

      {/* === STICKY TOPBAR === */}
      <header className="ig-topbar">
        <div className="ig-topbar-left">
          <div className="ig-topbar-avatar">
            <img src={CONFIG.fotoHero || photos[0].src} alt="avatar" />
          </div>
          <span className="ig-topbar-username">maharani.oktapia</span>
        </div>
        <div className="ig-topbar-right">
          <span aria-hidden="true">♡</span>
          <span aria-hidden="true">✈</span>
        </div>
      </header>

      {/* === PROFILE HEADER === */}
      <div className="ig-profile">
        <h2 className="ig-feed-title">Memories Kita</h2>
        <p className="ig-feed-subtitle">Instagram Feed 📸</p>

        {/* STATS */}
        <div className="ig-stats">
          <div className="ig-stat">
            <strong>{photos.length}</strong>
            <span>Post</span>
          </div>
          <div className="ig-stat">
            <strong>1.2K</strong>
            <span>Followers</span>
          </div>
          <div className="ig-stat">
            <strong>142</strong>
            <span>Following</span>
          </div>
        </div>

        {/* BIO */}
        <p className="ig-bio">
          💕 Capturing moments with <strong>@kamu</strong>
          <br />📍 Jakarta, Indonesia
        </p>

        {/* HIGHLIGHTS */}
        <div className="ig-highlights">
          {[
            { label: 'Story', emoji: '📖' },
            { label: 'Favorite', emoji: '❤️' },
            { label: 'Trips', emoji: '✈️' },
            { label: 'Food', emoji: '🍜' },
            { label: 'Random', emoji: '✨' },
          ].map((h, i) => (
            <div key={i} className="ig-highlight">
              <div className="ig-highlight-circle">
                <span>{h.emoji}</span>
              </div>
              <span className="ig-highlight-label">{h.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === FEED === */}
      <div className="ig-feed">
        {photos.map((photo, i) => (
          <article key={i} className="ig-post">
            {/* HEADER */}
            <header className="ig-post-header">
              <div className="ig-post-avatar">
                <img
                  src={CONFIG.fotoHero || photo.src}
                  alt="avatar"
                  loading="lazy"
                />
              </div>
              <div className="ig-post-user">
                <p className="ig-post-username">maharani.oktapia</p>
                <p className="ig-post-location">Jakarta, Indonesia</p>
              </div>
              <button type="button" className="ig-post-menu" aria-label="Menu">
                ⋯
              </button>
            </header>

            {/* FOTO */}
            <div className="ig-post-image">
              <img
                src={photo.src}
                alt={photo.caption}
                loading="lazy"
                onDoubleClick={() => handleDoubleTap(i)}
              />
              {heartBurst === i && (
                <div className="ig-heart-burst">❤️</div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="ig-post-actions">
              <button
                type="button"
                className={`ig-action-btn ${likedPosts[i] ? 'liked' : ''}`}
                onClick={() => toggleLike(i)}
                aria-label="Like"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill={likedPosts[i] ? '#c8312e' : 'none'}
                    stroke="currentColor"
                    strokeWidth={likedPosts[i] ? '0' : '1.5'}
                  />
                </svg>
              </button>

              <button
                type="button"
                className="ig-action-btn"
                aria-label="Comment"
                onClick={() => setActiveComment(i)}
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path
                    d="M20.656 17.008a9.993 9.993 0 10-3.59 3.615L22 22z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button type="button" className="ig-action-btn" aria-label="Share">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <line
                    x1="22" y1="3" x2="9.218" y2="10.083"
                    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                  />
                  <polygon
                    points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className={`ig-action-btn ig-save-btn ${savedPosts[i] ? 'saved' : ''}`}
                onClick={() => toggleSave(i)}
                aria-label="Save"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <polygon
                    points="20 21 12 13.44 4 21 4 3 20 3 20 21"
                    fill={savedPosts[i] ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* LIKES */}
            <div className="ig-post-likes">
              <strong>{formatLikes(i)}</strong> likes
            </div>

            {/* CAPTION */}
            <div className="ig-post-caption">
              <p>
                <strong className="ig-post-caption-user">maharani.oktapia</strong>{' '}
                {photo.caption}
              </p>
            </div>

            {/* === PREVIEW KOMEN (2 TERAKHIR) === */}
            {commentsCache[i] && commentsCache[i].length > 0 && (
              <div className="ig-post-comments-preview">
                {commentsCache[i].length > 2 && (
                  <button
                    type="button"
                    className="ig-post-comments-link"
                    onClick={() => setActiveComment(i)}
                  >
                    Lihat semua {commentsCache[i].length} komen
                  </button>
                )}
                {commentsCache[i].slice(-2).map((c, idx) => (
                  <p key={c.id || idx} className="ig-post-comment-line">
                    <strong className="ig-post-comment-user">{c.user}</strong>{' '}
                    <span className="ig-post-comment-text">{c.text}</span>
                  </p>
                ))}
              </div>
            )}

            {/* TIME */}
            <div className="ig-post-time">{getTimeAgo(i)}</div>
          </article>
        ))}
      </div>

      {/* === COMMENT MODAL === */}
      {activeComment !== null && photos[activeComment] && (
        <CommentModal
          photo={photos[activeComment]}
          photoIndex={activeComment}
          onClose={() => setActiveComment(null)}
          onCommentsUpdate={(newComments) => {
            setCommentsCache((prev) => ({
              ...prev,
              [activeComment]: newComments,
            }))
          }}
        />
      )}
    </section>
  )
}