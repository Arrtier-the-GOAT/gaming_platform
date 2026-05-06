import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

const GRID_SIZE = 8;
const CANDY_TYPES = ['🍬', '🍭', '🍫', '🍊', '🍋', '🍓'];
const MATCH_SIZE = 3;

interface Candy {
  id: string;
  type: string;
  row: number;
  col: number;
  matched: boolean;
}

export default function CandyCrush() {
  const [, setLocation] = useLocation();
  const [grid, setGrid] = useState<Candy[][]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [selectedCandy, setSelectedCandy] = useState<{ row: number; col: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize grid with random candies
  const initializeGrid = useCallback(() => {
    const newGrid: Candy[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      newGrid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = {
          id: `${row}-${col}`,
          type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
          row,
          col,
          matched: false,
        };
      }
    }
    setGrid(newGrid);
  }, []);

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Check for matches
  const findMatches = (currentGrid: Candy[][]): Set<string> => {
    const matched = new Set<string>();

    // Check horizontal matches
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - MATCH_SIZE + 1; col++) {
        const candyType = currentGrid[row][col].type;
        if (
          candyType &&
          currentGrid[row][col + 1].type === candyType &&
          currentGrid[row][col + 2].type === candyType
        ) {
          matched.add(`${row}-${col}`);
          matched.add(`${row}-${col + 1}`);
          matched.add(`${row}-${col + 2}`);
        }
      }
    }

    // Check vertical matches
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - MATCH_SIZE + 1; row++) {
        const candyType = currentGrid[row][col].type;
        if (
          candyType &&
          currentGrid[row + 1][col].type === candyType &&
          currentGrid[row + 2][col].type === candyType
        ) {
          matched.add(`${row}-${col}`);
          matched.add(`${row + 1}-${col}`);
          matched.add(`${row + 2}-${col}`);
        }
      }
    }

    return matched;
  };

  // Process matches and gravity
  const processMatches = async (currentGrid: Candy[][]) => {
    let newGrid = currentGrid.map(row => [...row]);
    let totalScore = 0;

    while (true) {
      const matched = findMatches(newGrid);
      if (matched.size === 0) break;

      totalScore += matched.size * 10;

      // Remove matched candies
      matched.forEach(id => {
        const [row, col] = id.split('-').map(Number);
        newGrid[row][col] = { ...newGrid[row][col], type: '' };
      });

      // Apply gravity
      for (let col = 0; col < GRID_SIZE; col++) {
        const candies = [];
        for (let row = 0; row < GRID_SIZE; row++) {
          if (newGrid[row][col].type) {
            candies.push(newGrid[row][col]);
          }
        }
        for (let row = 0; row < GRID_SIZE; row++) {
          if (row < GRID_SIZE - candies.length) {
            newGrid[row][col] = { ...newGrid[row][col], type: '' };
          } else {
            newGrid[row][col] = candies[row - (GRID_SIZE - candies.length)];
          }
        }
      }

      // Fill empty spaces with new candies
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (!newGrid[row][col].type) {
            newGrid[row][col] = {
              id: `${row}-${col}-${Date.now()}`,
              type: CANDY_TYPES[Math.floor(Math.random() * CANDY_TYPES.length)],
              row,
              col,
              matched: false,
            };
          }
        }
      }

      setGrid(newGrid);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setScore(prev => prev + totalScore);
    return newGrid;
  };

  // Swap candies
  const swapCandies = async (row1: number, col1: number, row2: number, col2: number) => {
    if (isProcessing || moves <= 0) return;

    setIsProcessing(true);
    const newGrid = grid.map(row => [...row]);
    
    // Swap
    [newGrid[row1][col1], newGrid[row2][col2]] = [newGrid[row2][col2], newGrid[row1][col1]];
    
    setGrid(newGrid);
    setMoves(prev => prev - 1);

    // Process matches
    await processMatches(newGrid);
    setSelectedCandy(null);
    setIsProcessing(false);
  };

  // Handle candy click
  const handleCandyClick = (row: number, col: number) => {
    if (isProcessing || gameOver) return;

    if (!selectedCandy) {
      setSelectedCandy({ row, col });
    } else {
      const { row: selectedRow, col: selectedCol } = selectedCandy;
      const distance = Math.abs(row - selectedRow) + Math.abs(col - selectedCol);

      if (distance === 1) {
        swapCandies(selectedRow, selectedCol, row, col);
      } else {
        setSelectedCandy({ row, col });
      }
    }
  };

  // Check game over
  useEffect(() => {
    if (moves === 0 && !gameOver) {
      setGameOver(true);
    }
  }, [moves, gameOver]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 p-4 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          Candy Crush
        </h1>
        
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 font-semibold">Score</div>
            <div className="text-3xl font-bold text-pink-600">{score}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 font-semibold">Moves</div>
            <div className="text-3xl font-bold text-purple-600">{moves}</div>
          </div>
        </div>

        {/* Game Grid */}
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-2 mb-6 inline-block w-full">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}>
            {grid.map((row, rowIdx) =>
              row.map((candy, colIdx) => (
                <button
                  key={candy.id}
                  onClick={() => handleCandyClick(rowIdx, colIdx)}
                  disabled={isProcessing || gameOver}
                  className={`
                    aspect-square text-2xl rounded-lg font-bold transition-all duration-200
                    ${selectedCandy?.row === rowIdx && selectedCandy?.col === colIdx
                      ? 'ring-4 ring-yellow-400 scale-110 bg-yellow-200'
                      : 'bg-white hover:bg-yellow-50 active:scale-95'
                    }
                    ${!candy.type ? 'opacity-50' : ''}
                    disabled:opacity-50
                  `}
                >
                  {candy.type}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game Over */}
        {gameOver && (
          <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg mb-4">Final Score: {score}</p>
            <p className="text-sm opacity-90">Great job! Try again to beat your score.</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => {
              initializeGrid();
              setScore(0);
              setMoves(30);
              setGameOver(false);
              setSelectedCandy(null);
            }}
            className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg"
          >
            {gameOver ? 'Play Again' : 'New Game'}
          </Button>
          <Button
            onClick={() => setLocation('/games')}
            variant="outline"
            className="flex-1"
          >
            Back
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">How to Play:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Click on a candy to select it</li>
            <li>Click an adjacent candy to swap</li>
            <li>Match 3 or more candies in a row</li>
            <li>You have 30 moves to get the highest score!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
