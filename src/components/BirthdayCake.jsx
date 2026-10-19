import { useState, useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'

export default function BirthdayCake() {
  const [blown, setBlown] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [micError, setMicError] = useState('')
  const [calibrating, setCalibrating] = useState(false)

  const audioCtxRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const blownRef = useRef(false)
  const barFillRef = useRef(null) // bar diisi lewat ref, TANPA re-render tiap frame

  // === TUNING ===
  const HOLD_DURATION = 450   // tiupan harus bertahan segini lama (ms)
  const CALIBRATION_MS = 700  // mic "belajar" suara sekitar dulu
  const MIN_THRESHOLD = 50    // batas minimum
  const MAX_THRESHOLD = 140   // batas maksimum
  const MARGIN = 30           // seberapa di atas suara sekitar dianggap tiupan

  const candleCount = CONFIG.candleCount || 3

  // === MATIKAN MIC ===
  const stopMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
  }

  // === LILIN PADAM ===
  const handleBlow = () => {
    if (blownRef.current) return
    blownRef.current = true
    setBlown(true)
    stopMic()

    const colors = ['#e8909c', '#c8312e', '#fdf8f3', '#f8c8d4', '#e8b33e']
    confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors })
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    }, 300)
    setTimeout(() => {
      confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    }, 600)
  }

  // === START MIC (harus dipanggil dari tap) ===
  const startMic = async () => {
    setMicError('')

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setMicError('⚠️ Mic cuma bisa lewat HTTPS. Pakai tombol tiup manual ya.')
      return
    }

    // PENTING di iPhone: AudioContext dibuat & di-resume LANGSUNG di dalam tap,
    // sebelum await apa pun. Kalau tidak, dia "tidur" dan levelnya selalu 0.
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    const ctx = new AudioCtx()
    audioCtxRef.current = ctx
    ctx.resume().catch(() => {})

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream
      await ctx.resume()

      setMicGranted(true)
      setCalibrating(true)

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.4
      source.connect(analyser)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const readLevel = () => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < 20; i++) sum += data[i] // frekuensi rendah (tiupan)
        return sum / 20
      }

      let threshold = 80
      let calibrated = false
      let calSum = 0
      let calCount = 0
      let blowStart = 0
      let lastResume = 0
      const startedAt = performance.now()

      const check = (now) => {
        if (blownRef.current || !streamRef.current) return

        const track = streamRef.current.getAudioTracks()[0]
        if (!track || track.readyState !== 'live') return

        // Kalau iOS menidurkan audio lagi, bangunkan
        if (ctx.state !== 'running' && now - lastResume > 500) {
          lastResume = now
          ctx.resume().catch(() => {})
        }

        const avg = readLevel()

        if (!calibrated) {
          // Kalibrasi: ukur suara sekitar, threshold = suara sekitar + margin
          calSum += avg
          calCount++
          if (now - startedAt >= CALIBRATION_MS) {
            const baseline = calSum / Math.max(calCount, 1)
            threshold = Math.min(MAX_THRESHOLD, Math.max(MIN_THRESHOLD, baseline + MARGIN))
            calibrated = true
            setCalibrating(false)
          }
        } else if (avg > threshold) {
          if (!blowStart) {
            blowStart = now
          } else if (now - blowStart >= HOLD_DURATION) {
            handleBlow()
            return
          }
        } else if (avg < threshold - 15) {
          blowStart = 0
        }

        // Update bar langsung ke DOM (tanpa setState → tidak bikin patah-patah)
        if (barFillRef.current) {
          barFillRef.current.style.width = `${Math.min(100, (avg / (threshold * 1.4)) * 100)}%`
        }

        rafRef.current = requestAnimationFrame(check)
      }

      rafRef.current = requestAnimationFrame(check)
    } catch (err) {
      console.log('Mic error:', err)
      if (ctx.state !== 'closed') ctx.close().catch(() => {})
      setMicError(
        err && err.name === 'NotAllowedError'
          ? '⚠️ Izin mic ditolak. Aktifkan izin mic di browser, atau pakai tiup manual.'
          : '⚠️ Mic gak bisa diakses. Pakai tombol tiup manual ya.'
      )
    }
  }

  // === CLEANUP ===
  useEffect(() => {
    return () => stopMic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                <g key={i} className="candle-group">
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
          <p className="mic-hint-scrap">
            {calibrating ? '🎧 Diam sebentar, lagi nyesuaiin mic...' : '💨 Tiup kenceng ke mic-nya...'}
          </p>
          <div className="mic-bar-scrap">
            <div
              ref={barFillRef}
              className="mic-bar-fill-scrap"
              style={{ width: '0%' }}
            />
            {/* Garis threshold: bar penuh = 1.4x threshold, jadi garis selalu di ~71% */}
            <div className="mic-bar-threshold" style={{ left: '71.4%' }} />
          </div>
          <p className="mic-tip-scrap">Tahan tiupannya sampe lilin mati 🔥</p>
        </div>
      )}

      {/* === TOMBOL === */}
      {!blown && (
        <div className="cake-actions-scrap">
          {!micGranted && (
            <button className="cake-btn-scrap" onClick={startMic}>
              🎤 Nyalain Mic Dulu
            </button>
          )}

          {/* Cadangan kalau mic gak bisa dipakai */}
          <button className="cake-btn-scrap" onClick={handleBlow}>
            💨 Tiup Manual
          </button>

          {micError && <p className="cake-error-scrap">{micError}</p>}
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