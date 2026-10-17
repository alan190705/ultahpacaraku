import { useEffect } from 'react'

export default function NotificationsPopup({ onClose, onNavigate, onOpenPhotoBooth }) {
  useEffect(() => {
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [])

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const notifications = [
    {
      id: 1,
      emoji: '💕',
      title: 'Kamu punya 100 likes',
      text: 'Semua orang suka momen kita',
      time: '2 menit lalu',
      action: null,
    },
    {
      id: 2,
      emoji: '🎂',
      title: 'Ulang tahun kamu 7 hari lagi!',
      text: 'Jangan lupa siapin wish ya',
      time: '1 jam lalu',
      action: null,
    },
    {
      id: 3,
      emoji: '💌',
      title: 'Ada surat buat kamu',
      text: 'Dari aku, buat kamu',
      time: '1 hari lalu',
      action: () => onNavigate('letter'),
    },
    {
      id: 4,
      emoji: '📸',
      title: 'PhotoBooth baru dibuka',
      text: 'Coba foto bareng di sini',
      time: '2 hari lalu',
      action: () => onOpenPhotoBooth(),
    },
    {
      id: 5,
      emoji: '🎁',
      title: '4 voucher belum diklaim',
      text: 'Klaim vouchernya sekarang',
      time: '3 hari lalu',
      action: () => onNavigate('rewards'),
    },
  ]

  return (
    <div className="notif-overlay" onClick={onClose}>
      <div className="notif-panel" onClick={(e) => e.stopPropagation()}>
        <div className="notif-header">
          <h3 className="notif-title">❤️ Notifikasi</h3>
          <button className="notif-close" onClick={onClose} aria-label="Tutup">
            ✕
          </button>
        </div>

        <div className="notif-list">
          {notifications.map((n) => (
            <button
              key={n.id}
              className={`notif-item ${n.action ? 'notif-item-clickable' : ''}`}
              onClick={() => {
                if (n.action) {
                  n.action()
                  onClose()
                }
              }}
            >
              <div className="notif-emoji-wrap">
                <span className="notif-emoji">{n.emoji}</span>
              </div>
              <div className="notif-content">
                <p className="notif-text">
                  <strong>{n.title}</strong>
                </p>
                <p className="notif-subtext">{n.text}</p>
                <p className="notif-time">{n.time}</p>
              </div>
              {n.action && <span className="notif-arrow">→</span>}
            </button>
          ))}
        </div>

        <p className="notif-hint">
          Klik notif yang ada tanda → buat buka 💕
        </p>
      </div>
    </div>
  )
}