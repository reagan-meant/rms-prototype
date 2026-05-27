import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RiskStoreProvider } from './store/RiskStore';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Identify from './pages/Identify';
import Analyze from './pages/Analyze';
import Evaluate from './pages/Evaluate';
import Treat from './pages/Treat';
import MyActions from './pages/MyActions';
import Placeholder from './pages/Placeholder';

function Layout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F5F0' }}>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/risks/new/identify" element={<Identify />} />
          <Route path="/risks/:id/identify" element={<Identify />} />
          <Route path="/risks/:id/analyze" element={<Analyze />} />
          <Route path="/risks/:id/evaluate" element={<Evaluate />} />
          <Route path="/risks/:id/treat" element={<Treat />} />
          <Route path="/my-actions" element={<MyActions />} />
          <Route path="/reports" element={<Placeholder title="Reports" />} />
          <Route path="/admin" element={<Placeholder title="Admin" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RiskStoreProvider>
        <Layout />
      </RiskStoreProvider>
    </BrowserRouter>
  );
}
