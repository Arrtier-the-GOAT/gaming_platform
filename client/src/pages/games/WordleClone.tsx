import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';

const WORD_LIST = [
  'REACT', 'JAVASCRIPT', 'PYTHON', 'GAMING', 'PLATFORM', 'PUZZLE', 'WINNER',
  'PLAYER', 'SCORE', 'LEADERBOARD', 'PREMIUM', 'ENERGY', 'REWARD', 'ACHIEVEMENT',
  'MOBILE', 'DESKTOP', 'BROWSER', 'NETWORK', 'SERVER', 'CLIENT', 'DATABASE',
  'ALGORITHM', 'FUNCTION', 'VARIABLE', 'CONSTANT', 'BOOLEAN', 'INTEGER', 'STRING',
  'ARRAY', 'OBJECT', 'PROMISE', 'ASYNC', 'AWAIT', 'CALLBACK', 'COMPONENT',
];

interface GuessRow {
  word: string;
  colors: ('green' | 'yellow' | 'gray')[];
}

export default function WordleClone() {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<GuessRow[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const submitScoreMutation = trpc.game.recordResult.useMutation();

  // Initialize game
  useEffect(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
  }, []);

  const getColors = (guess: string, target: string): ('green' | 'yellow' | 'gray')[] => {
    const colors: ('green' | 'yellow' | 'gray')[] = [];
    const targetChars = target.split('');
    const guessChars = guess.split('');

    // First pass: mark greens
    guessChars.forEach((char, i) => {
      if (char === targetChars[i]) {
        colors[i] = 'green';
        targetChars[i] = '';
      }
    });

    // Second pass: mark yellows and grays
    guessChars.forEach((char, i) => {
      if (colors[i]) return;
      if (targetChars.includes(char)) {
        colors[i] = 'yellow';
        targetChars[targetChars.indexOf(char)] = '';
      } else {
        colors[i] = 'gray';
      }
    });

    return colors;
  };

  const handleSubmitGuess = () => {
    if (currentGuess.length !== 5) {
      alert('Word must be 5 letters!');
      return;
    }

    const guess = currentGuess.toUpperCase();
    const colors = getColors(guess, targetWord);
    const newGuesses = [...guesses, { word: guess, colors }];
    setGuesses(newGuesses);
    setAttempts(newGuesses.length);

    if (guess === targetWord) {
      setWon(true);
      setGameOver(true);
    } else if (newGuesses.length >= 6) {
      setGameOver(true);
    }

    setCurrentGuess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (gameOver) return;

    if (e.key === 'Enter') {
      handleSubmitGuess();
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    } else if (e.key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleSubmitScore = async () => {
    try {
      const points = won ? (7 - attempts) * 10 : 0;
      await submitScoreMutation.mutateAsync({
        gameName: 'Wordle Clone',
        points,
        won,
      });
      alert(`Score submitted! Points: ${points}`);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  const handleNewGame = () => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setAttempts(0);
  };

  const getColorClass = (color: 'green' | 'yellow' | 'gray') => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'gray':
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Wordle Clone</h1>
        <p className="text-gray-300 text-center mb-4">Guess the 5-letter word in 6 attempts!</p>

        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          {/* Previous guesses */}
          <div className="space-y-2 mb-4">
            {guesses.map((guess, idx) => (
              <div key={idx} className="flex gap-1 justify-center">
                {guess.word.split('').map((char, charIdx) => (
                  <div
                    key={charIdx}
                    className={`w-10 h-10 flex items-center justify-center font-bold text-sm rounded ${getColorClass(
                      guess.colors[charIdx]
                    )}`}
                  >
                    {char}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Current guess input */}
          {!gameOver && (
            <div className="mb-4">
              <input
                type="text"
                value={currentGuess}
                onChange={(e) => setCurrentGuess(e.target.value.toUpperCase().slice(0, 5))}
                onKeyPress={handleKeyPress}
                placeholder="Type a 5-letter word..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded text-center text-lg font-bold"
                maxLength={5}
                autoFocus
              />
              <p className="text-gray-600 text-sm mt-2 text-center">
                Attempts: {attempts}/6
              </p>
            </div>
          )}

          {/* Empty rows for remaining guesses */}
          {!gameOver &&
            Array.from({ length: 6 - guesses.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex gap-1 justify-center mb-2">
                {Array.from({ length: 5 }).map((_, charIdx) => (
                  <div
                    key={charIdx}
                    className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded"
                  />
                ))}
              </div>
            ))}
        </div>

        {gameOver && (
          <div className={`rounded-lg p-4 mb-4 text-white text-center ${won ? 'bg-green-500' : 'bg-red-500'}`}>
            <h2 className="text-2xl font-bold mb-2">
              {won ? '🎉 You Won!' : '❌ Game Over!'}
            </h2>
            <p className="text-lg mb-2">
              {won ? `Solved in ${attempts} attempts!` : `The word was: ${targetWord}`}
            </p>
            <p className="text-sm mb-4">
              Points: {won ? (7 - attempts) * 10 : 0}
            </p>
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

        {!gameOver && (
          <div className="flex gap-2 mb-4">
            <Button
              onClick={handleSubmitGuess}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Submit Guess
            </Button>
          </div>
        )}

        <Button
          onClick={() => window.history.back()}
          className="w-full bg-gray-600 hover:bg-gray-700"
        >
          Back
        </Button>
      </div>
    </div>
  );
}
