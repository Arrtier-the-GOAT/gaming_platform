import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Gem, RotateCcw, Timer, TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CANVAS_WIDTH = 440;
const CANVAS_HEIGHT = 720;
const DURATION_MS = 60_000;
const TARGET_SCORE = 30;
const HOOK_BASE_LENGTH = 34;
const MAX_HOOK_LENGTH = 520;
const ROTATE_MIN = -75 * (Math.PI / 180);
const ROTATE_MAX = 75 * (Math.PI / 180);

type ItemType = "smallGold" | "bigGold" | "smallMine" | "bigMine";
type HookState = "idle" | "extending" | "retracting";
type GameStatus = "ready" | "playing" | "over";

type MiningItem = {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  radius: number;
  score: number;
  color: string;
  pullFactor: number;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
};

type FloatingText = {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
};

type HookData = {
  angle: number;
  rotateDir: 1 | -1;
  length: number;
  state: HookState;
  carried: MiningItem | null;
};

const ITEM_CONFIG: Record<
  ItemType,
  { score: number; radius: number; color: string; pullFactor: number }
> = {
  smallGold: { score: 3, radius: 14, color: "#facc15", pullFactor: 1 },
  bigGold: { score: 5, radius: 24, color: "#f59e0b", pullFactor: 0.75 },
  smallMine: { score: -3, radius: 14, color: "#ef4444", pullFactor: 0.95 },
  bigMine: { score: -5, radius: 24, color: "#b91c1c", pullFactor: 0.7 },
};

const ITEM_POOL: ItemType[] = [
  "smallGold",
  "smallGold",
  "smallGold",
  "bigGold",
  "smallMine",
  "smallMine",
  "bigMine",
];

function randomItemType() {
  return ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
}

function createItem(id: number, existing: MiningItem[]): MiningItem {
  const type = randomItemType();
  const config = ITEM_CONFIG[type];

  for (let tries = 0; tries < 120; tries++) {
    const x = 36 + Math.random() * (CANVAS_WIDTH - 72);
    const y = 260 + Math.random() * (CANVAS_HEIGHT - 290);
    const overlap = existing.some(item => {
      const dx = x - item.x;
      const dy = y - item.y;
      const minDist = config.radius + item.radius + 10;
      return dx * dx + dy * dy < minDist * minDist;
    });
    if (!overlap) {
      return {
        id,
        type,
        x,
        y,
        radius: config.radius,
        score: config.score,
        color: config.color,
        pullFactor: config.pullFactor,
      };
    }
  }

  return {
    id,
    type,
    x: 36 + Math.random() * (CANVAS_WIDTH - 72),
    y: 260 + Math.random() * (CANVAS_HEIGHT - 290),
    radius: config.radius,
    score: config.score,
    color: config.color,
    pullFactor: config.pullFactor,
  };
}

function makeInitialItems() {
  const items: MiningItem[] = [];
  for (let i = 0; i < 22; i++) {
    items.push(createItem(i + 1, items));
  }
  return items;
}

