
export type CalculatorState = {
  expression: string;
  result: string;
  isScientific: boolean;
  history: HistoryItem[];
  showHistory: boolean;
};

export type HistoryItem = {
  expression: string;
  result: string;
  timestamp: number;
};

export enum ButtonType {
  NUMBER = 'NUMBER',
  OPERATOR = 'OPERATOR',
  FUNCTION = 'FUNCTION',
  ACTION = 'ACTION',
  SCIENTIFIC = 'SCIENTIFIC',
  EQUALS = 'EQUALS'
}

export interface ButtonConfig {
  label: string;
  value: string;
  type: ButtonType;
  span?: number;
}
