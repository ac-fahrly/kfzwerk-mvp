import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/pages/dashboard';
import { BestellungenList } from '@/modules/bestellungen';
import { RechnungenList } from '@/modules/rechnungen';
import { TermineList } from '@/modules/termine';
import { MahnungenList } from '@/modules/mahnungen';
import { TeileList } from '@/modules/teile';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="bestellungen" element={<BestellungenList />} />
        <Route path="rechnungen" element={<RechnungenList />} />
        <Route path="termine" element={<TermineList />} />
        <Route path="mahnungen" element={<MahnungenList />} />
        <Route path="teile" element={<TeileList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
