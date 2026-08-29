import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Delete,
  Copy,
  Check,
  ArrowDownRight,
  ArrowUpRight,
  History,
  RotateCcw,
  Sparkles,
  Calculator as CalcIcon,
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters';
import { TransactionType } from '../types';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseAmount: (amount: number, type: TransactionType) => void;
}

interface CalcHistoryItem {
  id: string;
  expression: string;
  result: number;
  timestamp: string;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onUseAmount,
}) => {
  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [evaluatedResult, setEvaluatedResult] = useState<number>(0);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<CalcHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('catat_calc_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('catat_calc_history', JSON.stringify(historyList.slice(0, 15)));
    } catch {
      // ignore
    }
  }, [historyList]);

  // Safe evaluation of mathematical expressions
  const evaluateMath = useCallback((expr: string): number | null => {
    if (!expr || expr.trim() === '') return 0;
    try {
      // Normalize expression
      // Replace display symbols with JS arithmetic
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.')
        .replace(/k/gi, '*1000');

      // Handle percentage (e.g. 50 + 10% or 100 * 20%)
      sanitized = sanitized.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

      // Validate characters to prevent code execution
      if (!/^[0-9+\-*/().\s]+$/.test(sanitized)) {
        return null;
      }

      // Safe evaluate using Function constructor strictly limited to arithmetic
      // eslint-disable-next-line no-new-func
      const result = new Function(`'use strict'; return (${sanitized})`)();
      if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
        return Math.round(result * 100) / 100;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Update live preview when expression changes
  useEffect(() => {
    if (!expression) {
      setDisplayValue('0');
      setEvaluatedResult(0);
      return;
    }

    const res = evaluateMath(expression);
    if (res !== null) {
      setEvaluatedResult(res);
      if (!hasEvaluated) {
        setDisplayValue(expression);
      }
    }
  }, [expression, hasEvaluated, evaluateMath]);

  const handleInput = (val: string) => {
    if (hasEvaluated) {
      // If user starts typing number after pressing '=', start fresh
      if (/^[0-9]$/.test(val) || val === '00' || val === '000') {
        setExpression(val === '00' || val === '000' ? '0' : val);
        setHasEvaluated(false);
        return;
      } else {
        // If user types operator (+, -, ×, ÷), continue from previous result
        setExpression(String(evaluatedResult) + ' ' + val + ' ');
        setHasEvaluated(false);
        return;
      }
    }

    // Operator spacing
    if (['+', '-', '×', '÷'].includes(val)) {
      if (!expression && val === '-') {
        setExpression('-');
        return;
      }
      if (!expression) return;
      
      const lastChar = expression.trim().slice(-1);
      if (['+', '-', '×', '÷'].includes(lastChar)) {
        // replace previous operator
        setExpression(expression.trim().slice(0, -1) + ' ' + val + ' ');
      } else {
        setExpression(expression + ' ' + val + ' ');
      }
      return;
    }

    if (val === '00' || val === '000') {
      if (!expression || expression.endsWith(' ') || expression === '0') {
        return;
      }
      setExpression(expression + val);
      return;
    }

    if (val === 'k') {
      if (!expression || expression.endsWith(' ')) return;
      setExpression(expression + '000');
      return;
    }

    if (val === '.') {
      const parts = expression.split(/[\s+\-×÷]/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes('.')) return;
      if (!currentNumber) {
        setExpression(expression + '0.');
        return;
      }
    }

    setExpression((prev) => (prev === '0' && val !== '.' ? val : prev + val));
  };

  const handleClear = () => {
    setExpression('');
    setDisplayValue('0');
    setEvaluatedResult(0);
    setHasEvaluated(false);
  };

  const handleBackspace = () => {
    if (hasEvaluated) {
      handleClear();
      return;
    }
    if (!expression) return;

    if (expression.endsWith(' ')) {
      // Delete operator with surrounding spaces
      setExpression(expression.trim().slice(0, -1).trim());
    } else {
      setExpression(expression.slice(0, -1));
    }
  };

  const handleEqual = () => {
    if (!expression) return;
    const res = evaluateMath(expression);
    if (res !== null) {
      setEvaluatedResult(res);
      setHasEvaluated(true);

      // Add to history if not empty and non-trivial
      if (expression.includes('+') || expression.includes('-') || expression.includes('×') || expression.includes('÷') || expression.includes('%')) {
        const newItem: CalcHistoryItem = {
          id: String(Date.now()),
          expression,
          result: res,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setHistoryList((prev) => [newItem, ...prev.slice(0, 14)]);
      }
    }
  };

  const handleCopy = () => {
    const valToCopy = String(evaluatedResult || 0);
    navigator.clipboard.writeText(valToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleUseForTransaction = (type: TransactionType) => {
    const finalAmount = evaluatedResult > 0 ? evaluatedResult : (evaluateMath(expression) || 0);
    if (finalAmount <= 0) {
      alert('Masukkan nominal valid lebih dari 0 untuk dicatat.');
      return;
    }
    onUseAmount(finalAmount, type);
    onClose();
  };

  // Keyboard navigation when open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key >= '0' && e.key <= '9') {
        handleInput(e.key);
      } else if (e.key === '+') {
        handleInput('+');
      } else if (e.key === '-') {
        handleInput('-');
      } else if (e.key === '*') {
        handleInput('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleInput('÷');
      } else if (e.key === '.' || e.key === ',') {
        handleInput('.');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key.toLowerCase() === 'c') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, expression, hasEvaluated, evaluatedResult, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Calculator Container */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-slide-up flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CalcIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold tracking-tight">Kalkulator Finansial</h3>
              <p className="text-[10px] text-slate-400">Hitung & langsung catat ke saldo</p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer flex items-center space-x-1 ${
                showHistory ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Riwayat Hitungan"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calculator Display Screen */}
        <div className="p-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-end min-h-[110px] relative select-none">
          
          {/* History Dropdown Drawer */}
          {showHistory && (
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md p-3.5 z-20 overflow-y-auto divide-y divide-slate-800 text-left animate-fade-in">
              <div className="flex items-center justify-between pb-2 mb-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                  <History className="w-3.5 h-3.5" />
                  <span>Riwayat Hitungan Sesi Ini</span>
                </span>
                {historyList.length > 0 && (
                  <button
                    onClick={() => setHistoryList([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                  >
                    Hapus Semua
                  </button>
                )}
              </div>

              {historyList.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Belum ada riwayat hitungan.
                </div>
              ) : (
                historyList.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setExpression(String(item.result));
                      setEvaluatedResult(item.result);
                      setHasEvaluated(true);
                      setShowHistory(false);
                    }}
                    className="py-2 hover:bg-slate-800/80 px-2 rounded-lg cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-[11px] text-slate-400 group-hover:text-emerald-400 transition">
                        {item.expression} =
                      </div>
                      <div className="text-xs font-bold text-white">
                        {formatRupiah(item.result)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Raw Equation Line */}
          <div className="text-xs text-slate-400 font-mono tracking-wider text-right overflow-x-auto whitespace-nowrap mb-1 no-scrollbar min-h-[18px]">
            {expression || '0'}
          </div>

          {/* Evaluated Total Preview */}
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
              Total
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-right truncate text-emerald-300">
              {formatRupiah(evaluatedResult)}
            </div>
          </div>
        </div>

        {/* Quick Action Transfer Row */}
        <div className="px-3 py-2 bg-slate-50 border-y border-slate-200 grid grid-cols-3 gap-1.5">
          <button
            onClick={() => handleUseForTransaction('cash_out')}
            disabled={evaluatedResult <= 0}
            className="flex items-center justify-center space-x-1 py-2 px-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs"
            title="Kirim ke Catatan Pengeluaran"
          >
            <ArrowDownRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span className="truncate text-[11px]">Catat Keluar</span>
          </button>

          <button
            onClick={() => handleUseForTransaction('cash_in')}
            disabled={evaluatedResult <= 0}
            className="flex items-center justify-center space-x-1 py-2 px-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs"
            title="Kirim ke Catatan Pemasukan"
          >
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0 stroke-[2.5]" />
            <span className="truncate text-[11px]">Catat Masuk</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center space-x-1 py-2 px-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs"
            title="Salin nominal ke clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span className="text-emerald-700 text-[11px]">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate text-[11px]">Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Keypad Grid */}
        <div className="p-3 bg-white grid grid-cols-4 gap-2 flex-1">
          {/* Row 1: Function Keys */}
          <button
            onClick={handleClear}
            className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-sm rounded-xl transition active:scale-95 cursor-pointer border border-rose-200/60"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition active:scale-95 cursor-pointer flex items-center justify-center"
            title="Hapus Karakter"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleInput('%')}
            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition active:scale-95 cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleInput('÷')}
            className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-lg rounded-xl transition active:scale-95 cursor-pointer border border-amber-200/60"
          >
            ÷
          </button>

          {/* Row 2: 7, 8, 9, × */}
          <button
            onClick={() => handleInput('7')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            7
          </button>
          <button
            onClick={() => handleInput('8')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            8
          </button>
          <button
            onClick={() => handleInput('9')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            9
          </button>
          <button
            onClick={() => handleInput('×')}
            className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-lg rounded-xl transition active:scale-95 cursor-pointer border border-amber-200/60"
          >
            ×
          </button>

          {/* Row 3: 4, 5, 6, - */}
          <button
            onClick={() => handleInput('4')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            4
          </button>
          <button
            onClick={() => handleInput('5')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            5
          </button>
          <button
            onClick={() => handleInput('6')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            6
          </button>
          <button
            onClick={() => handleInput('-')}
            className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-lg rounded-xl transition active:scale-95 cursor-pointer border border-amber-200/60"
          >
            -
          </button>

          {/* Row 4: 1, 2, 3, + */}
          <button
            onClick={() => handleInput('1')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            1
          </button>
          <button
            onClick={() => handleInput('2')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            2
          </button>
          <button
            onClick={() => handleInput('3')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            3
          </button>
          <button
            onClick={() => handleInput('+')}
            className="py-3 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold text-lg rounded-xl transition active:scale-95 cursor-pointer border border-amber-200/60"
          >
            +
          </button>

          {/* Row 5: 0, 000 (Ribu), . (Titik), = (Hasil) */}
          <button
            onClick={() => handleInput('0')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            0
          </button>
          <button
            onClick={() => handleInput('000')}
            className="py-3 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer border border-teal-200/60"
            title="Tambah Ribuan (000)"
          >
            000
          </button>
          <button
            onClick={() => handleInput('.')}
            className="py-3 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl transition active:scale-95 cursor-pointer border border-slate-200/80 shadow-2xs"
          >
            .
          </button>
          <button
            onClick={handleEqual}
            className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg rounded-xl transition active:scale-95 cursor-pointer shadow-md flex items-center justify-center"
          >
            =
          </button>
        </div>

        {/* Indonesian Rupiah Fast Tips */}
        <div className="px-4 py-2 bg-slate-100/80 text-[10px] text-slate-500 flex items-center justify-between border-t border-slate-200">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Gunakan tombol <b>000</b> untuk nominal ribuan lebih cepat</span>
          </span>
          <span className="hidden sm:inline text-slate-400">Esc / Tutup</span>
        </div>

      </div>
    </div>
  );
};
