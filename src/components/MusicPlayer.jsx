import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  // Coba autoplay pas mount (biasanya browser blok, tapi worth to try)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = 0.35
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false))
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play()
      setPlaying(true)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={CONFIG.musicUrl} loop preload="auto" />
      <button className="music" onClick={toggle} aria-label="Toggle music">
        {playing ? '🔊' : '🔇'} {playing ? 'Pause' : 'Play'}
      </button>
    </>
  )
}