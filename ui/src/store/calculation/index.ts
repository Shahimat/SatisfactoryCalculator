import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import type { RootState } from '../index';

export interface CalculationEntity {
  id: number;
  name: string;
}

const calculationAdapter = createEntityAdapter<CalculationEntity>({
  selectId: (model) => model.id,
});

export const calculationSlice = createSlice({
  name: 'calculation',
  initialState: calculationAdapter.getInitialState(),
  reducers: {
    addOneCalculation: calculationAdapter.addOne,
  },
});

export const { addOneCalculation } = calculationSlice.actions;

export const selectorCalculation = calculationAdapter.getSelectors<RootState>(
  (state) => state.calculation,
);

export default calculationSlice.reducer;
