import React, { useRef } from 'react';
import { X, Printer, Download } from 'lucide-react';
import { Transaction, KasbonItem, FinancialHealthMetrics } from '../types';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Can be Transaction, KasbonItem, or Report payload
  type: 'transaction' | 'kasbon' | 'report';
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-receipt-area, #print-receipt-area * {
              visibility: visible;
            }
            #print-receipt-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-width: 58mm; /* Standard thermal printer */
              margin: 0;
              padding: 0;
              background: white;
            }
            /* Hide scrollbars, adjust margins */
            @page {
              margin: 0;
              size: auto;
            }
          }
        `}
      </style>
      
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in print:hidden">
        {/* Click outside to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <div className="relative bg-slate-100 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] z-10 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Pratinjau Cetak</h3>
                <p className="text-xs text-slate-500">Struk Thermal / PDF</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Container */}
          <div className="p-6 overflow-y-auto flex-1 flex justify-center bg-slate-200">
            {/* The actual print content */}
            <div
              id="print-receipt-area"
              ref={printAreaRef}
              className="bg-white p-4 shadow-sm font-mono text-black text-xs leading-tight mx-auto"
              style={{ width: '100%', maxWidth: '320px', minHeight: '400px' }}
            >
              {/* Receipt Header */}
              <div className="text-center mb-4">
                <h2 className="font-bold text-lg mb-1 tracking-tight">UANG WARUNG</h2>
                <p className="text-[10px] text-gray-600">Catatan Keuangan Pintar</p>
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
              </div>

              {/* Transaction Content */}
              {type === 'transaction' && (
                <div>
                  <div className="text-center mb-3">
                    <p className="font-bold text-sm uppercase">BUKTI TRANSAKSI</p>
                    <p className="text-[10px] mt-0.5">{todayStr}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between py-1">
                      <span>Tipe:</span>
                      <span className="font-bold">
                        {data.type === 'cash_in' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Kategori:</span>
                      <span className="font-bold">{data.categoryName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Akun:</span>
                      <span className="font-bold uppercase">{data.account || 'Tunai'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Tgl Trx:</span>
                      <span>{data.date} {data.time}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                  
                  <div className="mb-4">
                    <p className="mb-1 font-semibold">Keterangan:</p>
                    <p className="break-words bg-gray-50 p-2 rounded text-[11px]">{data.notes}</p>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>

                  <div className="flex justify-between items-end mt-4">
                    <span className="font-bold text-sm">TOTAL</span>
                    <span className="font-black text-lg">{formatRupiah(data.amount)}</span>
                  </div>
                </div>
              )}

              {/* Kasbon Content */}
              {type === 'kasbon' && (
                <div>
                  <div className="text-center mb-3">
                    <p className="font-bold text-sm uppercase">TAGIHAN / KASBON</p>
                    <p className="text-[10px] mt-0.5">{todayStr}</p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between py-1">
                      <span>Pelanggan:</span>
                      <span className="font-bold uppercase">{data.name}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Tgl Catat:</span>
                      <span>{data.date}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Status:</span>
                      <span className="font-bold">{data.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                  
                  <div className="mb-4">
                    <p className="mb-1 font-semibold">Detail Barang/Jasa:</p>
                    <p className="break-words">{data.description}</p>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>

                  <div className="flex justify-between items-end mt-4">
                    <span className="font-bold text-sm">TOTAL TAGIHAN</span>
                    <span className="font-black text-lg">{formatRupiah(data.amount)}</span>
                  </div>
                </div>
              )}

              {/* Receipt Footer */}
              <div className="mt-8 text-center">
                <div className="border-b-2 border-dashed border-gray-400 my-2"></div>
                <p className="text-[10px] text-gray-500 mt-2">Terima kasih atas kepercayaannya!</p>
                <p className="text-[9px] text-gray-400 mt-1">Dicetak dari app Uang Warung</p>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-lg shadow-indigo-200 flex items-center justify-center space-x-2"
            >
              <Printer className="w-5 h-5" />
              <span>Cetak / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
