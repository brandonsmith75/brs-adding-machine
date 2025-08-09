
import React, { useState, useCallback, useEffect } from 'react';
import TapeDisplay from './components/TapeDisplay';
import Keypad from './components/Keypad';
import type { Operator, PlusMinusOperator } from './types';

const calculate = (val1: number, op: Operator, val2: number): number => {
  switch (op) {
    case '*':
      return val1 * val2;
    case '/':
      return val2 === 0 ? NaN : val1 / val2;
    // + and - are handled by the runningTotal logic
    default:
      return val2;
  }
};

// Helper function for consistent number formatting with parentheses for negatives
const formatWithParens = (num: number, options: Intl.NumberFormatOptions): string => {
  if (num < 0) {
    // Format the absolute value and wrap it in parentheses
    return `(${Math.abs(num).toLocaleString('en-US', options)})`;
  }
  return num.toLocaleString('en-US', options);
};


const App: React.FC = () => {
  const [currentValue, setCurrentValue] = useState<string>('0');
  const [tape, setTape] = useState<string[]>([]);
  const [runningTotal, setRunningTotal] = useState<number>(0);
  const [operand, setOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<Extract<Operator, '*' | '/'> | null>(null);
  const [isNewEntry, setIsNewEntry] = useState<boolean>(true);

  const formatNumberForTape = (num: number): string => {
    // Allow up to 10 decimal places on the tape, and use parens for negatives.
    return formatWithParens(num, { maximumFractionDigits: 10 });
  };

  const handleClearAllClick = useCallback(() => {
    setCurrentValue('0');
    setOperand(null);
    setOperator(null);
    setRunningTotal(0);
    setTape([]);
    setIsNewEntry(true);
  }, []);
  
  const handleClearClick = useCallback(() => {
    if (currentValue === 'Error') {
      handleClearAllClick();
      return;
    }
    setCurrentValue('0');
    setIsNewEntry(true);
  }, [currentValue, handleClearAllClick]);

  const handleNumberClick = useCallback((num: string) => {
    if (currentValue === 'Error') return;
    if (currentValue.length >= 12 && !isNewEntry) return;

    if (isNewEntry) {
      setCurrentValue(num);
      setIsNewEntry(false);
    } else {
      setCurrentValue(prev => (prev === '0' ? num : prev + num));
    }
  }, [currentValue, isNewEntry]);

  const handleDecimalClick = useCallback(() => {
    if (currentValue === 'Error') return;
    if (isNewEntry) {
      setCurrentValue('0.');
      setIsNewEntry(false);
    } else if (!currentValue.includes('.')) {
      setCurrentValue(prev => prev + '.');
    }
  }, [currentValue, isNewEntry]);

  // Handles only * and /
  const handleOperatorClick = useCallback((op: Extract<Operator, '*' | '/'>) => {
    if (currentValue === 'Error') return;

    const num = parseFloat(currentValue);
    if (isNaN(num)) return;

    setTape(prev => [...prev, `${formatNumberForTape(num)} ${op}`]);

    if (operand !== null && operator !== null && !isNewEntry) {
      const result = calculate(operand, operator, num);
      if (isNaN(result)) {
        setCurrentValue('Error');
        setTape(prev => [...prev, '──────────', 'Error']);
        setOperand(null);
        setOperator(null);
        setIsNewEntry(true);
        return;
      }
      setOperand(result);
      setCurrentValue(result.toString());
    } else {
      setOperand(num);
    }

    setOperator(op);
    setIsNewEntry(true);
  }, [currentValue, operand, operator, isNewEntry]);

  // Handles only + and -
  const handlePlusMinusClick = useCallback((op: PlusMinusOperator) => {
    if (currentValue === 'Error') return;
    let num = parseFloat(currentValue);
    if (isNaN(num)) return;

    // If there is a pending multiplication/division, resolve it first.
    if (operand !== null && operator !== null && !isNewEntry) {
      const result = calculate(operand, operator, num);
      if (isNaN(result)) {
        setCurrentValue('Error');
        setTape(prev => [...prev, '──────────', 'Error']);
        setOperand(null);
        setOperator(null);
        setIsNewEntry(true);
        return;
      }
      num = result; // The result of the mult/div is what we add/subtract
      setOperand(null);
      setOperator(null);
    }

    const newTotal = op === '+' ? runningTotal + num : runningTotal - num;
    setRunningTotal(newTotal);
    setTape(prev => [...prev, `${formatNumberForTape(num)} ${op}`]);
    setCurrentValue(newTotal.toString()); // Display running total
    setIsNewEntry(true);
  }, [currentValue, runningTotal, operand, operator, isNewEntry]);

  const handleTotalClick = useCallback(() => {
    if (currentValue === 'Error') return;

    let num = parseFloat(currentValue);
    if (isNaN(num) || isNewEntry) num = 0; // If display is from a previous op, treat as 0

    let finalValue = num;
    if (operand !== null && operator !== null) {
      const result = calculate(operand, operator, num);
      if (isNaN(result)) {
        setCurrentValue('Error');
        setTape(prev => [ ...prev, '──────────', 'Error']);
        setOperand(null);
        setOperator(null);
        setRunningTotal(0);
        setIsNewEntry(true);
        return;
      }
      finalValue = result;
    }
    
    // The final total is the running total plus the last value (which may be a result of a mult/div)
    const grandTotal = runningTotal + finalValue;

    setTape(prev => [
      ...prev,
      ...(num !== 0 || operand !== null ? [`${formatNumberForTape(num)}`] : []),
      '──────────',
      `${formatNumberForTape(grandTotal)} T`
    ]);

    setCurrentValue(grandTotal.toString());
    // Reset for next calculation chain
    setRunningTotal(0);
    setOperand(null);
    setOperator(null);
    setIsNewEntry(true);
  }, [currentValue, runningTotal, operand, operator, isNewEntry]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
       if (currentValue === 'Error' && !['Escape', 'Delete', 'Backspace'].includes(event.key)) {
        return;
      }
      if (event.key >= '0' && event.key <= '9') {
        event.preventDefault();
        handleNumberClick(event.key);
        return;
      }

      switch (event.key) {
        case '.':
          event.preventDefault();
          handleDecimalClick();
          break;
        case '+':
          event.preventDefault();
          handlePlusMinusClick('+');
          break;
        case '-':
          event.preventDefault();
          handlePlusMinusClick('-');
          break;
        case '*':
          event.preventDefault();
          handleOperatorClick('*');
          break;
        case '/':
          event.preventDefault();
          handleOperatorClick('/');
          break;
        case 'Enter':
        case '=':
          event.preventDefault();
          handleTotalClick();
          break;
        case 'Escape':
          event.preventDefault();
          handleClearAllClick();
          break;
        case 'Backspace':
        case 'Delete':
          event.preventDefault();
          handleClearClick();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    handleNumberClick,
    handleDecimalClick,
    handleOperatorClick,
    handlePlusMinusClick,
    handleTotalClick,
    handleClearClick,
    handleClearAllClick,
    currentValue,
  ]);

  const displayValue = () => {
      if (currentValue === 'Error') {
          return 'Error';
      }
      const num = parseFloat(currentValue);
       if (isNaN(num)) {
          return currentValue; // Handles cases like '0.'
      }
      
      const options: Intl.NumberFormatOptions = { maximumFractionDigits: 10 };
      // Preserve original logic for minimum digits on display
      if (currentValue.includes('.')) {
        options.minimumFractionDigits = 1;
      }
      
      // Use the consistent formatter for display
      return formatWithParens(num, options);
  }

  return (
    <div>
      <div>
        <h1 className="text-center text-2xl text-neutral-700 select-none font-cursive text-engraved">
          BRS Adding Machine
        </h1>
        <TapeDisplay tape={tape} />
        <div className="bg-black/60 text-emerald-400 font-mono text-5xl p-4 rounded-md text-right overflow-x-auto break-all shadow-[inset_0_4px_8px_rgba(0,0,0,0.7)] border-2 border-black">
          {displayValue()}
        </div>
        <Keypad
          onNumberClick={handleNumberClick}
          onDecimalClick={handleDecimalClick}
          onOperatorClick={handleOperatorClick}
          onPlusMinusClick={handlePlusMinusClick}
          onTotalClick={handleTotalClick}
          onClearClick={handleClearClick}
          onClearAllClick={handleClearAllClick}
        />
      </div>
    </div>
  );
};

export default App;
