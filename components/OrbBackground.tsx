'use client'

import { useEffect, useRef } from 'react'

interface Orb {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  targetX: number
  targetY: number
}

export function OrbBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const orbsRef = useRef<Orb[]>([])
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize orbs
    const colors = [
      'rgba(99, 102, 241, 0.6)',
      'rgba(34, 211, 238, 0.5)',
      'rgba(16, 185, 129, 0.4)',
      'rgba(139, 92, 246, 0.5)',
    ]

    orbsRef.current = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 250 + Math.random() * 200,
      color: colors[i],
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
    }))

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouseMove)

    let lastTime = 0
    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05)
      lastTime = time

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orbsRef.current.forEach((orb, i) => {
        // Gentle drift toward mouse (subtle)
        const dx = mouseRef.current.x - orb.x
        const dy = mouseRef.current.y - orb.y
        orb.vx += dx * 0.00002
        orb.vy += dy * 0.00002

        // Slow drift
        orb.vx += (Math.random() - 0.5) * 0.01
        orb.vy += (Math.random() - 0.5) * 0.01

        // Damping
        orb.vx *= 0.99
        orb.vy *= 0.99

        // Clamp speed
        const speed = Math.sqrt(orb.vx ** 2 + orb.vy ** 2)
        if (speed > 0.5) {
          orb.vx = (orb.vx / speed) * 0.5
          orb.vy = (orb.vy / speed) * 0.5
        }

        orb.x += orb.vx
        orb.y += orb.vy

        // Bounce off edges (soft)
        if (orb.x < 0) orb.vx += 0.1
        if (orb.x > canvas.width) orb.vx -= 0.1
        if (orb.y < 0) orb.vy += 0.1
        if (orb.y > canvas.height) orb.vy -= 0.1

        // Draw orb with radial gradient
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        )
        gradient.addColorStop(0, orb.color)
        gradient.addColorStop(1, 'transparent')

        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      })

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  )
}
