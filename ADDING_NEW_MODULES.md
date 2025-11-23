# Adding New Modules/Apps to BizOptimize Pro

## 🎯 **Two Ways to Add Modules**

### **Method 1: Using Developer Dashboard (Easiest)** ⭐ Recommended

1. **Go to Developer Dashboard**
   - Navigate to `/admin/login`
   - Sign in with your admin password
   - Go to **"📦 Modules"** tab

2. **Create New Module**
   - Fill in module details:
     - **Module Name**: e.g., "Manufacturing Optimizer"
     - **Icon**: Emoji (e.g., 🏭)
     - **Description**: Brief description
     - **Category**: Select from dropdown
     - **Base Price**: Monthly price (e.g., 99)
     - **Features**: Comma-separated list
   - Click **"Create Module"**

3. **Create the Module Page**
   - The module is created in the database
   - You'll see the route (e.g., `/dashboard/modules/manufacturing`)
   - Now create the actual page file

---

### **Method 2: Manual Creation (More Control)**

Follow the step-by-step guide below.

---

## 📝 **Step-by-Step: Creating a New Module**

### **Step 1: Create Module Page File**

Create a new file: `src/app/dashboard/modules/[your-module-id]/page.tsx`

**Example**: For "Manufacturing Optimizer" with ID `manufacturing`:
- File: `src/app/dashboard/modules/manufacturing/page.tsx`

### **Step 2: Use Module Template**

Copy the template below and customize it for your module.

### **Step 3: Register Module in Database**

Either:
- Use Developer Dashboard (Method 1), OR
- Add to `src/lib/modules.ts` DEFAULT_MODULES array

### **Step 4: Test**

1. Go to `/dashboard` - module should appear
2. Test subscription flow
3. Test module functionality

---

## 📋 **Module Page Template**

Here's a complete template you can copy and customize:

```typescript
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatAssistant } from "@/components/ui/chat-assistant";
import { hasAccess, isDemoActive, getDemoTimeRemaining, startDemo } from "@/lib/subscription";
import { Badge } from "@/components/ui/badge";

export default function YourModulePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [hasModuleAccess, setHasModuleAccess] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [demoTimeRemaining, setDemoTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    // Check for demo mode in URL
    const urlParams = new URLSearchParams(window.location.search);
    const isDemoMode = urlParams.get('demo') === 'true';
    
    if (isDemoMode && !isDemoActive('your-module-id')) {
      startDemo('your-module-id');
    }

    const access = hasAccess('your-module-id');
    const demo = isDemoActive('your-module-id');
    
    setHasModuleAccess(access);
    setIsDemo(demo);

    if (!access) {
      router.push('/pricing');
      return;
    }

    // Update demo timer
    if (demo) {
      const updateTimer = () => {
        const remaining = getDemoTimeRemaining('your-module-id');
        setDemoTimeRemaining(remaining);
        if (remaining <= 0) {
          alert('Demo time has expired. Please subscribe to continue using this module.');
          router.push('/pricing');
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Your module logic here
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Your module prompt',
          businessType: 'your-module-type',
          optimizationType: 'your-optimization-type',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.result);
      }
    } catch (error) {
      console.error('Error:', error);
      setResult('Error processing request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" className="hover:bg-blue-50">
                ← Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl">🏭</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Your Module Name
                </h1>
                <p className="text-sm text-gray-600">Module description</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Demo Banner */}
        {isDemo && (
          <Card className="mb-6 border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⏱️</div>
                  <div>
                    <div className="font-semibold text-orange-700">Demo Mode Active</div>
                    <div className="text-sm text-orange-600">
                      Time remaining: {Math.floor(demoTimeRemaining / 60)}:{(demoTimeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <Link href="/pricing">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                    Subscribe to Continue →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Module Input Form</CardTitle>
                <CardDescription>Enter your information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Add your form fields here */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Field Name</label>
                    <Input
                      placeholder="Enter value"
                      className="border-2"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Generate"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="prose max-w-none">
                    <pre className="text-sm whitespace-pre-wrap font-mono text-gray-700 bg-blue-50 p-4 rounded border">
                      {result}
                    </pre>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Fill out the form and click "Generate" to see results
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chat Assistant */}
      <ChatAssistant 
        businessType="your-module-type" 
        contextData={{}}
      />
    </div>
  );
}
```

