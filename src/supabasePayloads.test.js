import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSupabasePayload, deserializeSupabaseRow, mergeRowsForDisplay, mergeRowsWithLatestState, filterRiwayatRows } from './supabasePayloads.js';

test('buildSupabasePayload keeps only safe riwayat columns', () => {
  const row = {
    id: 1,
    namaAnak: 'Ali',
    namaAsli: 'Ali',
    halaqoh: 'Halaqoh Tsuroyya',
    tanggal: '2026-08-10',
    hari: 'Senin',
    pekanLabel: 'Pekan 1',
    hadir: 'Hadir',
    jenisSetoran: 'Ziyadah (Hafalan Baru)',
    rincianCapaian: 'Setoran lancar',
    predikat: 'Qowy (Kuat)',
    skorAdab: 10,
    skorCapaian: 9,
    totalSkorPoin: 19,
    evaluasiBacaan: { catatan: 'baik' },
    createdBy: 'admin',
    updatedBy: 'admin'
  };

  const result = buildSupabasePayload('riwayat', row);

  assert.deepEqual(result, {
    id: 1,
    nama_anak: 'Ali',
    nama_asli: 'Ali',
    halaqoh: 'Halaqoh Tsuroyya',
    tanggal: '2026-08-10',
    hari: 'Senin',
    pekan_label: 'Pekan 1',
    hadir: 'Hadir',
    jenis_setoran: 'Ziyadah (Hafalan Baru)',
    rincian_capaian: 'Setoran lancar',
    predikat: 'Qowy (Kuat)',
    skor_adab: 10,
    skor_capaian: 9,
    total_skor_poin: 19,
    evaluasi_bacaan: { catatan: 'baik' }
  });
});

test('mergeRowsForDisplay keeps remote rows and appends local-only rows', () => {
  const remoteRows = [{ id: 1, namaAnak: 'Remote' }];
  const localRows = [{ id: 2, namaAnak: 'Local' }];

  const result = mergeRowsForDisplay(remoteRows, localRows);

  assert.deepEqual(result, [
    { id: 1, namaAnak: 'Remote' },
    { id: 2, namaAnak: 'Local' }
  ]);
});

test('deserializeSupabaseRow normalizes legacy null riwayat fields', () => {
  const row = {
    id: 1,
    nama_anak: 'ali',
    nama_asli: 'Ali',
    halaqoh: 'Halaqoh Tsuroyya',
    tanggal: '2026-08-10',
    hari: 'Senin',
    hadir: null,
    jenis_setoran: null,
    rincian_capaian: null,
    predikat: null,
    skor_adab: null,
    skor_capaian: null,
    total_skor_poin: null,
    evaluasi_bacaan: null,
  };

  const result = deserializeSupabaseRow('riwayat', row);

  assert.equal(result.hadir, '-');
  assert.equal(result.jenisSetoran, '-');
  assert.equal(result.rincianCapaian, '-');
  assert.equal(result.predikat, '-');
  assert.equal(result.skorAdab, 0);
  assert.equal(result.skorCapaian, 0);
  assert.equal(result.totalSkorPoin, 0);
  assert.equal(result.evaluasiBacaan, null);
});

test('mergeRowsWithLatestState keeps remote rows plus local-only rows', () => {
  const remoteRows = [{ id: 1, namaAsli: 'Remote' }];
  const localRows = [{ id: 2, namaAsli: 'Local' }];

  const result = mergeRowsWithLatestState(remoteRows, localRows);

  assert.deepEqual(result, [
    { id: 1, namaAsli: 'Remote' },
    { id: 2, namaAsli: 'Local' }
  ]);
});

test('filterRiwayatRows supports halaqoh and periode filters', () => {
  const rows = [
    { id: 1, halaqoh: 'Halaqoh Tsuroyya', tanggal: '2026-08-10', hari: 'Senin', pekanLabel: 'Pekan 2 Bulan Agustus 2026', hadir: 'Hadir', jenisSetoran: 'Ziyadah (Hafalan Baru)', rincianCapaian: 'A', predikat: 'Qowy (Kuat)', skorAdab: 1, skorCapaian: 0, totalSkorPoin: 1 },
    { id: 2, halaqoh: 'Halaqoh Abror', tanggal: '2026-08-11', hari: 'Selasa', pekanLabel: 'Pekan 2 Bulan Agustus 2026', hadir: 'Hadir', jenisSetoran: 'Ziyadah (Hafalan Baru)', rincianCapaian: 'B', predikat: 'Qowy (Kuat)', skorAdab: 1, skorCapaian: 0, totalSkorPoin: 1 }
  ];

  const result = filterRiwayatRows(rows, { role: 'guru', halaqoh: 'Halaqoh Tsuroyya' }, 'Halaqoh Tsuroyya', 'hari', 'Senin', '', '', '');

  assert.equal(result.length, 1);
  assert.equal(result[0].halaqoh, 'Halaqoh Tsuroyya');
});

test('filterRiwayatRows respects a guru-selected halaqoh instead of forcing all halaqoh', () => {
  const rows = [
    { id: 1, halaqoh: 'Halaqoh Abror', tanggal: '2026-08-10', hari: 'Senin', pekanLabel: 'Pekan 2 Bulan Agustus 2026', hadir: 'Hadir', jenisSetoran: 'Ziyadah (Hafalan Baru)', rincianCapaian: 'A', predikat: 'Qowy (Kuat)', skorAdab: 1, skorCapaian: 0, totalSkorPoin: 1 },
    { id: 2, halaqoh: 'Halaqoh Tsuroyya', tanggal: '2026-08-11', hari: 'Selasa', pekanLabel: 'Pekan 2 Bulan Agustus 2026', hadir: 'Hadir', jenisSetoran: 'Ziyadah (Hafalan Baru)', rincianCapaian: 'B', predikat: 'Qowy (Kuat)', skorAdab: 1, skorCapaian: 0, totalSkorPoin: 1 }
  ];

  const result = filterRiwayatRows(rows, { role: 'guru', halaqoh: 'Halaqoh Abror' }, 'Halaqoh Abror', 'semua', '', '', '', '');

  assert.equal(result.length, 1);
  assert.equal(result[0].halaqoh, 'Halaqoh Abror');
});

test('filterRiwayatRows hides legacy placeholder rows for all roles', () => {
  const rows = [
    { id: 1, halaqoh: 'Halaqoh Tsuroyya', tanggal: '2026-08-10', hadir: '-', jenisSetoran: '-', rincianCapaian: '-', predikat: '-', skorAdab: 0, skorCapaian: 0, totalSkorPoin: 0 },
    { id: 2, halaqoh: 'Halaqoh Tsuroyya', tanggal: '2026-08-10', hadir: 'Hadir', jenisSetoran: 'Ziyadah (Hafalan Baru)', rincianCapaian: 'A', predikat: 'Qowy (Kuat)', skorAdab: 2, skorCapaian: 3, totalSkorPoin: 5 }
  ];

  const guruResult = filterRiwayatRows(rows, { role: 'guru', halaqoh: 'Halaqoh Tsuroyya' }, 'Semua', 'semua', '', '', '', '');
  const adminResult = filterRiwayatRows(rows, { role: 'admin' }, 'Semua', 'semua', '', '', '', '');

  assert.equal(guruResult.length, 1);
  assert.equal(guruResult[0].id, 2);
  assert.equal(adminResult.length, 1);
});

