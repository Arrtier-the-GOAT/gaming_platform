import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bomb, Sparkles, Target } from "lucide-react";
import { useLocation } from "wouter";

const WIDTH = 420;
const HEIGHT = 720;
const CELL = 34;
const COLS = 10;
const ROWS = 16;
const TOP_OFFSET = 40;
const BOARD_WIDTH = COLS * CELL;
const BOARD_X = (WIDTH - BOARD_WIDTH) / 2;
const CANNON_Y = HEIGHT - 56;
const BUBBLE_R = CELL * 0.42;

type BubbleColor = "red" | "blue" | "green" | "yellow" | "purple" | "cyan";
type BubbleSpecial = "normal" | "bomb" | "rainbow";
type GameState = "ready" | "playing" | "levelClear" | "gameOver";

type BubbleCell = {
  color: BubbleColor;
  special: BubbleSpecial;
};

type Projectile = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bubble: BubbleCell;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

const PALETTE: Record<BubbleColor, string> = {
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#f59e0b",
  purple: "#a855f7",
  cyan: "#06b6d4",
};

const COLOR_LIST: BubbleColor[] = ["red", "blue", "green", "yellow", "purple", "cyan"];
const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function inRangeRow(row: number) {
  return row >= 0 && row < ROWS;
}

function inRangeCol(col: number) {
  return col >= 0 && col < COLS;
}

function toWorld(col: number, row: number) {
  return {
    x: BOARD_X + col * CELL + CELL / 2,
    y: TOP_OFFSET + row * CELL + CELL / 2,
  };
}

function toGrid(x: number, y: number) {
  const col = Math.round((x - BOARD_X - CELL / 2) / CELL);
  const row = Math.round((y - TOP_OFFSET - CELL / 2) / CELL);
  return {
    col: Math.max(0, Math.min(COLS - 1, col)),
    row: Math.max(0, Math.min(ROWS - 1, row)),
  };
}

function randColor(poolSize: number) {
  return COLOR_LIST[Math.floor(Math.random() * poolSize)] as BubbleColor;
}

function makeBoard(level: number) {
  const board: (BubbleCell | null)[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => null)
  );
  const rows = Math.min(5 + level, 11);
  const colorPool = Math.min(3 + Math.floor(level / 2), COLOR_LIST.length);
  const bombChance = Math.min(0.04 + level * 0.01, 0.16);
  const rainbowChance = Math.min(0.03 + level * 0.01, 0.12);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      let special: BubbleSpecial = "normal";
      const roll = Math.random();
      if (roll < bombChance) special = "bomb";
      else if (roll < bombChance + rainbowChance) special = "rainbow";
      board[row][col] = {
        color: randColor(colorPool),
        special,
      };
    }
  }
  return board;
}

function randomShot(level: number): BubbleCell {
  const colorPool = Math.min(3 + Math.floor(level / 2), COLOR_LIST.length);
  const bombChance = Math.min(0.03 + level * 0.007, 0.1);
  const rainbowChance = Math.min(0.03 + level * 0.006, 0.08);
  const roll = Math.random();
  let special: BubbleSpecial = "normal";
  if (roll < bombChance) special = "bomb";
  else if (roll < bombChance + rainbowChance) special = "rainbow";
  return { color: randColor(colorPool), special };
}

function bubbleMatches(target: BubbleCell, source: BubbleCell, color: BubbleColor) {
  if (target.special === "rainbow") return true;
  if (source.special === "rainbow") return true;
  return target.color === color;
}

