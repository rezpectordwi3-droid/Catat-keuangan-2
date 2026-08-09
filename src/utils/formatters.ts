// Utility functions for formatting Indonesian Rupiah, Dates, etc.

export const formatRupiah = (amount: number): string => {
  const num = Number(amount);
  const clean = (isNaN(num) || !isFinite(num) || Math.abs(num) > 1_000_000_000) ? 0 : num;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(clean);
};

export const formatCompactRupiah = (amount: number): string => {
  const num = Number(amount);
  const clean = (isNaN(num) || !isFinite(num) || Math.abs(num) > 1_000_000_000) ? 0 : num;
  if (Math.abs(clean) >= 1_000_000_000) {
    return `Rp ${(clean / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  }
  if (Math.abs(clean) >= 1_000_000) {
    return `Rp ${(clean / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (Math.abs(clean) >= 1_000) {
    return `Rp ${(clean / 1_000).toFixed(0)} rb`;
  }
  return `Rp ${clean}`;
};

export const formatDateIndonesian = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    let dStr = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      dStr = dStr + 'T00:00:00';
    }
    const date = new Date(dStr);
    if (isNaN(date.getTime())) {
      return String(dateStr);
    }
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return String(dateStr);
  }
};

export const formatDateShort = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    let dStr = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(dStr)) {
      dStr = dStr + 'T00:00:00';
    }
    const date = new Date(dStr);
    if (isNaN(date.getTime())) {
      return String(dateStr);
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  } catch (e) {
    return String(dateStr);
  }
};

export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};
