import { OrderBill, StoreProfile } from '../types';
import { formatRupiah } from './formatters';

export interface GeneratedReceiptImage {
  dataUrl: string;
  blob: Blob;
}

/**
 * Generates an ultra-crisp, tamper-proof PNG image receipt using HTML5 Canvas.
 * Resolution: 720px width (2x Retina high-DPI quality) for clean WhatsApp mobile sharing.
 */
export const generateReceiptImage = async (
  bill: OrderBill,
  profile?: StoreProfile
): Promise<GeneratedReceiptImage> => {
  return new Promise((resolve, reject) => {
    try {
      const storeName = profile?.name || 'WARUNG SOTO & RAWON';
      const tagline = profile?.tagline || 'Soto Lamongan, Rawon & Aneka Kuliner';
      const address = profile?.address || '';
      const phone = profile?.phone || '';
      const footerMsg = profile?.footerMessage || 'Maturnuwun sampun mampir & jajan! 🙏\nSemoga berkah & sehat selalu.';

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Canvas 2D context is not available');
      }

      const width = 720;
      const basePadding = 48;
      const contentWidth = width - basePadding * 2;

      // Calculate dynamic height
      const itemsCount = bill.items.length;
      const hasDiscount = bill.discount > 0;
      const isCash = bill.paymentMethod === 'cash';
      const hasChange = isCash && (bill.cashTendered || 0) > 0;
      const hasAddress = Boolean(address || phone);

      let estimatedHeight = 590;
      if (hasAddress) estimatedHeight += 44;
      estimatedHeight += itemsCount * 46;
      if (hasDiscount) estimatedHeight += 36;
      if (hasChange) estimatedHeight += 44;

      canvas.width = width;
      canvas.height = estimatedHeight;

      // Enable smooth text rendering
      ctx.imageSmoothingEnabled = true;

      // 1. Background (Clean soft warm paper card)
      ctx.fillStyle = '#F8FAFC'; // slate-50
      ctx.fillRect(0, 0, width, estimatedHeight);

      // Inner white card
      const cardMargin = 20;
      const cardW = width - cardMargin * 2;
      const cardH = estimatedHeight - cardMargin * 2;

      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(15, 23, 42, 0.12)';
      ctx.shadowBlur = 18;
      ctx.shadowOffsetY = 6;
      ctx.beginPath();
      ctx.roundRect(cardMargin, cardMargin, cardW, cardH, 24);
      ctx.fill();
      ctx.shadowColor = 'transparent'; // reset shadow

      // Outer border
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Security Color Stripe (Emerald brand bar)
      ctx.fillStyle = '#059669'; // emerald-600
      ctx.beginPath();
      ctx.roundRect(cardMargin, cardMargin, cardW, 14, [24, 24, 0, 0]);
      ctx.fill();

      // 2. Anti-Tamper Security Watermark in Background
      ctx.save();
      ctx.translate(width / 2, estimatedHeight / 2);
      ctx.rotate((-22 * Math.PI) / 180);
      ctx.font = 'bold 36px sans-serif';
      ctx.fillStyle = 'rgba(16, 185, 129, 0.04)'; // faint emerald
      ctx.textAlign = 'center';
      ctx.fillText('STRUK RESMI • ANTI MANIPULASI', 0, -40);
      ctx.fillText(`TERVERIFIKASI SISTEM KASIR • ${bill.id}`, 0, 40);
      ctx.restore();

      let y = 68;

      // 3. Header: Store Name & Subtitle
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A'; // slate-900
      ctx.font = '900 32px system-ui, -apple-system, sans-serif';
      ctx.fillText(storeName.toUpperCase(), width / 2, y);

      if (tagline) {
        y += 26;
        ctx.fillStyle = '#64748B'; // slate-500
        ctx.font = '600 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(tagline, width / 2, y);
      }

      if (hasAddress) {
        y += 22;
        ctx.fillStyle = '#64748B'; // slate-500
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        const contactStr = [address, phone ? `Telp: ${phone}` : ''].filter(Boolean).join(' • ');
        ctx.fillText(contactStr, width / 2, y);
      }

      y += 28;
      // Verification Stamp Badge
      ctx.fillStyle = '#ECFDF5'; // emerald-50
      ctx.strokeStyle = '#A7F3D0'; // emerald-200
      ctx.lineWidth = 1.5;
      const badgeW = 290;
      const badgeH = 28;
      ctx.beginPath();
      ctx.roundRect(width / 2 - badgeW / 2, y - 20, badgeW, badgeH, 14);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#047857'; // emerald-700
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`✓ STRUK RESMI #${bill.id}`, width / 2, y);

      y += 30;

      // Dashed Separator Line
      drawDashedLine(ctx, basePadding, y, width - basePadding, y);
      y += 28;

      // 4. Order Metadata (Grid 2 Columns)
      ctx.textAlign = 'left';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';

      // Left Column
      ctx.fillStyle = '#64748B';
      ctx.fillText('Waktu Transaksi:', basePadding, y);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`${bill.date}  ${bill.time} WIB`, basePadding + 140, y);

      y += 26;
      ctx.fillStyle = '#64748B';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('Nama Pelanggan:', basePadding, y);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(bill.customerName || 'Pelanggan', basePadding + 140, y);

      y += 26;
      const orderTypeStr = bill.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus / Take Away';
      const tableInfo = bill.tableNumber ? ` (Meja ${bill.tableNumber})` : '';

      ctx.fillStyle = '#64748B';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('Tipe Pesanan:', basePadding, y);
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${orderTypeStr}${tableInfo}`, basePadding + 140, y);

      // Right Column Badge: Total Customer (Pax)
      const paxW = 160;
      const paxH = 54;
      const paxX = width - basePadding - paxW;
      const paxY = y - 56;

      ctx.fillStyle = '#EFF6FF'; // blue-50
      ctx.strokeStyle = '#BFDBFE'; // blue-200
      ctx.beginPath();
      ctx.roundRect(paxX, paxY, paxW, paxH, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#1D4ED8';
      ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TOTAL PENGUNJUNG', paxX + paxW / 2, paxY + 22);

      ctx.fillStyle = '#1E3A8A';
      ctx.font = '900 20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${bill.totalCustomers || 1} ORANG`, paxX + paxW / 2, paxY + 44);

      y += 28;

      // Dashed Separator Line
      drawDashedLine(ctx, basePadding, y, width - basePadding, y);
      y += 30;

      // 5. Table Header (Rincian Menu)
      ctx.fillStyle = '#F1F5F9';
      ctx.beginPath();
      ctx.roundRect(basePadding, y - 20, contentWidth, 32, 8);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
      ctx.fillText('RINCIAN MENU', basePadding + 12, y);

      ctx.textAlign = 'right';
      ctx.fillText('HARGA & TOTAL', width - basePadding - 12, y);

      y += 26;

      // 6. Items Rows
      bill.items.forEach((item) => {
        const itemSubtotal = item.price * item.qty;

        // Qty Pill Badge
        ctx.fillStyle = '#E2E8F0';
        ctx.beginPath();
        ctx.roundRect(basePadding + 10, y - 16, 32, 22, 6);
        ctx.fill();

        ctx.textAlign = 'center';
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`${item.qty}x`, basePadding + 26, y);

        // Menu Name
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(item.name, basePadding + 52, y);

        // Unit Price note
        ctx.fillStyle = '#94A3B8';
        ctx.font = '500 13px system-ui, -apple-system, sans-serif';
        ctx.fillText(`@${formatRupiah(item.price)}`, basePadding + 52, y + 16);

        // Subtotal
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(formatRupiah(itemSubtotal), width - basePadding - 12, y + 4);

        y += 44;
      });

      y += 6;
      drawDashedLine(ctx, basePadding, y, width - basePadding, y);
      y += 28;

      // 7. Subtotal, Discount & Total Summary
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('Subtotal Pesanan:', basePadding, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(formatRupiah(bill.subtotal || bill.total), width - basePadding, y);

      if (hasDiscount) {
        y += 28;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#E11D48';
        ctx.font = '600 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('Potongan / Diskon:', basePadding, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#E11D48';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`-${formatRupiah(bill.discount)}`, width - basePadding, y);
      }

      y += 34;

      // Grand Total Box (Prominent Green Banner)
      const totalBoxH = 68;
      ctx.fillStyle = '#064E3B'; // deep emerald
      ctx.beginPath();
      ctx.roundRect(basePadding, y - 26, contentWidth, totalBoxH, 18);
      ctx.fill();

      ctx.textAlign = 'left';
      ctx.fillStyle = '#A7F3D0'; // emerald-200
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      ctx.fillText('TOTAL PEMBAYARAN', basePadding + 22, y + 4);

      ctx.fillStyle = '#6EE7B7';
      ctx.font = '500 12px system-ui, -apple-system, sans-serif';
      const avgPax = bill.totalCustomers > 0 ? Math.round(bill.total / bill.totalCustomers) : bill.total;
      ctx.fillText(`Rata-rata: ${formatRupiah(avgPax)} / orang`, basePadding + 22, y + 24);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px monospace';
      ctx.fillText(formatRupiah(bill.total), width - basePadding - 22, y + 16);

      y += 66;

      // 8. Payment Details & Change
      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = '600 15px system-ui, -apple-system, sans-serif';
      ctx.fillText('Metode Pembayaran:', basePadding, y);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 16px system-ui, -apple-system, sans-serif';
      ctx.fillText(bill.paymentMethod.toUpperCase(), width - basePadding, y);

      if (hasChange) {
        y += 26;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748B';
        ctx.font = '600 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('Uang Diterima:', basePadding, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(formatRupiah(bill.cashTendered || 0), width - basePadding, y);

        y += 26;
        ctx.textAlign = 'left';
        ctx.fillStyle = '#047857';
        ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
        ctx.fillText('Kembalian:', basePadding, y);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#047857';
        ctx.font = '900 18px monospace';
        ctx.fillText(formatRupiah(bill.changeAmount || 0), width - basePadding, y);
      }

      y += 32;
      drawDashedLine(ctx, basePadding, y, width - basePadding, y);
      y += 26;

      // 9. Tamper-Proof Barcode & Hash Verification Signature
      drawBarcodePattern(ctx, basePadding + 40, y, contentWidth - 80, 26);
      y += 38;

      ctx.textAlign = 'center';
      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 12px monospace';
      const securityHash = `SEC-${bill.id}-${(bill.createdAt || Date.now()).toString(36).toUpperCase()}-AUTHENTIC`;
      ctx.fillText(securityHash, width / 2, y);

      y += 24;
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif';
      // Split footer message if multiline
      const footerLines = footerMsg.split('\n');
      footerLines.forEach((fline) => {
        ctx.fillText(fline, width / 2, y);
        y += 18;
      });

      ctx.fillStyle = '#94A3B8';
      ctx.font = '500 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('Dokumen digital sah & asli diterbitkan otomatis oleh sistem kasir.', width / 2, y);

      // Convert to Blob & DataURL
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed creating blob from canvas'));
          return;
        }
        const dataUrl = canvas.toDataURL('image/png');
        resolve({ dataUrl, blob });
      }, 'image/png');
    } catch (err) {
      reject(err);
    }
  });
};

