import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as math from 'mathjs';
import { MAIN_BUTTONS, SCIENTIFIC_BUTTONS, COLORS } from './constants';
import { ButtonType, CalculatorState, HistoryItem } from './types';
import { HistoryItemCard } from './components/HistoryItemCard';

const App: React.FC = () => {
  const [state, setState] = useState<CalculatorState>({
    expression: '',
    result: '',
    isScientific: false,
    history: [],
    showHistory: false,
  });

  const [editingSource, setEditingSource] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('calc_history');
    if (saved) {
      try {
        setState(prev => ({ ...prev, history: JSON.parse(saved) }));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('calc_history', JSON.stringify(state.history));
  }, [state.history]);

  const formatForDisplay = (expr: string): string => {
    return expr
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/-/g, '−');
  };

  const calculateResult = (expr: string): string => {
    if (!expr || !expr.trim()) return '';
    try {
      // Replace display symbols with mathjs friendly ones
      let cleaned = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/√/g, 'sqrt')
        .replace(/%/g, '/100');
      
      const res = math.evaluate(cleaned);
      if (typeof res === 'number') {
        if (isNaN(res) || !isFinite(res)) return 'Lỗi';
        return Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
      }
      return res.toString();
    } catch {
      return '';
    }
  };

  const handleInput = useCallback((val: string) => {
    setState(prev => {
      let expr = prev.expression;
      
      let start = expr.length;
      let end = expr.length;
      if (inputRef.current) {
        start = inputRef.current.selectionStart ?? expr.length;
        end = inputRef.current.selectionEnd ?? expr.length;
      }

      let newExpr = expr;
      let newCursorPos = start;

      if (val === 'AC') {
        newExpr = '';
        newCursorPos = 0;
        setEditingSource(null);
      } else if (val === 'DEL') {
        if (start !== end) {
          newExpr = expr.slice(0, start) + expr.slice(end);
          newCursorPos = start;
        } else if (start > 0) {
          newExpr = expr.slice(0, start - 1) + expr.slice(start);
          newCursorPos = start - 1;
        }
      } else if (val === '=') {
        const finalResult = calculateResult(newExpr);
        if (finalResult && finalResult !== 'Lỗi' && newExpr.trim() !== finalResult) {
          const newItem: HistoryItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            expression: formatForDisplay(newExpr),
            result: finalResult,
            timestamp: Date.now()
          };
          
          setEditingSource(null);

          return {
            ...prev,
            expression: finalResult,
            result: '',
            history: [newItem, ...prev.history].slice(0, 50)
          };
        }
        return prev;
      } else {
        let insertVal = val;
        if (val === '*') insertVal = '×';
        if (val === '/') insertVal = '÷';
        if (val === '-') insertVal = '−';

        const charBefore = expr.slice(start - 1, start);
        const operators = ['+', '−', '×', '÷', '^', '.'];
        
        if (operators.includes(insertVal) && operators.includes(charBefore)) {
          newExpr = expr.slice(0, start - 1) + insertVal + expr.slice(end);
          newCursorPos = start;
        } else {
          newExpr = expr.slice(0, start) + insertVal + expr.slice(end);
          newCursorPos = start + insertVal.length;
        }
      }

      const newResult = calculateResult(newExpr);

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);

      return { ...prev, expression: newExpr, result: newResult };
    });
  }, []);

  const toggleScientific = () => {
    setState(prev => ({ ...prev, isScientific: !prev.isScientific }));
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, history: [] }));
  };

  const updateHistoryItem = (index: number, newExpression: string, newResult: string) => {
    setState(prev => {
      const updated = [...prev.history];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          expression: newExpression,
          result: newResult,
        };
      }
      return { ...prev, history: updated };
    });
  };

  const addAsNewHistory = (newExpression: string, newResult: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      expression: newExpression,
      result: newResult,
      timestamp: Date.now()
    };
    setState(prev => ({
      ...prev,
      history: [newItem, ...prev.history].slice(0, 50)
    }));
  };

  const deleteHistoryItem = (index: number) => {
    setState(prev => ({
      ...prev,
      history: prev.history.filter((_, i) => i !== index),
    }));
  };

  const selectHistoryForEdit = (item: HistoryItem) => {
    const expr = item.expression;
    const res = calculateResult(expr);
    setEditingSource(item.expression);
    
    setState(prev => ({
      ...prev,
      expression: expr,
      result: res,
      showHistory: false
    }));

    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(expr.length, expr.length);
      }
    }, 100);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#202124] overflow-hidden select-none touch-none pt-safe pb-safe">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <button 
          onClick={() => setState(prev => ({...prev, showHistory: !prev.showHistory}))}
          className="text-gray-400 p-2 rounded-full active:bg-gray-700 transition-colors flex items-center gap-2"
          title="Xem lịch sử tính toán"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <div className="flex gap-4">
            <span className="text-gray-500 font-medium">RAD</span>
            <button className="text-gray-400">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
        </div>
      </div>

      {/* Display Area */}
      <div className="flex-1 flex flex-col justify-end px-6 py-4 overflow-hidden relative">
        {state.showHistory && (
          <div className="absolute inset-0 z-50 bg-[#202124] flex flex-col animate-in slide-in-from-top duration-300">
             <div className="flex justify-between items-center px-6 py-5 border-b border-gray-800">
                <h2 className="text-xl font-medium text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lịch sử tính toán
                </h2>
                {state.history.length > 0 && (
                  <button onClick={clearHistory} className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                    Xóa tất cả
                  </button>
                )}
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                {state.history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                    <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>Chưa có lịch sử tính toán</p>
                  </div>
                ) : (
                  state.history.map((item, idx) => (
                    <HistoryItemCard
                      key={item.id || item.timestamp || idx}
                      item={item}
                      index={idx}
                      onSelectForEdit={selectHistoryForEdit}
                      onSaveEdit={updateHistoryItem}
                      onAddAsNewHistory={addAsNewHistory}
                      onDelete={deleteHistoryItem}
                      calculateResult={calculateResult}
                    />
                  ))
                )}
             </div>
             <button 
                onClick={() => setState(prev => ({...prev, showHistory: false}))}
                className="p-4 text-center text-[#8ab4f8] hover:bg-gray-800/50 font-medium border-t border-gray-800 transition-colors"
              >
                Đóng
              </button>
          </div>
        )}

        {/* Source Badge if Editing from History */}
        {editingSource && !state.showHistory && (
          <div className="mb-2 flex items-center justify-between bg-[#2a2d32] border border-[#8ab4f8]/30 px-3 py-1.5 rounded-xl animate-in fade-in">
            <span className="text-xs text-[#8ab4f8] font-medium flex items-center gap-1.5 truncate">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Sửa từ lịch sử: <span className="text-gray-300 font-mono truncate max-w-[180px]">{editingSource}</span>
            </span>
            <button
              onClick={() => setEditingSource(null)}
              className="text-gray-400 hover:text-white text-xs px-1.5 py-0.5 rounded transition-colors"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        )}

        {/* Expression Input Area */}
        <div className="text-right overflow-x-auto no-scrollbar w-full">
          <input
            ref={inputRef}
            type="text"
            value={state.expression}
            onChange={(e) => {
              const val = e.target.value;
              const res = calculateResult(val);
              setState(prev => ({ ...prev, expression: val, result: res }));
            }}
            placeholder="0"
            className="w-full text-right bg-transparent text-gray-200 text-3xl font-light mb-1 focus:outline-none focus:border-b focus:border-[#8ab4f8] font-mono tracking-wide selection:bg-[#8ab4f8]/30"
          />
          <div className={`text-white transition-all duration-200 ${state.result ? 'text-5xl font-medium text-[#8ab4f8]' : 'text-3xl text-gray-600'}`}>
            {state.result ? `= ${state.result}` : ' '}
          </div>
        </div>
      </div>

      {/* Scientific Toggle Handle (Android style) */}
      <div className="flex justify-center py-2">
        <div 
          onClick={toggleScientific}
          className="w-12 h-1 bg-gray-600 rounded-full cursor-pointer mb-2"
        />
      </div>

      {/* Keypad */}
      <div className={`transition-all duration-300 ${state.isScientific ? 'h-[65%]' : 'h-[50%]'} bg-[#202124] p-2 flex flex-col`}>
        {state.isScientific && (
          <div className="grid grid-cols-5 gap-2 px-4 mb-4 animate-in fade-in duration-300">
            {SCIENTIFIC_BUTTONS.map((btn) => (
              <CalcButton 
                key={btn.label} 
                config={btn} 
                onClick={() => handleInput(btn.value)} 
                isScience 
              />
            ))}
          </div>
        )}

        <div className="flex-1 grid grid-cols-4 gap-3 px-4 pb-8">
          {MAIN_BUTTONS.map((btn) => (
            <CalcButton 
              key={btn.label} 
              config={btn} 
              onClick={() => handleInput(btn.value)} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CalcButtonProps {
  config: any;
  onClick: () => void;
  isScience?: boolean;
}

const CalcButton: React.FC<CalcButtonProps> = ({ config, onClick, isScience }) => {
  const getBgColor = () => {
    switch (config.type) {
      case ButtonType.NUMBER: return 'bg-[#3c4043]';
      case ButtonType.OPERATOR: return 'bg-[#3c4043]';
      case ButtonType.ACTION: return 'bg-[#3c4043]';
      case ButtonType.EQUALS: return 'bg-[#8ab4f8]';
      case ButtonType.SCIENTIFIC: return 'bg-transparent';
      default: return 'bg-[#3c4043]';
    }
  };

  const getTextColor = () => {
    if (config.type === ButtonType.EQUALS) return 'text-[#202124]';
    if (config.type === ButtonType.OPERATOR) return 'text-[#8ab4f8]';
    if (config.type === ButtonType.ACTION && config.label === 'AC') return 'text-red-400';
    if (isScience) return 'text-gray-300';
    return 'text-white';
  };

  const getSize = () => {
    if (isScience) return 'h-10 text-sm';
    return 'h-16 text-2xl';
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${getBgColor()} 
        ${getTextColor()} 
        ${getSize()}
        flex items-center justify-center
        rounded-full font-medium
        active:scale-95 active:opacity-70 transition-all duration-75
        ${config.span ? `col-span-${config.span}` : ''}
      `}
    >
      {config.label}
    </button>
  );
};

export default App;
