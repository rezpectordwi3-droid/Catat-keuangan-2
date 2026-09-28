import React, { useRef, useState } from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { Transaction, DebtItem, FinancialHealthMetrics, StoreProfile } from '../types';
import { formatRupiah, formatDateIndonesian } from '../utils/formatters';
import { downloadReceiptPdf } from '../utils/pdfGenerator';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any; // Can be Transaction, KasbonItem/DebtItem, OrderBill, or Report payload
  type: 'transaction' | 'kasbon' | 'report' | 'order_bill';
  profile?: StoreProfile;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  data,
  type,
  profile,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadReceiptPdf(data, type, profile);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500);
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
                <h2 className="font-bold text-lg mb-0.5 tracking-tight uppercase">
                  {type === 'order_bill' ? (profile?.name || 'WARUNG SOTO & RAWON') : 'UANG WARUNG'}
                </h2>
                <p className="text-[10px] text-gray-600">
                  {type === 'order_bill' ? (profile?.tagline || 'Soto Lamongan, Rawon & Aneka Kuliner') : 'Catatan Keuangan Pintar'}
                </p>
                {type === 'order_bill' && (profile?.address || profile?.phone) && (
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    {[profile?.address, profile?.phone ? `Telp: ${profile.phone}` : ''].filter(Boolean).join(' • ')}
                  </p>
                )}
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

              {/* Order Bill Content (Warung Soto & Rawon) */}
              {type === 'order_bill' && (
                <div>
                  <div className="text-center mb-3">
                    <p className="font-bold text-sm uppercase">NOTA PESANAN</p>
                    <p className="text-[10px] mt-0.5">{data.date} {data.time} • No: {data.id}</p>
                  </div>
                  
                  <div className="mb-3 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pelanggan:</span>
                      <span className="font-bold">{data.customerName || 'Pelanggan'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipe Pesanan:</span>
                      <span className="font-semibold">
                        {data.orderType === 'dine_in' ? `Makan Sini (Meja ${data.tableNumber || '-'})` : 'Bungkus / Take Away'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jumlah Orang:</span>
                      <span className="font-bold">{data.totalCustomers || 1} Orang</span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>

                  {/* Menu Items List */}
                  <div className="mb-3 space-y-1.5">
                    <p className="font-bold text-[11px] mb-1">Rincian Menu:</p>
                    {Array.isArray(data.items) && data.items.map((it: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <div>
                          <span className="font-bold">{it.qty}x</span> {it.name}
                        </div>
                        <span className="font-bold">{formatRupiah((it.price || 0) * (it.qty || 1))}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>

                  {/* Totals */}
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatRupiah(data.subtotal || data.total || 0)}</span>
                    </div>
                    {data.discount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Diskon:</span>
                        <span>-{formatRupiah(data.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-gray-300">
                      <span className="font-bold text-sm">TOTAL:</span>
                      <span className="font-black text-base">{formatRupiah(data.total || 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pt-1">
                      <span>Bayar:</span>
                      <span className="font-bold uppercase">{data.paymentMethod || 'cash'}</span>
                    </div>
                    {data.paymentMethod === 'cash' && data.cashTendered && (
                      <>
                        <div className="flex justify-between">
                          <span>Uang Diterima:</span>
                          <span>{formatRupiah(data.cashTendered)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>Kembalian:</span>
                          <span>{formatRupiah(data.changeAmount || 0)}</span>
                        </div>
                      </>
                    )}
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
                      <span className="font-bold uppercase">{data.customerName || data.name || '-'}</span>
                    </div>
                    {data.phone && (
                      <div className="flex justify-between py-1">
                        <span>No. HP:</span>
                        <span>{data.phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>Jatuh Tempo:</span>
                      <span>{data.dueDate || data.date || '-'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Status:</span>
                      <span className={`font-bold ${data.status === 'paid' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {data.status === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </div>
                  </div>

                  <div className="border-b border-dashed border-gray-400 my-2"></div>
                  
                  {(data.notes || data.description) && (
                    <>
                      <div className="mb-4">
                        <p className="mb-1 font-semibold">Keterangan / Rincian:</p>
                        <p className="break-words bg-gray-50 p-2 rounded text-[11px]">{data.notes || data.description}</p>
                      </div>
                      <div className="border-b border-dashed border-gray-400 my-2"></div>
                    </>
                  )}

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
          <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2.5">
            {downloadSuccess && (
              <div className="py-2 px-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>File PDF berhasil diunduh ke perangkat Anda!</span>
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onClose}
                className="py-2.5 px-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition text-xs sm:text-sm cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handleDownloadPdf}
                className="py-2.5 px-3 rounded-xl font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:bg-emerald-300 border border-emerald-200 transition flex items-center justify-center space-x-1.5 text-xs sm:text-sm cursor-pointer shadow-2xs"
                title="Download file PDF struk langsung"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>Unduh PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl font-bold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition shadow-md flex items-center justify-center space-x-1.5 text-xs sm:text-sm cursor-pointer"
                title="Cetak struk ke printer"
              >
                <Printer className="w-4 h-4 text-white" />
                <span>Cetak</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
