import React, { useState, useCallback } from 'react';
// CSS must be imported by the exposed module itself so it is part of the
// federated module graph and gets injected when the host loads this app.
import './index.css';

type Operation = '+' | '-' | '×' | '÷' | null;

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: Operation;
  waitingForOperand: boolean;
}

const initialState: CalculatorState = {
  display: '0',
  previousValue: null,
  operation: null,
  waitingForOperand: false,
};

function calculate(left: number, right: number, op: Operation): number {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      if (right === 0) {
        return Infinity;
      }
      return left / right;
    default:
      return right;
  }
}

function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }

  // Limit precision to avoid floating point display issues
  const stringValue = String(value);
  if (stringValue.length > 12) {
    if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }
    return value.toPrecision(10);
  }

  return stringValue;
}

export default function CalculatorApp() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const { display, previousValue, operation } = state;

  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
        };
      }

      const newDisplay = prev.display === '0' ? digit : prev.display + digit;

      if (newDisplay.length > 12) {
        return prev;
      }

      return {
        ...prev,
        display: newDisplay,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }

      if (prev.display.includes('.')) {
        return prev;
      }

      return {
        ...prev,
        display: prev.display + '.',
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  const performOperation = useCallback((nextOperation: Operation) => {
    setState((prev) => {
      const inputValue = parseFloat(prev.display);

      // If there is already a pending operation, calculate it first
      if (prev.previousValue !== null && prev.operation && !prev.waitingForOperand) {
        const result = calculate(prev.previousValue, inputValue, prev.operation);
        return {
          display: formatDisplay(result),
          previousValue: result,
          operation: nextOperation,
          waitingForOperand: true,
        };
      }

      return {
        ...prev,
        previousValue: inputValue,
        operation: nextOperation,
        waitingForOperand: true,
      };
    });
  }, []);

  const handleEquals = useCallback(() => {
    setState((prev) => {
      if (prev.previousValue === null || prev.operation === null) {
        return prev;
      }

      const inputValue = parseFloat(prev.display);
      const result = calculate(prev.previousValue, inputValue, prev.operation);

      return {
        display: formatDisplay(result),
        previousValue: null,
        operation: null,
        waitingForOperand: true,
      };
    });
  }, []);

  const Button = ({
    children,
    onClick,
    variant = 'default',
    span = 1,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'default' | 'operation' | 'accent' | 'clear';
    span?: number;
  }) => {
    const baseClasses =
      'flex items-center justify-center text-xl font-medium rounded-lg transition-all duration-150 active:scale-95 select-none';

    const variantClasses = {
      default: 'bg-background-secondary hover:bg-background-tertiary text-foreground-primary',
      operation: 'bg-accent-secondary hover:bg-accent-primary text-foreground-primary',
      accent: 'bg-accent-primary hover:bg-accent-hover text-foreground-primary',
      clear: 'bg-error hover:bg-error-dark text-foreground-primary',
    };

    const spanClasses = span === 2 ? 'col-span-2' : '';

    return (
      <button
        className={`${baseClasses} ${variantClasses[variant]} ${spanClasses} h-14`}
        onClick={onClick}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-background-primary p-4">
      <div className="bg-background-secondary rounded-xl p-4 mb-4">
        <div className="text-right text-4xl font-mono text-foreground-primary truncate">
          {display}
        </div>
        {operation && (
          <div className="text-right text-sm text-foreground-secondary mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button variant="clear" onClick={clearAll}>C</Button>
        <Button onClick={() => setState(prev => ({
          ...prev,
          display: formatDisplay(parseFloat(prev.display) * -1)
        }))}>±</Button>
        <Button onClick={() => setState(prev => ({
          ...prev,
          display: formatDisplay(parseFloat(prev.display) / 100)
        }))}>%</Button>
        <Button variant="operation" onClick={() => performOperation('÷')}>÷</Button>

        <Button onClick={() => inputDigit('7')}>7</Button>
        <Button onClick={() => inputDigit('8')}>8</Button>
        <Button onClick={() => inputDigit('9')}>9</Button>
        <Button variant="operation" onClick={() => performOperation('×')}>×</Button>

        <Button onClick={() => inputDigit('4')}>4</Button>
        <Button onClick={() => inputDigit('5')}>5</Button>
        <Button onClick={() => inputDigit('6')}>6</Button>
        <Button variant="operation" onClick={() => performOperation('-')}>-</Button>

        <Button onClick={() => inputDigit('1')}>1</Button>
        <Button onClick={() => inputDigit('2')}>2</Button>
        <Button onClick={() => inputDigit('3')}>3</Button>
        <Button variant="operation" onClick={() => performOperation('+')}>+</Button>

        <Button span={2} onClick={() => inputDigit('0')}>0</Button>
        <Button onClick={inputDecimal}>.</Button>
        <Button variant="accent" onClick={handleEquals}>=</Button>
      </div>
    </div>
  );
}