function key(row: number, col: number) {
  return `${row}:${col}`;
}

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setLocation] = useLocation();
  const [state, setState] = useState<GameState>("ready");
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [message, setMessage] = useState("Aim and clear same-color bubbles.");

  const boardRef = useRef<(BubbleCell | null)[][]>(makeBoard(1));
  const projectileRef = useRef<Projectile | null>(null);
  const currentRef = useRef<BubbleCell>(randomShot(1));
  const nextRef = useRef<BubbleCell>(randomShot(1));
  const angleRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const statusRef = useRef<GameState>("ready");
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const shotsRef = useRef(0);
  const bestRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);

  const multiplierValue = useMemo(() => multiplier.toFixed(2), [multiplier]);

  const getAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) audioRef.current = new window.AudioContext();
    return audioRef.current;
  };

  const sound = (frequency: number, duration: number, type: OscillatorType, gain = 0.05) => {
    const ctx = getAudio();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(g);
    g.connect(ctx.destination);
    const now = ctx.currentTime;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  };

  const resetForLevel = (nextLevel: number, keepScore: boolean) => {
    boardRef.current = makeBoard(nextLevel);
    currentRef.current = randomShot(nextLevel);
    nextRef.current = randomShot(nextLevel);
    projectileRef.current = null;
    shotsRef.current = 0;
    angleRef.current = 0;
    if (!keepScore) {
      scoreRef.current = 0;
      comboRef.current = 0;
      setScore(0);
      setCombo(0);
      setMultiplier(1);
    }
  };

  const startGame = () => {
    levelRef.current = 1;
    setLevel(1);
    resetForLevel(1, false);
    setMessage("Tap to shoot. Match 3+ bubbles.");
    statusRef.current = "playing";
    setState("playing");
  };

  const spawnParticles = (x: number, y: number, count: number, color: string, force = 1) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (80 + Math.random() * 170) * force;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 520 + Math.random() * 220,
        color,
        size: 2 + Math.random() * 4,
      });
    }
  };

  const addRow = () => {
    const board = boardRef.current.map(row => [...row]);
    for (let row = ROWS - 1; row >= 1; row--) {
      board[row] = [...board[row - 1]];
    }
    const colorPool = Math.min(3 + Math.floor(levelRef.current / 2), COLOR_LIST.length);
    board[0] = Array.from({ length: COLS }, () => ({
      color: randColor(colorPool),
      special: Math.random() < 0.08 ? "bomb" : "normal",
    }));
    boardRef.current = board;
    const reachedBottom = board[ROWS - 1].some(cell => cell !== null);
    if (reachedBottom) {
      statusRef.current = "gameOver";
      setState("gameOver");
      setMessage("Bubbles reached the bottom.");
    }
  };

  const bfsCluster = (
    board: (BubbleCell | null)[][],
    startRow: number,
    startCol: number
  ) => {
    const origin = board[startRow][startCol];
    if (!origin) return [];
    const targetColor = origin.color;
    const queue: Array<[number, number]> = [[startRow, startCol]];
    const visited = new Set<string>([key(startRow, startCol)]);
    const cluster: Array<[number, number]> = [];

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      const cell = board[row][col];
      if (!cell) continue;
      if (!bubbleMatches(cell, origin, targetColor)) continue;
      cluster.push([row, col]);
      for (const [dr, dc] of DIRECTIONS) {
        const nr = row + dr;
        const nc = col + dc;
        if (!inRangeRow(nr) || !inRangeCol(nc)) continue;
        const k = key(nr, nc);
        if (visited.has(k)) continue;
        visited.add(k);
        if (board[nr][nc]) queue.push([nr, nc]);
      }
    }
    return cluster;
  };

  const removeDetached = (board: (BubbleCell | null)[][]) => {
    const visited = new Set<string>();
    const queue: Array<[number, number]> = [];
    for (let col = 0; col < COLS; col++) {
      if (board[0][col]) {
        queue.push([0, col]);
        visited.add(key(0, col));
      }
    }

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      for (const [dr, dc] of DIRECTIONS) {
        const nr = row + dr;
        const nc = col + dc;
        if (!inRangeRow(nr) || !inRangeCol(nc)) continue;
        const k = key(nr, nc);
        if (visited.has(k)) continue;
        if (!board[nr][nc]) continue;
        visited.add(k);
        queue.push([nr, nc]);
      }
    }

    let removed = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (board[row][col] && !visited.has(key(row, col))) {
          const { x, y } = toWorld(col, row);
          spawnParticles(x, y, 7, "#cbd5e1", 0.9);
          board[row][col] = null;
          removed++;
        }
      }
    }
    return removed;
  };

  const placeProjectile = (projectile: Projectile) => {
    const board = boardRef.current.map(row => [...row]);
    const snapped = toGrid(projectile.x, projectile.y);

    let row = snapped.row;
    let col = snapped.col;
    if (board[row][col] !== null) {
      const neighbors = [
        [row, col - 1],
        [row, col + 1],
        [row - 1, col],
        [row + 1, col],
      ];
      const empty = neighbors.find(([r, c]) => inRangeRow(r) && inRangeCol(c) && board[r][c] === null);
      if (empty) {
        row = empty[0];
        col = empty[1];
      } else {
        row = Math.max(0, row - 1);
      }
    }

    const placed = { ...projectile.bubble };
    if (placed.special === "rainbow") {
      const counts = new Map<BubbleColor, number>();
      for (const [dr, dc] of DIRECTIONS) {
        const nr = row + dr;
        const nc = col + dc;
        if (!inRangeRow(nr) || !inRangeCol(nc)) continue;
        const neighbor = board[nr][nc];
        if (!neighbor) continue;
        counts.set(neighbor.color, (counts.get(neighbor.color) ?? 0) + 1);
      }
      if (counts.size > 0) {
        const winner = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
        placed.color = winner;
      }
      placed.special = "normal";
    }

    board[row][col] = placed;
    let popped = 0;
    let hadBombInSet = false;
    const popSet = new Set<string>();
    const cluster = bfsCluster(board, row, col);
    if (placed.special === "bomb") {
      for (let rr = row - 1; rr <= row + 1; rr++) {
        for (let cc = col - 1; cc <= col + 1; cc++) {
          if (!inRangeRow(rr) || !inRangeCol(cc)) continue;
          if (board[rr][cc]) popSet.add(key(rr, cc));
        }
      }
    } else if (cluster.length >= 3) {
      for (const [rr, cc] of cluster) popSet.add(key(rr, cc));
    }

    if (popSet.size > 0) {
      hadBombInSet = Array.from(popSet).some(k => {
        const [rr, cc] = k.split(":").map(Number);
        return board[rr][cc]?.special === "bomb";
      });
      const extraBombs: Array<[number, number]> = [];
      popSet.forEach(k => {
        const [rr, cc] = k.split(":").map(Number);
        const cell = board[rr][cc];
        if (cell?.special === "bomb") extraBombs.push([rr, cc]);
      });
      for (const [rr, cc] of extraBombs) {
        for (let r = rr - 1; r <= rr + 1; r++) {
          for (let c = cc - 1; c <= cc + 1; c++) {
            if (!inRangeRow(r) || !inRangeCol(c)) continue;
            if (board[r][c]) popSet.add(key(r, c));
          }
        }
      }

      popSet.forEach(k => {
        const [rr, cc] = k.split(":").map(Number);
        const cell = board[rr][cc];
        if (!cell) return;
        const { x, y } = toWorld(cc, rr);
        const colorHex = PALETTE[cell.color];
        spawnParticles(
          x,
          y,
          cell.special === "bomb" ? 22 : 12,
          cell.special === "rainbow" ? "#ffffff" : colorHex,
          cell.special === "bomb" ? 1.3 : 1
        );
        board[rr][cc] = null;
        popped++;
      });
    }

    let dropped = 0;
    if (popped > 0) {
      dropped = removeDetached(board);
      const nextCombo = comboRef.current + 1;
      comboRef.current = nextCombo;
      const nextMultiplier = Math.min(1 + nextCombo * 0.25, 3.25);
      setCombo(nextCombo);
      setMultiplier(nextMultiplier);
      const gained = Math.round((popped * 12 + dropped * 18) * nextMultiplier);
      scoreRef.current += gained;
      setScore(scoreRef.current);
      setMessage(
        dropped > 0
          ? `Combo x${nextCombo}! +${gained} (${popped} popped, ${dropped} dropped)`
          : `Combo x${nextCombo}! +${gained}`
      );
      sound(520 + Math.min(220, nextCombo * 25), 0.08, "triangle", 0.07);
      if (hadBombInSet) {
        sound(160, 0.16, "sawtooth", 0.08);
      }
    } else {
      comboRef.current = 0;
      setCombo(0);
      setMultiplier(1);
      setMessage("No match. Try another angle.");
      sound(240, 0.05, "square", 0.05);
    }

    boardRef.current = board;
    projectileRef.current = null;
    currentRef.current = nextRef.current;
    nextRef.current = randomShot(levelRef.current);
    shotsRef.current += 1;

    const pushEvery = Math.max(8 - levelRef.current, 3);
    if (shotsRef.current % pushEvery === 0 && statusRef.current === "playing") {
      addRow();
      sound(180, 0.07, "square", 0.045);
    }

    const empty = boardRef.current.every(rowCells => rowCells.every(cell => cell === null));
    if (empty && statusRef.current === "playing") {
      statusRef.current = "levelClear";
      setState("levelClear");
      setMessage(`Level ${levelRef.current} cleared!`);
      sound(700, 0.12, "triangle", 0.09);
      sound(920, 0.16, "sine", 0.06);
    }

    if (scoreRef.current > bestRef.current) {
      bestRef.current = scoreRef.current;
      setBestScore(scoreRef.current);
      localStorage.setItem("bubble-pop-best-score", String(scoreRef.current));
    }
  };

  const shoot = () => {
    if (statusRef.current !== "playing") return;
    if (projectileRef.current) return;
    const speed = 450;
    projectileRef.current = {
      x: WIDTH / 2,
      y: CANNON_Y,
      vx: Math.sin(angleRef.current) * speed,
      vy: -Math.cos(angleRef.current) * speed,
      bubble: currentRef.current,
    };
    sound(440, 0.06, "square", 0.05);
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * WIDTH;
    const y = ((clientY - rect.top) / rect.height) * HEIGHT;
    const dx = x - WIDTH / 2;
    const dy = CANNON_Y - y;
    const raw = Math.atan2(dx, dy);
    const clamped = Math.max(-1.2, Math.min(1.2, raw));
    angleRef.current = clamped;
  };

  useEffect(() => {
    const saved = Number(localStorage.getItem("bubble-pop-best-score") || "0");
    const best = Number.isFinite(saved) && saved > 0 ? saved : 0;
    bestRef.current = best;
    setBestScore(best);
  }, []);

  useEffect(() => {
    const tick = (ts: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = ts;
      const deltaMs = Math.min(33, ts - lastFrameRef.current);
      const dt = deltaMs / 1000;
      lastFrameRef.current = ts;

      const projectile = projectileRef.current;
      if (projectile && statusRef.current === "playing") {
        projectile.x += projectile.vx * dt;
        projectile.y += projectile.vy * dt;

        if (projectile.x <= BOARD_X + BUBBLE_R) {
          projectile.x = BOARD_X + BUBBLE_R;
          projectile.vx = Math.abs(projectile.vx);
        } else if (projectile.x >= BOARD_X + BOARD_WIDTH - BUBBLE_R) {
          projectile.x = BOARD_X + BOARD_WIDTH - BUBBLE_R;
          projectile.vx = -Math.abs(projectile.vx);
        }

        if (projectile.y <= TOP_OFFSET + BUBBLE_R) {
          placeProjectile(projectile);
        } else {
          let collided = false;
          for (let row = 0; row < ROWS && !collided; row++) {
            for (let col = 0; col < COLS; col++) {
              const bubble = boardRef.current[row][col];
              if (!bubble) continue;
              const world = toWorld(col, row);
              const dx = projectile.x - world.x;
              const dy = projectile.y - world.y;
              if (dx * dx + dy * dy <= (BUBBLE_R * 2.05) * (BUBBLE_R * 2.05)) {
                collided = true;
                break;
              }
            }
          }
          if (collided) {
            placeProjectile(projectile);
          }
        }
      }

      particlesRef.current = particlesRef.current
        .map(p => ({
          ...p,
          x: p.x + p.vx * dt,
          y: p.y + p.vy * dt,
          vy: p.vy + 220 * dt,
          life: p.life + deltaMs,
          size: Math.max(0.6, p.size - dt * 2),
        }))
        .filter(p => p.life < p.maxLife);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, WIDTH, HEIGHT);

          const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          bg.addColorStop(0, "#111827");
          bg.addColorStop(1, "#1f2937");
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, WIDTH, HEIGHT);

          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(BOARD_X - 4, TOP_OFFSET - 4, BOARD_WIDTH + 8, ROWS * CELL + 8);

          for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
              const cell = boardRef.current[row][col];
              if (!cell) continue;
              const { x, y } = toWorld(col, row);
              const color = PALETTE[cell.color];
              const grad = ctx.createRadialGradient(x - 4, y - 5, 2, x, y, BUBBLE_R);
              grad.addColorStop(0, "#ffffff");
              grad.addColorStop(0.15, color);
              grad.addColorStop(1, "#111827");
              ctx.fillStyle = grad;
              ctx.beginPath();
              ctx.arc(x, y, BUBBLE_R, 0, Math.PI * 2);
              ctx.fill();

              ctx.strokeStyle = "rgba(255,255,255,0.35)";
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(x, y, BUBBLE_R - 1, 0, Math.PI * 2);
              ctx.stroke();

              if (cell.special === "bomb") {
                ctx.fillStyle = "#111827";
                ctx.beginPath();
                ctx.arc(x, y, 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#f97316";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x + 4, y - 4);
                ctx.lineTo(x + 10, y - 10);
                ctx.stroke();
              } else if (cell.special === "rainbow") {
                const rainbow = ["#ef4444", "#f59e0b", "#eab308", "#22c55e", "#3b82f6", "#a855f7"];
                rainbow.forEach((c, idx) => {
                  ctx.strokeStyle = c;
                  ctx.lineWidth = 2;
                  ctx.beginPath();
                  ctx.arc(x, y, 4 + idx * 1.3, 0, Math.PI * 2);
                  ctx.stroke();
                });
              }
            }
          }

          if (projectileRef.current) {
            const p = projectileRef.current;
            const color = PALETTE[p.bubble.color];
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, BUBBLE_R, 0, Math.PI * 2);
            ctx.fill();
            if (p.bubble.special === "bomb") {
              ctx.fillStyle = "#111827";
              ctx.beginPath();
              ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
              ctx.fill();
            } else if (p.bubble.special === "rainbow") {
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(p.x, p.y, BUBBLE_R - 5, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          for (const particle of particlesRef.current) {
            const alpha = Math.max(0, 1 - particle.life / particle.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }

          ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(WIDTH / 2, CANNON_Y);
          ctx.lineTo(
            WIDTH / 2 + Math.sin(angleRef.current) * 90,
            CANNON_Y - Math.cos(angleRef.current) * 90
          );
          ctx.stroke();

          ctx.fillStyle = "#334155";
          ctx.beginPath();
          ctx.arc(WIDTH / 2, CANNON_Y, 22, 0, Math.PI * 2);
          ctx.fill();

          const current = currentRef.current;
          const next = nextRef.current;
          ctx.fillStyle = PALETTE[current.color];
          ctx.beginPath();
          ctx.arc(WIDTH / 2, CANNON_Y, BUBBLE_R - 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = PALETTE[next.color];
          ctx.beginPath();
          ctx.arc(48, HEIGHT - 52, BUBBLE_R - 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#e2e8f0";
          ctx.font = "12px sans-serif";
          ctx.fillText("NEXT", 30, HEIGHT - 16);

          if (statusRef.current === "ready") {
            ctx.fillStyle = "rgba(2, 6, 23, 0.7)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = "#ffffff";
            ctx.textAlign = "center";
            ctx.font = "bold 30px sans-serif";
            ctx.fillText("Bubble Pop", WIDTH / 2, HEIGHT / 2 - 16);
            ctx.font = "16px sans-serif";
            ctx.fillText("Shoot and clear same-color bubbles", WIDTH / 2, HEIGHT / 2 + 18);
          }
        }
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    animationRef.current = requestAnimationFrame(tick);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setLocation("/games")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <Button onClick={startGame} disabled={state === "playing"}>
            {state === "ready" ? "Start Bubble Pop" : "Retry"}
          </Button>
          {state === "levelClear" && (
            <Button
              onClick={() => {
                const nextLevel = levelRef.current + 1;
                levelRef.current = nextLevel;
                setLevel(nextLevel);
                resetForLevel(nextLevel, true);
                statusRef.current = "playing";
                setState("playing");
                setMessage(`Level ${nextLevel} started`);
              }}
            >
              Next Level
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Score</p>
            <p className="text-2xl font-bold text-cyan-400">{score}</p>
          </div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Best</p>
            <p className="text-2xl font-bold text-emerald-400">{bestScore}</p>
          </div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Level</p>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Combo</p>
            <p className="text-2xl font-bold text-yellow-300">{combo}</p>
          </div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Multiplier</p>
            <p className="text-2xl font-bold text-violet-300">{multiplierValue}x</p>
          </div>
          <div className="rounded bg-slate-900 border border-slate-700 p-3">
            <p className="text-xs text-slate-400">Special</p>
            <p className="text-sm mt-1 flex items-center gap-2">
              <Bomb className="w-4 h-4 text-orange-400" />
              <Sparkles className="w-4 h-4 text-fuchsia-400" />
              <Target className="w-4 h-4 text-cyan-300" />
            </p>
          </div>
        </div>

        <div className="rounded border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
          {message}
        </div>

        <div className="rounded-lg overflow-hidden border border-slate-700 relative">
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full max-h-[74vh] object-contain touch-none"
            onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
            onTouchMove={e => handlePointerMove(e.touches[0].clientX, e.touches[0].clientY)}
            onPointerDown={shoot}
          />
          {state === "gameOver" && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded bg-slate-900 border border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Game Over</h2>
                <p className="text-slate-300">Final Score: {score}</p>
                <p className="text-slate-300">Best Score: {bestScore}</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={startGame}>
                    Retry
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => setLocation("/games")}
                  >
                    Exit
                  </Button>
                </div>
              </div>
            </div>
          )}
          {state === "levelClear" && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center p-4">
              <div className="w-full max-w-sm rounded bg-slate-900 border border-slate-700 p-6 space-y-4">
                <h2 className="text-2xl font-bold">Level Clear</h2>
                <p className="text-slate-300">Score: {score}</p>
                <p className="text-slate-300">Prepare for level {level + 1}</p>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      const nextLevel = levelRef.current + 1;
                      levelRef.current = nextLevel;
                      setLevel(nextLevel);
                      resetForLevel(nextLevel, true);
                      statusRef.current = "playing";
                      setState("playing");
                      setMessage(`Level ${nextLevel} started`);
                    }}
                  >
                    Next Level
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
    </div>
  );
}
