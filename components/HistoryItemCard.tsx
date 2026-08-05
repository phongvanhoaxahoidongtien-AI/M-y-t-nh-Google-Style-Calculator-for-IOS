import React, { useState, useEffect } from 'react';
import { HistoryItem } from '../types';

interface HistoryItemCardProps {
  item: HistoryItem;
  index: number;
  onSelectForEdit: (item: HistoryItem) => void;
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

  const insertSymbol = (sym: string) => {
    const newVal = editExpr + sym;
    handleExprChange(newVal);
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

        {/* Edit Expression Input */}
        <div className="mb-3">
          <input
            type="text"
            value={editExpr}
            onChange={(e) => handleExprChange(e.target.value)}
            className="w-full bg-[#1a1b1e] text-white text-lg px-3 py-2.5 rounded-xl border border-gray-700 focus:border-[#8ab4f8] focus:outline-none font-mono select-text touch-auto"
            placeholder="Nhập biểu thức..."
            autoFocus
          />
        </div>

        {/* Quick Operators helper for quick editing */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['+', '−', '×', '÷', '(', ')', '^', '%', '.'].map((symbol) => (
            <button
              key={symbol}
              type="button"
              onClick={() => insertSymbol(symbol)}
              className="px-2.5 py-1 text-xs font-semibold bg-[#3c4043] text-gray-200 hover:text-white hover:bg-[#4a4e52] active:scale-95 rounded-lg transition-all"
            >
              {symbol}
            </button>
          ))}
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
              onSelectForEdit({ ...item, expression: editExpr, result: liveResult });
            }}
            className="px-3 py-1.5 text-xs font-medium text-[#8ab4f8] hover:bg-gray-800 rounded-xl transition-all flex items-center gap-1"
            title="Đưa biểu thức này ra màn hình máy tính để tiếp tục chỉnh sửa bằng bàn phím máy tính"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Sửa trên máy tính
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
        <div className="flex items-center gap-1 pt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectForEdit(item);
            }}
            className="p-2 text-[#8ab4f8] hover:bg-gray-700/60 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium"
            title="Đưa phép tính này lên màn hình máy tính để chỉnh sửa các số & phép tính"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <span className="hidden sm:inline">Sửa</span>
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-xl transition-colors"
            title="Sửa nhanh tại đây"
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
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-xl transition-colors"
            title="Xóa khỏi lịch sử"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Expression and Result (Clicking loads into calculator) */}
        <div
          className="flex-1 text-right cursor-pointer"
          onClick={() => onSelectForEdit(item)}
          title="Bấm để đưa phép tính này ra máy tính để sửa/tính lại"
        >
          <div className="text-gray-300 text-base font-medium mb-0.5 break-all">
            {item.expression}
          </div>
          <div className="text-[#8ab4f8] text-xl font-medium break-all">
            = {item.result}
          </div>
        </div>
      </div>
    </div>
  );
};
