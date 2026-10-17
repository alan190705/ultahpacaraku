import { useState } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function Rewards() {
  const [redeemed, setRedeemed] = useState({})
  const rewards = CONFIG.rewards || []

  const claim = (index) => {
    if (redeemed[index]) return
    setRedeemed((prev) => ({ ...prev, [index]: true }))
  }

  const claimedCount = Object.keys(redeemed).length
  const allClaimed = claimedCount === rewards.length && rewards.length > 0

  return (
    <section className="rewards-section">
      <Reveal>
        <h2 className="serif">Voucher Spesial Buat Kamu</h2>
        <p className="it rewards-subtitle">
          Klik tiap voucher buat klaim. Berlaku selamanya 💗
        </p>
      </Reveal>

      <div className="rewards-grid">
        {rewards.map((r, i) => (
          <Reveal key={i} delay={i * 0.1}>
            <button
              className={`reward-card ${redeemed[i] ? 'redeemed' : ''}`}
              onClick={() => claim(i)}
              disabled={redeemed[i]}
            >
              {/* Kupon stub (efek garis putus-putus) */}
              <div className="reward-stub" aria-hidden="true">
                <span className="stub-hole top" />
                <span className="stub-hole bottom" />
              </div>

              <div className="reward-icon">{r.icon}</div>
              <h3 className="reward-title">{r.title}</h3>
              <p className="reward-desc">{r.desc}</p>

              {/* Status */}
              <div className="reward-status">
                {redeemed[i] ? (
                  <span className="status-claimed">✓ CLAIMED</span>
                ) : (
                  <span className="status-available">TAP TO CLAIM</span>
                )}
              </div>

              {/* Stempel CLAIMED */}
              {redeemed[i] && (
                <div className="reward-stamp" aria-hidden="true">
                  CLAIMED
                </div>
              )}
            </button>
          </Reveal>
        ))}
      </div>

      {/* Progress */}
      {rewards.length > 0 && (
        <Reveal delay={0.4}>
          <p className="rewards-progress">
            {claimedCount} / {rewards.length} voucher diklaim
          </p>
        </Reveal>
      )}

      {/* Pesan kalau semua diklaim */}
      {allClaimed && (
        <div className="rewards-complete pop">
          <p className="serif it">
            Yeay! Semua voucher udah kamu klaim 🎉
          </p>
          <p className="rewards-complete-sub">
            Tinggal chat aku buat klaim fisiknya 💗
          </p>
        </div>
      )}
    </section>
  )
}