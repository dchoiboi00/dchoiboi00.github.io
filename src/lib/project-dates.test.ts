import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatLength, formatPeriod } from './project-dates.ts';

test('formatLength counts short projects in weeks', () => {
  assert.equal(formatLength('2026-06-26', '2026-07-08'), '2 weeks');
  assert.equal(formatLength('2026-09-08', '2026-09-30'), '3 weeks');
  assert.equal(formatLength('2026-01-01', '2026-01-03'), '1 week');
});

test('formatLength counts longer projects in months', () => {
  assert.equal(formatLength('2026-04-14', '2026-06-05'), '2 months');
  assert.equal(formatLength('2025-10-08', '2026-02-05'), '4 months');
});

test('formatPeriod shortens the range when the year or month repeats', () => {
  assert.equal(formatPeriod('2025-10-08', '2026-02-05'), 'Oct 2025 – Feb 2026');
  assert.equal(formatPeriod('2026-04-14', '2026-06-05'), 'Apr – Jun 2026');
  assert.equal(formatPeriod('2026-09-08', '2026-09-30'), 'Sep 2026');
});

test('both reject an end date before the start date', () => {
  assert.throws(() => formatLength('2026-02-01', '2026-01-01'), /ends before it starts/);
  assert.throws(() => formatPeriod('2026-02-01', '2026-01-01'), /ends before it starts/);
});
