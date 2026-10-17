import { useRef, useState, useEffect, useCallback } from 'react'
import Reveal from './Reveal'
import { CONFIG } from '../config'
import { motion } from 'framer-motion'

// ============================================
// === HELPER: stopPropagation global =========
// ============================================
const stopAll = (e) => {
  e.stopPropagation()
}

const TEMPLATES = [
  { id: 'film',    name: 'Film Strip', emoji: '🎞️' },
  { id: 'xmas',    name: 'Vintage',    emoji: '🎄' },
  { id: 'love',    name: 'Love',       emoji: '💝' },
  { id: 'star',    name: 'Star',       emoji: '🌟' },
  { id: 'cherry',  name: 'Cherry',     emoji: '🍒' },
  { id: 'korea',   name: 'Korea',      emoji: '🎀' },
]

const COLLAGES = [
  { id: 'scrap',      name: 'Scrapbook',     emoji: '🎱' },
  { id: 'gingham',    name: 'Gingham',       emoji: '🎀' },
  { id: 'filmred',    name: 'Film Merah',    emoji: '🎞️' },
  { id: 'grid',       name: 'Kertas Kotak',  emoji: '📸' },
  { id: 'cherry',     name: 'Cherry',        emoji: '🍒' },
  { id: 'polaroid',   name: 'Polaroid Grid', emoji: '🖼️' },
  { id: 'heart',      name: 'Love Heart',    emoji: '💖' },
  { id: 'filmstrip',  name: 'Filmstrip',     emoji: '🎬' },
  { id: 'photostrip', name: 'Photo Strip',   emoji: '📷' },
  { id: 'loveletter', name: 'Love Letter',   emoji: '💌' },
]

// ============================================
// === HELPER KOLASE =========================
// ============================================
const loadImage = (src) =>
  new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = () => rej(new Error('Gagal load image: ' + src?.slice(0, 50)))
    i.src = src
  })

// crop foto jadi kotak + terapkan hasil edit (zoom/geser)
async function cropPhoto(photoObj, size = 600) {
  if (!photoObj || !photoObj.dataUrl) {
    throw new Error('photoObj tidak valid: ' + JSON.stringify(photoObj))
  }

  const img = await loadImage(photoObj.dataUrl)
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const edit = photoObj.edit || { scale: 1, offsetX: 0, offsetY: 0, box: 260 }
  const box = edit.box || 260
  const base = Math.max(size / img.naturalWidth, size / img.naturalHeight)
  const s = base * edit.scale
  const w = img.naturalWidth * s
  const h = img.naturalHeight * s
  const k = size / box

  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, size, size)
  ctx.drawImage(
    img,
    (size - w) / 2 + edit.offsetX * k,
    (size - h) / 2 + edit.offsetY * k,
    w, h
  )
  return c
}

const tape = (ctx, x, y, w, rot, color = 'rgba(232,144,156,0.8)') => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.fillStyle = color
  ctx.fillRect(-w / 2, -9, w, 18)
  ctx.restore()
}

