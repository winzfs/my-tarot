"use client"

import { useState } from "react"
import { PixelGame } from "@/components/game/pixel-game"
import { TarotChat } from "@/components/game/tarot-chat"

export default function TarotPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  console.log("[v0] TarotPage rendered, isDialogOpen:", isDialogOpen)

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-sm md:text-base text-accent glow-text mb-2">
          MYSTIC TAROT
        </h1>
        <p className="text-[8px] md:text-[10px] text-muted-foreground">
          8-BIT FORTUNE TELLER
        </p>
      </div>

      {/* Game Area */}
      <div className="w-full max-w-lg">
        <PixelGame
          onInteract={() => setIsDialogOpen(true)}
          isDialogOpen={isDialogOpen}
        />

        {/* Instructions */}
        <div className="mt-6 text-center space-y-2">
          <div className="hidden md:block">
            <p className="text-[8px] text-muted-foreground">
              [WASD / ARROWS] MOVE
            </p>
            <p className="text-[8px] text-muted-foreground">
              [SPACE] INTERACT
            </p>
          </div>
          <p className="text-[8px] text-accent animate-blink">
            APPROACH THE ORACLE TO BEGIN...
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center">
          <div className="inline-block border border-border rounded-sm p-3 bg-card/50">
            <p className="text-[8px] text-muted-foreground leading-relaxed">
              신비로운 점술사에게 다가가<br />
              당신의 운명을 물어보세요
            </p>
          </div>
        </div>
      </div>

      {/* Tarot Chat Dialog */}
      <TarotChat isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />

      {/* Decorative elements */}
      <div className="fixed top-4 left-4 text-accent opacity-30 text-lg animate-float">
        ✦
      </div>
      <div
        className="fixed top-12 right-8 text-primary opacity-30 text-sm animate-float"
        style={{ animationDelay: "0.5s" }}
      >
        ✧
      </div>
      <div
        className="fixed bottom-16 left-8 text-secondary opacity-30 text-lg animate-float"
        style={{ animationDelay: "1s" }}
      >
        ◇
      </div>
      <div
        className="fixed bottom-8 right-4 text-accent opacity-30 text-sm animate-float"
        style={{ animationDelay: "1.5s" }}
      >
        ○
      </div>
    </main>
  )
}
