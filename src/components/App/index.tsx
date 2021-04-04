import React, { useEffect, useState } from "react";
import { MAX_COLS, MAX_ROWS, NO_OF_BOMBS } from "../../constants";
import { Cell, CellState, CellValue, Face } from "../../types";
import { generateCells, openMultipleCells } from "../../utils";
import Button from "../Button";
import NumberDisplay from "../NumberDisplay";

import "./App.scss";

const App: React.FC = () => {
  const [cells, setCells] = useState<Cell[][]>(generateCells());
  const [face, setFace] = useState<Face>(Face.Smile);
  const [time, setTime] = useState<number>(0);
  const [live, setLive] = useState<boolean>(false);
  const [bombCounter, setBombCounter] = useState<number>(NO_OF_BOMBS);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseDown = (): void => {
      setFace(Face.Oh);
    };
    const handleMouseUp = (): void => {
      setFace(Face.Smile);
    };
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (live && time < 999) {
      const timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    }
  }, [live]);

  useEffect(() => {
    if (gameOver) {
      setFace(Face.Lost);
      setLive(false);
    }
  }, [gameOver]);

  useEffect(() => {
    setLive(false);
    setFace(Face.Won);
  }, [hasWon]);

  const handleCellClick = (rowParam: number, colParam: number) => (): void => {
    // start the game
    let newCells = cells.slice();

    if (!live) {
      let isNone = newCells[rowParam][colParam].value !== CellValue.None;
      while (isNone) {
        newCells = generateCells();
        if (newCells[rowParam][colParam].value === CellValue.None) {
          isNone = false;
          break;
        }
      }
      setLive(true);
    }

    const currentCell = newCells[rowParam][colParam];

    if ([CellState.Flagged, CellState.Visible].includes(currentCell.state)) {
      return;
    }

    if (currentCell.value === CellValue.Bomb) {
      setGameOver(true);
      newCells[rowParam][colParam].red = true;
      newCells = showAllBombs();
      setCells(newCells);
      return;
    } else if (currentCell.value === CellValue.None) {
      newCells = openMultipleCells(newCells, rowParam, colParam);
    } else {
      newCells[rowParam][colParam].state = CellState.Visible;
    }

    // Check if we have won
    let safeOpenCellsExists = false;
    for (let row = 0; row < MAX_ROWS; row++) {
      for (let col = 0; col < MAX_COLS; col++) {
        const currentCell = newCells[row][col];
        if (
          currentCell.value !== CellValue.Bomb &&
          currentCell.state === CellState.Open
        ) {
          safeOpenCellsExists = true;
          break;
        }
      }
    }

    if (!safeOpenCellsExists) {
      newCells = newCells.map((row) =>
        row.map((cell) => {
          if (cell.value === CellValue.Bomb) {
            return {
              ...cell,
              state: CellState.Flagged,
            };
          }
          return cell;
        })
      );
      setHasWon(true);
    }

    setCells(newCells);
  };

  const handleCellContext = (rowParam: number, colParam: number) => (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ): void => {
    e.preventDefault();

    if (!live) {
      return;
    }

    const currentCells = cells.slice();
    const currentCell = cells[rowParam][colParam];

    if (currentCell.state === CellState.Visible) {
      return;
    } else if (currentCell.state === CellState.Open) {
      currentCells[rowParam][colParam].state = CellState.Flagged;
      setCells(currentCells);
      setBombCounter(bombCounter - 1);
    } else if (currentCell.state === CellState.Flagged) {
      currentCells[rowParam][colParam].state = CellState.Open;
      setCells(currentCells);
      setBombCounter(bombCounter + 1);
    }
  };

  const handleFaceClick = (): void => {
    setLive(false);
    setTime(0);
    setBombCounter(NO_OF_BOMBS);
    setCells(generateCells());
    setGameOver(false);
    setHasWon(false);
  };

  const showAllBombs = (): Cell[][] => {
    const currentCells = cells.slice();
    return currentCells.map((row) =>
      row.map((cell) => {
        if (cell.value === CellValue.Bomb) {
          return {
            ...cell,
            state: CellState.Visible,
          };
        }
        return cell;
      })
    );
  };

  const renderCells = (): React.ReactNode => {
    return cells.map((row, rowIndex) =>
      row.map((cell, colIndex) => (
        <Button
          key={`${rowIndex}-${colIndex}`}
          state={cell.state}
          value={cell.value}
          row={rowIndex}
          col={colIndex}
          onClick={handleCellClick}
          onContext={handleCellContext}
          red={cell.red}
        />
      ))
    );
  };

  return (
    <div className="App">
      <div className="Header">
        <NumberDisplay value={bombCounter} />
        <div className="Face" onClick={handleFaceClick}>
          <span role="image" aria-label="face">
            {face}
          </span>
        </div>
        <NumberDisplay value={time} />
      </div>
      <div className="Body">{renderCells()}</div>
    </div>
  );
};

export default App;
