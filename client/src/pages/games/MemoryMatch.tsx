import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Timer } from "lucide-react";
import { useLocation } from "wouter";

const GAME_DURATION = 60;
const CARD_BACK = "❓";
const EMOJIS = ["🍒", "🍋", "🍇", "🍉", "🍓", "🍍", "🥝", "🍊"];

type GameStatus = "ready" | "playing" | "over";

type MemoryCard = {
  id: number;
  emoji: string;
  matched: boolean;
};

function shuffleDeck(): MemoryCard[] {
  const doubled = [...EMOJIS, ...EMOJIS];
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled.map((emoji, index) => ({ id: index + 1, emoji, matched: false }));
}

export default function MemoryMatch() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<GameStatus>("ready");
  const [cards, setCards] = useState<MemoryCard[]>(() => shuffleDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const matchedCount = useMemo(() => cards.filter(card => card.matched).length, [cards]);

  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
    return audioCtxRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType, gain = 0.06) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const node = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    node.gain.value = gain;
    osc.connect(node);
    node.connect(ctx.destination);
    const now = ctx.currentTime;
    node.gain.setValueAtTime(gain, now);
    node.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  };

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const endGame = () => {
    clearTimer();
    setStatus("over");
    setFinalScore(score);
    playTone(180, 0.18, "sawtooth", 0.05);
  };

  const startGame = () => {
    clearTimer();
    setCards(shuffleDeck());
    setFlipped([]);
    setScore(0);
    setFinalScore(0);
    setTimeLeft(GAME_DURATION);
    setIsLocked(false);
    setStatus("playing");
  };

  const handleCardClick = (index: number) => {
    if (status !== "playing" || isLocked) return;
    if (flipped.includes(index)) return;
    if (cards[index].matched) return;
    if (flipped.length >= 2) return;

    playTone(420, 0.06, "triangle", 0.04);
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);
  };

  useEffect(() => {
    if (status !== "playing") return;
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [status]);

  useEffect(() => {
    if (status === "playing" && timeLeft === 0) {
      endGame();
    }
  }, [timeLeft, status]);

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [firstIdx, secondIdx] = flipped;
    const first = cards[firstIdx];
    const second = cards[secondIdx];
    if (!first || !second) return;

    setIsLocked(true);
    const isMatch = first.emoji === second.emoji;

    if (isMatch) {
      playTone(640, 0.08, "sine", 0.08);
      playTone(820, 0.12, "triangle", 0.05);
      setTimeout(() => {
        setCards(prev =>
          prev.map((card, idx) =>
            idx === firstIdx || idx === secondIdx ? { ...card, matched: true } : card
          )
        );
        setScore(prev => prev + 5);
        setFlipped([]);
        setIsLocked(false);
      }, 420);
    } else {
      playTone(190, 0.12, "square", 0.07);
      setTimeout(() => {
        setScore(prev => prev - 1);
        setFlipped([]);
        setIsLocked(false);
      }, 700);
    }
  }, [flipped, cards]);

  useEffect(() => {
    if (status === "playing" && matchedCount === cards.length && cards.length > 0) {
      endGame();
    }
  }, [matchedCount, cards.length, status]);

  useEffect(() => () => clearTimer(), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100 py-6 px-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setLocation("/games")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <Button onClick={startGame} disabled={status === "playing"}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {status === "ready" ? "Start Game" : "Retry"}
            </Button>
          </div>
          <p className="text-sm rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1">
            Match all pairs in 1 minute
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Current Score</p>
            <p className="text-3xl font-bold text-cyan-300">{score}</p>
          </div>
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Remaining Time</p>
            <p className={`text-3xl font-bold flex items-center gap-2 ${timeLeft <= 10 && status === "playing" ? "text-rose-300" : "text-amber-300"}`}>
              <Timer className="w-6 h-6" />
              {timeLeft}s
            </p>
          </div>
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Matched Pairs</p>
            <p className="text-3xl font-bold text-emerald-300">{matchedCount / 2}/{EMOJIS.length}</p>
          </div>
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Rules</p>
            <p className="text-sm mt-1">Match: +5</p>
            <p className="text-sm">Wrong: -1</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 md:p-6">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card, index) => {
              const isFlipped = flipped.includes(index) || card.matched;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleCardClick(index)}
                  disabled={status !== "playing" || card.matched || isLocked}
                  className={`relative aspect-[3/4] w-full [perspective:900px] transition-opacity ${
                    card.matched ? "opacity-0 pointer-events-none" : "opacity-100"
                  }`}
                >
                  <div
                    className={`absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d] ${
                      isFlipped ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div className="absolute inset-0 rounded-lg border border-indigo-400/40 bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-3xl [backface-visibility:hidden] shadow-lg">
                      {CARD_BACK}
                    </div>
                    <div className="absolute inset-0 rounded-lg border border-cyan-300/40 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-4xl [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-lg">
                      {card.emoji}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {status === "over" && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-sm rounded-lg bg-slate-900 border border-slate-700 p-6 space-y-4">
              <h2 className="text-2xl font-bold">Game Over</h2>
              <p className="text-slate-300">Final Score: {finalScore}</p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={startGame}>
                  Retry
                </Button>
                <Button className="flex-1" variant="outline" onClick={() => setLocation("/games")}>
                  Exit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