// ===== 1. SCRAPBOOK (3 foto miring + gingham + stiker) =====
async function renderScrapStrip(photos, nama = 'Sayang') {
  const W = 420, H = 960
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 3 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#eadfcb'
  ctx.fillRect(0, 0, W, H)

  const gingham = (x, y, w, h, s = 22) => {
    ctx.save()
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
    ctx.fillStyle = '#f4ecdc'
    ctx.fillRect(x, y, w, h)
    ctx.fillStyle = 'rgba(165,30,40,0.55)'
    for (let i = x; i < x + w; i += s * 2) ctx.fillRect(i, y, s, h)
    for (let j = y; j < y + h; j += s * 2) ctx.fillRect(x, j, w, s)
    ctx.restore()
  }
  gingham(0, 0, 135, H)
  gingham(0, 0, W, 95)

  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(112, 95, 14, H - 95)
  for (let y = 100; y < H; y += 15) {
    ctx.beginPath()
    ctx.arc(128, y, 8, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = 'rgba(180,150,130,0.45)'
  for (let y = 100; y < H; y += 30) {
    ctx.beginPath(); ctx.arc(118, y, 2.5, 0, Math.PI * 2); ctx.fill()
  }

  const PW = 276, PH = 207, PAD = 12
  const cx = 245
  const tops = [135, 400, 665]
  const rots = [-0.03, 0.025, -0.02]

  for (let i = 0; i < 3; i++) {
    const fw = PW + PAD * 2
    const fh = PH + PAD * 2 + (i === 2 ? 14 : 0)
    ctx.save()
    ctx.translate(cx, tops[i] + fh / 2)
    ctx.rotate(rots[i])
    ctx.shadowColor = 'rgba(60,30,30,0.35)'
    ctx.shadowBlur = 14
    ctx.shadowOffsetY = 5
    ctx.fillStyle = '#fffdf9'
    ctx.fillRect(-fw / 2, -fh / 2, fw, fh)
    ctx.shadowColor = 'transparent'
    if (imgs[i]) {
      ctx.drawImage(imgs[i], 0, 75, 600, 450, -PW / 2, -fh / 2 + PAD, PW, PH)
    } else {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect(-PW / 2, -fh / 2 + PAD, PW, PH)
      ctx.font = '32px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('📷', 0, -fh / 2 + PAD + PH / 2 + 10)
    }
    ctx.restore()
  }

  // Pita
  ctx.save()
  ctx.translate(62, 150)
  ctx.rotate(-0.25)
  ctx.fillStyle = '#c8312e'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-38, -20); ctx.lineTo(-38, 20); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(38, -20); ctx.lineTo(38, 20); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-4, 6); ctx.lineTo(-22, 46); ctx.lineTo(-8, 42); ctx.lineTo(0, 52); ctx.closePath(); ctx.fill()
  ctx.beginPath(); ctx.moveTo(4, 6); ctx.lineTo(22, 46); ctx.lineTo(8, 42); ctx.lineTo(0, 52); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#a02424'
  ctx.beginPath(); ctx.roundRect(-8, -10, 16, 20, 4); ctx.fill()
  ctx.restore()

  // Bola 7
  const bx = 360, by = 48, br = 36
  const g = ctx.createRadialGradient(bx - 12, by - 12, 4, bx, by, br)
  g.addColorStop(0, '#e25555')
  g.addColorStop(1, '#6e0d14')
  ctx.fillStyle = g
  ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath(); ctx.arc(bx, by, br * 0.45, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#222'
  ctx.font = 'bold 26px Arial'
  ctx.fillText('7', bx, by + 9)

  ctx.font = '38px Arial'
  ctx.fillText('❤️', 372, 392)

  // Kaset
  ctx.save()
  ctx.translate(70, 620)
  ctx.rotate(-0.2)
  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.roundRect(-42, -26, 84, 52, 5); ctx.fill()
  ctx.fillStyle = '#e8e0d0'
  ctx.fillRect(-32, -18, 64, 22)
  ctx.fillStyle = '#c8312e'
  ctx.fillRect(-32, -18, 64, 5)
  ctx.fillStyle = '#2b2b2b'
  ctx.beginPath(); ctx.arc(-14, -2, 6, 0, Math.PI * 2); ctx.arc(14, -2, 6, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#555'
  ctx.fillRect(-22, 10, 44, 10)
  ctx.restore()

  ctx.font = '46px Arial'
  ctx.fillText('🐞', 360, 905)

  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  ctx.fillStyle = '#7a1a22'
  ctx.font = 'bold 22px "Gamja Flower", Georgia, serif'
  ctx.fillText(nama, 245, 932)
  ctx.font = '15px "Gamja Flower", Georgia, serif'
  ctx.fillText(date, 245, 952)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 2-5. KOLASE 4 FOTO =====
async function renderCollage4(photos, id, nama = 'Sayang') {
  const W = 360, PAD = 40, SLOT = 280, GAP = 18, TOP = 70
  const H = TOP + 4 * SLOT + 3 * GAP + 110
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  if (id === 'gingham') {
    ctx.fillStyle = '#fffbf5'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(200,49,46,0.45)'
    for (let x = 0; x < W; x += 24) ctx.fillRect(x, 0, 12, H)
    for (let y = 0; y < H; y += 24) ctx.fillRect(0, y, W, 12)
  }
  if (id === 'filmred') {
    ctx.fillStyle = '#a63a1c'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = '#fdf8f3'
    for (let y = 14; y < H - 20; y += 34) {
      ctx.beginPath(); ctx.roundRect(12, y, 16, 22, 4); ctx.fill()
      ctx.beginPath(); ctx.roundRect(W - 28, y, 16, 22, 4); ctx.fill()
    }
  }
  if (id === 'grid') {
    ctx.fillStyle = '#f3ecdc'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(120,100,80,0.15)'
    ctx.lineWidth = 1
    for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  }
  if (id === 'cherry') {
    ctx.fillStyle = '#7a1020'
    ctx.fillRect(0, 0, W, H)
    ctx.fillStyle = 'rgba(255,255,255,0.06)'
    for (let y = 0; y < H; y += 40) ctx.fillRect(0, y, W, 20)
  }

  for (let i = 0; i < 4; i++) {
    const x = PAD
    const y = TOP + i * (SLOT + GAP)
    if (id !== 'filmred') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(x - 7, y - 7, SLOT + 14, SLOT + 14)
    }
    if (imgs[i]) {
      ctx.drawImage(imgs[i], x, y, SLOT, SLOT)
    } else {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect(x, y, SLOT, SLOT)
      ctx.font = '48px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('📷', W / 2, y + SLOT / 2 + 16)
    }
    if (id === 'filmred') {
      ctx.strokeStyle = '#2a1810'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, SLOT, SLOT)
    }
    if (id === 'grid') tape(ctx, x + SLOT / 2, y - 6, 70, (i % 2 ? 1 : -1) * 0.06)
  }

  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const fy = H - 60
  ctx.font = '40px Arial'

  if (id === 'gingham') {
    ctx.fillText('🎀', 36, 54)
    ctx.fillText('⭐', W - 36, TOP + SLOT + 4)
    ctx.fillText('🧸', 40, TOP + 2 * SLOT + GAP * 2 + 10)
    ctx.fillText('💗', W - 36, TOP + 3 * SLOT + GAP * 3)
    ctx.fillStyle = '#8b1f2a'
    ctx.font = 'bold 26px "Gamja Flower", Georgia, serif'
    ctx.fillText(nama, W / 2, fy)
    ctx.font = '18px "Gamja Flower", Georgia, serif'
    ctx.fillText(date, W / 2, fy + 28)
  }
  if (id === 'filmred') {
    ctx.fillStyle = '#e8b33e'
    ctx.font = 'bold 20px monospace'
    ctx.fillText('▶ KODAK 400', W / 2, 42)
    ctx.fillStyle = '#fdf8f3'
    ctx.font = 'bold 22px "Gamja Flower", Georgia, serif'
    ctx.fillText(nama, W / 2, fy)
    ctx.font = '16px monospace'
    ctx.fillText(date, W / 2, fy + 26)
    ctx.font = '36px Arial'
    ctx.fillText('⭐', W - 52, TOP + SLOT - 6)
  }
  if (id === 'grid') {
    ctx.fillText('📸', W / 2, 52)
    ctx.fillText('✨', W - 36, TOP + 2 * SLOT)
    ctx.fillStyle = '#4a3a35'
    ctx.font = 'bold 26px "Gamja Flower", Georgia, serif'
    ctx.fillText(nama.toUpperCase(), W / 2, fy)
    ctx.font = '18px "Gamja Flower", Georgia, serif'
    ctx.fillText(date, W / 2, fy + 28)
    ctx.fillText('♥ photobox ♥', W / 2, fy + 52)
  }
  if (id === 'cherry') {
    ctx.fillText('🍒', 34, 52)
    ctx.fillText('🍒', W - 34, 52)
    ctx.fillText('🍒', 34, TOP + 2 * SLOT + GAP)
    ctx.fillText('🍒', W - 34, TOP + 3 * SLOT + 2 * GAP)
    ctx.fillStyle = '#f5efe4'
    ctx.font = 'bold 26px "Gamja Flower", Georgia, serif'
    ctx.fillText('🍒 ' + nama + ' 🍒', W / 2, fy)
    ctx.font = '18px "Gamja Flower", Georgia, serif'
    ctx.fillText(date, W / 2, fy + 28)
  }

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 6. POLAROID GRID =====
async function renderPolaroidGrid(photos, nama = 'Sayang') {
  const W = 400, H = 500
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#f5efe4'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = 'rgba(200, 180, 160, 0.15)'
  ctx.lineWidth = 1
  for (let x = 0; x <= W; x += 16) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y <= H; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  const PW = 160, PH = 160
  const positions = [
    { x: 30, y: 50 },
    { x: 210, y: 50 },
    { x: 30, y: 270 },
    { x: 210, y: 270 },
  ]
  const rotations = [-0.06, 0.05, 0.04, -0.05]

  for (let i = 0; i < 4; i++) {
    const p = positions[i]
    ctx.save()
    ctx.translate(p.x + PW / 2, p.y + PH / 2)
    ctx.rotate(rotations[i])
    ctx.shadowColor = 'rgba(60, 30, 30, 0.3)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 5
    ctx.fillStyle = '#fff'
    ctx.fillRect(-PW / 2 - 10, -PH / 2 - 10, PW + 20, PH + 40)
    ctx.shadowColor = 'transparent'
    if (imgs[i]) {
      ctx.drawImage(imgs[i], -PW / 2, -PH / 2, PW, PH)
    } else {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect(-PW / 2, -PH / 2, PW, PH)
      ctx.font = '40px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('📷', 0, 10)
    }
    ctx.fillStyle = 'rgba(232,144,156,0.8)'
    ctx.fillRect(-30, -PH / 2 - 14, 60, 12)
    ctx.fillStyle = '#7a1a22'
    ctx.font = 'italic 13px "Nanum Pen Script", cursive'
    ctx.fillText(nama, 0, PH / 2 + 22)
    ctx.restore()
  }

  ctx.font = '32px Arial'
  ctx.fillText('💗', 20, 30)
  ctx.fillText('⭐', W - 30, 30)
  ctx.fillText('🌸', 20, H - 20)
  ctx.fillText('✨', W - 30, H - 20)

  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  ctx.fillStyle = '#7a1a22'
  ctx.font = 'bold 18px "Gamja Flower", Georgia, serif'
  ctx.fillText('✿ ' + date + ' ✿', W / 2, H - 8)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 7. HEART COLLAGE =====
async function renderHeartCollage(photos, nama = 'Sayang') {
  const W = 400, H = 460
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#fdeef1'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = 'rgba(200, 49, 46, 0.1)'
  for (let x = 10; x < W; x += 20) {
    for (let y = 10; y < H; y += 20) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const PW = 130

  const drawInHeart = (img, cx, cy, size) => {
    if (!img) {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect(cx - size/2, cy - size/2, size, size)
      ctx.font = '40px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('💖', cx, cy + 14)
      return
    }
    ctx.drawImage(img, cx - size/2, cy - size/2, size, size)
  }

  drawInHeart(imgs[0], 130, 160, PW)
  drawInHeart(imgs[1], 270, 160, PW)
  drawInHeart(imgs[2], 130, 310, PW)
  drawInHeart(imgs[3], 270, 310, PW)

  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 6
  const drawBorder = (cx, cy, size) => {
    ctx.strokeRect(cx - size/2, cy - size/2, size, size)
  }
  drawBorder(130, 160, PW)
  drawBorder(270, 160, PW)
  drawBorder(130, 310, PW)
  drawBorder(270, 310, PW)

  ctx.font = '80px Arial'
  ctx.fillText('💖', W/2, 250)

  ctx.font = '32px Arial'
  ctx.fillText('💕', 30, 40)
  ctx.fillText('💕', W - 30, 40)
  ctx.fillText('✨', 30, H - 90)
  ctx.fillText('✨', W - 30, H - 90)

  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  ctx.fillStyle = '#c8312e'
  ctx.font = 'bold 26px "Gamja Flower", Georgia, serif'
  ctx.fillText('♥ ' + nama + ' ♥', W/2, H - 50)
  ctx.font = '16px "Gamja Flower", Georgia, serif'
  ctx.fillText(date, W/2, H - 22)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 8. FILMSTRIP =====
async function renderFilmstrip(photos, nama = 'Sayang') {
  const W = 280, H = 720
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#0a0a0a'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#f5efe4'
  for (let i = 0; i < 30; i++) {
    const y = 20 + i * 24
    ctx.beginPath(); ctx.roundRect(12, y, 18, 16, 3); ctx.fill()
    ctx.beginPath(); ctx.roundRect(W - 30, y, 18, 16, 3); ctx.fill()
  }

  ctx.save()
  ctx.translate(6, H - 20)
  ctx.rotate(-Math.PI / 2)
  ctx.fillStyle = '#e8b33e'
  ctx.font = 'bold 11px monospace'
  ctx.fillText('▶ KODAK 400  ·  ' + nama.toUpperCase() + '  ·  35MM  ·  C-41', 0, 0)
  ctx.restore()

  const PW = 200, PH = 150
  const gap = 12
  const topPad = 20
  for (let i = 0; i < 4; i++) {
    const y = topPad + i * (PH + gap)
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect((W - PW) / 2 - 4, y - 4, PW + 8, PH + 8)
    if (imgs[i]) {
      ctx.drawImage(imgs[i], (W - PW) / 2, y, PW, PH)
    } else {
      ctx.fillStyle = '#2a2a2a'
      ctx.fillRect((W - PW) / 2, y, PW, PH)
      ctx.font = '40px Arial'
      ctx.fillStyle = '#666'
      ctx.fillText('📷', W/2, y + PH/2 + 14)
    }
    ctx.fillStyle = '#e8b33e'
    ctx.font = 'bold 11px monospace'
    ctx.textAlign = 'left'
    ctx.fillText('▶ ' + (i + 1) + 'A', 32, y + 14)
    ctx.textAlign = 'center'
  }

  ctx.fillStyle = '#e8b33e'
  ctx.font = 'bold 13px monospace'
  ctx.fillText('▶ ' + new Date().toLocaleDateString('id-ID').toUpperCase(), W/2, H - 8)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 9. PHOTO STRIP =====
async function renderPhotoStrip(photos, nama = 'Sayang') {
  const W = 320, H = 800
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#fffdf8'
  ctx.fillRect(0, 0, W, H)

  ctx.fillStyle = '#c8312e'
  ctx.fillRect(0, 0, W, 60)
  ctx.fillStyle = '#fffdf8'
  ctx.font = 'bold 24px "Gamja Flower", Georgia, serif'
  ctx.fillText('📷 PHOTOBOOTH 📷', W/2, 40)

  ctx.save()
  ctx.translate(W/2, 70)
  ctx.rotate(-0.05)
  ctx.fillStyle = 'rgba(232,144,156,0.85)'
  ctx.fillRect(-60, -6, 120, 14)
  ctx.restore()

  const PW = 240, PH = 155
  const startY = 100
  for (let i = 0; i < 4; i++) {
    const y = startY + i * (PH + 12)
    ctx.fillStyle = '#c8312e'
    ctx.fillRect((W - PW) / 2 - 4, y - 4, PW + 8, PH + 8)
    if (imgs[i]) {
      ctx.drawImage(imgs[i], (W - PW) / 2, y, PW, PH)
    } else {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect((W - PW) / 2, y, PW, PH)
      ctx.font = '40px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('📷', W/2, y + PH/2 + 14)
    }
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 11px monospace'
    ctx.fillText('#' + String(i + 1).padStart(2, '0'), W - 45, y + 16)
  }

  const date = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
  const footerY = startY + 4 * (PH + 12) + 20
  ctx.fillStyle = '#c8312e'
  ctx.font = 'bold 22px "Gamja Flower", Georgia, serif'
  ctx.fillText(nama, W/2, footerY)
  ctx.font = '14px "Gamja Flower", Georgia, serif'
  ctx.fillStyle = '#8b1f2a'
  ctx.fillText('✿ ' + date + ' ✿', W/2, footerY + 24)
  ctx.font = '20px Arial'
  ctx.fillText('💕 📸 💕', W/2, footerY + 52)

  ctx.strokeStyle = '#c8312e'
  ctx.lineWidth = 3
  ctx.strokeRect(6, 6, W - 12, H - 12)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ===== 10. LOVE LETTER =====
async function renderLoveLetter(photos, nama = 'Sayang') {
  const W = 420, H = 560
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.textAlign = 'center'

  const imgs = await Promise.all(
    Array.from({ length: 4 }, async (_, i) => {
      if (!photos[i]) return null
      try { return await cropPhoto(photos[i]) } catch (e) { return null }
    })
  )

  ctx.fillStyle = '#f5e6d3'
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#fffbf5'
  ctx.fillRect(20, 20, W - 40, H - 40)

  ctx.strokeStyle = '#c8312e'
  ctx.lineWidth = 2
  ctx.setLineDash([8, 4])
  ctx.strokeRect(28, 28, W - 56, H - 56)
  ctx.setLineDash([])

  ctx.fillStyle = '#c8312e'
  ctx.font = 'bold 30px "Gamja Flower", Georgia, serif'
  ctx.fillText('💌 Love Letter 💌', W/2, 70)

  ctx.strokeStyle = 'rgba(200, 49, 46, 0.3)'
  ctx.beginPath()
  ctx.moveTo(80, 84)
  ctx.lineTo(W - 80, 84)
  ctx.stroke()

  const PW = 160, PH = 160
  const positions = [
    { x: 60, y: 110 },
    { x: 220, y: 110 },
    { x: 60, y: 290 },
    { x: 220, y: 290 },
  ]

  for (let i = 0; i < 4; i++) {
    const p = positions[i]
    ctx.fillStyle = '#fff'
    ctx.fillRect(p.x - 6, p.y - 6, PW + 12, PH + 12)
    ctx.strokeStyle = '#c8312e'
    ctx.lineWidth = 2
    ctx.strokeRect(p.x - 6, p.y - 6, PW + 12, PH + 12)
    if (imgs[i]) {
      ctx.drawImage(imgs[i], p.x, p.y, PW, PH)
    } else {
      ctx.fillStyle = '#f3e6e6'
      ctx.fillRect(p.x, p.y, PW, PH)
      ctx.font = '40px Arial'
      ctx.fillStyle = '#a89890'
      ctx.fillText('💌', p.x + PW/2, p.y + PH/2 + 14)
    }
    ctx.save()
    ctx.translate(p.x + PW / 2, p.y - 8)
    ctx.rotate(-0.1)
    ctx.fillStyle = 'rgba(232,144,156,0.85)'
    ctx.fillRect(-30, -6, 60, 12)
    ctx.restore()
  }

  ctx.font = '60px Arial'
  ctx.fillText('💗', W/2, 270)

  ctx.fillStyle = '#7a1a22'
  ctx.font = 'italic 18px "Nanum Pen Script", cursive'
  ctx.fillText('with love,', W/2, H - 100)
  ctx.font = 'bold 26px "Gamja Flower", Georgia, serif'
  ctx.fillText('♥ ' + nama + ' ♥', W/2, H - 68)
  ctx.font = '14px "Gamja Flower", Georgia, serif'
  ctx.fillStyle = '#8b1f2a'
  ctx.fillText(new Date().toLocaleDateString('id-ID'), W/2, H - 44)

  ctx.font = '28px Arial'
  ctx.fillText('🌸', 40, 100)
  ctx.fillText('🌸', W - 40, 100)
  ctx.fillText('✨', 40, H - 100)
  ctx.fillText('✨', W - 40, H - 100)

  return canvas.toDataURL('image/jpeg', 0.92)
}

// ============================================
// === ROUTER KOLASE =========================
// ============================================
async function renderCollage(photos, id, nama = 'Sayang') {
  if (!photos || photos.length === 0) {
    throw new Error('Belum ada foto untuk dijadikan kolase')
  }

  if (id === 'scrap')      return renderScrapStrip(photos, nama)
  if (id === 'polaroid')   return renderPolaroidGrid(photos, nama)
  if (id === 'heart')      return renderHeartCollage(photos, nama)
  if (id === 'filmstrip')  return renderFilmstrip(photos, nama)
  if (id === 'photostrip') return renderPhotoStrip(photos, nama)
  if (id === 'loveletter') return renderLoveLetter(photos, nama)
  return renderCollage4(photos, id, nama)
}

// ============================================
// === KOMPONEN EDITOR FOTO ===================
// ============================================
function PhotoEditor({ photo, onSave, onCancel, index, total }) {
  const containerRef = useRef(null)
  const imgRef = useRef(null)

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  })

  useEffect(() => {
    document.body.classList.add('modal-open')
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.classList.remove('modal-open')
      document.body.style.overflow = prevOverflow
    }
  }, [])

  const clampOffset = useCallback((x, y, currentScale) => {
    const container = containerRef.current
    const img = imgRef.current
    if (!container || !img) return { x, y }

    const containerSize = container.offsetWidth
    const imgW = img.naturalWidth * currentScale
    const imgH = img.naturalHeight * currentScale

    const maxX = Math.max(0, (imgW - containerSize) / 2)
    const maxY = Math.max(0, (imgH - containerSize) / 2)

    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }, [])

  const handlePointerDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    dragRef.current = {
      active: true,
      startX: e.clientX ?? e.touches?.[0]?.clientX ?? 0,
      startY: e.clientY ?? e.touches?.[0]?.clientY ?? 0,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    }
    containerRef.current?.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!dragRef.current.active) return
    e.preventDefault()
    e.stopPropagation()

    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0

    const dx = clientX - dragRef.current.startX
    const dy = clientY - dragRef.current.startY

    const newX = dragRef.current.startOffsetX + dx
    const newY = dragRef.current.startOffsetY + dy

    setOffset(clampOffset(newX, newY, scale))
  }

  const handlePointerUp = (e) => {
    e?.stopPropagation?.()
    dragRef.current.active = false
  }

  const handleZoom = (newScale) => {
    setScale(newScale)
    setOffset((prev) => clampOffset(prev.x, prev.y, newScale))
  }

  const handleReset = () => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleSave = () => {
    onSave({
      scale,
      offsetX: offset.x,
      offsetY: offset.y,
      box: containerRef.current?.offsetWidth || 260,
    })
  }

  return (
    <div
      className="photo-editor-overlay"
      onClick={onCancel}
      onPointerDown={stopAll}
      onPointerMove={stopAll}
      onPointerUp={stopAll}
      onTouchStart={stopAll}
      onTouchMove={stopAll}
      onTouchEnd={stopAll}
    >
      <div
        className="photo-editor"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={stopAll}
        onPointerMove={stopAll}
        onPointerUp={stopAll}
        onTouchStart={stopAll}
        onTouchMove={stopAll}
        onTouchEnd={stopAll}
      >
        <div className="photo-editor-tape" aria-hidden="true" />

        <div className="photo-editor-header">
          <h3>✨ Atur Posisi Foto ✨</h3>
          {total > 1 && (
            <span className="photo-editor-counter">
              Foto {index + 1} / {total}
            </span>
          )}
        </div>

        <div className="photo-editor-crop-wrap">
          <div
            ref={containerRef}
            className="photo-editor-crop"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <img
              ref={imgRef}
              src={photo}
              alt="Edit"
              className="photo-editor-img"
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              }}
            />
            <div className="photo-editor-grid" aria-hidden="true" />
          </div>
        </div>

        <div className="photo-editor-zoom">
          <span className="photo-editor-zoom-icon">🔍</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={scale}
            onChange={(e) => handleZoom(parseFloat(e.target.value))}
            className="photo-editor-slider"
            aria-label="Zoom foto"
          />
          <span className="photo-editor-zoom-value">{scale.toFixed(1)}x</span>
        </div>

        <p className="photo-editor-hint">
          Geser foto buat atur posisi, pakai slider buat zoom 💗
        </p>

        <div className="photo-editor-actions">
          <button
            type="button"
            className="photo-editor-btn photo-editor-btn-ghost"
            onClick={handleReset}
          >
            ↺ Reset
          </button>
          <button
            type="button"
            className="photo-editor-btn photo-editor-btn-save"
            onClick={handleSave}
          >
            ✓ Lanjut
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================
// === KOMPONEN UTAMA PHOTOBOOTH ==============
// ============================================
export default function PhotoBooth() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const photosCountRef = useRef(0)

  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [flash, setFlash] = useState(false)

  const [photos, setPhotos] = useState([])
  const [editingIndex, setEditingIndex] = useState(-1)

  const [selectedTemplate, setSelectedTemplate] = useState('film')
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  const [showCollage, setShowCollage] = useState(false)
  const [collageId, setCollageId] = useState('scrap')
  const [collagePreview, setCollagePreview] = useState(null)
  const [collageError, setCollageError] = useState(null)

  const resultsRef = useRef(null)

  useEffect(() => {
    if (photos.length > 0) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 350)
      return () => clearTimeout(timer)
    }
  }, [photos.length])

  useEffect(() => {
    photosCountRef.current = photos.length
  }, [photos.length])

  // ============================================
  // === KAMERA ================================
  // ============================================
  const startCamera = async () => {
    setCameraError(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (err) {
      console.log('Camera error:', err)
      setCameraError(true)
    }
  }

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraOn(false)
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ============================================
  // === KOLASE: render + lock scroll ==========
  // ============================================
  useEffect(() => {
    if (!showCollage) return
    let cancel = false
    setCollagePreview(null)
    setCollageError(null)

    console.log('🎨 Render kolase:', collageId, '| Foto:', photos.length)

    renderCollage(photos, collageId, CONFIG.nama || 'Sayang')
      .then((url) => {
        if (cancel) return
        console.log('✅ Kolase berhasil dibuat')
        setCollagePreview(url)
      })
      .catch((err) => {
        if (cancel) return
        console.error('❌ Collage error:', err)
        setCollageError(err.message || 'Gagal bikin kolase')
      })

    return () => { cancel = true }
  }, [showCollage, collageId, photos])

  useEffect(() => {
    if (!showCollage) return
    document.body.classList.add('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [showCollage])

  const downloadCollage = () => {
    if (!collagePreview) return
    const link = document.createElement('a')
    link.href = collagePreview
    link.download = `kolase-${collageId}-${Date.now()}.jpg`
    link.click()
  }

  // ============================================
  // === SNAP ==================================
  // ============================================
  const snap = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return null

    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.9)
  }

  const startCapture = () => {
    if (countdown > 0) return
    setCountdown(3)
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          setFlash(true)
          setTimeout(() => setFlash(false), 200)

          const dataUrl = snap()
          if (dataUrl) {
            setPhotos((prev) => {
              const newPhotos = [...prev, { dataUrl, edit: null }]
              setEditingIndex(newPhotos.length - 1)
              return newPhotos
            })
          }
          setTimeout(() => setCountdown(0), 300)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }

  const startStripCapture = async () => {
    if (countdown > 0) return
    const startIdx = photosCountRef.current

    for (let i = 0; i < 4; i++) {
      await new Promise((resolve) => {
        setCountdown(3)
        let count = 3
        const timer = setInterval(() => {
          count--
          if (count <= 0) {
            clearInterval(timer)
            setFlash(true)
            setTimeout(() => setFlash(false), 200)

            const dataUrl = snap()
            if (dataUrl) {
              setPhotos((prev) => [...prev, { dataUrl, edit: null }])
            }
            setTimeout(() => { setCountdown(0); resolve() }, 500)
          } else {
            setCountdown(count)
          }
        }, 1000)
      })
      if (i < 3) await new Promise((r) => setTimeout(r, 800))
    }

    setEditingIndex(startIdx)
  }

  // ============================================
  // === EDITOR CALLBACKS ======================
  // ============================================
  const handleEditorSave = (editData) => {
    const currentIdx = editingIndex
    setPhotos((prev) => {
      const updated = [...prev]
      if (updated[currentIdx]) {
        updated[currentIdx] = { ...updated[currentIdx], edit: editData }
      }
      return updated
    })

    const nextIndex = currentIdx + 1
    const hasNext = photos.some((p, i) => i >= nextIndex && !p.edit)

    if (hasNext && nextIndex < photos.length) {
      setEditingIndex(nextIndex)
    } else {
      setEditingIndex(-1)
    }
  }

  const handleEditorCancel = () => {
    setEditingIndex(-1)
  }

  // ============================================
  // === RENDER TEMPLATE (1 foto) ==============
  // ============================================
  const renderTemplate = (photoObj, templateId) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const CROP_SIZE = 500
        const cropCanvas = document.createElement('canvas')
        cropCanvas.width = CROP_SIZE
        cropCanvas.height = CROP_SIZE
        const cropCtx = cropCanvas.getContext('2d')

        const edit = photoObj.edit || { scale: 1, offsetX: 0, offsetY: 0, box: 260 }
        const box = edit.box || 260

        const baseScale = Math.max(CROP_SIZE / img.naturalWidth, CROP_SIZE / img.naturalHeight)
        const finalScale = baseScale * edit.scale
        const k = CROP_SIZE / box

        const drawW = img.naturalWidth * finalScale
        const drawH = img.naturalHeight * finalScale
        const drawX = (CROP_SIZE - drawW) / 2 + edit.offsetX * k
        const drawY = (CROP_SIZE - drawH) / 2 + edit.offsetY * k

        cropCtx.fillStyle = '#fff'
        cropCtx.fillRect(0, 0, CROP_SIZE, CROP_SIZE)
        cropCtx.drawImage(img, drawX, drawY, drawW, drawH)

        const processedImg = cropCanvas

        if (templateId === 'film') {
          canvas.width = 300
          canvas.height = 400
          ctx.fillStyle = '#2a1810'
          ctx.fillRect(0, 0, 300, 400)
          ctx.fillStyle = '#fff'
          ctx.fillRect(30, 30, 240, 240)
          ctx.drawImage(processedImg, 35, 35, 230, 230)
          ctx.fillStyle = '#f5efe4'
          for (let i = 0; i < 14; i++) {
            ctx.fillRect(8, 20 + i * 28, 14, 18)
            ctx.fillRect(278, 20 + i * 28, 14, 18)
          }
          ctx.fillStyle = '#e8b33e'
          ctx.font = 'bold 14px monospace'
          ctx.fillText('▶ KODAK 400', 30, 300)
          ctx.fillText('▶ ' + (CONFIG.nama?.toUpperCase() || 'SAYANG'), 30, 320)
          ctx.fillStyle = '#f5efe4'
          ctx.font = 'italic 16px Georgia, serif'
          ctx.textAlign = 'center'
          ctx.fillText('— ' + new Date().toLocaleDateString('id-ID') + ' —', 150, 360)
          ctx.textAlign = 'left'
          ctx.strokeStyle = '#c8312e'
          ctx.lineWidth = 2
          ctx.strokeRect(30, 30, 240, 240)
        }

        if (templateId === 'xmas') {
          canvas.width = 320
          canvas.height = 480
          const colors = ['#c8312e', '#fdf8f3', '#8b1f2a', '#f5efe4']
          for (let i = 0; i < 20; i++) {
            for (let j = 0; j < 30; j++) {
              ctx.fillStyle = (i + j) % 2 === 0 ? colors[0] : colors[1]
              ctx.fillRect(i * 16, j * 16, 16, 16)
            }
          }
          ctx.fillStyle = 'rgba(139, 31, 42, 0.3)'
          for (let j = 0; j < 30; j += 4) ctx.fillRect(0, j * 16, 320, 4)
          for (let i = 0; i < 20; i += 4) ctx.fillRect(i * 16, 0, 4, 480)
          ctx.fillStyle = '#f5efe4'
          ctx.fillRect(50, 60, 220, 320)
          ctx.fillStyle = '#2a1810'
          ctx.fillRect(55, 65, 210, 310)
          ctx.drawImage(processedImg, 65, 75, 190, 190)
          ctx.fillStyle = '#e8b33e'
          ctx.fillRect(65, 275, 190, 3)
          ctx.fillStyle = '#f5efe4'
          ctx.font = 'bold 24px Georgia, serif'
          ctx.textAlign = 'center'
          ctx.fillText('COUPLE', 160, 310)
          ctx.font = 'italic 16px Georgia, serif'
          ctx.fillText(CONFIG.nama || 'Sayang', 160, 335)
          ctx.fillText(new Date().toLocaleDateString('id-ID'), 160, 355)
          ctx.textAlign = 'left'
          ctx.fillStyle = '#2a1810'
          for (let i = 0; i < 10; i++) {
            ctx.fillRect(50, 70 + i * 32, 6, 20)
            ctx.fillRect(264, 70 + i * 32, 6, 20)
          }
          ctx.font = '48px Arial'
          ctx.textAlign = 'center'
          ctx.fillText('🎅', 160, 45)
          ctx.font = '36px Arial'
          ctx.fillText('⭐', 280, 45)
          ctx.fillText('🌟', 40, 130)
          ctx.beginPath()
          ctx.arc(45, 410, 18, 0, Math.PI * 2)
          ctx.fillStyle = '#8b1f2a'
          ctx.fill()
          ctx.fillStyle = '#e8b33e'
          ctx.font = 'bold 14px Arial'
          ctx.fillText('♥', 45, 416)
          ctx.beginPath()
          ctx.arc(275, 410, 22, 0, Math.PI * 2)
          ctx.fillStyle = '#c8312e'
          ctx.fill()
          ctx.strokeStyle = '#f5efe4'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.fillStyle = '#f5efe4'
          ctx.font = 'bold 11px Arial'
          ctx.fillText('LOVE', 275, 407)
          ctx.font = 'bold 10px Arial'
          ctx.fillText('US ❤', 275, 420)
          ctx.textAlign = 'left'
        }

        if (templateId === 'love') {
          canvas.width = 320
          canvas.height = 440
          ctx.fillStyle = '#fdeef1'
          ctx.fillRect(0, 0, 320, 440)
          ctx.fillStyle = '#e8909c'
          ctx.fillRect(0, 0, 20, 440)
          ctx.fillRect(300, 0, 20, 440)
          ctx.font = '20px Arial'
          ctx.textAlign = 'center'
          for (let i = 0; i < 22; i++) {
            ctx.fillText('💗', 10, 20 + i * 20)
            ctx.fillText('💗', 310, 20 + i * 20)
          }
          ctx.fillStyle = '#fff'
          ctx.fillRect(45, 45, 230, 230)
          ctx.drawImage(processedImg, 50, 50, 220, 220)
          ctx.fillStyle = '#c8312e'
          ctx.fillRect(120, 20, 80, 20)
          ctx.fillStyle = '#c8312e'
          ctx.font = 'bold 26px Georgia, serif'
          ctx.fillText('LOVE', 160, 310)
          ctx.font = 'italic 18px Georgia, serif'
          ctx.fillText(CONFIG.nama || 'Sayang', 160, 340)
          ctx.font = 'italic 14px Georgia, serif'
          ctx.fillText(new Date().toLocaleDateString('id-ID'), 160, 365)
          ctx.font = '40px Arial'
          ctx.fillText('💝', 160, 405)
        }

        if (templateId === 'star') {
          canvas.width = 320
          canvas.height = 460
          ctx.fillStyle = '#f5efe4'
          ctx.fillRect(0, 0, 320, 460)
          ctx.fillStyle = '#2a1810'
          ctx.fillRect(35, 40, 250, 250)
          ctx.drawImage(processedImg, 40, 45, 240, 240)
          ctx.fillStyle = '#f5efe4'
          for (let i = 0; i < 12; i++) {
            ctx.fillRect(38, 45 + i * 22, 5, 14)
            ctx.fillRect(277, 45 + i * 22, 5, 14)
          }
          ctx.fillStyle = '#2a1810'
          ctx.font = 'bold 28px Georgia, serif'
          ctx.textAlign = 'center'
          ctx.fillText('OUR MOMENT', 160, 330)
          ctx.font = 'italic 18px Georgia, serif'
          ctx.fillText(CONFIG.nama || 'Sayang', 160, 360)
          ctx.fillText(new Date().toLocaleDateString('id-ID'), 160, 385)
          ctx.font = '40px Arial'
          ctx.fillText('⭐', 50, 30)
          ctx.fillText('⭐', 270, 30)
          ctx.fillText('⭐', 50, 445)
          ctx.fillText('⭐', 270, 445)
          ctx.beginPath()
          ctx.arc(45, 420, 20, 0, Math.PI * 2)
          ctx.fillStyle = '#a8c8a0'
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 14px Arial'
          ctx.fillText('★', 45, 426)
          ctx.beginPath()
          ctx.arc(275, 420, 22, 0, Math.PI * 2)
          ctx.fillStyle = '#c8312e'
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 11px Arial'
          ctx.fillText('US', 275, 417)
          ctx.fillText('❤', 275, 430)
          ctx.textAlign = 'left'
        }

        if (templateId === 'cherry') {
          canvas.width = 320
          canvas.height = 460
          const size = 24
          for (let i = 0; i < 14; i++) {
            for (let j = 0; j < 20; j++) {
              ctx.fillStyle = (i + j) % 2 === 0 ? '#fdf8f3' : '#f5c8c8'
              ctx.fillRect(i * size, j * size, size, size)
            }
          }
          ctx.fillStyle = 'rgba(200, 49, 46, 0.35)'
          for (let j = 0; j < 20; j += 2) ctx.fillRect(0, j * size, 320, 3)
          for (let i = 0; i < 14; i += 2) ctx.fillRect(i * size, 0, 3, 460)
          ctx.fillStyle = '#fff'
          ctx.fillRect(60, 60, 200, 200)
          ctx.drawImage(processedImg, 65, 65, 190, 190)
          ctx.strokeStyle = '#8b6f47'
          ctx.lineWidth = 3
          ctx.strokeRect(60, 60, 200, 200)
          ctx.fillStyle = '#8b1f2a'
          ctx.textAlign = 'center'
          ctx.font = 'bold 22px Georgia, serif'
          ctx.fillText('🍒 SWEET 🍒', 160, 295)
          ctx.font = 'italic 20px Georgia, serif'
          ctx.fillText(CONFIG.nama || 'Sayang', 160, 325)
          ctx.font = 'italic 14px Georgia, serif'
          ctx.fillText(new Date().toLocaleDateString('id-ID'), 160, 350)
          ctx.beginPath()
          ctx.arc(50, 400, 22, 0, Math.PI * 2)
          ctx.fillStyle = '#a8c8a0'
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 16px Arial'
          ctx.fillText('✿', 50, 406)
          ctx.font = '50px Arial'
          ctx.fillText('⭐', 45, 445)
          ctx.beginPath()
          ctx.arc(272, 400, 24, 0, Math.PI * 2)
          ctx.fillStyle = '#c8312e'
          ctx.fill()
          ctx.strokeStyle = '#f5efe4'
          ctx.lineWidth = 3
          ctx.stroke()
          ctx.fillStyle = '#f5efe4'
          ctx.font = 'bold 12px Arial'
          ctx.fillText('COUPLE', 272, 398)
          ctx.font = 'bold 10px Arial'
          ctx.fillText('❤ FOREVER', 272, 414)
          ctx.textAlign = 'left'
        }

        if (templateId === 'korea') {
          canvas.width = 320
          canvas.height = 440
          ctx.fillStyle = '#fdf8f3'
          ctx.fillRect(0, 0, 320, 440)
          ctx.strokeStyle = 'rgba(232, 144, 156, 0.3)'
          ctx.lineWidth = 1
          for (let i = 0; i < 320; i += 16) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 440); ctx.stroke()
          }
          for (let j = 0; j < 440; j += 16) {
            ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(320, j); ctx.stroke()
          }
          for (let i = 0; i < 20; i++) {
            ctx.fillStyle = i % 2 === 0 ? '#c8312e' : '#fdf8f3'
            ctx.fillRect(i * 16, 0, 16, 14)
            ctx.fillRect(i * 16, 426, 16, 14)
          }
          ctx.fillStyle = '#fff'
          ctx.fillRect(45, 60, 230, 230)
          ctx.drawImage(processedImg, 50, 65, 220, 220)
          ctx.fillStyle = 'rgba(232, 144, 156, 0.85)'
          ctx.fillRect(130, 52, 60, 16)
          ctx.fillStyle = '#c8312e'
          ctx.textAlign = 'center'
          ctx.font = 'bold 24px Georgia, serif'
          ctx.fillText('✿ ' + (CONFIG.nama || 'Sayang') + ' ✿', 160, 330)
          ctx.font = 'italic 16px Georgia, serif'
          ctx.fillText(new Date().toLocaleDateString('id-ID'), 160, 355)
          ctx.font = '32px Arial'
          ctx.fillText('🎀', 50, 40)
          ctx.fillText('✨', 270, 40)
          ctx.fillText('💕', 50, 420)
          ctx.fillText('⭐', 270, 420)
          ctx.textAlign = 'left'
        }

        resolve(canvas.toDataURL('image/jpeg', 0.9))
      }
      img.onerror = () => resolve(null)
      img.src = photoObj.dataUrl
    })
  }

  // ============================================
  // === DOWNLOAD ==============================
  // ============================================
  const downloadPhoto = async (photoObj, index) => {
    const templated = await renderTemplate(photoObj, selectedTemplate)
    if (!templated) return
    const link = document.createElement('a')
    link.href = templated
    link.download = `photobox-${selectedTemplate}-${index + 1}.jpg`
    link.click()
  }

  const downloadAll = async () => {
    for (let i = 0; i < photos.length; i++) {
      await downloadPhoto(photos[i], i)
      await new Promise((r) => setTimeout(r, 300))
    }
  }

  const retake = () => {
    setPhotos([])
    setEditingIndex(-1)
    setShowCollage(false)
    setCollagePreview(null)
    setCollageError(null)
  }

  // ============================================
  // === RENDER ================================
  // ============================================
  return (
    <section className="photobooth-section">
      <div className="photobooth-grid" aria-hidden="true" />
      <div className="photobooth-tartan-top" aria-hidden="true" />
      <div className="photobooth-tartan-bottom" aria-hidden="true" />

      <div className="photobooth-sticker photobooth-sticker-1" aria-hidden="true">📸</div>
      <div className="photobooth-sticker photobooth-sticker-2" aria-hidden="true">✨</div>
      <div className="photobooth-sticker photobooth-sticker-3" aria-hidden="true">💕</div>
      <div className="photobooth-sticker photobooth-sticker-4" aria-hidden="true">🎀</div>

      <div className="photobooth-content">
        <Reveal>
          <div className="photobooth-title-wrap">
            <div className="photobooth-title-tape" aria-hidden="true" />
            <h2 className="photobooth-title">Mini Photobox 📸</h2>
            <p className="photobooth-tagline">abadiin momen kita di sini 💗</p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="photobooth-camera-wrap">
            <div className="photobooth-camera">
              {!cameraOn && !cameraError && (
                <div className="photobooth-placeholder">
                  <div className="photobooth-placeholder-icon">📷</div>
                  <p>Kameranya belum nyala</p>
                </div>
              )}

              {cameraError && (
                <div className="photobooth-placeholder photobooth-error">
                  <div className="photobooth-placeholder-icon">😢</div>
                  <p>Kamera gak bisa diakses</p>
                  <p className="photobooth-error-hint">Cek izin kamera di browser ya</p>
                </div>
              )}

              <video ref={videoRef} className={`photobooth-video ${cameraOn ? 'active' : ''}`} playsInline muted />

              {countdown > 0 && (<div className="photobooth-countdown"><span>{countdown}</span></div>)}
              {flash && <div className="photobooth-flash" />}
              <div className="photobooth-camera-tape" aria-hidden="true" />
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="photobooth-actions">
            {!cameraOn && (
              <button className="photobooth-btn" onClick={startCamera}>🎥 Nyalain Kamera</button>
            )}

            {cameraOn && photos.length === 0 && (
              <>
                <button className="photobooth-btn photobooth-btn-snap" onClick={startCapture} disabled={countdown > 0}>
                  {countdown > 0 ? `📸 ${countdown}...` : '🔴 Ambil Foto'}
                </button>
                <button className="photobooth-btn photobooth-btn-strip" onClick={startStripCapture} disabled={countdown > 0}>
                  🎞️ Mode Strip (4 foto)
                </button>
              </>
            )}

            {cameraOn && photos.length > 0 && (
              <>
                <button className="photobooth-btn photobooth-btn-template" onClick={() => setShowTemplatePicker(true)}>
                  🎨 Pilih Template
                </button>
                <button className="photobooth-btn photobooth-btn-strip" onClick={() => setShowCollage(true)}>
                  🖼️ Bikin Kolase
                </button>
                <button className="photobooth-btn" onClick={downloadAll}>💾 Download Semua</button>
                <button className="photobooth-btn photobooth-btn-ghost" onClick={retake}>🔄 Ulangi</button>
              </>
            )}

            {cameraOn && (
              <button className="photobooth-btn photobooth-btn-ghost" onClick={stopCamera}>❌ Matiin Kamera</button>
            )}
          </div>
        </Reveal>

        {photos.length > 0 && (
          <Reveal delay={0.4}>
            <div className="photobooth-results" ref={resultsRef}>
              <p className="photobooth-results-title">✨ Hasil Photobox Kita ✨</p>
              <p className="photobooth-active-template">
                Template: <strong>{TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong> {TEMPLATES.find(t => t.id === selectedTemplate)?.emoji}
              </p>

              <div className="photobooth-strip">
                {photos.map((p, i) => (
                  <motion.div
                    key={i}
                    className={`photobooth-polaroid template-${selectedTemplate}`}
                    initial={{ 
                      y: -300, 
                      rotate: -20 + Math.random() * 40, 
                      opacity: 0,
                      scale: 0.6,
                    }}
                    animate={{ 
                      y: 0, 
                      rotate: ((i % 3) - 1) * 2, 
                      opacity: 1,
                      scale: 1,
                    }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 180,
                      damping: 14,
                      delay: i * 0.12,
                    }}
                    whileHover={{ 
                      scale: 1.08, 
                      rotate: 0,
                      zIndex: 10,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="photobooth-polaroid-tape" aria-hidden="true" />
                    <img src={p.dataUrl} alt={`Foto ${i + 1}`} />
                    <p className="photobooth-polaroid-caption">
                      {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <button
                      className="photobooth-edit-btn"
                      onClick={() => setEditingIndex(i)}
                      aria-label="Edit foto"
                      title="Edit posisi"
                    >
                      ✏️
                    </button>
                    <button className="photobooth-download-btn" onClick={() => downloadPhoto(p, i)} aria-label="Download foto">⬇</button>
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {showTemplatePicker && (
          <div
            className="template-picker-overlay"
            onClick={() => setShowTemplatePicker(false)}
            onPointerDown={stopAll}
            onPointerMove={stopAll}
            onPointerUp={stopAll}
            onTouchStart={stopAll}
            onTouchMove={stopAll}
            onTouchEnd={stopAll}
          >
            <div
              className="template-picker"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={stopAll}
              onPointerMove={stopAll}
              onPointerUp={stopAll}
              onTouchStart={stopAll}
              onTouchMove={stopAll}
              onTouchEnd={stopAll}
            >
              <div className="template-picker-header">
                <h3>Pilih Template 🎨</h3>
                <button className="template-picker-close" onClick={() => setShowTemplatePicker(false)}>✕</button>
              </div>

              <div className="template-picker-grid">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    className={`template-option ${selectedTemplate === t.id ? 'active' : ''}`}
                    onClick={() => { setSelectedTemplate(t.id); setShowTemplatePicker(false) }}
                  >
                    <div className={`template-preview template-preview-${t.id}`}>
                      <span className="template-preview-emoji">{t.emoji}</span>
                    </div>
                    <span className="template-option-name">{t.name}</span>
                    {selectedTemplate === t.id && <span className="template-option-check">✓</span>}
                  </button>
                ))}
              </div>

              <p className="template-picker-hint">Template akan dipakai pas kamu download foto 💗</p>
            </div>
          </div>
        )}

        {showCollage && (
          <div
            className="template-picker-overlay"
            onClick={() => setShowCollage(false)}
            onPointerDown={stopAll}
            onPointerMove={stopAll}
            onPointerUp={stopAll}
            onTouchStart={stopAll}
            onTouchMove={stopAll}
            onTouchEnd={stopAll}
          >
            <div
              className="template-picker collage-modal"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={stopAll}
              onPointerMove={stopAll}
              onPointerUp={stopAll}
              onTouchStart={stopAll}
              onTouchMove={stopAll}
              onTouchEnd={stopAll}
            >
              <div className="template-picker-header">
                <h3>Kolase Photobox 🖼️</h3>
                <button className="template-picker-close" onClick={() => setShowCollage(false)}>✕</button>
              </div>

              <div className="collage-chips">
                {COLLAGES.map((c) => (
                  <button
                    key={c.id}
                    className={`collage-chip ${collageId === c.id ? 'active' : ''}`}
                    onClick={() => setCollageId(c.id)}
                  >
                    {c.emoji} {c.name}
                  </button>
                ))}
              </div>

              <div className="collage-preview-wrap">
                {collagePreview ? (
                  <img src={collagePreview} alt="Preview kolase" className="collage-preview" />
                ) : collageError ? (
                  <div className="collage-error">
                    <p style={{ fontSize: '2.5rem', margin: '0 0 8px' }}>😢</p>
                    <p className="template-picker-hint" style={{ color: '#c8312e' }}>
                      {collageError}
                    </p>
                  </div>
                ) : (
                  <div className="collage-loading">
                    <p className="template-picker-hint">Lagi nyusun kolase… ✨</p>
                    <p className="template-picker-hint" style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                      {photos.length > 0
                        ? `(${photos.length} foto siap)`
                        : '(Belum ada foto)'}
                    </p>
                  </div>
                )}
              </div>

              <div className="photo-editor-actions">
                <button className="photo-editor-btn photo-editor-btn-ghost" onClick={() => setShowCollage(false)}>
                  Tutup
                </button>
                <button
                  className="photo-editor-btn photo-editor-btn-save"
                  onClick={downloadCollage}
                  disabled={!collagePreview}
                >
                  💾 Download
                </button>
              </div>
            </div>
          </div>
        )}

        {editingIndex >= 0 && photos[editingIndex] && (
          <PhotoEditor
            photo={photos[editingIndex].dataUrl}
            index={editingIndex}
            total={photos.length}
            onSave={handleEditorSave}
            onCancel={handleEditorCancel}
          />
        )}
      </div>
    </section>
  )
}