---

## 🔧 **Customization Checklist**

When creating a new module, customize:

- [ ] **Module ID**: Change `'your-module-id'` to your actual module ID
- [ ] **Module Name**: Update header title
- [ ] **Icon**: Change emoji in header
- [ ] **Description**: Update description text
- [ ] **Form Fields**: Add your specific input fields
- [ ] **API Call**: Update `/api/ai` call with your module's data
- [ ] **Business Type**: Update `businessType` in API call
- [ ] **Chat Assistant**: Update `businessType` prop
- [ ] **Styling**: Adjust colors/gradients if needed

---

## 📦 **Module Structure**

Each module should have:

1. **Page Component** (`page.tsx`)
   - Access control (subscription/demo check)
   - Input form
   - Results display
   - Demo banner (if in demo mode)

2. **API Integration** (optional)
   - Can use existing `/api/ai` route
   - Or create custom API route: `/api/modules/[module-id]/route.ts`

3. **Database Entry**
   - Created via Developer Dashboard
   - Or manually in `modules` table

---

## 🎨 **Module Examples**

### **Example 1: Manufacturing Optimizer**

```typescript
// src/app/dashboard/modules/manufacturing/page.tsx
// Features: Production line optimization, quality control
// Business Type: "manufacturing"
```

### **Example 2: Retail Analytics**

```typescript
// src/app/dashboard/modules/retail/page.tsx
// Features: Sales forecasting, inventory optimization
// Business Type: "retail"
```

### **Example 3: Service Scheduler**

```typescript
// src/app/dashboard/modules/services/page.tsx
// Features: Appointment optimization, resource allocation
// Business Type: "service"
```

---

## 🚀 **Quick Start: Add Your First Module**

1. **Create the page**:
   ```bash
   # Create directory
   mkdir -p src/app/dashboard/modules/your-module-id
   
   # Create page file
   touch src/app/dashboard/modules/your-module-id/page.tsx
   ```

2. **Copy template** into the file

3. **Customize** the template (see checklist above)

4. **Add to database** via Developer Dashboard

5. **Test** at `/dashboard/modules/your-module-id`

---

## 💡 **Pro Tips**

1. **Reuse Components**: Use existing UI components from `src/components/ui/`
2. **Follow Patterns**: Look at `construction/page.tsx` as a reference
3. **Test Access Control**: Make sure subscription/demo checks work
4. **Add to Pricing Page**: Module will auto-appear if status is "active"
5. **Update API Route**: Add your module's logic to `/api/ai/route.ts` if needed

---

## 📚 **Reference Files**

- **Construction Module**: `src/app/dashboard/modules/construction/page.tsx` (most complete example)
- **Trucking Module**: `src/app/dashboard/modules/trucking/page.tsx`
- **Restaurant Module**: `src/app/dashboard/modules/restaurant/page.tsx`
- **Module Management**: `src/lib/modules.ts`
- **API Route**: `src/app/api/ai/route.ts`

---

## ✅ **Module Checklist**

Before launching a new module:

- [ ] Page created and working
- [ ] Access control tested (subscription required)
- [ ] Demo mode works (15-minute limit)
- [ ] Module added to database (via Developer Dashboard)
- [ ] Status set to "active" in database
- [ ] Appears on pricing page
- [ ] Appears on dashboard
- [ ] Stripe checkout works
- [ ] API integration works (if applicable)
- [ ] Chat assistant configured
- [ ] Tested end-to-end

---

**You're all set! Use the Developer Dashboard to easily add new modules over time.** 🎉

