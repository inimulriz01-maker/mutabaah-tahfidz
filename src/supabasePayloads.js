const SAFE_COLUMNS = {
  riwayat: new Set([
    'id',
    'nama_anak',
    'nama_asli',
    'halaqoh',
    'tanggal',
    'hari',
    'pekan_label',
    'hadir',
    'jenis_setoran',
    'rincian_capaian',
    'predikat',
    'skor_adab',
    'skor_capaian',
    'total_skor_poin',
    'evaluasi_bacaan'
  ]),
  riwayat_ukl: new Set([
    'id',
    'nama_key',
    'nama_asli',
    'nama_halaqoh',
    'jenis_ujian',
    'materi_ujian',
    'penguji',
    'tanggal',
    'hasil_ujian',
    'catatan_ujian'
  ]),
  riwayat_absensi_guru: new Set([
    'id',
    'nama_halaqoh',
    'ustadz',
    'tanggal',
    'hari',
    'pekan',
    'kehadiran',
    'keterangan'
  ])
};

const toSnakeCase = (str) => str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
const toCamelCase = (str) => str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const mapKeys = (obj, mapper) => Object.fromEntries(
  Object.entries(obj).map(([key, value]) => [mapper(key), value])
);

const sanitizeSupabaseRow = (row) => {
  const forbiddenKeys = new Set(['createdBy', 'updatedBy', 'created_by', 'updated_by', 'createdAt', 'updatedAt', 'created_at', 'updated_at']);
  return Object.fromEntries(Object.entries(row).filter(([key]) => !forbiddenKeys.has(key)));
};

const normalizeRiwayatForWrite = (row) => {
  const skorAdab = Number.isFinite(row.skorAdab) ? row.skorAdab : 0;
  const skorCapaian = Number.isFinite(row.skorCapaian) ? row.skorCapaian : 0;
  const totalSkorPoin = Number.isFinite(row.totalSkorPoin) ? row.totalSkorPoin : (skorAdab + skorCapaian);

  return {
    ...row,
    pekanLabel: row.pekanLabel || 'Pekan 1',
    hadir: row.hadir || '-',
    jenisSetoran: row.jenisSetoran || '-',
    rincianCapaian: row.rincianCapaian || '-',
    predikat: row.predikat || '-',
    skorAdab,
    skorCapaian,
    totalSkorPoin,
    evaluasiBacaan: row.evaluasiBacaan ?? null,
  };
};

export function buildSupabasePayload(table, row) {
  const sourceRow = table === 'riwayat' ? normalizeRiwayatForWrite(row) : row;
  const safeRow = sanitizeSupabaseRow(sourceRow);
  const snakeRow = mapKeys(safeRow, toSnakeCase);

  const allowedColumns = SAFE_COLUMNS[table] || new Set(Object.keys(snakeRow));
  const payload = Object.fromEntries(
    Object.entries(snakeRow).filter(([key]) => allowedColumns.has(key))
  );

  return payload;
}

export function deserializeSupabaseRow(table, row) {
  const camelRow = mapKeys(row, toCamelCase);
  if (table === 'riwayat') {
    const skorAdab = Number.isFinite(camelRow.skorAdab) ? camelRow.skorAdab : 0;
    const skorCapaian = Number.isFinite(camelRow.skorCapaian) ? camelRow.skorCapaian : 0;
    const totalSkorPoin = Number.isFinite(camelRow.totalSkorPoin)
      ? camelRow.totalSkorPoin
      : skorAdab + skorCapaian;

    return {
      ...camelRow,
      hadir: camelRow.hadir || '-',
      jenisSetoran: camelRow.jenisSetoran || '-',
      rincianCapaian: camelRow.rincianCapaian || '-',
      predikat: camelRow.predikat || '-',
      skorAdab,
      skorCapaian,
      totalSkorPoin,
      evaluasiBacaan: camelRow.evaluasiBacaan || null,
    };
  }

  return camelRow;
}

export function mergeRowsForDisplay(remoteRows = [], localRows = []) {
  const merged = [...remoteRows];
  const remoteIds = new Set(remoteRows.map((item) => item.id));

  localRows.forEach((localItem) => {
    if (!remoteIds.has(localItem.id)) {
      merged.push(localItem);
    }
  });

  return merged;
}

export function mergeRowsWithLatestState(remoteRows = [], localRows = []) {
  return mergeRowsForDisplay(remoteRows, localRows);
}

export function filterRiwayatRows(
  rows,
  currentUser,
  adminHalaqohFilter,
  adminPeriodeFilter,
  adminFilterHari,
  adminFilterTanggal,
  adminFilterPekan,
  adminFilterBulan
) {
  return rows.filter((item) => {
    const isLegacyPlaceholderRow =
      item?.hadir === '-' &&
      item?.jenisSetoran === '-' &&
      item?.rincianCapaian === '-' &&
      item?.predikat === '-' &&
      Number(item?.skorAdab ?? 0) === 0 &&
      Number(item?.skorCapaian ?? 0) === 0 &&
      Number(item?.totalSkorPoin ?? 0) === 0;

    if (isLegacyPlaceholderRow) {
      return false;
    }

    if (adminHalaqohFilter !== 'Semua' && item.halaqoh !== adminHalaqohFilter) {
      return false;
    }

    if (adminPeriodeFilter === 'hari' && adminFilterHari) {
      if (item.hari !== adminFilterHari) return false;
    }
    if (adminPeriodeFilter === 'tanggal' && adminFilterTanggal) {
      if (item.tanggal !== adminFilterTanggal) return false;
    }
    if (adminPeriodeFilter === 'pekan' && adminFilterPekan) {
      const pekanLabel = item.pekanLabel || '';
      if (!pekanLabel.includes(adminFilterPekan)) return false;
    }
    if (adminPeriodeFilter === 'bulan' && adminFilterBulan) {
      if (!String(item.tanggal || '').startsWith(adminFilterBulan)) return false;
    }

    return true;
  });
}
