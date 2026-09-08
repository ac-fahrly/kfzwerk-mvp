import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/app-shell';
import { Dashboard } from '@/pages/dashboard';
import { BestellungenList } from '@/modules/bestellungen';
import { RechnungenList } from '@/modules/rechnungen';
import { TermineList } from '@/modules/termine';
import { MahnungenList } from '@/modules/mahnungen';
import { TeileList } from '@/modules/teile';
import { KundenList } from '@/modules/kunden';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="bestellungen" element={<BestellungenList />} />
        <Route path="bestellungen/:id" element={<BestellungenList />} />
        <Route path="rechnungen" element={<RechnungenList />} />
        <Route path="rechnungen/:id" element={<RechnungenList />} />
        <Route path="termine" element={<TermineList />} />
        <Route path="termine/:id" element={<TermineList />} />
        <Route path="mahnungen" element={<MahnungenList />} />
        <Route path="mahnungen/:id" element={<MahnungenList />} />
        <Route path="teile" element={<TeileList />} />
        <Route path="teile/:id" element={<TeileList />} />
        <Route path="kunden" element={<KundenList />} />
        <Route path="kunden/:id" element={<KundenList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
