import React, { useState, useEffect, useCallback } from 'react';
import './Minesweeper.css';
import { useCrash } from './CrashContext';

interface Cell {
  row: number;
  col: number;
  isBomb: boolean;
  adjacentBombs: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

interface GameState {
  board: Cell[][];
  gameOver: boolean;
  gameWon: boolean;
  timer: number;
  isTimerRunning: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

const DIFFICULTY_SETTINGS = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 }
};

const Minesweeper: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    board: [],
    gameOver: false,
    gameWon: false,
    timer: 0,
    isTimerRunning: false,
    difficulty: 'easy'
  });
  const { crashApp } = useCrash();

  // Initialize board
  const initializeBoard = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    const { rows, cols } = DIFFICULTY_SETTINGS[difficulty];
    const board: Cell[][] = [];

    for (let i = 0; i < rows; i++) {
      board[i] = [];
      for (let j = 0; j < cols; j++) {
        board[i][j] = {
          row: i,
          col: j,
          isBomb: false,
          adjacentBombs: 0,
          isRevealed: false,
          isFlagged: false
        };
      }
    }
    return board;
  }, []);

  // Place mines randomly
  const placeMines = useCallback((board: Cell[][], difficulty: 'easy' | 'medium' | 'hard', firstRow: number, firstCol: number) => {
    const { mines } = DIFFICULTY_SETTINGS[difficulty];
    const rows = board.length;
    const cols = board[0].length;
    let minesPlaced = 0;

    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      // Don't place mine on first click or if already a mine
      if ((row !== firstRow || col !== firstCol) && !board[row][col].isBomb) {
        board[row][col].isBomb = true;
        minesPlaced++;
      }
    }

    // Calculate adjacent bombs
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!board[i][j].isBomb) {
          board[i][j].adjacentBombs = countAdjacentBombs(board, i, j);
        }
      }
    }
  }, []);

  // Count adjacent bombs
  const countAdjacentBombs = (board: Cell[][], row: number, col: number): number => {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const newRow = row + i;
        const newCol = col + j;
        if (newRow >= 0 && newRow < board.length && 
            newCol >= 0 && newCol < board[0].length && 
            board[newRow][newCol].isBomb) {
          count++;
        }
      }
    }
    return count;
  };

  // Reveal cell recursively
  const revealCell = useCallback((board: Cell[][], row: number, col: number) => {
    if (row < 0 || row >= board.length || col < 0 || col >= board[0].length) {
      return;
    }

    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) {
      return;
    }

    cell.isRevealed = true;

    if (cell.adjacentBombs === 0) {
      // Reveal adjacent cells recursively
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(board, row + i, col + j);
        }
      }
    }
  }, []);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number, isRightClick: boolean = false) => {
    if (gameState.gameOver || gameState.gameWon) return;

    setGameState(prevState => {
      const newBoard = prevState.board.map(row => row.map(cell => ({ ...cell })));
      const cell = newBoard[row][col];

      if (isRightClick) {
        // Toggle flag
        if (!cell.isRevealed) {
          cell.isFlagged = !cell.isFlagged;
        }
        return { ...prevState, board: newBoard };
      }

      // First click - place mines and reveal the clicked cell
      if (!prevState.isTimerRunning) {
        placeMines(newBoard, prevState.difficulty, row, col);
        // Reveal the clicked cell after placing mines
        revealCell(newBoard, row, col);
        return {
          ...prevState,
          board: newBoard,
          isTimerRunning: true
        };
      }

      // Regular click
      if (cell.isFlagged) return prevState;

      if (cell.isBomb) {
        setTimeout(() => crashApp(), 0);
        return prevState;
      }

      revealCell(newBoard, row, col);

      // Check for win
      const isWon = checkWin(newBoard);
      return {
        ...prevState,
        board: newBoard,
        gameWon: isWon,
        isTimerRunning: !isWon
      };
    });
  }, [gameState.gameOver, gameState.gameWon, gameState.isTimerRunning, placeMines, revealCell, crashApp]);

  // Check if game is won
  const checkWin = (board: Cell[][]): boolean => {
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        const cell = board[i][j];
        if (!cell.isBomb && !cell.isRevealed) {
          return false;
        }
      }
    }
    return true;
  };

  // Start new game
  const startNewGame = useCallback((difficulty: 'easy' | 'medium' | 'hard') => {
    const board = initializeBoard(difficulty);
    setGameState({
      board,
      gameOver: false,
      gameWon: false,
      timer: 0,
      isTimerRunning: false,
      difficulty
    });
  }, [initializeBoard]);

  // Timer effect
  useEffect(() => {
    let interval: number;
    if (gameState.isTimerRunning && !gameState.gameOver && !gameState.gameWon) {
      interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState.isTimerRunning, gameState.gameOver, gameState.gameWon]);

  // Initialize game on mount
  useEffect(() => {
    startNewGame('easy');
  }, [startNewGame]);

  // Handle right click
  const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    handleCellClick(row, col, true);
  }, [handleCellClick]);

  const renderCell = (cell: Cell) => {
    let content = '';
    let className = 'cell';

    if (cell.isFlagged) {
      content = '🚩';
      className += ' flagged';
    } else if (cell.isRevealed) {
      className += ' revealed';
      if (cell.isBomb) {
        content = '💣';
        className += ' bomb';
      } else if (cell.adjacentBombs > 0) {
        content = cell.adjacentBombs.toString();
        className += ` adjacent-${cell.adjacentBombs}`;
      } else {
        className += ' empty';
      }
    }

    return (
      <td
        key={`${cell.row}-${cell.col}`}
        className={className}
        onClick={() => handleCellClick(cell.row, cell.col)}
        onContextMenu={(e) => handleRightClick(e, cell.row, cell.col)}
      >
        {content}
      </td>
    );
  };

  return (
    <div className="minesweeper">
      <div className="game-header">
        <div className="difficulty-buttons">
          <button 
            className={gameState.difficulty === 'easy' ? 'active' : ''}
            onClick={() => startNewGame('easy')}
          >
            Easy
          </button>
          <button 
            className={gameState.difficulty === 'medium' ? 'active' : ''}
            onClick={() => startNewGame('medium')}
          >
            Medium
          </button>
          <button 
            className={gameState.difficulty === 'hard' ? 'active' : ''}
            onClick={() => startNewGame('hard')}
          >
            Hard
          </button>
        </div>
        <div className="game-info">
          <div className="timer">Time: {gameState.timer}</div>
          <div className="status">
            {gameState.gameOver ? 'Game Over!' : 
             gameState.gameWon ? 'You Win!' : 'Playing...'}
          </div>
        </div>
      </div>
      
      <div className="game-board">
        <table>
          <tbody>
            {gameState.board.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell) => renderCell(cell))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="game-instructions">
        <p>Left click to reveal cells. Right click to place flags.</p>
        <p>Numbers show how many mines are adjacent to that cell.</p>
      </div>
    </div>
  );
};

export default Minesweeper; 