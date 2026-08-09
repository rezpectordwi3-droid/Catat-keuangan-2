import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Store, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Menyiapkan data warung...');
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Progress animation timeline
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 35) {
      setStatusText('Menyiapkan catatan kas & transaksi...');
    } else if (progress < 75) {
      setStatusText('Memuat kategori, kasbon & multi-kas...');
    } else if (progress < 100) {
      setStatusText('Sinkronisasi fitur warung sehat...');
    } else {
      setStatusText('Aplikasi Siap Ditampilkan!');
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onFinish();
        }, 400); // match fade out duration
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [progress, onFinish]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-gradient-to-b from-slate-900 via-emerald-950 to-slate-950 text-white p-6 overflow-hidden select-none"
        >
          {/* Background Decorative Subtle Glow Elements */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Badge Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center space-x-2 bg-emerald-900/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 backdrop-blur-md mt-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Pencatatan Finansial Warung Sehat</span>
          </motion.div>

          {/* Main Logo & Title Centerpiece */}
          <div className="flex flex-col items-center text-center max-w-sm px-4 my-auto space-y-6">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
              className="relative"
            >
              {/* Outer Glowing Ring */}
              <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-400 opacity-40 blur-lg animate-pulse" />
              
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 rounded-3xl p-0.5 shadow-2xl flex items-center justify-center">
                <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
                  <div className="relative flex items-center justify-center">
                    <Store className="w-12 h-12 text-emerald-400" />
                    <Wallet className="w-7 h-7 text-teal-300 absolute -bottom-1 -right-1 drop-shadow-md" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Catat Keuangan
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-xs mx-auto">
                Pencatatan Harian & Analisis Kas Warung Lebih Rapi & Terkontrol
              </p>
            </motion.div>
          </div>

          {/* Bottom Progress & Status Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-xs space-y-3 mb-6"
          >
            {/* Progress Bar Container */}
            <div className="w-full bg-slate-800/80 border border-slate-700/60 h-2.5 rounded-full p-0.5 shadow-inner overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-sm"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            {/* Status Info */}
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 px-1">
              <span className="truncate pr-2">{statusText}</span>
              <span className="font-bold text-emerald-400">{progress}%</span>
            </div>

            {/* Tap to skip button if user is in a hurry */}
            <button
              onClick={() => {
                setIsExiting(true);
                setTimeout(() => onFinish(), 200);
              }}
              className="w-full text-center text-[11px] text-slate-400 hover:text-emerald-300 transition py-1 cursor-pointer font-medium"
            >
              Ketuk untuk langsung masuk &rarr;
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
