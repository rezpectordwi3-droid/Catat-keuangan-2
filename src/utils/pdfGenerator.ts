import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '../types';
import { formatRupiah } from './formatters';

interface FinancialReportPdfOptions {
  transactions: Transaction[];
  totalBalance: number;
  totalIn: number;
  totalOut: number;
  netProfit: number;
  periodLabel: string;
}

export const downloadFinancialReportPdf = ({
  transactions,
  totalBalance,
  totalIn,
  totalOut,
  netProfit,
  periodLabel,
}: FinancialReportPdfOptions) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary Header background bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('UANG WARUNG', 14, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text('Laporan Rekapitulasi Pembukuan & Arus Kas Keuangan', 14, 18);

  // Date on the right of header
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  const printedDateStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Dicetak: ${printedDateStr}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Periode: ${periodLabel}`, pageWidth - 14, 18, { align: 'right' });

  // Summary KPI Cards (Y = 32)
  const cardY = 32;
  const cardHeight = 22;
  const gap = 3.5;
  const totalCards = 4;
  const availableWidth = pageWidth - 28; // 14mm margin left and right
  const cardWidth = (availableWidth - gap * (totalCards - 1)) / totalCards;

  const summaryCards = [
    {
      title: 'TOTAL PEMASUKAN',
      value: formatRupiah(totalIn),
      bg: [236, 253, 245], // emerald-50
      border: [167, 243, 208], // emerald-200
      text: [6, 95, 70], // emerald-800
      valColor: [4, 120, 87], // emerald-700
    },
    {
      title: 'TOTAL PENGELUARAN',
      value: formatRupiah(totalOut),
      bg: [255, 241, 242], // rose-50
      border: [254, 205, 211], // rose-200
      text: [159, 18, 57], // rose-800
      valColor: [190, 18, 60], // rose-700
    },
    {
      title: 'LABA BERSIH',
      value: formatRupiah(netProfit),
      bg: netProfit >= 0 ? [240, 249, 255] : [255, 247, 237], // sky-50 / amber-50
      border: netProfit >= 0 ? [186, 230, 253] : [254, 215, 170],
      text: netProfit >= 0 ? [3, 105, 161] : [194, 65, 12],
      valColor: netProfit >= 0 ? [2, 132, 199] : [234, 88, 12],
    },
    {
      title: 'SALDO KAS SAAT INI',
      value: formatRupiah(totalBalance),
      bg: [248, 250, 252], // slate-50
      border: [203, 213, 225], // slate-300
      text: [51, 65, 85], // slate-700
      valColor: [15, 23, 42], // slate-900
    },
  ];

  summaryCards.forEach((card, index) => {
    const x = 14 + index * (cardWidth + gap);
    doc.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
    doc.setDrawColor(card.border[0], card.border[1], card.border[2]);
    doc.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(card.text[0], card.text[1], card.text[2]);
    doc.text(card.title, x + 3, cardY + 6);

    // Value
    doc.setFontSize(8.5);
    doc.setTextColor(card.valColor[0], card.valColor[1], card.valColor[2]);
    doc.text(card.value, x + 3, cardY + 14);
  });

  // Section Title for Transactions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(`Rincian Transaksi (${transactions.length} baris)`, 14, 60);

  // Table Data Preparation
  const tableRows = transactions.map((t, idx) => {
    const isIncome = t.type === 'cash_in';
    const typeLabel = isIncome ? '+ Masuk' : '- Keluar';
    const formattedAmount = `${isIncome ? '+' : '-'} ${formatRupiah(t.amount)}`;
    const dateTimeStr = `${t.date} ${t.time || ''}`.trim();
    const accountStr = t.account ? t.account.toUpperCase() : 'TUNAI';

    return [
      (idx + 1).toString(),
      dateTimeStr,
      typeLabel,
      t.categoryName || '-',
      accountStr,
      t.notes || '-',
      formattedAmount,
    ];
  });

  // Render Table with autoTable
  autoTable(doc, {
    startY: 64,
    margin: { left: 14, right: 14, bottom: 20 },
    head: [['No', 'Tanggal & Waktu', 'Jenis', 'Kategori', 'Akun Kas', 'Catatan / Deskripsi', 'Nominal']],
    body: tableRows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.2,
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.2,
      textColor: [51, 65, 85], // slate-700
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28 },
      2: { cellWidth: 18, fontStyle: 'bold' },
      3: { cellWidth: 32 },
      4: { cellWidth: 20 },
      5: { cellWidth: 'auto' },
      6: { cellWidth: 28, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    didParseCell: (data) => {
      // Colorize the 'Jenis' and 'Nominal' columns
      if (data.section === 'body') {
        const rawRow = transactions[data.row.index];
        if (rawRow) {
          const isIncome = rawRow.type === 'cash_in';
          if (data.column.index === 2) {
            data.cell.styles.textColor = isIncome ? [5, 150, 105] : [225, 29, 72];
          }
          if (data.column.index === 6) {
            data.cell.styles.textColor = isIncome ? [4, 120, 87] : [190, 18, 60];
          }
        }
      }
    },
    didDrawPage: () => {
      // Footer on every page
      const currentYear = new Date().getFullYear();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400

      // Left footer
      doc.text(
        `Dokumen resmi dibuat otomatis oleh Uang Warung © ${currentYear} • Sistem Pembukuan Kas Digital`,
        14,
        pageHeight - 8
      );

      // Right footer page number
      const pageNumberStr = `Halaman ${(doc as any).internal.getNumberOfPages()}`;
      doc.text(pageNumberStr, pageWidth - 14, pageHeight - 8, { align: 'right' });
    },
  });

  // Trigger browser download
  const cleanPeriod = periodLabel.replace(/\s+/g, '_').toLowerCase();
  const dateStamp = new Date().toISOString().slice(0, 10);
  const filename = `Laporan_Keuangan_Warung_${cleanPeriod}_${dateStamp}.pdf`;
  doc.save(filename);
};

export const downloadReceiptPdf = (data: any, type: 'transaction' | 'kasbon' | 'report') => {
  // Use a slip receipt size: 80mm width, dynamic height
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 160], // Thermal slip format
  });

  const pageWidth = 80;
  const todayStr = new Date().toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text('UANG WARUNG', pageWidth / 2, 12, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Catatan Keuangan Pintar Warung', pageWidth / 2, 16, { align: 'center' });

  // Dashed separator line
  doc.setLineDashPattern([1, 1], 0);
  doc.setDrawColor(148, 163, 184);
  doc.line(6, 20, pageWidth - 6, 20);

  let curY = 26;

  if (type === 'transaction') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('BUKTI TRANSAKSI', pageWidth / 2, curY, { align: 'center' });

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(todayStr, pageWidth / 2, curY, { align: 'center' });

    curY += 8;
    const isIncome = data.type === 'cash_in';
    const fields = [
      ['Jenis', isIncome ? 'Pemasukan (+)' : 'Pengeluaran (-)'],
      ['Kategori', data.categoryName || '-'],
      ['Akun Kas', (data.account || 'Tunai').toUpperCase()],
      ['Waktu', `${data.date || ''} ${data.time || ''}`.trim()],
    ];

    fields.forEach(([label, val]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 8, curY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, pageWidth - 8, curY, { align: 'right' });
      curY += 5.5;
    });

    curY += 2;
    doc.line(6, curY, pageWidth - 6, curY);
    curY += 6;

    if (data.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Catatan:', 8, curY);
      curY += 4.5;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(51, 65, 85);
      const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 16);
      doc.text(splitNotes, 8, curY);
      curY += splitNotes.length * 4.5;
      curY += 2;
      doc.line(6, curY, pageWidth - 6, curY);
      curY += 6;
    }

    // Total Amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL', 8, curY);

    doc.setFontSize(12);
    doc.setTextColor(isIncome ? 5 : 225, isIncome ? 150 : 29, isIncome ? 105 : 72);
    doc.text(formatRupiah(data.amount || 0), pageWidth - 8, curY, { align: 'right' });
  } else if (type === 'kasbon') {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('BUKTI KASBON / HUTANG', pageWidth / 2, curY, { align: 'center' });

    curY += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(todayStr, pageWidth / 2, curY, { align: 'center' });

    curY += 8;
    const isPaid = data.status === 'paid';
    const customer = data.customerName || data.name || '-';
    const fields = [
      ['Nama Pelanggan', customer],
      ['No. HP', data.phone || '-'],
      ['Status', isPaid ? 'LUNAS' : 'BELUM LUNAS'],
      ['Jatuh Tempo', data.dueDate || data.date || '-'],
    ];

    fields.forEach(([label, val]) => {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(label, 8, curY);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(val, pageWidth - 8, curY, { align: 'right' });
      curY += 5.5;
    });

    curY += 2;
    doc.line(6, curY, pageWidth - 6, curY);
    curY += 6;

    const detailNotes = data.notes || data.description || '';
    if (detailNotes) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Keterangan / Rincian:', 8, curY);
      curY += 4.5;
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(51, 65, 85);
      const splitNotes = doc.splitTextToSize(detailNotes, pageWidth - 16);
      doc.text(splitNotes, 8, curY);
      curY += splitNotes.length * 4.5;
      curY += 2;
      doc.line(6, curY, pageWidth - 6, curY);
      curY += 6;
    }

    // Total Amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('TOTAL TAGIHAN', 8, curY);

    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text(formatRupiah(data.amount || 0), pageWidth - 8, curY, { align: 'right' });
  }

  // Slip Footer
  curY += 10;
  doc.setLineDashPattern([1, 1], 0);
  doc.line(6, curY, pageWidth - 6, curY);
  curY += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Terima kasih atas kepercayaannya!', pageWidth / 2, curY, { align: 'center' });
  curY += 4;
  doc.text('Dicetak otomatis dari Uang Warung', pageWidth / 2, curY, { align: 'center' });

  const filename = `Struk_${type}_${Date.now()}.pdf`;
  doc.save(filename);
};
