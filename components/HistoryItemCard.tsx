import React, { useState, useEffect, useRef } from 'react';
import { HistoryItem } from '../types';

interface HistoryItemCardProps {
  item: HistoryItem;
  index: number;
  onSelectForEdit: (item: HistoryItem, index: number) => void;
  onSaveEdit: (index: number, newExpression: string, newResult: string) => void;
  onAddAsNewHistory: (newExpression: string, newResult: string) => void;
  onDelete: (index: number) => void;
  calculateResult: (expr: string) => string;
}

export const HistoryItemCard: React.FC<HistoryItemCardProps> = ({
  item,
  index,
  onSelectForEdit,
  onSaveEdit,
  onAddAsNewHistory,
  onDelete,
  calculateResult,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editExpr, setEditExpr] = useState(item.expression);
  const [liveResult, setLiveResult] = useState(item.result);
  const inlineInputRef = useRef<HTMLInputElement>(null);

  // Sync state if item prop changes
  useEffect(() => {
    setEditExpr(item.expression);
    setLiveResult(item.result);
  }, [item.expression, item.result]);

  const handleExprChange = (val: string) => {
    setEditExpr(val);
    if (val.trim()) {
      const res = calculateResult(val);
      setLiveResult(res);
    } else {
      setLiveResult('');
    }
  };

  const insertSymbolAtCursor = (sym: string) => {
    let start = editExpr.length;
    let end = editExpr.length;
    if (inlineInputRef.current) {
      start = inlineInputRef.current.selectionStart ?? editExpr.length;
      end = inlineInputRef.current.selectionEnd ?? editExpr.length;
    }

    let newExpr = editExpr;
    let newCursorPos = start;

    if (sym === 'AC') {
      newExpr = '';
      newCursorPos = 0;
    } else if (sym === 'DEL') {
      if (start !== end) {
        newExpr = editExpr.slice(0, start) + editExpr.slice(end);
        newCursorPos = start;
      } else if (start > 0) {
        newExpr = editExpr.slice(0, start - 1) + editExpr.slice(start);
        newCursorPos = start - 1;
      }
    } else {
      newExpr = editExpr.slice(0, start) + sym + editExpr.slice(end);
      newCursorPos = start + sym.length;
    }

    handleExprChange(newExpr);

    setTimeout(() => {
      if (inlineInputRef.current) {
        inlineInputRef.current.focus();
        inlineInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleUpdateCurrent = () => {
    if (!editExpr.trim()) return;
    const finalResult = calculateResult(editExpr) || '0';
    onSaveEdit(index, editExpr, finalResult);
    setIsEditing(false);
  };

  const handleCreateNew = () => {
    if (!editExpr.trim()) return;
    const finalResult = calculateResult(editExpr) || '0';
    onAddAsNewHistory(editExpr, finalResult);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditExpr(item.expression);
    setLiveResult(item.result);
    setIsEditing(false);
  };

  if (isEditing) {
    const isValid = Boolean(liveResult && liveResult !== 'Lỗi' && editExpr.trim());

    return (
      <div className="mb-4 p-4 bg-[#2a2d32] border border-[#8ab4f8]/50 rounded-2xl shadow-lg transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#8ab4f8] uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa phép tính
          </span>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
            title="Hủy"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Edit Expression Input - inputMode="none" prevents mobile soft keyboard */}
        <div className="mb-3 relative">
          <input
            ref={inlineInputRef}
            type="text"
            inputMode="none"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            value={editExpr}
            onChange={(e) => handleExprChange(e.target.value)}
            className="w-full bg-[#1a1b1e] text-white text-lg px-3 py-2.5 rounded-xl border border-gray-700 focus:border-[#8ab4f8] focus:outline-none font-mono selection:bg-[#8ab4f8]/30 cursor-pointer"
            placeholder="Nhập biểu thức..."
            autoFocus
          />
          <span className="text-[10px] text-gray-500 mt-1 block">
            💡 Chạm vào vị trí bất kỳ để di chuyển con trỏ, dùng các nút bấm bên dưới để chỉnh sửa.
          </span>
        </div>

        {/* Quick Touch Keypad for Inline Editing */}
        <div className="mb-3">
          <div className="text-[11px] text-gray-400 mb-1 font-medium">Bàn phím cảm ứng:</div>
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {['7', '8', '9', '÷', 'DEL'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertSymbolAtCursor(symbol)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                  symbol === 'DEL' 
                    ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-800/50' 
                    : ['÷', '×', '−', '+'].includes(symbol)
                    ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4e52]'
                }`}
              >
                {symbol}
              </button>
            ))}
            {['4', '5', '6', '×', 'AC'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertSymbolAtCursor(symbol)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                  symbol === 'AC' 
                    ? 'bg-red-900/40 text-red-300 hover:bg-red-800/50' 
                    : ['÷', '×', '−', '+'].includes(symbol)
                    ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4e52]'
                }`}
              >
                {symbol}
              </button>
            ))}
            {['1', '2', '3', '−', '('].map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertSymbolAtCursor(symbol)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                  ['÷', '×', '−', '+'].includes(symbol)
                    ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4e52]'
                }`}
              >
                {symbol}
              </button>
            ))}
            {['0', '.', '+', '^', ')'].map((symbol) => (
              <button
                key={symbol}
                type="button"
                onClick={() => insertSymbolAtCursor(symbol)}
                className={`py-2 text-sm font-semibold rounded-lg transition-all active:scale-95 ${
                  ['÷', '×', '−', '+'].includes(symbol)
                    ? 'bg-[#8ab4f8]/20 text-[#8ab4f8]'
                    : 'bg-[#3c4043] text-white hover:bg-[#4a4e52]'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Live Result Preview */}
        <div className="flex items-center justify-between py-2 px-3 bg-[#1a1b1e]/60 rounded-xl mb-4 border border-gray-800">
          <span className="text-xs text-gray-400">Kết quả tính:</span>
          <span className={`text-lg font-medium ${isValid ? 'text-green-400' : 'text-amber-400/80 text-sm italic'}`}>
            {isValid ? `= ${liveResult}` : 'Biểu thức chưa hợp lệ'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-800 pt-3">
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              onSelectForEdit({ ...item, expression: editExpr, result: liveResult }, index);
            }}
            className="px-3 py-1.5 text-xs font-medium text-[#8ab4f8] bg-[#8ab4f8]/10 hover:bg-[#8ab4f8]/20 rounded-xl transition-all flex items-center gap-1.5"
            title="Đưa ra máy tính chính để sửa bằng bàn phím máy tính đầy đủ"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Sửa trên máy tính chính
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={!isValid}
              onClick={handleUpdateCurrent}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${
                isValid
                  ? 'border-gray-600 text-gray-200 hover:bg-gray-700/60'
                  : 'border-gray-800 text-gray-600 cursor-not-allowed'
              }`}
              title="Cập nhật trực tiếp dòng lịch sử này"
            >
              Cập nhật dòng này
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleCreateNew}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                isValid
                  ? 'bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] active:scale-95 shadow-sm'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              title="Thêm thành một phép tính mới vào lịch sử"
            >
              + Tạo phép tính mới
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative mb-3 p-4 bg-[#28292c] hover:bg-[#2e3034] rounded-2xl transition-all border border-transparent hover:border-gray-700">
      <div className="flex items-start justify-between gap-3">
        {/* Left Action Buttons */}
        <div className="flex items-center gap-1 pt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectForEdit(item, index);
            }}
            className="px-2.5 py-1.5 text-[#8ab4f8] bg-[#8ab4f8]/10 hover:bg-[#8ab4f8]/20 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
            title="Sửa phép tính này bằng bàn phím cảm ứng máy tính"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Sửa
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-xl transition-colors"
            title="Sửa nhanh ngay tại đây"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(index);
            }}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-xl transition-colors"
            title="Xóa khỏi lịch sử"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Expression and Result (Clicking loads into calculator for editing/calculating) */}
        <div
          className="flex-1 text-right cursor-pointer"
          onClick={() => onSelectForEdit(item, index)}
          title="Bấm để đưa phép tính này ra máy tính để sửa/tính lại"
        >
          <div className="text-gray-300 text-base font-medium mb-0.5 break-all font-mono">
            {item.expression}
          </div>
          <div className="text-[#8ab4f8] text-xl font-medium break-all font-mono">
            = {item.result}
          </div>
        </div>
      </div>
    </div>
  );
};
