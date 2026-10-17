import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CONFIG } from './config'
import ScrapbookIntro from './components/ScrapbookIntro'
import LoadingScreen from './components/LoadingScreen'
import LockScreen from './components/LockScreen'
import Opening from './components/Opening'
import MusicPlayer from './components/MusicPlayer'
import BirthdayCake from './components/BirthdayCake'
import Hero from './components/Hero'
import Countdown from './components/Countdown'
import OurStory from './components/OurStory'
import Reasons from './components/Reasons'
import Memories from './components/Memories'
import PhotoBooth from './components/PhotoBooth'
import VideoMessage from './components/VideoMessage'
import Rewards from './components/Rewards'
import LoveLetter from './components/LoveLetter'
import QuizGame from './components/QuizGame'
import Surprise from './components/Surprise'
import Footer from './components/Footer'
import SearchOverlay from './components/SearchOverlay'
import NotificationsPopup from './components/NotificationsPopup'
import ProfileModal from './components/ProfileModal'

const SECTIONS = [
  { id: 'cake',       component: BirthdayCake, scrollable: true  },
  { id: 'hero',       component: Hero,         scrollable: false },
  { id: 'countdown',  component: Countdown,    scrollable: false },
  { id: 'ourstory',   component: OurStory,     scrollable: true  },
  { id: 'reasons',    component: Reasons,      scrollable: true  },
  { id: 'memories',   component: Memories,     scrollable: true  },
  { id: 'video',      component: VideoMessage, scrollable: true  },
  { id: 'rewards',    component: Rewards,      scrollable: true  },
  { id: 'letter',     component: LoveLetter,   scrollable: true  },
  { id: 'quiz',       component: QuizGame,     scrollable: true  },
  { id: 'surprise',   component: Surprise,     scrollable: false },
  { id: 'footer',     component: Footer,       scrollable: false },
]

const TARTAN_SLIDES = [
  'hero', 'countdown', 'cake', 'ourstory',
  'reasons', 'rewards', 'letter', 'surprise'
]

