import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function FlappyBirdGame() {
  const { user } = useAuth();
  const recordResult = trpc.game.recordResult.useMutation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gameState = useRef({
    bird: { x: 50, y: 150, width: 20, height: 20, velocity: 0 },
    pipes: [] as Array<{ x: number; y: number; width: number; height: number }>,
    score: 0,
    gameOver: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      if (!gameActive || gameOver) return;

      const state = gameState.current;
      const bird = state.bird;

      // Apply gravity
      bird.velocity += 0.6;
      bird.y += bird.velocity;

      // Draw background
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw bird
      ctx.fillStyle = "#FFD700";
      ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

      // Generate pipes
      if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < canvas.width - 200) {
        const pipeHeight = Math.random() * 100 + 50;
        state.pipes.push({
          x: canvas.width,
          y: 0,
          width: 50,
          height: pipeHeight,
        });
        state.pipes.push({
          x: canvas.width,
          y: pipeHeight + 100,
          width: 50,
          height: canvas.height - pipeHeight - 100,
        });
      }

      // Move and draw pipes
      state.pipes = state.pipes.filter((pipe) => pipe.x > -50);
      state.pipes.forEach((pipe) => {
        pipe.x -= 5;
        ctx.fillStyle = "#228B22";
        ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

        // Check collision
        if (
          bird.x < pipe.x + pipe.width &&
          bird.x + bird.width > pipe.x &&
          bird.y < pipe.y + pipe.height &&
          bird.y + bird.height > pipe.y
        ) {
          setGameOver(true);
          recordResult.mutate({ gameName: "Flappy Bird", won: false, points: 0 });
        }
      });

      // Check ground collision
      if (bird.y + bird.height > canvas.height) {
        setGameOver(true);
          recordResult.mutate({ gameName: "Flappy Bird", won: false, points: 0 });
      }

      // Score
      state.pipes.forEach((pipe) => {
        if (pipe.x === bird.x && pipe.y === 0) {
          state.score += 1;
          setScore(state.score);
        }
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameActive, gameOver, recordResult]);

  const handleJump = () => {
    if (!gameActive || gameOver) {
      setGameActive(true);
      setGameOver(false);
      setScore(0);
      gameState.current = {
        bird: { x: 50, y: 150, width: 20, height: 20, velocity: 0 },
        pipes: [],
        score: 0,
        gameOver: false,
      };
      return;
    }
    gameState.current.bird.velocity = -12;
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-2xl">Flappy Bird</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm sm:text-base">Score: {score}</p>
          </div>

          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={400}
              className="border-2 border-gray-800 w-full max-w-xs sm:max-w-sm"
              onClick={handleJump}
              onTouchStart={handleJump}
            />
          </div>

          {gameOver && (
            <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded">
              <p className="text-lg font-bold text-red-700 dark:text-red-300">Game Over!</p>
              <p className="text-sm text-red-600 dark:text-red-400">Final Score: {score}</p>
            </div>
          )}

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              onClick={handleJump}
              className="w-full sm:w-auto"
            >
              {gameActive && !gameOver ? "Jump" : "Start Game"}
            </Button>
            <Button
              onClick={() => {
                setGameActive(false);
                setGameOver(false);
                setScore(0);
              }}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Quit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
