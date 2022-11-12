import { useEffect } from 'react';
import { Routes, Route, Outlet, Link, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from 'hooks/store';
import { setRoute, selectorRouter, RouterPage } from 'store/router';
import { block } from '../lib/slf';

import MainLayout from 'components/layouts/MainLayout';
import HomePage from 'pages/Home';
import PlantsPage from 'pages/Plants';
import SchemesAndItemsPage from 'pages/SchemesAndItems';
import HelpPage from 'pages/Help';

const routerSet = block(
  (prev: RouterPage, current: RouterPage, dispatch: Function) => {
    if (prev !== current) {
      dispatch(setRoute(current));
    }
  },
);

export default function RouterWrapper() {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectorRouter);
  useEffect(() => {
    routerSet(currentPage, pathname, dispatch);
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/plants" element={<PlantsPage />} />
        <Route path="/schemes" element={<SchemesAndItemsPage />} />
        <Route path="/factories" element={<SchemesAndItemsPage />} />
        <Route path="/items" element={<SchemesAndItemsPage />} />
        <Route path="/icons" element={<SchemesAndItemsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}
