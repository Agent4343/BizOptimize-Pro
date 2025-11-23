"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { isAdminAuthenticated, logoutAdmin, isDeveloper } from "@/lib/admin-auth";
import { getAPIKeys, addAPIKey, updateAPIKey, deleteAPIKey, maskAPIKey, type APIKey } from "@/lib/api-keys";
import { getModules, addModule, updateModule, deleteModule, type Module } from "@/lib/modules";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'api-keys' | 'modules' | 'settings'>('overview');
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [newAPIKey, setNewAPIKey] = useState({ name: '', service: 'openai' as APIKey['service'], key: '' });
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    icon: '📦',
    category: 'custom' as Module['category'],
    basePrice: 99,
    features: '',
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  });

  useEffect(() => {
    // Check if user is signed in and is the developer
    if (!session?.user) {
      router.push("/auth/signin?callbackUrl=/admin");
      return;
    }

    if (!isDeveloper(session.user.email)) {
      router.push("/dashboard");
      return;
    }

    if (!isAdminAuthenticated()) {
      router.push("/admin/login");
      return;
    }
    loadData();
  }, [router, session]);

  const loadData = () => {
    setAPIKeys(getAPIKeys());
    setModules(getModules());
  };

  const handleAddAPIKey = () => {
    if (!newAPIKey.name || !newAPIKey.key) {
      alert("Please fill in all fields");
      return;
    }
    const key: APIKey = {
      id: Date.now().toString(),
      name: newAPIKey.name,
      service: newAPIKey.service,
      key: newAPIKey.key,
      isActive: true,
      createdAt: Date.now()
    };
    addAPIKey(key);
    setNewAPIKey({ name: '', service: 'openai', key: '' });
    loadData();
  };

  const handleToggleAPIKey = (id: string) => {
    const key = apiKeys.find(k => k.id === id);
    if (key) {
      updateAPIKey(id, { isActive: !key.isActive });
      loadData();
    }
  };

  const handleDeleteAPIKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API key?")) {
      deleteAPIKey(id);
      loadData();
    }
  };

  const handleAddModule = () => {
    if (!newModule.name || !newModule.description) {
      alert("Please fill in name and description");
      return;
    }
    const module = addModule({
      name: newModule.name,
      description: newModule.description,
      icon: newModule.icon,
      route: `/dashboard/modules/${newModule.name.toLowerCase().replace(/\s+/g, '-')}`,
      category: newModule.category,
      status: 'development',
      features: newModule.features.split(',').map(f => f.trim()).filter(f => f),
      basePrice: newModule.basePrice,
      color: newModule.color,
      bgColor: newModule.bgColor,
      borderColor: newModule.borderColor
    });
    setNewModule({
      name: '',
      description: '',
      icon: '📦',
      category: 'custom',
      basePrice: 99,
      features: '',
      color: 'from-gray-500 to-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    });
    loadData();
    alert(`Module "${module.name}" created! You'll need to create the page at ${module.route}`);
  };

  const handleUpdateModuleStatus = (id: string, status: Module['status']) => {
    updateModule(id, { status });
    loadData();
  };

  const handleDeleteModule = (id: string) => {
    if (confirm("Are you sure you want to delete this module? This cannot be undone.")) {
      deleteModule(id);
      loadData();
    }
  };

  // Password change removed - developer credentials are hardcoded for security

  const handleLogout = () => {
    logoutAdmin();
    router.push("/admin/login");
  };

  // Check authentication and developer status
  if (!session?.user || !isDeveloper(session.user.email)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600 mb-4">Access Denied</div>
          <p className="text-gray-600">Developer access only.</p>
          <Button onClick={() => router.push('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!isAdminAuthenticated()) {
    router.push("/admin/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">⚙️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Developer Dashboard
                </h1>
                <p className="text-sm text-gray-600">Admin & Settings</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  ← Back to App
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6 border-b">
          {[
            { id: 'overview', label: '📊 Overview' },
            { id: 'api-keys', label: '🔑 API Keys' },
            { id: 'modules', label: '📦 Modules' },
            { id: 'settings', label: '⚙️ Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{apiKeys.length}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {apiKeys.filter(k => k.isActive).length} active
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{modules.length}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {modules.filter(m => m.status === 'active').length} active
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600 mt-1">All systems operational</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New API Key</CardTitle>
                <CardDescription>Add API keys for AI services (OpenAI, Anthropic, OpenRouter, etc.)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Key Name (e.g., OpenAI Production)"
                    value={newAPIKey.name}
                    onChange={(e) => setNewAPIKey({ ...newAPIKey, name: e.target.value })}
                  />
                  <select
                    value={newAPIKey.service}
                    onChange={(e) => setNewAPIKey({ ...newAPIKey, service: e.target.value as APIKey['service'] })}
                    className="border-2 rounded-md px-3 py-2"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="custom">Custom</option>
                  </select>
                  <Input
                    type="password"
                    placeholder="API Key"
                    value={newAPIKey.key}
                    onChange={(e) => setNewAPIKey({ ...newAPIKey, key: e.target.value })}
                  />
                </div>
                <Button onClick={handleAddAPIKey} className="bg-gradient-to-r from-blue-600 to-green-600">
                  Add API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing API Keys</CardTitle>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No API keys added yet</p>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map(key => (
                      <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{key.name}</span>
                            <Badge className={key.isActive ? 'bg-green-500' : 'bg-gray-400'}>
                              {key.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{key.service}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 font-mono">
                            {maskAPIKey(key.key)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Created: {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleAPIKey(key.id)}
                          >
                            {key.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteAPIKey(key.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === 'modules' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Module</CardTitle>
                <CardDescription>Create a new app/module for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Module Name"
                    value={newModule.name}
                    onChange={(e) => setNewModule({ ...newModule, name: e.target.value })}
                  />
                  <Input
                    placeholder="Icon (emoji)"
                    value={newModule.icon}
                    onChange={(e) => setNewModule({ ...newModule, icon: e.target.value })}
                    maxLength={2}
                  />
                  <Input
                    placeholder="Description"
                    value={newModule.description}
                    onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                    className="md:col-span-2"
                  />
                  <select
                    value={newModule.category}
                    onChange={(e) => setNewModule({ ...newModule, category: e.target.value as Module['category'] })}
                    className="border-2 rounded-md px-3 py-2"
                  >
                    <option value="construction">Construction</option>
                    <option value="trucking">Trucking</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="retail">Retail</option>
                    <option value="service">Service</option>
                    <option value="custom">Custom</option>
                  </select>
                  <Input
                    type="number"
                    placeholder="Base Price ($)"
                    value={newModule.basePrice}
                    onChange={(e) => setNewModule({ ...newModule, basePrice: parseInt(e.target.value) || 99 })}
                  />
                  <Input
                    placeholder="Features (comma-separated)"
                    value={newModule.features}
                    onChange={(e) => setNewModule({ ...newModule, features: e.target.value })}
                    className="md:col-span-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddModule} className="bg-gradient-to-r from-blue-600 to-green-600">
                    Create Module
                  </Button>
                  <Link href="/dashboard/modules/_template" target="_blank">
                    <Button variant="outline">
                      📄 View Template
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                  <strong>💡 Tip:</strong> After creating a module, create the page file at the route shown above. 
                  Use the template at <code className="bg-white px-1 rounded">src/app/dashboard/modules/_template/page.tsx</code> as a starting point.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Modules</CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No modules created yet</p>
                ) : (
                  <div className="space-y-3">
                    {modules.map(module => (
                      <div key={module.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">{module.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-lg">{module.name}</span>
                                <Badge className={
                                  module.status === 'active' ? 'bg-green-500' :
                                  module.status === 'development' ? 'bg-yellow-500' : 'bg-gray-400'
                                }>
                                  {module.status}
                                </Badge>
                                <Badge variant="outline">{module.category}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{module.description}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={module.status}
                              onChange={(e) => handleUpdateModuleStatus(module.id, e.target.value as Module['status'])}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="active">Active</option>
                              <option value="development">Development</option>
                              <option value="disabled">Disabled</option>
                            </select>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteModule(module.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Route: <code className="bg-gray-100 px-1 rounded">{module.route}</code> | 
                          Price: ${module.basePrice}/mo | 
                          Features: {module.features.length}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Developer Account</CardTitle>
                <CardDescription>Your developer account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    type="email"
                    value={session.user.email || ''}
                    disabled
                    className="font-mono bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Developer email (hardcoded for security)</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border border-blue-200 text-sm">
                  <strong>🔒 Security Note:</strong> Developer credentials are hardcoded in the system for maximum security. 
                  Only your email ({session.user.email}) can access this dashboard.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-mono">BizOptimize Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-mono">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-mono">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Developer:</span>
                    <span className="font-mono">{session.user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

