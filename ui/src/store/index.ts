import { configureStore } from '@reduxjs/toolkit';

import routerReducer from './router';

export const store = configureStore({
  reducer: {
    router: routerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
