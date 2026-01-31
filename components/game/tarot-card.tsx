"use client"

interface TarotCardProps {
  card: {
    name: string
    nameKo: string
    number: number
  }
  reversed: boolean
  flipped: boolean
  onClick: () => void
  label: string
}

export function TarotCard({
  card,
  reversed,
  flipped,
  onClick,
  label,
}: TarotCardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-accent">{label}</span>
      <div
        onClick={onClick}
        className={`relative w-20 h-32 cursor-pointer transition-transform duration-500 transform-gpu ${
          flipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
        }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 bg-primary border-2 border-accent rounded-sm flex items-center justify-center backface-hidden animate-pulse-glow"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <div className="text-center">
            <div className="text-2xl text-accent">✦</div>
            <div className="text-[8px] text-accent mt-2">TAROT</div>
          </div>
        </div>

        {/* Card Front */}
        <div
          className={`absolute inset-0 bg-card border-2 border-primary rounded-sm flex flex-col items-center justify-center p-2 ${
            reversed ? "rotate-180" : ""
          }`}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <span className="text-xs text-muted-foreground">{card.number}</span>
          <div className="w-12 h-12 my-2 bg-muted rounded-sm flex items-center justify-center">
            <span className="text-2xl">{getCardSymbol(card.number)}</span>
          </div>
          <span className="text-[8px] text-foreground text-center leading-tight">
            {card.nameKo}
          </span>
          {reversed && (
            <span className="text-[6px] text-destructive mt-1">(역방향)</span>
          )}
        </div>
      </div>
    </div>
  )
}

function getCardSymbol(number: number): string {
  const symbols: Record<number, string> = {
    0: "🃏",
    1: "🪄",
    2: "🌙",
    3: "👑",
    4: "🏰",
    5: "📿",
    6: "💕",
    7: "🏎️",
    8: "🦁",
    9: "🏮",
    10: "🎡",
    11: "⚖️",
    12: "🙃",
    13: "💀",
    14: "🏺",
    15: "😈",
    16: "🗼",
    17: "⭐",
    18: "🌜",
    19: "☀️",
    20: "📯",
    21: "🌍",
  }
  return symbols[number] || "✦"
}
