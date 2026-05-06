import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function TicTacToe() {
  const recordResult = trpc.game.recordResult.useMutation();
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? "X" : "O";
    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
      recordResult.mutate({
        gameName: "Tic Tac Toe",
        won: gameWinner === "X",
        points: 20,
      });
    } else if (newBoard.every(sq => sq !== null)) {
      setGameOver(true);
    }

    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Tic Tac Toe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            {winner ? (
              <p className="text-2xl font-bold text-green-600">Player {winner} wins!</p>
            ) : gameOver ? (
              <p className="text-2xl font-bold">It's a draw!</p>
            ) : (
              <p className="text-xl">Player {isXNext ? "X" : "O"}'s turn</p>
            )}
          </div>

          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-2">
              {board.map((value, index) => (
                <button
                  key={index}
                  onClick={() => handleClick(index)}
                  className="w-20 h-20 bg-gray-200 text-3xl font-bold hover:bg-gray-300 rounded"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={resetGame}>New Game</Button>
            <Button onClick={() => recordResult.mutate({ gameName: "Tic Tac Toe", won: false, points: 0 })} variant="destructive">
              Quit
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
