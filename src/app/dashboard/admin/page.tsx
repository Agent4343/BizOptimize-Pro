'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LaborRate {
  workerType: string;
  hourlyRate: number;
  overtimeRate?: number;
}

interface QuoteSettings {
  overheadPercent: number;
  travelRate: number;
  travelMinimum: number;
  depositPercent: number;
  paymentTerms: string;
  warrantyYears: number;
  warrantyTerms: string;
  quoteValidDays: number;
  customTerms: string;
}

interface Contractor {
  id: string;
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  licenseNumber: string;
  insuranceProvider: string;
  insuranceAmount: string;
  wsibNumber: string;
  laborRates: LaborRate[];
  quoteSettings: QuoteSettings | null;
}

export default function AdminSettingsPage() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'company' | 'rates' | 'settings'>('company');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dbStatus, setDbStatus] = useState<string | null>(null);

  // Form states
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    licenseNumber: '',
    insuranceProvider: '',
    insuranceAmount: '',
    wsibNumber: '',
  });

  const [rates, setRates] = useState<LaborRate[]>([
    { workerType: 'journeyman', hourlyRate: 85 },
    { workerType: 'apprentice', hourlyRate: 45 },
    { workerType: 'helper', hourlyRate: 35 },
  ]);

  const [settings, setSettings] = useState<QuoteSettings>({
    overheadPercent: 15,
    travelRate: 65,
    travelMinimum: 0,
    depositPercent: 50,
    paymentTerms: 'Balance due upon completion',
    warrantyYears: 1,
    warrantyTerms: '',
    quoteValidDays: 30,
    customTerms: '',
  });

  useEffect(() => {
    fetchContractor();
  }, []);

  const fetchContractor = async () => {
    try {
      const res = await fetch('/api/contractor');
      const data = await res.json();

      // Check for database status message
      if (data.message) {
        setDbStatus(data.message);
      }

      if (data.contractor) {
        setContractor(data.contractor);
        setCompanyForm({
          companyName: data.contractor.companyName || '',
          ownerName: data.contractor.ownerName || '',
          email: data.contractor.email || '',
          phone: data.contractor.phone || '',
          address: data.contractor.address || '',
          city: data.contractor.city || '',
          province: data.contractor.province || '',
          postalCode: data.contractor.postalCode || '',
          licenseNumber: data.contractor.licenseNumber || '',
          insuranceProvider: data.contractor.insuranceProvider || '',
          insuranceAmount: data.contractor.insuranceAmount || '',
          wsibNumber: data.contractor.wsibNumber || '',
        });

        if (data.contractor.laborRates?.length > 0) {
          setRates(data.contractor.laborRates);
        }

        if (data.contractor.quoteSettings) {
          setSettings(data.contractor.quoteSettings);
        }
      }
    } catch (error) {
      console.error('Error fetching contractor:', error);
      setDbStatus('Unable to connect to database. Settings will use defaults.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveCompanyProfile = async () => {
    setSaving(true);
    try {
      const method = contractor ? 'PUT' : 'POST';
      const body = contractor
        ? { id: contractor.id, ...companyForm }
        : companyForm;

      const res = await fetch('/api/contractor', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        setContractor(data.contractor);
        showMessage('success', 'Company profile saved successfully!');
      } else {
        showMessage('error', data.error || 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save company profile');
    } finally {
      setSaving(false);
    }
  };

  const saveLaborRates = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/contractor/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates }),
      });

      const data = await res.json();

      if (res.ok) {
        setRates(data.rates);
        showMessage('success', 'Labor rates saved successfully!');
      } else {
        showMessage('error', data.error || 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save labor rates');
    } finally {
      setSaving(false);
    }
  };

  const saveQuoteSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/contractor/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setSettings(data.settings);
        showMessage('success', 'Quote settings saved successfully!');
      } else {
        showMessage('error', data.error || 'Failed to save');
      }
    } catch (error) {
      showMessage('error', 'Failed to save quote settings');
    } finally {
      setSaving(false);
    }
  };

  const updateRate = (workerType: string, field: 'hourlyRate' | 'overtimeRate', value: number) => {
    setRates(rates.map(r =>
      r.workerType === workerType ? { ...r, [field]: value } : r
    ));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Contractor Settings</h1>
      <p className="text-gray-600 mb-6">Manage your company profile, labor rates, and quote settings</p>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {dbStatus && (
        <div className="p-4 rounded-lg mb-6 bg-yellow-50 border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800">Database Not Configured</p>
              <p className="text-sm text-yellow-700 mt-1">{dbStatus}</p>
              <p className="text-sm text-yellow-600 mt-2">
                Your estimates will use default rates until the database is set up.
                Default rates: Journeyman $85/hr, Apprentice $45/hr, 15% overhead.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'company' ? 'default' : 'outline'}
          onClick={() => setActiveTab('company')}
        >
          Company Profile
        </Button>
        <Button
          variant={activeTab === 'rates' ? 'default' : 'outline'}
          onClick={() => setActiveTab('rates')}
        >
          Labor Rates
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          onClick={() => setActiveTab('settings')}
        >
          Quote Settings
        </Button>
      </div>

      {/* Company Profile Tab */}
      {activeTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Your business information for quotes and invoices</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  value={companyForm.companyName}
                  onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                  placeholder="ABC Electrical Ltd."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Owner Name</label>
                <Input
                  value={companyForm.ownerName}
                  onChange={(e) => setCompanyForm({ ...companyForm, ownerName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  placeholder="info@abcelectrical.ca"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="(709) 555-1234"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <Input
                  value={companyForm.city}
                  onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })}
                  placeholder="St. John's"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Province</label>
                <Input
                  value={companyForm.province}
                  onChange={(e) => setCompanyForm({ ...companyForm, province: e.target.value })}
                  placeholder="Newfoundland and Labrador"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Postal Code</label>
                <Input
                  value={companyForm.postalCode}
                  onChange={(e) => setCompanyForm({ ...companyForm, postalCode: e.target.value })}
                  placeholder="A1B 2C3"
                />
              </div>
            </div>

            <hr className="my-4" />

            <h3 className="text-lg font-semibold">Licensing & Insurance</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">License Number</label>
                <Input
                  value={companyForm.licenseNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, licenseNumber: e.target.value })}
                  placeholder="EC-123456"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">WSIB/WCB Number</label>
                <Input
                  value={companyForm.wsibNumber}
                  onChange={(e) => setCompanyForm({ ...companyForm, wsibNumber: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Insurance Provider</label>
                <Input
                  value={companyForm.insuranceProvider}
                  onChange={(e) => setCompanyForm({ ...companyForm, insuranceProvider: e.target.value })}
                  placeholder="Intact Insurance"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Insurance Amount</label>
                <Input
                  value={companyForm.insuranceAmount}
                  onChange={(e) => setCompanyForm({ ...companyForm, insuranceAmount: e.target.value })}
                  placeholder="$2,000,000 liability"
                />
              </div>
            </div>

            <Button onClick={saveCompanyProfile} disabled={saving} className="w-full md:w-auto">
              {saving ? 'Saving...' : 'Save Company Profile'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Labor Rates Tab */}
      {activeTab === 'rates' && (
        <Card>
          <CardHeader>
            <CardTitle>Labor Rates</CardTitle>
            <CardDescription>Set hourly rates for different worker types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!contractor && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-yellow-800">Please create a company profile first before setting labor rates.</p>
              </div>
            )}

            <div className="space-y-4">
              {rates.map((rate) => (
                <div key={rate.workerType} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="font-medium capitalize">{rate.workerType}</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Hourly Rate ($/hr)</label>
                    <Input
                      type="number"
                      value={rate.hourlyRate}
                      onChange={(e) => updateRate(rate.workerType, 'hourlyRate', parseFloat(e.target.value) || 0)}
                      placeholder="85"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">Overtime Rate ($/hr)</label>
                    <Input
                      type="number"
                      value={rate.overtimeRate || ''}
                      onChange={(e) => updateRate(rate.workerType, 'overtimeRate', parseFloat(e.target.value) || 0)}
                      placeholder="127.50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={saveLaborRates} disabled={saving || !contractor} className="w-full md:w-auto">
              {saving ? 'Saving...' : 'Save Labor Rates'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quote Settings Tab */}
      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Quote Settings</CardTitle>
            <CardDescription>Configure default settings for your estimates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!contractor && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                <p className="text-yellow-800">Please create a company profile first before setting quote settings.</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Overhead & Profit (%)</label>
                <Input
                  type="number"
                  value={settings.overheadPercent}
                  onChange={(e) => setSettings({ ...settings, overheadPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Rate ($/hr)</label>
                <Input
                  type="number"
                  value={settings.travelRate}
                  onChange={(e) => setSettings({ ...settings, travelRate: parseFloat(e.target.value) || 0 })}
                  placeholder="65"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deposit Required (%)</label>
                <Input
                  type="number"
                  value={settings.depositPercent}
                  onChange={(e) => setSettings({ ...settings, depositPercent: parseFloat(e.target.value) || 0 })}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quote Valid (days)</label>
                <Input
                  type="number"
                  value={settings.quoteValidDays}
                  onChange={(e) => setSettings({ ...settings, quoteValidDays: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Warranty (years)</label>
                <Input
                  type="number"
                  value={settings.warrantyYears}
                  onChange={(e) => setSettings({ ...settings, warrantyYears: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Travel Minimum ($)</label>
                <Input
                  type="number"
                  value={settings.travelMinimum}
                  onChange={(e) => setSettings({ ...settings, travelMinimum: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Terms</label>
              <Input
                value={settings.paymentTerms}
                onChange={(e) => setSettings({ ...settings, paymentTerms: e.target.value })}
                placeholder="Balance due upon completion and successful inspection"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Warranty Terms</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                value={settings.warrantyTerms}
                onChange={(e) => setSettings({ ...settings, warrantyTerms: e.target.value })}
                placeholder="1-year workmanship warranty. Manufacturer warranties apply to all materials."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Terms & Conditions</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                value={settings.customTerms}
                onChange={(e) => setSettings({ ...settings, customTerms: e.target.value })}
                placeholder="Additional terms and conditions to include on quotes..."
              />
            </div>

            <Button onClick={saveQuoteSettings} disabled={saving || !contractor} className="w-full md:w-auto">
              {saving ? 'Saving...' : 'Save Quote Settings'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