function drawMine(ctx: CanvasRenderingContext2D, item: MiningItem) {
  const spikes = item.type === "smallMine" ? 8 : 12;
  const outer = item.radius;
  const inner = item.radius * 0.72;
  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.fillStyle = item.color;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? outer : inner;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#111827";
  ctx.beginPath();
  ctx.arc(0, 0, item.radius * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawGold(ctx: CanvasRenderingContext2D, item: MiningItem) {
  const gradient = ctx.createRadialGradient(
    item.x - item.radius * 0.2,
    item.y - item.radius * 0.2,
    2,
    item.x,
    item.y,
    item.radius
  );
  gradient.addColorStop(0, "#fde68a");
  gradient.addColorStop(1, item.color);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#ca8a04";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(item.x, item.y, item.radius - 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawItem(ctx: CanvasRenderingContext2D, item: MiningItem) {
  if (item.type.includes("Mine")) {
    drawMine(ctx, item);
    return;
  }
  drawGold(ctx, item);
}

function drawMiner(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  aimAngle: number,
  isActive: boolean
) {
  const armReach = 18;
  const handX = x + Math.sin(aimAngle) * armReach;
  const handY = y + 10 + Math.cos(aimAngle) * armReach;

  // Helmet
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.ellipse(x, y - 14, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#92400e";
  ctx.fillRect(x - 18, y - 16, 36, 4);

  // Face
  ctx.fillStyle = "#fcd7b8";
  ctx.beginPath();
  ctx.arc(x, y - 2, 10, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = isActive ? "#2563eb" : "#334155";
  ctx.fillRect(x - 13, y + 8, 26, 26);

  // Legs
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(x - 11, y + 34, 8, 18);
  ctx.fillRect(x + 3, y + 34, 8, 18);

  // Left arm
  ctx.strokeStyle = "#fcd7b8";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x - 10, y + 12);
  ctx.lineTo(x - 22, y + 20);
  ctx.stroke();

  // Right arm aiming with rope
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 12);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Hand glove
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(handX, handY, 4.2, 0, Math.PI * 2);
  ctx.fill();
}

export default function GoldMiner() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();
  const [status, setStatus] = useState<GameStatus>("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [newHighScore, setNewHighScore] = useState(false);

  const highScoreRef = useRef(0);
  const scoreRef = useRef(0);
  const statusRef = useRef<GameStatus>("ready");
  const remainingMsRef = useRef(DURATION_MS);
  const displaySecondRef = useRef(60);
  const itemsRef = useRef<MiningItem[]>([]);
  const nextItemIdRef = useRef(1000);
  const particlesRef = useRef<Particle[]>([]);
  const textsRef = useRef<FloatingText[]>([]);
  const hookRef = useRef<HookData>({
    angle: -0.4,
    rotateDir: 1,
    length: HOOK_BASE_LENGTH,
    state: "idle",
    carried: null,
  });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);
  const shakeRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = () => {
    if (typeof window === "undefined") return null;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext();
    }
    return audioCtxRef.current;
  };

  const playTone = (frequency: number, duration: number, type: OscillatorType, gain = 0.05) => {
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

  const emitFloatingText = (x: number, y: number, scoreValue: number) => {
    textsRef.current.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text: scoreValue > 0 ? `+${scoreValue}` : `${scoreValue}`,
      color: scoreValue > 0 ? "#16a34a" : "#dc2626",
      life: 0,
      maxLife: 900,
    });
  };

  const emitParticles = (x: number, y: number, count: number, isMine: boolean) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 190;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isMine ? 40 : 10),
        life: 0,
        maxLife: isMine ? 600 : 500,
        size: isMine ? 3 + Math.random() * 4 : 2 + Math.random() * 3,
        color: isMine
          ? Math.random() > 0.5
            ? "#f97316"
            : "#ef4444"
          : Math.random() > 0.5
            ? "#fde047"
            : "#facc15",
      });
    }
  };

  const applyCatchEffect = (item: MiningItem) => {
    emitFloatingText(item.x, item.y, item.score);
    if (item.score > 0) {
      emitParticles(item.x, item.y, 18, false);
      playTone(640, 0.08, "triangle", 0.08);
      playTone(820, 0.1, "sine", 0.05);
    } else {
      emitParticles(item.x, item.y, 36, true);
      shakeRef.current = 10;
      playTone(120, 0.2, "sawtooth", 0.08);
      playTone(80, 0.25, "square", 0.05);
    }
  };

  const resetRound = () => {
    scoreRef.current = 0;
    setScore(0);
    remainingMsRef.current = DURATION_MS;
    displaySecondRef.current = 60;
    setTimeLeft(60);
    itemsRef.current = makeInitialItems();
    particlesRef.current = [];
    textsRef.current = [];
    hookRef.current = {
      angle: -0.4,
      rotateDir: 1,
      length: HOOK_BASE_LENGTH,
      state: "idle",
      carried: null,
    };
    shakeRef.current = 0;
    setFinalScore(0);
    setNewHighScore(false);
  };

  const startRound = () => {
    resetRound();
    statusRef.current = "playing";
    setStatus("playing");
  };

  const endRound = () => {
    statusRef.current = "over";
    setStatus("over");
    setFinalScore(scoreRef.current);
    if (scoreRef.current > highScoreRef.current) {
      highScoreRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
      setNewHighScore(true);
      localStorage.setItem("gold-miner-high-score", String(scoreRef.current));
    } else {
      setNewHighScore(false);
    }
  };

  const attemptDropHook = () => {
    if (statusRef.current !== "playing") return;
    if (hookRef.current.state !== "idle") return;
    hookRef.current.state = "extending";
    playTone(360, 0.05, "square", 0.04);
  };

  useEffect(() => {
    const stored = Number(localStorage.getItem("gold-miner-high-score") || "0");
    const initialHigh = Number.isFinite(stored) && stored > 0 ? stored : 0;
    highScoreRef.current = initialHigh;
    setHighScore(initialHigh);
    itemsRef.current = makeInitialItems();
  }, []);

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTsRef.current) {
        lastTsRef.current = timestamp;
      }
      const deltaMs = Math.min(33, timestamp - lastTsRef.current);
      const dt = deltaMs / 1000;
      lastTsRef.current = timestamp;

      const hook = hookRef.current;
      if (statusRef.current === "playing") {
        remainingMsRef.current = Math.max(0, remainingMsRef.current - deltaMs);
        const nextDisplaySecond = Math.ceil(remainingMsRef.current / 1000);
        if (nextDisplaySecond !== displaySecondRef.current) {
          displaySecondRef.current = nextDisplaySecond;
          setTimeLeft(nextDisplaySecond);
        }
        if (remainingMsRef.current <= 0) {
          endRound();
        }

        if (hook.state === "idle") {
          hook.angle += hook.rotateDir * dt * 1.5;
          if (hook.angle <= ROTATE_MIN) {
            hook.angle = ROTATE_MIN;
            hook.rotateDir = 1;
          } else if (hook.angle >= ROTATE_MAX) {
            hook.angle = ROTATE_MAX;
            hook.rotateDir = -1;
          }
        } else if (hook.state === "extending") {
          hook.length += dt * 430;
          const tipX = CANVAS_WIDTH / 2 + Math.sin(hook.angle) * hook.length;
          const tipY = 72 + Math.cos(hook.angle) * hook.length;

          const hitIndex = itemsRef.current.findIndex(item => {
            const dx = tipX - item.x;
            const dy = tipY - item.y;
            return dx * dx + dy * dy <= item.radius * item.radius;
          });

          if (hitIndex >= 0) {
            const hit = itemsRef.current.splice(hitIndex, 1)[0];
            hook.carried = hit;
            hook.state = "retracting";
            applyCatchEffect(hit);
          } else if (
            hook.length >= MAX_HOOK_LENGTH ||
            tipX < 10 ||
            tipX > CANVAS_WIDTH - 10 ||
            tipY > CANVAS_HEIGHT - 20
          ) {
            hook.state = "retracting";
          }
        } else if (hook.state === "retracting") {
          const pullFactor = hook.carried?.pullFactor ?? 1;
          hook.length = Math.max(HOOK_BASE_LENGTH, hook.length - dt * 500 * pullFactor);
          if (hook.length <= HOOK_BASE_LENGTH + 0.5) {
            if (hook.carried) {
              const nextScore = scoreRef.current + hook.carried.score;
              scoreRef.current = nextScore;
              setScore(nextScore);
              hook.carried = null;
              itemsRef.current.push(createItem(nextItemIdRef.current++, itemsRef.current));
            }
            hook.length = HOOK_BASE_LENGTH;
            hook.state = "idle";
          }
        }
      }

      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 120 * dt,
          life: p.life + deltaMs,
          size: Math.max(0.6, p.size - dt * 2),
        }))
        .filter(p => p.life < p.maxLife);

      textsRef.current = textsRef.current
        .map(t => ({
          ...t,
          y: t.y - dt * 45,
          life: t.life + deltaMs,
        }))
        .filter(t => t.life < t.maxLife);

      shakeRef.current = Math.max(0, shakeRef.current - dt * 22);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;
          const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current : 0;
          ctx.save();
          ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          ctx.translate(shakeX, shakeY);

          const sky = ctx.createLinearGradient(0, 0, 0, 260);
          sky.addColorStop(0, "#bfdbfe");
          sky.addColorStop(1, "#dbeafe");
          ctx.fillStyle = sky;
          ctx.fillRect(0, 0, CANVAS_WIDTH, 260);

          const ground = ctx.createLinearGradient(0, 260, 0, CANVAS_HEIGHT);
          ground.addColorStop(0, "#d97706");
          ground.addColorStop(1, "#78350f");
          ctx.fillStyle = ground;
          ctx.fillRect(0, 260, CANVAS_WIDTH, CANVAS_HEIGHT - 260);

          ctx.fillStyle = "rgba(0,0,0,0.08)";
          for (let i = 0; i < 16; i++) {
            ctx.beginPath();
            ctx.arc(
              12 + (i * 30) % CANVAS_WIDTH,
              290 + (i % 8) * 55,
              2 + (i % 3),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          for (const item of itemsRef.current) {
            drawItem(ctx, item);
          }

          const anchorX = CANVAS_WIDTH / 2;
          const anchorY = 130;
          const tipX = anchorX + Math.sin(hook.angle) * hook.length;
          const tipY = anchorY + Math.cos(hook.angle) * hook.length;

          // Wooden platform for miner
          ctx.fillStyle = "#7c2d12";
          ctx.fillRect(anchorX - 52, anchorY - 12, 104, 14);
          ctx.fillStyle = "#92400e";
          ctx.fillRect(anchorX - 62, anchorY + 2, 124, 10);

          // Miner character that visually aims where hook rotates
          drawMiner(ctx, anchorX, anchorY - 60, hook.angle, statusRef.current === "playing");

          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(anchorX, anchorY);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();

          ctx.fillStyle = "#111827";
          ctx.beginPath();
          ctx.arc(anchorX, anchorY, 11, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = "#f8fafc";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(anchorX, anchorY, 6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.save();
          ctx.translate(tipX, tipY);
          ctx.rotate(hook.angle);
          ctx.fillStyle = "#0b1220";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-11, 15);
          ctx.lineTo(0, 10);
          ctx.lineTo(11, 15);
          ctx.closePath();
          ctx.fill();

          // Hook highlight for better motion readability
          ctx.strokeStyle = "#cbd5e1";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, 1);
          ctx.lineTo(-6, 9);
          ctx.moveTo(0, 1);
          ctx.lineTo(6, 9);
          ctx.stroke();
          ctx.restore();

          if (hook.carried) {
            const carried = { ...hook.carried, x: tipX, y: tipY + hook.carried.radius * 0.55 };
            drawItem(ctx, carried);
          }

          for (const particle of particlesRef.current) {
            const alpha = 1 - particle.life / particle.maxLife;
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          for (const text of textsRef.current) {
            const alpha = 1 - text.life / text.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = text.color;
            ctx.font = "bold 22px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(text.text, text.x, text.y);
            ctx.globalAlpha = 1;
          }

          if (statusRef.current === "ready") {
            ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "bold 30px sans-serif";
            ctx.fillText("Gold Digger", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);
            ctx.font = "18px sans-serif";
            ctx.fillText("Tap Start and mine for 60 seconds", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14);
          }

          ctx.restore();
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const progressPercent = Math.min(100, Math.round((score / TARGET_SCORE) * 100));
  const isTimeCritical = timeLeft <= 10 && status === "playing";
  const scoreDelta = finalScore - TARGET_SCORE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30 text-slate-100 py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => navigate("/games")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Exit
            </Button>
            <Button onClick={startRound} disabled={status === "playing"}>
              <RotateCcw className="w-4 h-4 mr-2" />
              {status === "ready" ? "Start Game" : "Retry"}
            </Button>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-medium">
            Status:{" "}
            <span className="text-amber-300">
              {status === "ready" ? "Ready" : status === "playing" ? "Mining" : "Round Over"}
            </span>
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Current Score</p>
            <p className="text-3xl font-bold text-amber-400">{score}</p>
          </div>
          <div className={`rounded border p-4 ${isTimeCritical ? "bg-rose-950/60 border-rose-700" : "bg-slate-800 border-slate-700"}`}>
            <p className="text-xs text-slate-400">Remaining Time</p>
            <p className={`text-3xl font-bold flex items-center gap-2 ${isTimeCritical ? "text-rose-300" : ""}`}>
              {isTimeCritical ? (
                <TriangleAlert className="w-6 h-6 text-rose-300" />
              ) : (
                <Timer className="w-6 h-6 text-cyan-400" />
              )}
              {timeLeft}s
            </p>
          </div>
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Highest Score</p>
            <p className="text-3xl font-bold text-emerald-400">{highScore}</p>
          </div>
          <div className="rounded bg-slate-800 border border-slate-700 p-4">
            <p className="text-xs text-slate-400">Controls</p>
            <p className="text-sm mt-2">Tap anywhere to drop hook</p>
            <p className="text-sm">Hook auto-rotates left/right</p>
          </div>
        </div>



        <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-950 relative">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full max-h-[72vh] object-contain touch-none"
            onPointerDown={attemptDropHook}
          />
          {status === "ready" && (
            <div className="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 border border-slate-700 px-3 py-1 text-xs text-slate-200">
              Press Start Game, then tap screen to throw hook
            </div>
          )}
          {status === "over" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded-lg bg-slate-900 border border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Game Over</h2>
                <div className="space-y-1">
                  <p className="text-slate-300">Final Score: {finalScore}</p>
                  <p className="text-slate-300">Highest Score: {highScore}</p>
                  <p className={`text-sm font-medium ${scoreDelta >= 0 ? "text-emerald-400" : "text-amber-300"}`}>
                    {scoreDelta >= 0
                      ? `Target cleared by +${scoreDelta}`
                      : `${Math.abs(scoreDelta)} points needed to reach target`}
                  </p>
                  {newHighScore && (
                    <p className="text-sm font-semibold text-cyan-300">New High Score!</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={startRound}>
                    Retry
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => navigate("/games")}
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
