import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  radius: number;
  vx?: number;
  vy?: number;
}

interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
const BUBBLE_RADIUS = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const CANNON_Y = CANVAS_HEIGHT - 40;
const CANNON_WIDTH = 50;

export default function BubbleShooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [, navigate] = useLocation();
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [score, setScore] = useState(0);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [cannonAngle, setCannonAngle] = useState(Math.PI / 2);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({ score: 0, bubbles: [] as Bubble[], projectiles: [] as Projectile[], cannonAngle: Math.PI / 2 });

  const submitScoreMutation = trpc.game.recordResult.useMutation();

  // Initialize bubbles
  useEffect(() => {
    const initialBubbles: Bubble[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        initialBubbles.push({
          id: row * 5 + col,
          x: 60 + col * 70,
          y: 60 + row * 50,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          radius: BUBBLE_RADIUS,
        });
      }
    }
    setBubbles(initialBubbles);
    gameStateRef.current.bubbles = initialBubbles;
  }, []);

  // Handle mouse/touch movement for cannon aiming
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current || !gameStarted) return;

      const rect = canvasRef.current.getBoundingClientRect();
      let clientX, clientY;

      if (e instanceof TouchEvent) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const cannonX = CANVAS_WIDTH / 2;
      const dx = x - cannonX;
      const dy = y - CANNON_Y;
      const angle = Math.atan2(dy, dx);

      setCannonAngle(angle);
      gameStateRef.current.cannonAngle = angle;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [gameStarted]);

  // Handle click/tap to shoot
  useEffect(() => {
    const handleClick = () => {
      if (!gameStarted || gameState === 'gameOver') return;

      const cannonX = CANVAS_WIDTH / 2;
      const newProjectile: Projectile = {
        id: Date.now(),
        x: cannonX,
        y: CANNON_Y,
        vx: Math.cos(cannonAngle) * 8,
        vy: Math.sin(cannonAngle) * 8,
        radius: 8,
      };

      setProjectiles((prev) => [...prev, newProjectile]);
      gameStateRef.current.projectiles = [...gameStateRef.current.projectiles, newProjectile];
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchend', handleClick);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchend', handleClick);
    };
  }, [gameStarted, gameState, cannonAngle]);

  // Game loop
  useEffect(() => {
    if (!gameStarted || gameState === 'gameOver') return;

    const interval = setInterval(() => {
      setProjectiles((prevProjectiles) => {
        let newProjectiles = prevProjectiles.map((proj) => ({
          ...proj,
          x: proj.x + proj.vx,
          y: proj.y + proj.vy,
        }));

        // Remove projectiles that are out of bounds
        newProjectiles = newProjectiles.filter((proj) => proj.y > 0);

        // Check collisions with bubbles
        setBubbles((prevBubbles) => {
          let newBubbles = [...prevBubbles];
          let newScore = gameStateRef.current.score;

          newProjectiles = newProjectiles.filter((proj) => {
            let hit = false;

            newBubbles = newBubbles.filter((bubble) => {
              const dx = proj.x - bubble.x;
              const dy = proj.y - bubble.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < proj.radius + bubble.radius) {
                hit = true;
                newScore += 10;
                return false;
              }
              return true;
            });

            return !hit;
          });

          gameStateRef.current.bubbles = newBubbles;
          gameStateRef.current.score = newScore;
          setScore(newScore);

          // Check win condition
            if (newBubbles.length === 0) {
              setGameState('gameOver');
              submitScoreMutation.mutate({
                gameName: 'Bubble Shooter',
                points: newScore,
                won: true,
              });
            }

          return newBubbles;
        });

        gameStateRef.current.projectiles = newProjectiles;
        return newProjectiles;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [gameStarted, gameState, submitScoreMutation]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f0f9ff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw bubbles
    bubbles.forEach((bubble) => {
      ctx.fillStyle = bubble.color;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw projectiles
    projectiles.forEach((proj) => {
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw cannon
    const cannonX = CANVAS_WIDTH / 2;
    ctx.save();
    ctx.translate(cannonX, CANNON_Y);
    ctx.rotate(cannonAngle);

    // Cannon barrel
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, -5, 40, 10);

    ctx.restore();

    // Cannon base
    ctx.fillStyle = '#555555';
    ctx.beginPath();
    ctx.arc(cannonX, CANNON_Y, 15, 0, Math.PI * 2);
    ctx.fill();
  }, [bubbles, projectiles, cannonAngle]);

  const handleStart = () => {
    setGameStarted(true);
  };

  const handleRestart = () => {
    setGameState('playing');
    setScore(0);
    setProjectiles([]);
    setCannonAngle(Math.PI / 2);
    gameStateRef.current.score = 0;
    gameStateRef.current.projectiles = [];

    const initialBubbles: Bubble[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        initialBubbles.push({
          id: row * 5 + col,
          x: 60 + col * 70,
          y: 60 + row * 50,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          radius: BUBBLE_RADIUS,
        });
      }
    }
    setBubbles(initialBubbles);
    gameStateRef.current.bubbles = initialBubbles;
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-4 text-indigo-600">
            Bubble Shooter
          </h1>

          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-semibold text-gray-700">
              Score: <span className="text-indigo-600">{score}</span>
            </div>
            <Button
              onClick={() => navigate('/games')}
              variant="outline"
              size="sm"
            >
              Back
            </Button>
          </div>

          <div className="mb-4 border-2 border-indigo-300 rounded-lg overflow-hidden bg-blue-50">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="w-full cursor-crosshair"
            />
          </div>

          {!gameStarted && gameState === 'playing' && (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Tap the canvas to aim and shoot bubbles. Clear all bubbles to win!
              </p>
              <Button
                onClick={handleStart}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Start Game
              </Button>
            </div>
          )}

          {gameState === 'gameOver' && (
            <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg mb-4">
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                🎉 You Won!
              </h2>
              <p className="text-gray-700 mb-4">
                Final Score: <span className="text-2xl font-bold text-indigo-600">{score}</span>
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleRestart}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  Play Again
                </Button>
                <Button
                  onClick={() => navigate('/games')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Games
                </Button>
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-gray-600">
            <p className="font-semibold mb-2">How to Play:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Move mouse/touch to aim the cannon</li>
              <li>Click or tap to shoot bubbles</li>
              <li>Destroy all bubbles to win</li>
              <li>Each bubble = 10 points</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
