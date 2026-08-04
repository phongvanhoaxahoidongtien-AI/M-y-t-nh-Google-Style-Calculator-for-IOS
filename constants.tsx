
import { ButtonConfig, ButtonType } from './types';

export const COLORS = {
  bg: '#202124',
  surface: '#3c4043',
  primary: '#8ab4f8', // Material Blue
  accent: '#aecbfa',
  text: '#e8eaed',
  operator: '#8ab4f8',
  science: '#4285f4',
  number: '#303134',
};

export const MAIN_BUTTONS: ButtonConfig[] = [
  { label: 'AC', value: 'AC', type: ButtonType.ACTION },
  { label: '(', value: '(', type: ButtonType.OPERATOR },
  { label: ')', value: ')', type: ButtonType.OPERATOR },
  { label: '÷', value: '/', type: ButtonType.OPERATOR },
  
  { label: '7', value: '7', type: ButtonType.NUMBER },
  { label: '8', value: '8', type: ButtonType.NUMBER },
  { label: '9', value: '9', type: ButtonType.NUMBER },
  { label: '×', value: '*', type: ButtonType.OPERATOR },
  
  { label: '4', value: '4', type: ButtonType.NUMBER },
  { label: '5', value: '5', type: ButtonType.NUMBER },
  { label: '6', value: '6', type: ButtonType.NUMBER },
  { label: '−', value: '-', type: ButtonType.OPERATOR },
  
  { label: '1', value: '1', type: ButtonType.NUMBER },
  { label: '2', value: '2', type: ButtonType.NUMBER },
  { label: '3', value: '3', type: ButtonType.NUMBER },
  { label: '+', value: '+', type: ButtonType.OPERATOR },
  
  { label: '0', value: '0', type: ButtonType.NUMBER },
  { label: '.', value: '.', type: ButtonType.NUMBER },
  { label: '⌫', value: 'DEL', type: ButtonType.ACTION },
  { label: '=', value: '=', type: ButtonType.EQUALS },
];

export const SCIENTIFIC_BUTTONS: ButtonConfig[] = [
  { label: 'INV', value: 'INV', type: ButtonType.SCIENTIFIC },
  { label: 'RAD', value: 'RAD', type: ButtonType.SCIENTIFIC },
  { label: 'sin', value: 'sin(', type: ButtonType.SCIENTIFIC },
  { label: 'cos', value: 'cos(', type: ButtonType.SCIENTIFIC },
  { label: 'tan', value: 'tan(', type: ButtonType.SCIENTIFIC },
  { label: '%', value: '%', type: ButtonType.OPERATOR },
  { label: 'ln', value: 'ln(', type: ButtonType.SCIENTIFIC },
  { label: 'log', value: 'log(', type: ButtonType.SCIENTIFIC },
  { label: '√', value: 'sqrt(', type: ButtonType.SCIENTIFIC },
  { label: 'π', value: 'pi', type: ButtonType.SCIENTIFIC },
  { label: 'e', value: 'e', type: ButtonType.SCIENTIFIC },
  { label: '^', value: '^', type: ButtonType.OPERATOR },
  { label: '!', value: '!', type: ButtonType.SCIENTIFIC },
];
