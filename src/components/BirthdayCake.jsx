import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'

export default function BirthdayCake() {
  const [blown, setBlown] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [micError, setMicError] = useState(false)
  const [micLevel, setMicLevel] = useState(0)
  const [calibrating, setCalibrating] = useState(false)
  const audioCtxRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const blowStartRef = useRef(null)
  const dynamicThresholdRef = useRef(130)

  // === TUNING (fallback kalau kalibrasi gagal) ===
  const BLOW_THRESHOLD = 130
  const HOLD_DURATION = 1200
  const MIN_START_LEVEL = 110

  const candleCount = CONFIG.candleCount || 3

  // === HANDLE BLOW — cuma bisa dipanggil dari check() ===
  const handleBlow = () => {
    if (blown) return
    setBlown(true)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close()
    }

    const colors = ['#e8909c', '#c8312e', '#fdf8f3', '#f8c8d4', '#e8b33e']
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors })
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    }, 300)
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    }, 600)
  }

  // === START MIC ===
  const startMic = async () => {
    setMicError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream
      setMicGranted(true)

      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      // === CHECK LOOP ===
      const check = () => {
        // STOP kalau udah ditiup
        if (blown) return

        // Cek mic masih aktif
        if (!streamRef.current) return
        const tracks = streamRef.current.getAudioTracks()
        if (tracks.length === 0 || tracks[0].readyState !== 'live') {
          console.log('Mic track gak live, stop')
          return
        }

        analyser.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < 20; i++) sum += dataArray[i]
        const avg = sum / 20
        setMicLevel(avg)

        // === LOGIKA TIUP ===
        // Butuh avg > BLOW_THRESHOLD buat mulai hitungan
        // Reset cuma kalau avg < MIN_START_LEVEL
        if (avg > BLOW_THRESHOLD) {
          if (!blowStartRef.current) {
            blowStartRef.current = Date.now()
            console.log('🟡 Mulai hitung tiupan...')
          } else {
            const duration = Date.now() - blowStartRef.current
            if (duration >= HOLD_DURATION) {
              console.log('🟢 Tiupan terdeteksi! Matiin lilin...')
              handleBlow()
              return
            }
          }
        } else if (avg < MIN_START_LEVEL) {
          if (blowStartRef.current) {
            console.log('🔴 Tiupan berhenti, reset')
          }
          blowStartRef.current = null
        }

        rafRef.current = requestAnimationFrame(check)
      }

      check()
    } catch (err) {
      console.log('Mic error:', err)
      setMicError(true)
    }
  }

  // === CLEANUP (di LUAR startMic!) ===
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <section className="cake-scrap">
      {/* === GRID PAPER === */}
      <div className="cake-grid" aria-hidden="true" />

      {/* === STIKER === */}
      <div className="cake-sticker cake-sticker-1" aria-hidden="true">🎂</div>
      <div className="cake-sticker cake-sticker-2" aria-hidden="true">✨</div>
      <div className="cake-sticker cake-sticker-3" aria-hidden="true">💕</div>
      <div className="cake-sticker cake-sticker-4" aria-hidden="true">🎀</div>
      <div className="cake-sticker cake-sticker-5" aria-hidden="true">⭐</div>

      {/* === JUDUL === */}
      <h2 className="cake-title-scrap">
        {blown
          ? `Happy Birthday, ${CONFIG.nama}! 🎉`
          : CONFIG.cakeMessage}
      </h2>

      {/* === KUE === */}
      <div className="cake-stage-scrap">
        <div className="cake-tape" aria-hidden="true" />
        <div className="cake-svg-wrap">
          <svg className="cake-svg-scrap" viewBox="0 0 400 320" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <ellipse cx="200" cy="290" rx="180" ry="18" fill="#f8c8d4" opacity="0.5" />
            <ellipse cx="200" cy="285" rx="180" ry="18" fill="#fdf8f3" />
            <ellipse cx="200" cy="283" rx="160" ry="14" fill="#fffbf5" />

            <rect x="60" y="220" width="280" height="65" rx="8" fill="#f8c8d4" />
            <rect x="60" y="220" width="280" height="65" rx="8" fill="url(#cakeGradient1)" />
            <path
              d="M 60 235 Q 75 250, 90 235 Q 105 250, 120 235 Q 135 250, 150 235 Q 165 250, 180 235 Q 195 250, 210 235 Q 225 250, 240 235 Q 255 250, 270 235 Q 285 250, 300 235 Q 315 250, 330 235 L 340 220 L 60 220 Z"
              fill="#fffbf5"
            />

            <rect x="90" y="165" width="220" height="60" rx="8" fill="#f8c8d4" />
            <rect x="90" y="165" width="220" height="60" rx="8" fill="url(#cakeGradient2)" />
            <path
              d="M 90 180 Q 105 195, 120 180 Q 135 195, 150 180 Q 165 195, 180 180 Q 195 195, 210 180 Q 225 195, 240 180 Q 255 195, 270 180 Q 285 195, 300 180 L 310 165 L 90 165 Z"
              fill="#fffbf5"
            />

            <ellipse cx="200" cy="165" rx="110" ry="12" fill="#fffbf5" />

            <circle cx="150" cy="158" r="8" fill="#c8312e" />
            <circle cx="170" cy="155" r="7" fill="#e8b33e" />
            <circle cx="200" cy="153" r="8" fill="#c8312e" />
            <circle cx="230" cy="155" r="7" fill="#e8b33e" />
            <circle cx="250" cy="158" r="8" fill="#c8312e" />
            <circle cx="148" cy="156" r="2.5" fill="rgba(255,255,255,0.7)" />
            <circle cx="198" cy="151" r="2.5" fill="rgba(255,255,255,0.7)" />
            <circle cx="248" cy="156" r="2.5" fill="rgba(255,255,255,0.7)" />

            {Array.from({ length: candleCount }).map((_, i) => {
              const startX = 200 - ((candleCount - 1) * 40) / 2
              const x = startX + i * 40
              return (
                <g key={i} className="candle-group" style={{ transformOrigin: `${x}px 135px` }}>
                  <rect x={x - 6} y="95" width="12" height="45" rx="3" fill="#fdf8f3" />
                  <rect x={x - 6} y="100" width="12" height="4" fill="#e8909c" />
                  <rect x={x - 6} y="110" width="12" height="4" fill="#e8909c" />
                  <rect x={x - 6} y="120" width="12" height="4" fill="#e8909c" />
                  <rect x={x - 6} y="130" width="12" height="4" fill="#e8909c" />
                  <rect x={x - 1} y="88" width="2" height="8" fill="#4a3a35" />

                  {!blown ? (
                    <g className="flame-group">
                      <ellipse cx={x} cy="78" rx="9" ry="16" fill="url(#flameOuter)" />
                      <ellipse cx={x} cy="80" rx="5" ry="10" fill="url(#flameInner)" />
                      <ellipse cx={x} cy="80" rx="20" ry="28" fill="rgba(232, 179, 62, 0.25)" />
                    </g>
                  ) : (
                    <g className="smoke-group">
                      <ellipse cx={x} cy="80" rx="4" ry="10" fill="rgba(154, 128, 112, 0.3)" />
                    </g>
                  )}
                </g>
              )
            })}

            <defs>
              <linearGradient id="cakeGradient1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(200, 49, 46, 0.15)" />
              </linearGradient>
              <linearGradient id="cakeGradient2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <stop offset="100%" stopColor="rgba(200, 49, 46, 0.15)" />
              </linearGradient>
              <radialGradient id="flameOuter">
                <stop offset="0%" stopColor="#fffbf5" />
                <stop offset="40%" stopColor="#ffe4a0" />
                <stop offset="75%" stopColor="#e8b33e" />
                <stop offset="100%" stopColor="rgba(232, 179, 62, 0)" />
              </radialGradient>
              <radialGradient id="flameInner">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#ffe4a0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* === MIC INDICATOR (pas mic aktif) === */}
      {micGranted && !blown && (
        <div className="mic-indicator-scrap">
          <p className="mic-hint-scrap">💨 Tiup kenceng ke mic-nya...</p>
          <div className="mic-bar-scrap">
            <div
              className="mic-bar-fill-scrap"
              style={{ width: `${Math.min(micLevel * 1.5, 100)}%` }}
            />
            {/* Garis threshold — indikator kapan dianggap tiup */}
            <div
              className="mic-bar-threshold"
              style={{ left: `${BLOW_THRESHOLD}%` }}
            />
          </div>
          <p className="mic-tip-scrap">Tahan tiupannya sampe lilin mati 🔥</p>
        </div>
      )}

      {/* === TOMBOL MIC (sebelum mic aktif) === */}
      {!blown && !micGranted && (
        <div className="cake-actions-scrap">
          <button className="cake-btn-scrap" onClick={startMic}>
            🎤 Nyalain Mic Dulu
          </button>

          {micError && (
            <p className="cake-error-scrap">
              ⚠️ Mic gak bisa diakses. Cek izin browser kamu ya.
            </p>
          )}
        </div>
      )}

      {/* === PESAN SETELAH TIUP === */}
      {blown && (
        <p className="cake-after-scrap">
          Semoga semua harapan kamu terkabul ✨
        </p>
      )}
    </section>
  )
}