import { Routes, Route, Outlet, Link } from 'react-router-dom';

import MainLayout from 'components/layouts/MainLayout';
import HomePage from 'pages/Home';
import PlantsPage from 'pages/Plants';
import SchemesAndItemsPage from 'pages/SchemesAndItems';
import HelpPage from 'pages/Help';

export default function RouterWrapper() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/plants" element={<PlantsPage />} />
        <Route path="/schemes_and_items" element={<SchemesAndItemsPage />} />
        <Route path="/help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
}
