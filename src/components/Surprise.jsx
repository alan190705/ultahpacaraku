import { useState } from 'react'
import confetti from 'canvas-confetti'
import Hearts from './Hearts'

export default function Surprise() {
  const [on, setOn] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const fire = () => {
    setOn(true)

    const colors = ['#f9d9df', '#d96b84', '#7a1f3d', '#fff7ef', '#f3c6d0']
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (!prefersReduced) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.7 },
        colors,
      })

      const duration = 4000
      const end = Date.now() + duration
      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        })
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }

    setTimeout(() => setShowContent(true), 800)
  }

  return (
    <section className="surprise">
      {on && !showContent && <Hearts count={18} />}

      {!on ? (
        <button className="btn" onClick={fire}>
          Klik untuk kejutan 🎁
        </button>
      ) : (
        showContent && (
          <div className="pop">
            <h1 className="big serif">
              Happy Birthday, My Favorite Person ❤️
            </h1>
            <p className="fade-up" style={{ animationDelay: '.4s' }}>
              Semoga aku masih bisa merayakan banyak ulang tahun bersamamu.
            </p>
          </div>
        )
      )}
    </section>
  )
}