const isModalOpen = () => {
  return typeof document !== 'undefined' &&
    document.body.classList.contains('modal-open')
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [unlocked, setUnlocked] = useState(false)
  const [opened, setOpened] = useState(false)
  const [current, setCurrent] = useState(0)
  const [showPhotoBooth, setShowPhotoBooth] = useState(false)

  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  // Cek apakah device adalah Mobile / Tablet
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const next = () => setCurrent((i) => Math.min(i + 1, SECTIONS.length - 1))
  const prev = () => setCurrent((i) => Math.max(i - 1, 0))

  const goTo = (id) => {
    const index = SECTIONS.findIndex((s) => s.id === id)
    if (index !== -1) setCurrent(index)
  }

  // === PRELOAD FOTO ===
  useEffect(() => {
    const images = [
      CONFIG.fotoHero,
      CONFIG.fotoFinal,
      ...(CONFIG.photos || []).map((p) => p.src),
    ].filter(Boolean)

    images.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

  // === LOCK BODY SCROLL ===
  useEffect(() => {
    if (!opened) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [opened])

  // === LOCK BODY PAS MODAL KEBUKA ===
  useEffect(() => {
    const anyModal = showPhotoBooth || showSearch || showNotifications || showProfile
    if (anyModal) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [showPhotoBooth, showSearch, showNotifications, showProfile])

  // === KEYBOARD NAV ===
  useEffect(() => {
    if (!opened) return
    const onKey = (e) => {
      if (isModalOpen()) return
      if (showPhotoBooth) return
      if (showSearch) return
      if (showNotifications) return
      if (showProfile) return

      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (['ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [opened, current, showPhotoBooth, showSearch, showNotifications, showProfile])

  // === SWIPE GESTURE ===
  useEffect(() => {
    if (!opened) return
    let startX = 0
    let startY = 0
    let startedInScrollable = false

    const onStart = (e) => {
      if (isModalOpen()) return
      if (showPhotoBooth) return
      if (showSearch) return
      if (showNotifications) return
      if (showProfile) return

      startX = e.touches[0].clientX
      startY = e.touches[0].clientY

      const target = e.target
      const scrollable = target.closest(
        '.netflix-row-scroll, .netflix-row, .gallery-masonry, .netflix-row-scroll *, [data-no-swipe]'
      )
      startedInScrollable = !!scrollable
    }

    const onEnd = (e) => {
      if (isModalOpen()) return
      if (showPhotoBooth) return
      if (showSearch) return
      if (showNotifications) return
      if (showProfile) return
      if (startedInScrollable) return

      const dx = e.changedTouches[0].clientX - startX
      const dy = e.changedTouches[0].clientY - startY

      if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return

      if (dx < 0) next()
      else prev()
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchend', onEnd)
    }
  }, [opened, current, showPhotoBooth, showSearch, showNotifications, showProfile])

  // === RENDER FLOW ===
  if (!unlocked) {
    return (
      <>
        <LockScreen onUnlock={() => setUnlocked(true)} />
        {loading && <ScrapbookIntro onDone={() => setLoading(false)} />}
      </>
    )
  }
  if (!opened) return <Opening onOpen={() => setOpened(true)} />

  const section = SECTIONS[current]
  const SectionComponent = section.component
  const isLast = current === SECTIONS.length - 1

  return (
    <main className="slide-mode">
      <MusicPlayer />

      {/* === TARTAN GLOBAL === */}
      {TARTAN_SLIDES.includes(section.id) && (
        <>
          <div className="ourstory-tartan-top-global" aria-hidden="true" />
          <div className="ourstory-tartan-bottom-global" aria-hidden="true" />
        </>
      )}

      {/* === SLIDE TRANSITION (FLIP BOOK DI DESKTOP, SLIDE DI MOBILE) === */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className={`slide ${section.scrollable ? 'scrollable' : ''}`}
          
          // Deteksi perangkat: Mobile pakai 2D slide, Desktop pakai 3D rotate
          initial={isMobile ? { opacity: 0, x: 50, scale: 0.98 } : { rotateY: 90, opacity: 0, transformOrigin: 'left center' }}
          animate={isMobile ? { opacity: 1, x: 0, scale: 1 } : { rotateY: 0, opacity: 1, transformOrigin: 'left center' }}
          exit={isMobile ? { opacity: 0, x: -50, scale: 0.98 } : { rotateY: -90, opacity: 0, transformOrigin: 'right center' }}
          
          transition={{ duration: isMobile ? 0.35 : 0.6, ease: [0.32, 0.72, 0, 1] }}
          
          style={{ 
            transformStyle: isMobile ? 'flat' : 'preserve-3d', 
            transformOrigin: 'left center' 
          }}
        >
          <SectionComponent onNext={next} />
        </motion.div>
      </AnimatePresence>

      {/* Progress dots */}
      <div className="progress-dots">
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={`dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Ke slide ${i + 1}: ${s.id}`}
          />
        ))}
      </div>

      {/* Navigasi bawah */}
      <div className="slide-nav">
        {current > 0 && (
          <button className="btn ghost small" onClick={prev}>
            ← Balik
          </button>
        )}
        {!isLast && (
          <button className="btn small" onClick={next}>
            Lanjut →
          </button>
        )}
      </div>

      {/* === BOTTOM NAV IG === */}
      {section.id === 'memories' && (
        <nav className="ig-bottom-nav">
          <button
            type="button"
            className="ig-nav-btn"
            aria-label="Home"
            onClick={() => goTo('hero')}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-6h-6v6H5a2 2 0 01-2-2v-9z"
                fill="currentColor"
              />
            </svg>
          </button>

          <button
            type="button"
            className="ig-nav-btn"
            aria-label="Search"
            onClick={() => setShowSearch(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            className="ig-nav-btn ig-nav-btn-create"
            aria-label="Create"
            onClick={() => setShowPhotoBooth(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="7" x2="12" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <button
            type="button"
            className="ig-nav-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifications(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path
                d="M12 21s-7-4.5-9-9.5C1.5 8 4 4.5 7.5 4.5c2 0 3.5 1 4.5 2.5 1-1.5 2.5-2.5 4.5-2.5C20 4.5 22.5 8 21 11.5c-2 5-9 9.5-9 9.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span className="ig-nav-dot" />
          </button>

          <button
            type="button"
            className="ig-nav-btn"
            aria-label="Profile"
            onClick={() => setShowProfile(true)}
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M4 21c0-4 4-7 8-7s8 3 8 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </nav>
      )}

      {/* === PHOTOBOOTH MODAL === */}
      {showPhotoBooth && (
        <div
          className="photobooth-modal-overlay"
          onClick={() => setShowPhotoBooth(false)}
        >
          <div
            className="photobooth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="photobooth-modal-close"
              onClick={() => setShowPhotoBooth(false)}
              aria-label="Tutup"
            >
              ✕
            </button>

            <PhotoBooth />
          </div>
        </div>
      )}

      {/* === SEARCH OVERLAY === */}
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          onSelectPhoto={() => {
            const slide = document.querySelector('.slide')
            if (slide) slide.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      {/* === NOTIFICATIONS POPUP === */}
      {showNotifications && (
        <NotificationsPopup
          onClose={() => setShowNotifications(false)}
          onNavigate={(id) => goTo(id)}
          onOpenPhotoBooth={() => setShowPhotoBooth(true)}
        />
      )}

      {/* === PROFILE MODAL === */}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          photosCount={(CONFIG.photos || []).length}
        />
      )}
    </main>
  )
}