import { beforeEach, expect, test } from 'vitest';
import { StreamSet, Stream } from 'src/classes';

test('StreamSet constructor', () => {
  const streamSet = new StreamSet(
    Stream.from('name1', 'ipm', -10),
    Stream.from('name2', 'm3pm', 100),
  );
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [
      {
        type: 'Stream',
        measure: 'ipm',
        name: 'name1',
        value: -10,
      },
      {
        type: 'Stream',
        measure: 'm3pm',
        name: 'name2',
        value: 100,
      },
    ],
  });
});

let streamSet: StreamSet;

beforeEach(() => {
  streamSet = new StreamSet();
});

test('StreamSet add', () => {
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [],
  });

  expect(streamSet.add(Stream.from('name', 'ipm', 100)).debug).toStrictEqual({
    type: 'StreamSet',
    set: [
      {
        type: 'Stream',
        name: 'name',
        measure: 'ipm',
        value: 100,
      },
    ],
  });

  expect(
    streamSet.add(
      Stream.from('name', 'ipm', 100),
      Stream.from('name2', 'm3pm', 100),
    ).debug,
  ).toStrictEqual({
    type: 'StreamSet',
    set: [
      {
        type: 'Stream',
        name: 'name',
        measure: 'ipm',
        value: 200,
      },
      {
        type: 'Stream',
        name: 'name2',
        measure: 'm3pm',
        value: 100,
      },
    ],
  });
});

test('StreamSet sum', () => {
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [],
  });

  expect(
    streamSet
      .add(Stream.from('name', 'ipm', 100), Stream.from('name2', 'm3pm', 100))
      .sum(
        new StreamSet(
          Stream.from('name', 'ipm', 100),
          Stream.from('name2', 'm3pm', 100),
          Stream.from('name3', 'MW', 100),
        ),
      ).debug,
  ).toStrictEqual({
    type: 'StreamSet',
    set: [
      { type: 'Stream', name: 'name', measure: 'ipm', value: 200 },
      { type: 'Stream', name: 'name2', measure: 'm3pm', value: 200 },
      { type: 'Stream', name: 'name3', measure: 'MW', value: 100 },
    ],
  });
});

test('StreamSet diff', () => {
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [],
  });

  expect(
    streamSet
      .add(Stream.from('name', 'ipm', 100), Stream.from('name2', 'm3pm', 100))
      .diff(
        new StreamSet(
          Stream.from('name', 'ipm', 100),
          Stream.from('name2', 'm3pm', 100),
          Stream.from('name3', 'MW', 100),
        ),
      ).debug,
  ).toStrictEqual({
    type: 'StreamSet',
    set: [
      { type: 'Stream', name: 'name', measure: 'ipm', value: 0 },
      { type: 'Stream', name: 'name2', measure: 'm3pm', value: 0 },
      { type: 'Stream', name: 'name3', measure: 'MW', value: -100 },
    ],
  });
});

test('StreamSet prod', () => {
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [],
  });

  expect(
    streamSet
      .add(Stream.from('name', 'ipm', 100), Stream.from('name2', 'm3pm', 100))
      .prod(10).debug,
  ).toStrictEqual({
    type: 'StreamSet',
    set: [
      { type: 'Stream', name: 'name', measure: 'ipm', value: 1000 },
      { type: 'Stream', name: 'name2', measure: 'm3pm', value: 1000 },
    ],
  });
});

test('StreamSet rev', () => {
  expect(streamSet.debug).toStrictEqual({
    type: 'StreamSet',
    set: [],
  });

  expect(
    streamSet
      .add(Stream.from('name', 'ipm', 100), Stream.from('name2', 'm3pm', 100))
      .rev().debug,
  ).toStrictEqual({
    type: 'StreamSet',
    set: [
      { type: 'Stream', name: 'name', measure: 'ipm', value: -100 },
      { type: 'Stream', name: 'name2', measure: 'm3pm', value: -100 },
    ],
  });
});
