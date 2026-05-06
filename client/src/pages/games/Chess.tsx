import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const BOARD_SIZE = 8;

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "queen" | "king" | null;
type PieceColor = "white" | "black";

interface Piece {
  type: PieceType;
  color: PieceColor;
}

interface Square {
  piece: Piece | null;
  isSelected: boolean;
  isPossibleMove: boolean;
}

export default function ChessGame() {
  const { user } = useAuth();
  const recordResult = trpc.game.recordResult.useMutation();
  const [board, setBoard] = useState<Square[][]>([]);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PieceColor>("white");
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<PieceColor | null>(null);

  // Initialize board
  useEffect(() => {
    initializeBoard();
  }, []);

  const initializeBoard = () => {
    const newBoard: Square[][] = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
      newBoard[row] = [];
      for (let col = 0; col < BOARD_SIZE; col++) {
        let piece: Piece | null = null;

        // Set up pawns
        if (row === 1) {
          piece = { type: "pawn", color: "black" };
        } else if (row === 6) {
          piece = { type: "pawn", color: "white" };
        }

        // Set up back row
        if (row === 0) {
          const backRowPieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
          piece = { type: backRowPieces[col], color: "black" };
        } else if (row === 7) {
          const backRowPieces: PieceType[] = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"];
          piece = { type: backRowPieces[col], color: "white" };
        }

        newBoard[row][col] = {
          piece,
          isSelected: false,
          isPossibleMove: false,
        };
      }
    }

    setBoard(newBoard);
    setCurrentPlayer("white");
    setGameOver(false);
    setWinner(null);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameOver) return;

    const clickedSquare = board[row][col];

    // If clicking on a piece of current player
    if (clickedSquare.piece && clickedSquare.piece.color === currentPlayer) {
      setSelectedSquare([row, col]);
      // In a real game, calculate possible moves here
    } else if (selectedSquare && clickedSquare.isPossibleMove) {
      // Move piece
      const [fromRow, fromCol] = selectedSquare;
      const newBoard = board.map(r => [...r]);

      newBoard[row][col].piece = newBoard[fromRow][fromCol].piece;
      newBoard[fromRow][fromCol].piece = null;

      // Clear selection
      newBoard.forEach(r => r.forEach(sq => {
        sq.isSelected = false;
        sq.isPossibleMove = false;
      }));

      setBoard(newBoard);
      setSelectedSquare(null);
      setCurrentPlayer(currentPlayer === "white" ? "black" : "white");

      // Simple win condition (for demo)
      if (Math.random() > 0.95) {
        setGameOver(true);
        setWinner(currentPlayer);
        recordResult.mutate({
          gameName: "Chess",
          won: true,
          points: 50,
        });
      }
    }
  };

  const getPieceSymbol = (piece: Piece | null): string => {
    if (!piece) return "";
    const symbols: Record<string, string> = {
      pawn_white: "♙",
      pawn_black: "♟",
      rook_white: "♖",
      rook_black: "♜",
      knight_white: "♘",
      knight_black: "♞",
      bishop_white: "♗",
      bishop_black: "♝",
      queen_white: "♕",
      queen_black: "♛",
      king_white: "♔",
      king_black: "♚",
    };
    return symbols[`${piece.type}_${piece.color}`] || ""
  };

  const handleQuit = () => {
    recordResult.mutate({
      gameName: "Chess",
      won: false,
      points: 0,
    });
  };

  if (board.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Chess</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading game...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Chess - Strategy Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Current Player</p>
            <p className="text-2xl font-bold capitalize">{currentPlayer}</p>
          </div>

          {gameOver && winner && (
            <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {winner === "white" ? "White" : "Black"} wins! 🎉
              </p>
            </div>
          )}

          <div className="flex justify-center">
            <div className="inline-block border-4 border-gray-800">
              {board.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((square, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        className={`w-8 h-8 md:w-12 md:h-12 flex items-center justify-center text-lg md:text-2xl font-bold transition touch-manipulation ${
                          isLight ? "bg-amber-100" : "bg-amber-700"
                        } ${square.isSelected ? "ring-2 md:ring-4 ring-blue-500" : ""} ${
                          square.isPossibleMove ? "ring-1 md:ring-2 ring-green-500" : ""
                        } hover:opacity-80 active:opacity-60`}
                      >
                        {getPieceSymbol(square.piece)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-center">
            <Button onClick={initializeBoard} variant="outline">
              New Game
            </Button>
            <Button
              onClick={handleQuit}
              variant="destructive"
              disabled={recordResult.isPending}
            >
              {recordResult.isPending ? "Saving..." : "Quit Game"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
