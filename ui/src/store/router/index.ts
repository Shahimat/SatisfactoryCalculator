import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../index';

export enum RouterPage {
  None = 'none',
  Home = '/',
  Plants = '/plants',
  Schemes = '/schemes',
  Factories = '/factories',
  Items = '/items',
  Icons = '/icons',
  Help = '/help',
}

export interface RouterState {
  current: RouterPage;
}

const initialState: RouterState = {
  current: RouterPage.None,
};

export const routerSlice = createSlice({
  name: 'router',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    setRoute: (state, action: PayloadAction<RouterPage>) => {
      state.current = action.payload;
    },
  },
});

export const { setRoute } = routerSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectorRouter = (state: RootState) => state.router.current;

export default routerSlice.reducer;
