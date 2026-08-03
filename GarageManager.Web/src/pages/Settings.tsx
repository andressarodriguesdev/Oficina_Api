import { useState } from 'react';
import { Save, Building2, Bell, Shield, Link2, Info } from 'lucide-react';
import { Card, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export function Settings() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    workshopName: 'GarageManager', phone: '+356 0000 0000', email: 'contact@garagemanager.com',
    address: 'Triq il-Kbira, Valletta, Malta', apiBaseUrl: 'https://api.garagemanager.com/api',
    emailNotifications: true, whatsAppNotifications: true,
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Workshop details" subtitle="Information shown in the system and on documents"
          action={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-flame-400"><Building2 className="h-5 w-5" /></div>} />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Input label="Workshop name" value={form.workshopName} onChange={(e) => setForm((f) => ({ ...f, workshopName: e.target.value }))} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
      </Card>

      <Card>
        <CardHeader title="API integration" subtitle="Connection settings for the .NET backend"
          action={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-sky-400"><Link2 className="h-5 w-5" /></div>} />
        <div className="space-y-4 p-5">
          <Input label="API base URL" value={form.apiBaseUrl} onChange={(e) => setForm((f) => ({ ...f, apiBaseUrl: e.target.value }))}
            hint="E.g. https://api.garagemanager.com/api — the /customers, /Vehicle, /job-cards routes are consumed from this URL." />
          <div className="rounded-xl border border-ink-700/50 bg-ink-800/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Available routes</p>
            <div className="mt-2 grid gap-1.5 font-mono text-xs text-ink-300">
              <p><span className="text-emerald-400">GET</span> /api/customers</p>
              <p><span className="text-emerald-400">POST</span> /api/customers</p>
              <p><span className="text-amber-400">PUT</span> /api/customers/{'{id}'}</p>
              <p><span className="text-red-400">DELETE</span> /api/customers/{'{id}'}</p>
              <p><span className="text-emerald-400">GET</span> /api/Vehicle</p>
              <p><span className="text-emerald-400">POST</span> /api/Vehicle</p>
              <p><span className="text-amber-400">PUT</span> /api/Vehicle/{'{id}'}</p>
              <p><span className="text-red-400">DELETE</span> /api/Vehicle/{'{id}'}</p>
              <p><span className="text-emerald-400">GET</span> /api/job-cards</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards</p>
              <p><span className="text-amber-400">PUT</span> /api/job-cards/{'{id}'}</p>
              <p><span className="text-red-400">DELETE</span> /api/job-cards/{'{id}'}</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/send-for-approval</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/approve</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/decline</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/complete</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/cancel</p>
              <p><span className="text-emerald-400">POST</span> /api/job-cards/{'{id}'}/reopen</p>
              <p><span className="text-emerald-400">GET</span> /api/job-cards/{'{id}'}/pdf</p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" subtitle="System alert preferences"
          action={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-amber-400"><Bell className="h-5 w-5" /></div>} />
        <div className="space-y-3 p-5">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <div><p className="text-sm font-semibold text-white">Email notifications</p><p className="text-xs text-ink-400">Get alerted about new job cards and status changes</p></div>
            <input type="checkbox" checked={form.emailNotifications} onChange={(e) => setForm((f) => ({ ...f, emailNotifications: e.target.checked }))} className="h-5 w-5 accent-flame-500" />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-ink-700/50 bg-ink-800/40 px-4 py-3">
            <div><p className="text-sm font-semibold text-white">WhatsApp notifications</p><p className="text-xs text-ink-400">Send automatically when a job card is created/sent</p></div>
            <input type="checkbox" checked={form.whatsAppNotifications} onChange={(e) => setForm((f) => ({ ...f, whatsAppNotifications: e.target.checked }))} className="h-5 w-5 accent-flame-500" />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Preparing for JWT authentication"
          action={<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-800 text-emerald-400"><Shield className="h-5 w-5" /></div>} />
        <div className="p-5">
          <div className="rounded-xl border border-ink-700/50 bg-ink-800/40 p-4">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
              <div>
                <p className="text-sm font-semibold text-white">JWT authentication</p>
                <p className="mt-1 text-sm text-ink-400">The system is ready for future integration with JWT authentication. API calls already follow the REST pattern and can include the header
                  <code className="mx-1 rounded bg-ink-700 px-1.5 py-0.5 font-mono text-xs text-flame-400">Authorization: Bearer {'{token}'}</code>once authentication is enabled.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg"><Save className="h-4 w-4" />Save settings</Button>
      </div>
    </div>
  );
}
