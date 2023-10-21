import { configureStore } from '@reduxjs/toolkit';

import calculationReducer from './calculation';
import routerReducer from './router';

export const store = configureStore({
  reducer: {
    router: routerReducer,
    calculation: calculationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
