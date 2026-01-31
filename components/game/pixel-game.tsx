"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Position {
  x: number
  y: number
}

interface PixelGameProps {
  onInteract: () => void
  isDialogOpen: boolean
}

const TILE_SIZE = 16
const PLAYER_SIZE = 16
const FORTUNE_TELLER_SIZE = 32
const INTERACTION_DISTANCE = 40

export function PixelGame({ onInteract, isDialogOpen }: PixelGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerPos, setPlayerPos] = useState<Position>({ x: 80, y: 180 })
  
  console.log("[v0] PixelGame rendered, canvasRef:", canvasRef.current)
  const [showInteractHint, setShowInteractHint] = useState(false)
  const keysRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<number>(0)
  const frameCountRef = useRef(0)

  const fortuneTellerPos: Position = { x: 280, y: 80 }

  const checkInteraction = useCallback(
    (pos: Position) => {
      const distance = Math.sqrt(
        Math.pow(pos.x - fortuneTellerPos.x, 2) +
          Math.pow(pos.y - fortuneTellerPos.y, 2)
      )
      return distance < INTERACTION_DISTANCE
    },
    [fortuneTellerPos.x, fortuneTellerPos.y]
  )

  const drawGame = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      frameCountRef.current++

      // Clear canvas
      ctx.fillStyle = "#0a0a0f"
      ctx.fillRect(0, 0, width, height)

      // Draw floor tiles with pixel pattern
      for (let y = 0; y < height; y += TILE_SIZE) {
        for (let x = 0; x < width; x += TILE_SIZE) {
          const isEven = ((x + y) / TILE_SIZE) % 2 === 0
          ctx.fillStyle = isEven ? "#1a1a2e" : "#16162a"
          ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE)
        }
      }

      // Draw mystical symbols on floor
      ctx.fillStyle = "#2d1f4e"
      ctx.globalAlpha = 0.3
      const symbols = ["✦", "✧", "◇", "○"]
      ctx.font = "12px Arial"
      for (let i = 0; i < 8; i++) {
        const sx = 50 + (i % 4) * 100
        const sy = 100 + Math.floor(i / 4) * 120
        ctx.fillText(symbols[i % symbols.length], sx, sy)
      }
      ctx.globalAlpha = 1

      // Draw fortune teller booth/table
      ctx.fillStyle = "#4a1a6b"
      ctx.fillRect(fortuneTellerPos.x - 20, fortuneTellerPos.y + 30, 72, 20)
      
      // Crystal ball on table
      const glowIntensity = Math.sin(frameCountRef.current * 0.05) * 0.3 + 0.7
      ctx.fillStyle = `rgba(147, 51, 234, ${glowIntensity * 0.5})`
      ctx.beginPath()
      ctx.arc(fortuneTellerPos.x + 16, fortuneTellerPos.y + 25, 15, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = `rgba(200, 150, 255, ${glowIntensity})`
      ctx.beginPath()
      ctx.arc(fortuneTellerPos.x + 16, fortuneTellerPos.y + 25, 10, 0, Math.PI * 2)
      ctx.fill()

      // Draw fortune teller (pixel art style)
      // Cloak
      ctx.fillStyle = "#6b21a8"
      ctx.fillRect(
        fortuneTellerPos.x,
        fortuneTellerPos.y + 8,
        FORTUNE_TELLER_SIZE,
        FORTUNE_TELLER_SIZE - 8
      )

      // Hood
      ctx.fillStyle = "#581c87"
      ctx.beginPath()
      ctx.moveTo(fortuneTellerPos.x + 16, fortuneTellerPos.y - 4)
      ctx.lineTo(fortuneTellerPos.x - 2, fortuneTellerPos.y + 14)
      ctx.lineTo(fortuneTellerPos.x + 34, fortuneTellerPos.y + 14)
      ctx.closePath()
      ctx.fill()

      // Face (mysterious shadow)
      ctx.fillStyle = "#0a0a0f"
      ctx.fillRect(
        fortuneTellerPos.x + 8,
        fortuneTellerPos.y + 4,
        16,
        12
      )

      // Glowing eyes
      const eyeGlow = Math.sin(frameCountRef.current * 0.1) * 0.3 + 0.7
      ctx.fillStyle = `rgba(250, 204, 21, ${eyeGlow})`
      ctx.fillRect(fortuneTellerPos.x + 10, fortuneTellerPos.y + 8, 4, 4)
      ctx.fillRect(fortuneTellerPos.x + 18, fortuneTellerPos.y + 8, 4, 4)

      // Draw player (pixel art adventurer)
      // Body
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(playerPos.x + 2, playerPos.y + 6, 12, 10)

      // Head
      ctx.fillStyle = "#fcd34d"
      ctx.fillRect(playerPos.x + 4, playerPos.y, 8, 6)

      // Eyes
      ctx.fillStyle = "#0a0a0f"
      ctx.fillRect(playerPos.x + 5, playerPos.y + 2, 2, 2)
      ctx.fillRect(playerPos.x + 9, playerPos.y + 2, 2, 2)

      // Walking animation for legs
      const walkFrame = Math.floor(frameCountRef.current / 10) % 2
      if (keysRef.current.size > 0 && !isDialogOpen) {
        ctx.fillStyle = "#1e3a8a"
        if (walkFrame === 0) {
          ctx.fillRect(playerPos.x + 3, playerPos.y + 14, 4, 4)
          ctx.fillRect(playerPos.x + 9, playerPos.y + 14, 4, 4)
        } else {
          ctx.fillRect(playerPos.x + 2, playerPos.y + 14, 4, 4)
          ctx.fillRect(playerPos.x + 10, playerPos.y + 14, 4, 4)
        }
      } else {
        ctx.fillStyle = "#1e3a8a"
        ctx.fillRect(playerPos.x + 4, playerPos.y + 14, 4, 4)
        ctx.fillRect(playerPos.x + 8, playerPos.y + 14, 4, 4)
      }

      // Draw interaction hint
      if (showInteractHint && !isDialogOpen) {
        const hintY = fortuneTellerPos.y - 30 + Math.sin(frameCountRef.current * 0.1) * 3
        ctx.fillStyle = "#facc15"
        ctx.font = "10px 'Press Start 2P', monospace"
        ctx.textAlign = "center"
        ctx.fillText("SPACE", fortuneTellerPos.x + 16, hintY)
        ctx.fillText("to talk", fortuneTellerPos.x + 16, hintY + 14)
        ctx.textAlign = "left"
      }

      // Draw border frame
      ctx.strokeStyle = "#6b21a8"
      ctx.lineWidth = 4
      ctx.strokeRect(2, 2, width - 4, height - 4)
    },
    [playerPos, showInteractHint, isDialogOpen, fortuneTellerPos.x, fortuneTellerPos.y]
  )

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Handle movement
    if (!isDialogOpen) {
      let newX = playerPos.x
      let newY = playerPos.y
      const speed = 3

      if (keysRef.current.has("ArrowUp") || keysRef.current.has("KeyW")) {
        newY = Math.max(0, playerPos.y - speed)
      }
      if (keysRef.current.has("ArrowDown") || keysRef.current.has("KeyS")) {
        newY = Math.min(canvas.height - PLAYER_SIZE - 4, playerPos.y + speed)
      }
      if (keysRef.current.has("ArrowLeft") || keysRef.current.has("KeyA")) {
        newX = Math.max(0, playerPos.x - speed)
      }
      if (keysRef.current.has("ArrowRight") || keysRef.current.has("KeyD")) {
        newX = Math.min(canvas.width - PLAYER_SIZE - 4, playerPos.x + speed)
      }

      if (newX !== playerPos.x || newY !== playerPos.y) {
        setPlayerPos({ x: newX, y: newY })
      }

      // Check for interaction
      const canInteract = checkInteraction({ x: newX, y: newY })
      setShowInteractHint(canInteract)
    }

    drawGame(ctx, canvas.width, canvas.height)
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [playerPos, isDialogOpen, checkInteraction, drawGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.code)

      if (e.code === "Space" && showInteractHint && !isDialogOpen) {
        e.preventDefault()
        onInteract()
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [gameLoop, showInteractHint, isDialogOpen, onInteract])

  // Mobile controls
  const handleMobileMove = (direction: string, isPressed: boolean) => {
    if (isPressed) {
      keysRef.current.add(direction)
    } else {
      keysRef.current.delete(direction)
    }
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={400}
        height={280}
        className="w-full max-w-[400px] mx-auto block border-4 border-primary rounded-sm scanlines"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Mobile controls */}
      <div className="mt-4 flex flex-col items-center gap-2 md:hidden">
        <button
          className="pixel-btn w-14 h-14 text-foreground text-xl"
          onTouchStart={() => handleMobileMove("ArrowUp", true)}
          onTouchEnd={() => handleMobileMove("ArrowUp", false)}
          onMouseDown={() => handleMobileMove("ArrowUp", true)}
          onMouseUp={() => handleMobileMove("ArrowUp", false)}
          onMouseLeave={() => handleMobileMove("ArrowUp", false)}
        >
          ▲
        </button>
        <div className="flex gap-2">
          <button
            className="pixel-btn w-14 h-14 text-foreground text-xl"
            onTouchStart={() => handleMobileMove("ArrowLeft", true)}
            onTouchEnd={() => handleMobileMove("ArrowLeft", false)}
            onMouseDown={() => handleMobileMove("ArrowLeft", true)}
            onMouseUp={() => handleMobileMove("ArrowLeft", false)}
            onMouseLeave={() => handleMobileMove("ArrowLeft", false)}
          >
            ◄
          </button>
          <button
            className="pixel-btn w-14 h-14 text-foreground text-xl"
            onTouchStart={() => handleMobileMove("ArrowDown", true)}
            onTouchEnd={() => handleMobileMove("ArrowDown", false)}
            onMouseDown={() => handleMobileMove("ArrowDown", true)}
            onMouseUp={() => handleMobileMove("ArrowDown", false)}
            onMouseLeave={() => handleMobileMove("ArrowDown", false)}
          >
            ▼
          </button>
          <button
            className="pixel-btn w-14 h-14 text-foreground text-xl"
            onTouchStart={() => handleMobileMove("ArrowRight", true)}
            onTouchEnd={() => handleMobileMove("ArrowRight", false)}
            onMouseDown={() => handleMobileMove("ArrowRight", true)}
            onMouseUp={() => handleMobileMove("ArrowRight", false)}
            onMouseLeave={() => handleMobileMove("ArrowRight", false)}
          >
            ►
          </button>
        </div>
        {showInteractHint && !isDialogOpen && (
          <button
            className="pixel-btn px-6 py-3 text-accent text-xs mt-2"
            onClick={onInteract}
          >
            TALK
          </button>
        )}
      </div>
    </div>
  )
}
