import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

interface GameState {
  playerY: number;
  playerVelocity: number;
  score: number;
  gameActive: boolean;
  obstacles: Array<{ id: number; x: number; width: number; height: number }>;
  nextObstacleId: number;
}

export default function EndlessRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    playerY: 300,
    playerVelocity: 0,
    score: 0,
    gameActive: true,
    obstacles: [],
    nextObstacleId: 0,
  });
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const gameStateRef = useRef(gameState);
  const submitScoreMutation = trpc.game.recordResult.useMutation();

  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const PLAYER_SIZE = 30;
  const GRAVITY = 0.5;
  const JUMP_STRENGTH = -12;
  const GROUND_Y = CANVAS_HEIGHT - 50;

  // Handle touch/click to jump
  const handleJump = () => {
    if (gameStateRef.current.gameActive && gameStateRef.current.playerY >= GROUND_Y - 5) {
      gameStateRef.current.playerVelocity = JUMP_STRENGTH;
    }
  };

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      if (!gameStateRef.current.gameActive) return;

      // Update physics
      gameStateRef.current.playerVelocity += GRAVITY;
      gameStateRef.current.playerY += gameStateRef.current.playerVelocity;

      // Ground collision
      if (gameStateRef.current.playerY >= GROUND_Y) {
        gameStateRef.current.playerY = GROUND_Y;
        gameStateRef.current.playerVelocity = 0;
      }

      // Ceiling collision
      if (gameStateRef.current.playerY <= 0) {
        gameStateRef.current.playerY = 0;
        gameStateRef.current.playerVelocity = 0;
      }

      // Move obstacles
      gameStateRef.current.obstacles = gameStateRef.current.obstacles
        .map(obs => ({ ...obs, x: obs.x - 8 }))
        .filter(obs => obs.x > -obs.width);

      // Generate obstacles
      if (gameStateRef.current.obstacles.length === 0 || 
          gameStateRef.current.obstacles[gameStateRef.current.obstacles.length - 1].x < CANVAS_WIDTH - 200) {
        gameStateRef.current.obstacles.push({
          id: gameStateRef.current.nextObstacleId++,
          x: CANVAS_WIDTH,
          width: 40,
          height: 60,
        });
      }

      // Collision detection
      gameStateRef.current.obstacles.forEach(obs => {
        if (
          gameStateRef.current.playerY + PLAYER_SIZE > CANVAS_HEIGHT - 50 &&
          gameStateRef.current.playerY < CANVAS_HEIGHT - 50 + obs.height &&
          gameStateRef.current.playerY + PLAYER_SIZE > CANVAS_HEIGHT - 50 &&
          gameStateRef.current.playerY < CANVAS_HEIGHT - 50 + obs.height &&
          gameStateRef.current.playerY + PLAYER_SIZE > CANVAS_HEIGHT - 50 - obs.height
        ) {
          // Collision detected
          gameStateRef.current.gameActive = false;
          setGameOver(true);
          setFinalScore(gameStateRef.current.score);
        }
      });

      // Increase score
      gameStateRef.current.score += 1;

      // Update state
      setGameState({ ...gameStateRef.current });

      // Draw
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw ground
      ctx.fillStyle = '#8B7355';
      ctx.fillRect(0, CANVAS_HEIGHT - 50, CANVAS_WIDTH, 50);

      // Draw player
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(20, gameStateRef.current.playerY, PLAYER_SIZE, PLAYER_SIZE);

      // Draw obstacles
      ctx.fillStyle = '#333';
      gameStateRef.current.obstacles.forEach(obs => {
        ctx.fillRect(obs.x, CANVAS_HEIGHT - 50 - obs.height, obs.width, obs.height);
      });

      // Draw score
      ctx.fillStyle = '#000';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${Math.floor(gameStateRef.current.score / 10)}`, 10, 30);
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, []);

  const handleSubmitScore = async () => {
    try {
      await submitScoreMutation.mutateAsync({
        gameName: 'Endless Runner',
        points: Math.floor(finalScore / 10),
        won: true,
      });
      alert('Score submitted! Check leaderboard for points.');
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleNewGame = () => {
    setGameOver(false);
    setGameState({
      playerY: 300,
      playerVelocity: 0,
      score: 0,
      gameActive: true,
      obstacles: [],
      nextObstacleId: 0,
    });
    gameStateRef.current = {
      playerY: 300,
      playerVelocity: 0,
      score: 0,
      gameActive: true,
      obstacles: [],
      nextObstacleId: 0,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">Endless Runner</h1>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={handleJump}
            onTouchStart={handleJump}
            className="w-full cursor-pointer bg-sky-200"
          />
        </div>

        <div className="text-center mb-4">
          <p className="text-white text-lg">
            <strong>Score:</strong> {Math.floor(gameState.score / 10)}
          </p>
          <p className="text-gray-300 text-sm mt-2">
            Tap/Click to jump. Avoid obstacles!
          </p>
        </div>

        {gameOver && (
          <div className="bg-red-500 rounded-lg p-4 mb-4 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-xl mb-4">Final Score: {Math.floor(finalScore / 10)}</p>
            <div className="flex gap-2">
              <Button
                onClick={handleNewGame}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                New Game
              </Button>
              <Button
                onClick={handleSubmitScore}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Submit Score
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-600 hover:bg-gray-700"
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
