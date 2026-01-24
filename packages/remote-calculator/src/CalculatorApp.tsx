import React, { useState, useCallback, useEffect } from 'react';

/**
 * Calculator App Component
 * 
 * A simple calculator with basic arithmetic operations.
 * Designed to be consumed by the host app via Module Federation,
 * but can also run standalone for development/testing.
 */

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

/**
 * Perform arithmetic calculation
 */
function calculate(left: number, right: number, op: Operation): number {
  switch (op) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '×':
      return left * right;
    case '÷':
      // Handle division by zero gracefully
      if (right === 0) {
        return Infinity;
      }
      return left / right;
    default:
      return right;
  }
}

/**
 * Format number for display
 * Handles very large numbers, infinity, and precision
 */
function formatDisplay(value: number): string {
  if (!Number.isFinite(value)) {
    return 'Error';
  }
  
  // Limit precision to avoid floating point display issues
  const stringValue = String(value);
  if (stringValue.length > 12) {
    // Use exponential notation for very large/small numbers
    if (Math.abs(value) >= 1e12 || (Math.abs(value) < 1e-6 && value !== 0)) {
      return value.toExponential(6);
    }
    // Otherwise truncate decimal places
    return value.toPrecision(10);
  }
  
  return stringValue;
}

export default function CalculatorApp() {
  const [state, setState] = useState<CalculatorState>(initialState);
  const { display, previousValue, operation } = state;

  // Debug: Verify React singleton (shared dependency via Module Federation)
  useEffect(() => {
    const hostReact = (window as unknown as { HOST_REACT?: typeof React }).HOST_REACT;
    
    if (!hostReact) {
      console.warn('[Shared Dependency Check] HOST_REACT not found. Running standalone?');
      return;
    }

    const remoteReact = React;
    const instanceEqual = hostReact === remoteReact;
    // Compare internal core function - more accurate even if bundler wraps objects in Proxy
    const createElementEqual = hostReact.createElement === remoteReact.createElement;

    console.group('🔍 Module Federation Debug');
    console.log('Host React Version:', hostReact.version);
    console.log('Remote React Version:', remoteReact.version);
    console.log(
      `%cInstance Equal: ${instanceEqual}`,
      instanceEqual ? 'color: green; font-weight: bold;' : 'color: orange;'
    );
    console.log(
      `%ccreateElement Equal: ${createElementEqual}`,
      createElementEqual ? 'color: green; font-weight: bold;' : 'color: red; font-weight: bold;'
    );
    
    if (createElementEqual) {
      console.log('✅ Shared dependency working - same React core functions');
    } else {
      console.warn('❌ Duplicate React instances - createElement differs!');
    }
    console.groupEnd();
  }, []);

  /**
   * Handle digit input (0-9)
   */
  const inputDigit = useCallback((digit: string) => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: digit,
          waitingForOperand: false,
        };
      }
      
      // Replace initial 0, but allow "0." pattern
      const newDisplay = prev.display === '0' ? digit : prev.display + digit;
      
      // Limit display length
      if (newDisplay.length > 12) {
        return prev;
      }
      
      return {
        ...prev,
        display: newDisplay,
      };
    });
  }, []);

  /**
   * Handle decimal point input
   */
  const inputDecimal = useCallback(() => {
    setState((prev) => {
      if (prev.waitingForOperand) {
        return {
          ...prev,
          display: '0.',
          waitingForOperand: false,
        };
      }
      
      // Don't add another decimal if one exists
      if (prev.display.includes('.')) {
        return prev;
      }
      
      return {
        ...prev,
        display: prev.display + '.',
      };
    });
  }, []);

  /**
   * Clear all state (C button)
   */
  const clearAll = useCallback(() => {
    setState(initialState);
  }, []);

  /**
   * Handle operation buttons (+, -, ×, ÷)
   */
  const performOperation = useCallback((nextOperation: Operation) => {
    setState((prev) => {
      const inputValue = parseFloat(prev.display);
      
      // If we already have a pending operation, calculate first
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

  /**
   * Handle equals button
   */
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

  /**
   * Button component for consistent styling
   */
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
      {/* Display */}
      <div className="bg-background-secondary rounded-xl p-4 mb-4">
        <div className="text-right text-4xl font-mono text-foreground-primary truncate">
          {display}
        </div>
        {/* Show pending operation indicator */}
        {operation && (
          <div className="text-right text-sm text-foreground-secondary mt-1">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Button Grid */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* Row 1: C, ±, %, ÷ */}
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

        {/* Row 2: 7, 8, 9, × */}
        <Button onClick={() => inputDigit('7')}>7</Button>
        <Button onClick={() => inputDigit('8')}>8</Button>
        <Button onClick={() => inputDigit('9')}>9</Button>
        <Button variant="operation" onClick={() => performOperation('×')}>×</Button>

        {/* Row 3: 4, 5, 6, - */}
        <Button onClick={() => inputDigit('4')}>4</Button>
        <Button onClick={() => inputDigit('5')}>5</Button>
        <Button onClick={() => inputDigit('6')}>6</Button>
        <Button variant="operation" onClick={() => performOperation('-')}>-</Button>

        {/* Row 4: 1, 2, 3, + */}
        <Button onClick={() => inputDigit('1')}>1</Button>
        <Button onClick={() => inputDigit('2')}>2</Button>
        <Button onClick={() => inputDigit('3')}>3</Button>
        <Button variant="operation" onClick={() => performOperation('+')}>+</Button>

        {/* Row 5: 0, ., = */}
        <Button span={2} onClick={() => inputDigit('0')}>0</Button>
        <Button onClick={inputDecimal}>.</Button>
        <Button variant="accent" onClick={handleEquals}>=</Button>
      </div>
    </div>
  );
}
