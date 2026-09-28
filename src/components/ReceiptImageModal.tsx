import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  CheckCircle2,
  Printer,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { OrderBill, StoreProfile } from '../types';
import {
  generateReceiptImage,
  downloadReceiptImageFile,
  copyReceiptImageToClipboard,
  shareReceiptImageViaWebShare,
  GeneratedReceiptImage,
} from '../utils/receiptImageGenerator';
import { generateWhatsAppNotaText } from '../utils/storage';

interface ReceiptImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: OrderBill | null;
  profile?: StoreProfile;
  onPrintThermal?: (bill: OrderBill) => void;
}

export const ReceiptImageModal: React.FC<ReceiptImageModalProps> = ({
  isOpen,
  onClose,
  bill,
  profile,
  onPrintThermal,
}) => {
  const [generated, setGenerated] = useState<GeneratedReceiptImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bill) {
      setLoading(true);
      generateReceiptImage(bill, profile)
        .then((res) => {
          setGenerated(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed generating receipt image', err);
          setLoading(false);
        });
    } else {
      setGenerated(null);
    }
  }, [isOpen, bill, profile]);

  if (!isOpen || !bill) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDownload = () => {
    if (!generated) return;
    downloadReceiptImageFile(generated.blob, bill.id);
    showToast('✓ Gambar struk berhasil diunduh ke perangkat Anda!');
  };

  const handleCopyClipboard = async () => {
    if (!generated) return;
    const ok = await copyReceiptImageToClipboard(generated.blob);
    if (ok) {
      showToast('✓ Gambar struk berhasil disalin ke Clipboard! (Bisa langsung Paste/Ctrl+V di WhatsApp Web)');
    } else {
      // Fallback: download
      handleDownload();
    }
  };

  const handleSendToWhatsApp = async () => {
    if (!generated) return;

    // 1. Try Native Web Share with image file first (ideal for Android/iOS mobile)
    const shared = await shareReceiptImageViaWebShare(generated.blob, bill, profile);
    if (shared) {
      showToast('✓ Berhasil membuka menu kirim gambar WhatsApp!');
      return;
    }

    // 2. Fallback for Desktop/Browsers that do not support navigator.share files:
    // Automatically download image & open WhatsApp web
    downloadReceiptImageFile(generated.blob, bill.id);
    showToast('✓ Gambar struk terunduh! Silakan lampirkan gambar di WhatsApp.');

    // Format WA URL
    const caption = `🧾 *STRUK RESMI ${bill.id}*\nPelanggan: *${bill.customerName}* (Total: Rp ${bill.total.toLocaleString('id-ID')})\n\n_Catatan: Struk resmi terlampir dalam bentuk GAMBAR asli untuk mencegah perubahan data / manipulasi._`;
    const encoded = encodeURIComponent(caption);

    let url = `https://wa.me/?text=${encoded}`;
    if (bill.customerPhone) {
      let cleanPhone = bill.customerPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
      }
      url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    }

    setTimeout(() => {
      window.open(url, '_blank');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[130] bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold border border-emerald-500/50 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="relative bg-slate-100 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] z-10 animate-slide-up border border-slate-300/80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-white border-b border-slate-200">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className="font-black text-slate-900 text-sm sm:text-base">Struk Gambar Anti-Manipulasi</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PNG Asli
                </span>
              </div>
              <p className="text-xs text-slate-500">Gambar struk resmi tidak dapat diedit oleh pembeli</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Scrollable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex justify-center items-center bg-slate-200/90">
          {loading || !generated ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-600">Membuat gambar struk resolusi tinggi...</p>
            </div>
          ) : (
            <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-400/40 bg-white">
              <img
                src={generated.dataUrl}
                alt={`Struk Nota ${bill.id}`}
                className="w-full h-auto object-contain block select-none pointer-events-none"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 space-y-2.5">
          {/* Main Primary Action: Send Image to WhatsApp */}
          <button
            onClick={handleSendToWhatsApp}
            disabled={!generated || loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4 text-emerald-200" />
            <span>Kirim Gambar Struk ke WhatsApp</span>
          </button>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-3 gap-2">
            {/* Download Image */}
            <button
              onClick={handleDownload}
              disabled={!generated || loading}
              className="py-2 px-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center space-x-1.5 text-xs cursor-pointer disabled:opacity-50"
              title="Unduh file gambar PNG ke HP/Laptop"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Unduh PNG</span>
            </button>

            {/* Copy to Clipboard */}
            <button
              onClick={handleCopyClipboard}
              disabled={!generated || loading}
              className="py-2 px-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center space-x-1.5 text-xs cursor-pointer disabled:opacity-50"
              title="Salin gambar ke Clipboard untuk di-paste langsung"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>Salin Gambar</span>
            </button>

            {/* Thermal Print */}
            {onPrintThermal && (
              <button
                onClick={() => {
                  onClose();
                  onPrintThermal(bill);
                }}
                className="py-2 px-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center space-x-1.5 text-xs cursor-pointer"
                title="Cetak thermal struk kasir"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Print Thermal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
