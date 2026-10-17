import { useState } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'

export default function QuizGame() {
  const [step, setStep] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState(null)
  const [done, setDone] = useState(false)

  const quiz = CONFIG.quiz || []
  const current = quiz[step]

  if (!current && !done) {
    return (
      <section>
        <Reveal>
          <h2 className="serif">Quiz belum diisi 😅</h2>
        </Reveal>
      </section>
    )
  }

  const pick = (idx) => {
    if (picked !== null) return
    setPicked(idx)
    if (idx === current.answer) setScore((s) => s + 1)

    setTimeout(() => {
      if (step + 1 < quiz.length) {
        setStep(step + 1)
        setPicked(null)
      } else {
        setDone(true)
      }
    }, 900)
  }

  const reset = () => {
    setStep(0)
    setScore(0)
    setPicked(null)
    setDone(false)
  }

  const getMessage = () => {
    const pct = score / quiz.length
    if (pct === 1) return 'Perfect! Kamu beneran kenal aku luar dalam 💗'
    if (pct >= 0.6) return 'Wah, kamu hafal ya sama kita 🥰'
    if (pct >= 0.3) return 'Lumayan! Tapi masih perlu belajar lagi 😏'
    return 'Yah... kita perlu quality time lebih sering nih 😅'
  }

  return (
    <section>
      <Reveal>
        <h2 className="serif">Seberapa Kenal Kamu Sama Aku?</h2>
        <p className="it" style={{ marginBottom: '30px' }}>
          Yuk main dulu, jawab {quiz.length} pertanyaan ini 💕
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        {!done ? (
          <div className="quiz">
            <div className="quiz-progress">
              {step + 1} / {quiz.length}
            </div>
            <h3 className="quiz-q">{current.q}</h3>
            <div className="quiz-options">
              {current.options.map((opt, idx) => {
                let cls = 'quiz-opt'
                if (picked !== null) {
                  if (idx === current.answer) cls += ' correct'
                  else if (idx === picked) cls += ' wrong'
                }
                return (
                  <button
                    key={idx}
                    className={cls}
                    onClick={() => pick(idx)}
                    disabled={picked !== null}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="quiz-result pop">
            <div className="quiz-score">
              {score} / {quiz.length}
            </div>
            <p className="serif it" style={{ fontSize: '1.2rem' }}>
              {getMessage()}
            </p>
            <button className="btn small" onClick={reset}>
              Main lagi 🔄
            </button>
          </div>
        )}
      </Reveal>
    </section>
  )
}