
import React from 'react';
import Button from './Button';
import type { Operator, PlusMinusOperator } from '../types';

interface KeypadProps {
  onNumberClick: (num: string) => void;
  onDecimalClick: () => void;
  onOperatorClick: (operator: Extract<Operator, '*' | '/'>) => void;
  onPlusMinusClick: (operator: PlusMinusOperator) => void;
  onTotalClick: () => void;
  onClearClick: () => void;
  onClearAllClick: () => void;
}

const Keypad: React.FC<KeypadProps> = ({
  onNumberClick,
  onDecimalClick,
  onOperatorClick,
  onPlusMinusClick,
  onTotalClick,
  onClearClick,
  onClearAllClick,
}) => {
  const numBtnClasses = "bg-stone-400 hover:bg-stone-300 text-black border-stone-600";
  const opBtnClasses = "bg-sky-600 hover:bg-sky-500 text-white border-sky-800 text-3xl";
  
  return (
    <div className="grid grid-cols-4 gap-3">
      {/* C is All Clear (onClearAllClick), CE is Clear Entry (onClearClick) */}
      <Button onClick={onClearAllClick} className="bg-red-600 hover:bg-red-500 text-white border-red-800 text-xl">C</Button>
      <Button onClick={onClearClick} className="bg-amber-500 hover:bg-amber-400 text-white border-amber-700 text-xl">CE</Button>
      <Button onClick={() => onOperatorClick('/')} className={opBtnClasses}>/</Button>
      <Button onClick={() => onOperatorClick('*')} className={opBtnClasses}>x</Button>

      <Button onClick={() => onNumberClick('7')} className={numBtnClasses}>7</Button>
      <Button onClick={() => onNumberClick('8')} className={numBtnClasses}>8</Button>
      <Button onClick={() => onNumberClick('9')} className={numBtnClasses}>9</Button>
      <Button onClick={() => onPlusMinusClick('-')} className={opBtnClasses}>-</Button>

      <Button onClick={() => onNumberClick('4')} className={numBtnClasses}>4</Button>
      <Button onClick={() => onNumberClick('5')} className={numBtnClasses}>5</Button>
      <Button onClick={() => onNumberClick('6')} className={numBtnClasses}>6</Button>
      <Button onClick={() => onPlusMinusClick('+')} className={opBtnClasses}>+</Button>

      <Button onClick={() => onNumberClick('1')} className={numBtnClasses}>1</Button>
      <Button onClick={() => onNumberClick('2')} className={numBtnClasses}>2</Button>
      <Button onClick={() => onNumberClick('3')} className={numBtnClasses}>3</Button>
      <Button onClick={onTotalClick} className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-800 row-span-2 text-2xl font-bold">Total</Button>

      <Button onClick={() => onNumberClick('0')} className={`${numBtnClasses} col-span-2`}>0</Button>
      <Button onClick={onDecimalClick} className={numBtnClasses}>.</Button>
    </div>
  );
};

export default Keypad;
