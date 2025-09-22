import { expect, test } from 'vitest';
import { Stream } from 'src/classes';

test('Stream key', () => {
  expect(Stream.key('name', 'ipm')).toBe('name:ipm');
});

test('Stream from', () => {
  expect(Stream.from('name', 'ipm', 10).debug).toStrictEqual({
    type: 'Stream',
    name: 'name',
    measure: 'ipm',
    value: 10,
  });
  expect(Stream.from('name', 'ipm').debug).toStrictEqual({
    type: 'Stream',
    name: 'name',
    measure: 'ipm',
    value: 0,
  });
});

test('Stream copy', () => {
  const stream1 = Stream.from('name', 'ipm', 10);
  const stream2 = Stream.copy(stream1);
  stream2.value = 0;
  expect(stream1.key === stream2.key);
  expect(stream1.value !== stream2.value);
  expect(stream1.like(stream2));
});

test('Stream operations', () => {
  const stream1sum = Stream.from('name', 'ipm', 10).sum(
    Stream.from('name', 'ipm', 20),
  );
  const stream2sum = Stream.from('name', 'ipm', 10).sum(
    Stream.from('name2', 'ipm', 20),
  );
  const stream3sum = Stream.from('name', 'ipm', 10).sum(
    Stream.from('name', 'm3pm', 20),
  );
  expect(stream1sum.value).toBe(30);
  expect(stream2sum.value).toBe(10);
  expect(stream3sum.value).toBe(10);

  const stream1diff = Stream.from('name', 'ipm', 10).diff(
    Stream.from('name', 'ipm', 20),
  );
  const stream2diff = Stream.from('name', 'ipm', 10).diff(
    Stream.from('name2', 'ipm', 20),
  );
  const stream3diff = Stream.from('name', 'ipm', 10).diff(
    Stream.from('name', 'm3pm', 20),
  );
  expect(stream1diff.value).toBe(-10);
  expect(stream2diff.value).toBe(10);
  expect(stream3diff.value).toBe(10);

  const stream1prod = Stream.from('name', 'ipm', 10).prod(10);
  expect(stream1prod.value).toBe(100);

  const stream1rev = Stream.from('name', 'ipm', 10).rev();
  expect(stream1rev.value).toBe(-10);
});
