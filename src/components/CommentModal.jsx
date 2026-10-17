import { useState, useEffect, useRef } from 'react'
import { CONFIG } from '../config'

// Komen default — gak bisa di-edit/hapus (dari "kamu")
const buildDefaultComments = (photoIndex) => [
  { id: `d${photoIndex}-1`, user: 'kamu', avatar: CONFIG.fotoHero, text: 'Cantik banget 😍', time: '2 hari lalu', isMine: false },
  { id: `d${photoIndex}-2`, user: 'kamu', avatar: CONFIG.fotoHero, text: 'Aku sayang kamu ❤️', time: '3 hari lalu', isMine: false },
  { id: `d${photoIndex}-3`, user: 'kamu', avatar: CONFIG.fotoHero, text: 'Momen favorit aku 💕', time: '5 hari lalu', isMine: false },
]

export default function CommentModal({ photo, photoIndex, onClose, onCommentsUpdate }) {
  const [comments, setComments] = useState(() => {
    try {
      const saved = localStorage.getItem(`comments-${photoIndex}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    return buildDefaultComments(photoIndex)
  })

  const [input, setInput] = useState('')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const inputRef = useRef(null)
  const editInputRef = useRef(null)

  // === SAVE KE LOCALSTORAGE ===
  useEffect(() => {
    try {
      localStorage.setItem(`comments-${photoIndex}`, JSON.stringify(comments))
    } catch {}
  }, [comments, photoIndex])

  // === KIRIM UPDATE KE PARENT (buat preview di postingan) ===
  useEffect(() => {
    if (onCommentsUpdate) {
      onCommentsUpdate(comments)
    }
  }, [comments, onCommentsUpdate])

  // === LOCK BODY ===
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  // === AUTO FOCUS INPUT ===
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [])

  useEffect(() => {
    if (editingId) {
      setTimeout(() => editInputRef.current?.focus(), 100)
    }
  }, [editingId])

  // === ESC HANDLER ===
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (openMenuId) setOpenMenuId(null)
        else if (editingId) cancelEdit()
        else if (confirmDeleteId) setConfirmDeleteId(null)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, openMenuId, editingId, confirmDeleteId])

  // === CLICK OUTSIDE buat nutup menu ===
  useEffect(() => {
    if (!openMenuId) return
    const handler = () => setOpenMenuId(null)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [openMenuId])

  // === SUBMIT KOMEN BARU ===
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const newComment = {
      id: `c${Date.now()}`,
      user: 'maharani.oktapia',
      avatar: CONFIG.fotoHero,
      text: input.trim(),
      time: 'Baru aja',
      isMine: true,
    }

    setComments((prev) => [...prev, newComment])
    setInput('')
  }

  // === MULAI EDIT ===
  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.text)
    setOpenMenuId(null)
  }

  // === SIMPAN EDIT ===
  const saveEdit = () => {
    if (!editText.trim()) return
    setComments((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, text: editText.trim(), time: 'Diedit baru aja' }
          : c
      )
    )
    setEditingId(null)
    setEditText('')
  }

  // === CANCEL EDIT ===
  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  // === HAPUS KOMEN ===
  const confirmDelete = (id) => {
    setComments((prev) => prev.filter((c) => c.id !== id))
    setConfirmDeleteId(null)
    setOpenMenuId(null)
  }

  return (
    <div className="comment-overlay" onClick={onClose}>
      <div className="comment-panel" onClick={(e) => e.stopPropagation()}>
        <div className="comment-header">
          <h3 className="comment-title">💬 Komentar</h3>
          <button className="comment-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        {/* PREVIEW FOTO */}
        <div className="comment-photo-preview">
          <img src={photo.src} alt={photo.caption} />
          <p className="comment-photo-caption">{photo.caption}</p>
        </div>

        {/* LIST KOMEN */}
        <div className="comment-list">
          {comments.length === 0 ? (
            <div className="comment-empty">
              <p className="comment-empty-emoji">💭</p>
              <p className="comment-empty-text">Belum ada komen. Jadi yang pertama ya!</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-avatar">
                  <img src={c.avatar || CONFIG.fotoHero} alt={c.user} />
                </div>

                <div className="comment-content">
                  <p className="comment-user">{c.user}</p>

                  {/* MODE EDIT */}
                  {editingId === c.id ? (
                    <div className="comment-edit-wrap">
                      <input
                        ref={editInputRef}
                        type="text"
                        className="comment-edit-input"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit()
                          if (e.key === 'Escape') cancelEdit()
                        }}
                      />
                      <div className="comment-edit-actions">
                        <button
                          type="button"
                          className="comment-edit-btn comment-edit-cancel"
                          onClick={cancelEdit}
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          className="comment-edit-btn comment-edit-save"
                          onClick={saveEdit}
                          disabled={!editText.trim()}
                        >
                          Simpan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="comment-text">{c.text}</p>
                      <p className="comment-time">{c.time}</p>
                    </>
                  )}
                </div>

                {/* TOMBOL TITIK 3 — cuma muncul kalau komen sendiri */}
                {c.isMine && editingId !== c.id && (
                  <div className="comment-menu-wrap">
                    <button
                      type="button"
                      className="comment-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === c.id ? null : c.id)
                      }}
                      aria-label="Menu komen"
                    >
                      ⋯
                    </button>

                    {openMenuId === c.id && (
                      <div
                        className="comment-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="comment-menu-item"
                          onClick={() => startEdit(c)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="comment-menu-item comment-menu-item-danger"
                          onClick={() => {
                            setConfirmDeleteId(c.id)
                            setOpenMenuId(null)
                          }}
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* INPUT KOMEN BARU */}
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-input-avatar">
            <img src={CONFIG.fotoHero} alt="me" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="comment-input"
            placeholder="Tulis komen..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="comment-submit"
            disabled={!input.trim()}
            aria-label="Kirim"
          >
            Kirim
          </button>
        </form>

        {/* === MODAL KONFIRMASI HAPUS === */}
        {confirmDeleteId && (
          <div
            className="comment-confirm-overlay"
            onClick={() => setConfirmDeleteId(null)}
          >
            <div
              className="comment-confirm"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="comment-confirm-emoji">🗑️</p>
              <p className="comment-confirm-title">Hapus komen ini?</p>
              <p className="comment-confirm-text">
                Komen yang udah dihapus gak bisa dikembalikan.
              </p>
              <div className="comment-confirm-actions">
                <button
                  type="button"
                  className="comment-confirm-btn comment-confirm-cancel"
                  onClick={() => setConfirmDeleteId(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="comment-confirm-btn comment-confirm-delete"
                  onClick={() => confirmDelete(confirmDeleteId)}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}