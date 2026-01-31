"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { TarotCard } from "./tarot-card"

interface TarotChatProps {
  isOpen: boolean
  onClose: () => void
}

type ChatPhase = "greeting" | "question" | "drawing" | "reading" | "followup"

const TAROT_CARDS = [
  { name: "The Fool", nameKo: "광대", number: 0 },
  { name: "The Magician", nameKo: "마법사", number: 1 },
  { name: "The High Priestess", nameKo: "고위 여사제", number: 2 },
  { name: "The Empress", nameKo: "여황제", number: 3 },
  { name: "The Emperor", nameKo: "황제", number: 4 },
  { name: "The Hierophant", nameKo: "교황", number: 5 },
  { name: "The Lovers", nameKo: "연인", number: 6 },
  { name: "The Chariot", nameKo: "전차", number: 7 },
  { name: "Strength", nameKo: "힘", number: 8 },
  { name: "The Hermit", nameKo: "은둔자", number: 9 },
  { name: "Wheel of Fortune", nameKo: "운명의 수레바퀴", number: 10 },
  { name: "Justice", nameKo: "정의", number: 11 },
  { name: "The Hanged Man", nameKo: "매달린 사람", number: 12 },
  { name: "Death", nameKo: "죽음", number: 13 },
  { name: "Temperance", nameKo: "절제", number: 14 },
  { name: "The Devil", nameKo: "악마", number: 15 },
  { name: "The Tower", nameKo: "탑", number: 16 },
  { name: "The Star", nameKo: "별", number: 17 },
  { name: "The Moon", nameKo: "달", number: 18 },
  { name: "The Sun", nameKo: "태양", number: 19 },
  { name: "Judgement", nameKo: "심판", number: 20 },
  { name: "The World", nameKo: "세계", number: 21 },
]

