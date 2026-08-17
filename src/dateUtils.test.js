import test from 'node:test';
import assert from 'node:assert/strict';
import { getTanggalByHari } from './dateUtils.js';

test('getTanggalByHari returns the same date for the current weekday', () => {
  const result = getTanggalByHari('Selasa', new Date('2026-08-11T12:00:00'));
  assert.equal(result, '2026-08-11');
});

test('getTanggalByHari returns the next matching weekday when target is later in the week', () => {
  const result = getTanggalByHari('Rabu', new Date('2026-08-11T12:00:00'));
  assert.equal(result, '2026-08-12');
});

test('getTanggalByHari wraps to the next week when target day has passed', () => {
  const result = getTanggalByHari('Senin', new Date('2026-08-11T12:00:00'));
  assert.equal(result, '2026-08-17');
});
