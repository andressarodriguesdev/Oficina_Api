import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { Vehicles } from './pages/Vehicles';
import { VehicleDetails } from './pages/VehicleDetails';
import { JobCards } from './pages/JobCards';
import { JobCardDetails } from './pages/JobCardDetails';
import { JobCardEdit } from './pages/JobCardEdit';
import { StatusHistory } from './pages/StatusHistory';
import { Settings } from './pages/Settings';
import { Finance } from './pages/Finance';
import { Mechanics } from './pages/MechanicsPage';
import { MechanicDetails } from './pages/MechanicDetails';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetails />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/job-cards" element={<JobCards />} />
            <Route path="/job-cards/:id" element={<JobCardDetails />} />
            <Route path="/job-cards/:id/edit" element={<JobCardEdit />} />
            <Route path="/status-history" element={<StatusHistory />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/mechanics" element={<Mechanics />} />
            <Route path="/mechanics/:id" element={<MechanicDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
