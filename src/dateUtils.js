const JAKARTA_OFFSET_MINUTES = 7 * 60;

const dayNameMap = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 0,
};

function toTitleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function toJakartaDate(date = new Date()) {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60_000;
  return new Date(utcMs + JAKARTA_OFFSET_MINUTES * 60_000);
}

export function formatDateLocal(date = new Date()) {
  const jakartaDate = toJakartaDate(date);
  const year = jakartaDate.getFullYear();
  const month = String(jakartaDate.getMonth() + 1).padStart(2, '0');
  const day = String(jakartaDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateStr(date = new Date()) {
  return formatDateLocal(date);
}

export function formatDateDisplay(dateStr) {
  if (!dateStr) return '-';
  const localDate = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(localDate.getTime())) return dateStr;
  return localDate.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function getInitialHari(date = new Date()) {
  const jakartaDate = toJakartaDate(date);
  const dayName = jakartaDate.toLocaleDateString('id-ID', { weekday: 'long' });
  const formatted = toTitleCase(dayName);
  return Object.prototype.hasOwnProperty.call(dayNameMap, formatted) ? formatted : 'Senin';
}

export function getHariByTanggal(dateStr) {
  if (!dateStr) return 'Senin';
  const localDate = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(localDate.getTime())) return 'Senin';
  const dayName = localDate.toLocaleDateString('id-ID', { weekday: 'long' });
  const formatted = toTitleCase(dayName);
  return Object.prototype.hasOwnProperty.call(dayNameMap, formatted) ? formatted : 'Senin';
}

export function getTanggalByHari(targetHari, currentDate = new Date()) {
  const targetDayNum = dayNameMap[targetHari] ?? 1;
  const currentDayName = getInitialHari(currentDate);
  const currentDayNum = dayNameMap[currentDayName] ?? 1;
  let diff = targetDayNum - currentDayNum;

  if (diff < 0) {
    diff += 7;
  }

  const jakartaDate = toJakartaDate(currentDate);
  const targetDate = new Date(jakartaDate);
  targetDate.setDate(jakartaDate.getDate() + diff);
  return formatDateLocal(targetDate);
}