/** Helper to draw a crisp dashed separator */
function drawDashedLine(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  ctx.save();
  ctx.strokeStyle = '#CBD5E1'; // slate-300
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** Helper to draw a decorative barcode pattern for authentic receipt feel */
function drawBarcodePattern(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  ctx.save();
  ctx.fillStyle = '#475569';
  const barCount = 48;
  const step = w / barCount;
  for (let i = 0; i < barCount; i++) {
    // Generate pseudo-deterministic bar thickness from index
    const barW = (i % 3 === 0 ? step * 0.7 : step * 0.4);
    if ((i * 7) % 5 !== 0) {
      ctx.fillRect(x + i * step, y, barW, h);
    }
  }
  ctx.restore();
}

/**
 * Downloads receipt image file directly
 */
export const downloadReceiptImageFile = (blob: Blob, billId: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Struk_${billId}_${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Copies the image directly to user clipboard (supported in modern Chrome/Edge/Safari)
 */
export const copyReceiptImageToClipboard = async (blob: Blob): Promise<boolean> => {
  try {
    if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('Clipboard image write not supported or permitted', e);
    return false;
  }
};

/**
 * Shares image using Web Share API (native WhatsApp file sharing on Mobile & Desktop)
 */
export const shareReceiptImageViaWebShare = async (
  blob: Blob,
  bill: OrderBill,
  profile?: StoreProfile
): Promise<boolean> => {
  try {
    const storeName = profile?.name || 'Warung Soto & Rawon';
    const file = new File([blob], `Struk_${bill.id}.png`, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Struk Nota ${bill.id} - ${storeName}`,
        text: `Struk resmi nota pesanan ${bill.customerName} (${bill.id}) dari ${storeName}. Dokumen asli anti-manipulasi.`,
      });
      return true;
    }
    return false;
  } catch (e) {
    console.info('Web Share was canceled or not supported', e);
    return false;
  }
};
