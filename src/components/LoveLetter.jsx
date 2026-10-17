import { useState } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function LoveLetter() {
  const [open, setOpen] = useState(false)
  const letter = CONFIG.letter || []

  return (
    <section>
      <Reveal>
        <h2 className="serif">Sepucuk Surat Buat Kamu</h2>
      </Reveal>

      <div
        className={`env ${open ? 'open' : ''}`}
        onClick={() => setOpen(true)}
        role="button"
        aria-label="Buka surat"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
      >
        <div className="flap" />
        <div className="seal" style={{ fontSize: '2rem' }}>
          ❤️
        </div>
      </div>

      {!open && <p className="hint">Klik amplopnya ya 💌</p>}

      {open && (
        <div className="letter">
          {letter.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p style={{ textAlign: 'right', fontStyle: 'italic' }}>
            — Yang selalu sayang kamu 💗
          </p>
        </div>
      )}
    </section>
  )
}