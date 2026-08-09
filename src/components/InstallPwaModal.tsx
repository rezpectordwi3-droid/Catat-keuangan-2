import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle2, X, ExternalLink, HelpCircle, Share2 } from 'lucide-react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-100 hover:text-white bg-emerald-700/50 hover:bg-emerald-700 p-1.5 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <Smartphone className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Instal Aplikasi di HP Warung</h3>
              <p className="text-xs text-emerald-100">Gunakan seperti aplikasi APK native tanpa Play Store</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {isInstalled ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-bold text-emerald-900 text-sm">Aplikasi Sudah Terpasang!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Aplikasi Rekap Uang Warung sudah terinstal di layar utama (Home Screen) HP Anda.
              </p>
            </div>
          ) : deferredPrompt ? (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Klik tombol di bawah ini untuk langsung memasang aplikasi di HP/Laptop Anda secara otomatis.
              </p>
              <button
                onClick={handleInstallClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
              >
                <Download className="w-5 h-5" />
                <span>Instal Sekarang (Otomatis)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Cara Pasang di HP (Android & iOS)</span>
              </div>

              <ol className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                  <span>Buka menu browser Chrome di HP (klik <b>titik tiga ⋮</b> di sudut kanan atas).</span>
                </li>
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                  <span>Pilih menu <b>"Tambahkan ke Layar Utama"</b> (<i>Add to Home Screen</i>) atau <b>"Instal Aplikasi"</b>.</span>
                </li>
                <li className="flex items-start space-x-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                  <span>Icon <b>"Uang Warung"</b> akan langsung muncul di HP Anda dan siap dipakai kapan saja!</span>
                </li>
              </ol>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-800 flex items-start space-x-2">
                <Share2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <b>Keunggulan PWA:</b> Tidak membutuhkan penyimpanan memori besar, cepat dibuka, dan data tersimpan aman di HP & Cloud.
                </span>
              </div>
            </div>
          )}

          {/* Export option */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-500">
              Ingin mendownload kode sumber / ZIP proyek? Gunakan menu <b>Export</b> di bilah atas AI Studio.
            </p>
          </div>
        </div>

        {/* Footer button */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs hover:bg-slate-50 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
