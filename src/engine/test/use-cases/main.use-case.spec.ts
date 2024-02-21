import { describe, expect, test } from '@jest/globals';
import { MainUseCase } from 'src/use-cases/main.use-case';

describe('main tests', () => {
  test('getError', () => {
    expect(MainUseCase.hello()).toEqual(true);
  });
});
