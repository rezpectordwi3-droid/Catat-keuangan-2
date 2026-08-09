import React, { useState } from 'react';
import { Lock, Unlock, KeyRound, ShieldCheck, X } from 'lucide-react';

interface PinLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPin: string | null;
  onSavePin: (pin: string | null) => void;
  isUnlocked: boolean;
  setIsUnlocked: (unlocked: boolean) => void;
}

export const PinLockModal: React.FC<PinLockModalProps> = ({
  isOpen,
  onClose,
  savedPin,
  onSavePin,
  isUnlocked,
  setIsUnlocked,
}) => {
  const [inputPin, setInputPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [mode, setMode] = useState<'enter' | 'set'>('enter');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle Enter PIN to Unlock
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === savedPin) {
      setIsUnlocked(true);
      setErrorMsg(null);
      setInputPin('');
      onClose();
    } else {
      setErrorMsg('PIN yang Anda masukkan salah. Coba lagi.');
    }
  };

  // Handle Set / Change PIN
  const handleSetPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.length < 4) {
      setErrorMsg('PIN harus 4 digit angka.');
      return;
    }
    if (inputPin !== confirmPin) {
      setErrorMsg('Konfirmasi PIN tidak cocok.');
      return;
    }
    onSavePin(inputPin);
    setIsUnlocked(true);
    setErrorMsg(null);
    setInputPin('');
    setConfirmPin('');
    onClose();
  };

  // Handle Disable PIN
  const handleRemovePin = () => {
    onSavePin(null);
    setIsUnlocked(true);
    setInputPin('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-sm overflow-hidden relative">
        <div className="bg-slate-900 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Kunci PIN Keamanan</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {savedPin
              ? 'Aplikasi terproteksi PIN 4-Digit'
              : 'Aktifkan PIN untuk melindungi catatan keuangan'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {savedPin && mode === 'enter' ? (
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 text-center">
                  Masukkan PIN 4-Digit
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-2xl tracking-widest font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-500 font-bold"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Buka Kunci Aplikasi
              </button>

              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setMode('set')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Ubah PIN
                </button>
                <button
                  type="button"
                  onClick={handleRemovePin}
                  className="text-rose-600 hover:text-rose-700 font-semibold"
                >
                  Matikan PIN
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSetPin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {savedPin ? 'PIN Baru (4 Digit)' : 'Buat PIN 4-Digit Baru'}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-xl tracking-widest font-mono py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Konfirmasi PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  className="w-full text-center text-xl tracking-widest font-mono py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Simpan PIN Keamanan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
