import React from "react";
import { CellState, CellValue } from "../../types";

import "./Button.scss";

interface ButtonProps {
  row: number;
  col: number;
  state: CellState;
  value: CellValue;
}

const Button: React.FC<ButtonProps> = ({ row, col, state, value }) => {
  const renderContent = (): React.ReactNode => {
    if (state === CellState.Visible) {
      if (value === CellValue.Bomb) {
        return (
          <span role="image" aria-label="bomb">
            💣
          </span>
        );
      } else if (value === CellValue.None) {
        return null;
      }

      return value;
    } else if (state === CellState.Flagged) {
      return (
        <span role="image" aria-label="flagged">
          ⛳️
        </span>
      );
    }
  };
  return (
    <div
      className={`Button ${
        state === CellState.Visible ? "visible" : ""
      } value-${value}`}
    >
      {renderContent()}
    </div>
  );
};

export default Button;
