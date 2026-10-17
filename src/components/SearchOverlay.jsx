import { useState, useEffect, useRef } from 'react'
import { CONFIG } from '../config'

export default function SearchOverlay({ onClose, onSelectPhoto }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  const photos = CONFIG.photos || []
  const highlights = [
    { label: 'Story', emoji: '📖' },
    { label: 'Favorite', emoji: '❤️' },
    { label: 'Trips', emoji: '✈️' },
    { label: 'Food', emoji: '🍜' },
    { label: 'Random', emoji: '✨' },
  ]

  // Auto focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  // Lock body scroll
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  // ESC to close
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Filter foto berdasarkan query
  const filtered = query.trim()
    ? photos.filter((p) =>
        (p.caption || '').toLowerCase().includes(query.toLowerCase())
      )
    : []

  // Filter highlights
  const filteredHighlights = query.trim()
    ? highlights.filter((h) =>
        h.label.toLowerCase().includes(query.toLowerCase())
      )
    : highlights

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <h3 className="search-title">🔍 Cari Momen</h3>
          <button className="search-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Cari caption, momen, atau highlight..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Hapus"
            >
              ✕
            </button>
          )}
        </div>

        {/* HIGHLIGHTS */}
        {filteredHighlights.length > 0 && (
          <div className="search-section">
            <p className="search-section-title">✨ Highlights</p>
            <div className="search-highlights">
              {filteredHighlights.map((h, i) => (
                <button
                  key={i}
                  className="search-highlight"
                  onClick={() => setQuery(h.label)}
                >
                  <span className="search-highlight-emoji">{h.emoji}</span>
                  <span className="search-highlight-label">{h.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* HASIL SEARCH */}
        {query.trim() && (
          <div className="search-section">
            <p className="search-section-title">
              📸 Hasil ({filtered.length})
            </p>
            {filtered.length === 0 ? (
              <div className="search-empty">
                <p className="search-empty-emoji">🥺</p>
                <p className="search-empty-text">
                  Gak ada momen dengan kata "<strong>{query}</strong>"
                </p>
                <p className="search-empty-hint">Coba kata lain ya 💕</p>
              </div>
            ) : (
              <div className="search-results">
                {filtered.map((photo, i) => (
                  <button
                    key={i}
                    className="search-result"
                    onClick={() => {
                      onSelectPhoto?.(photo, i)
                      onClose()
                    }}
                  >
                    <img src={photo.src} alt={photo.caption} />
                    <p className="search-result-caption">{photo.caption}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HINT KALAU QUERY KOSONG */}
        {!query.trim() && (
          <div className="search-hint">
            <p className="search-hint-emoji">💡</p>
            <p className="search-hint-text">
              Ketik kata kunci buat cari momen, atau pilih highlight di atas
            </p>
          </div>
        )}
      </div>
    </div>
  )
}