export function TarotChat({ isOpen, onClose }: TarotChatProps) {
  const [phase, setPhase] = useState<ChatPhase>("greeting")
  const [userQuestion, setUserQuestion] = useState("")
  const [drawnCards, setDrawnCards] = useState<
    { card: (typeof TAROT_CARDS)[number]; reversed: boolean; flipped: boolean }[]
  >([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [displayedText, setDisplayedText] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/tarot" }),
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, displayedText])

  // Typewriter effect for AI responses
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "assistant") {
        const text =
          lastMessage.parts
            ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
            .map((p) => p.text)
            .join("") || ""

        if (status === "streaming") {
          setDisplayedText(text)
          setIsTyping(true)
        } else {
          setDisplayedText(text)
          setIsTyping(false)
        }
      }
    }
  }, [messages, status])

  const drawCards = () => {
    const shuffled = [...TAROT_CARDS].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 3).map((card) => ({
      card,
      reversed: Math.random() > 0.5,
      flipped: false,
    }))
    setDrawnCards(selected)
    setPhase("drawing")
  }

  const flipCard = (index: number) => {
    setDrawnCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, flipped: true } : c))
    )

    // Check if all cards are flipped
    const allFlipped = drawnCards.every((c, i) =>
      i === index ? true : c.flipped
    )
    if (allFlipped) {
      setTimeout(() => {
        startReading()
      }, 1000)
    }
  }

  const startReading = () => {
    setPhase("reading")
    const cardsDescription = drawnCards
      .map(
        (c, i) =>
          `${["과거", "현재", "미래"][i]}: ${c.card.nameKo} (${c.card.name}) - ${c.reversed ? "역방향" : "정방향"}`
      )
      .join("\n")

    sendMessage({
      text: `사용자의 질문: "${userQuestion}"\n\n뽑은 카드:\n${cardsDescription}\n\n이 카드들을 바탕으로 타로 해석을 해주세요. 신비롭고 영적인 어조로, 하지만 따뜻하고 희망적인 조언을 담아 해석해주세요.`,
    })
  }

  const handleSubmitQuestion = () => {
    if (!inputValue.trim()) return

    if (phase === "greeting") {
      setUserQuestion(inputValue)
      setInputValue("")
      drawCards()
    } else if (phase === "reading" || phase === "followup") {
      setPhase("followup")
      sendMessage({ text: inputValue })
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmitQuestion()
    }
  }

  const handleReset = () => {
    setPhase("greeting")
    setUserQuestion("")
    setDrawnCards([])
    setInputValue("")
    setDisplayedText("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-card border-4 border-primary rounded-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-border bg-muted">
          <h2 className="text-xs text-accent glow-text">MYSTIC ORACLE</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            [X]
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Initial greeting */}
          {phase === "greeting" && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-sm border-2 border-primary">
                <p className="text-xs leading-relaxed text-foreground">
                  어서오게, 젊은 영혼이여...
                </p>
                <p className="text-xs leading-relaxed text-foreground mt-2">
                  나는 이 세계의 비밀을 읽는 자.
                </p>
                <p className="text-xs leading-relaxed text-foreground mt-2">
                  그대의 마음 속 가장 깊은 질문을 말해보게.
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground mt-4">
                  (운세, 연애, 직업, 인간관계 등 무엇이든 물어보세요)
                </p>
              </div>
            </div>
          )}

          {/* Card drawing phase */}
          {phase === "drawing" && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-sm border-2 border-primary">
                <p className="text-xs leading-relaxed text-foreground">
                  {"\""}
                  {userQuestion}
                  {"\""}
                </p>
                <p className="text-xs leading-relaxed text-accent mt-2">
                  흥미로운 질문이군... 카드를 클릭하여 운명을 확인하게.
                </p>
              </div>

              <div className="flex justify-center gap-4 py-4">
                {drawnCards.map((cardData, index) => (
                  <TarotCard
                    key={index}
                    card={cardData.card}
                    reversed={cardData.reversed}
                    flipped={cardData.flipped}
                    onClick={() => !cardData.flipped && flipCard(index)}
                    label={["과거", "현재", "미래"][index]}
                  />
                ))}
              </div>

              {!drawnCards.every((c) => c.flipped) && (
                <p className="text-center text-xs text-muted-foreground animate-blink">
                  카드를 클릭하세요...
                </p>
              )}
            </div>
          )}

          {/* Reading phase */}
          {(phase === "reading" || phase === "followup") && (
            <div className="space-y-4">
              {/* Show drawn cards */}
              <div className="flex justify-center gap-2 py-2">
                {drawnCards.map((cardData, index) => (
                  <div key={index} className="text-center">
                    <div className="text-[8px] text-muted-foreground mb-1">
                      {["과거", "현재", "미래"][index]}
                    </div>
                    <div
                      className={`w-12 h-16 bg-primary/20 border border-primary rounded-sm flex items-center justify-center ${cardData.reversed ? "rotate-180" : ""}`}
                    >
                      <span className="text-[10px] text-accent">
                        {cardData.card.number}
                      </span>
                    </div>
                    <div className="text-[8px] text-foreground mt-1 max-w-12 truncate">
                      {cardData.card.nameKo}
                    </div>
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`p-3 rounded-sm text-xs leading-relaxed ${
                      message.role === "user"
                        ? "bg-secondary/20 border border-secondary ml-8"
                        : "bg-muted border-2 border-primary mr-8"
                    }`}
                  >
                    {message.role === "assistant" &&
                    index === messages.length - 1
                      ? displayedText
                      : message.parts
                          ?.filter(
                            (p): p is { type: "text"; text: string } =>
                              p.type === "text"
                          )
                          .map((p) => p.text)
                          .join("") || ""}
                    {message.role === "assistant" &&
                      index === messages.length - 1 &&
                      isTyping && (
                        <span className="animate-blink ml-1">_</span>
                      )}
                  </div>
                ))}
              </div>

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t-2 border-border bg-muted">
          {phase === "greeting" || phase === "reading" || phase === "followup" ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  phase === "greeting"
                    ? "질문을 입력하세요..."
                    : "추가 질문이 있으신가요?"
                }
                className="flex-1 bg-background border-2 border-border rounded-sm px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                disabled={status === "streaming"}
              />
              <button
                onClick={handleSubmitQuestion}
                disabled={!inputValue.trim() || status === "streaming"}
                className="pixel-btn px-4 py-2 text-xs text-foreground disabled:opacity-50"
              >
                {status === "streaming" ? "..." : "SEND"}
              </button>
            </div>
          ) : null}

          {(phase === "reading" || phase === "followup") && status !== "streaming" && (
            <button
              onClick={handleReset}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-accent border border-border rounded-sm"
            >
              NEW READING
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
