# Module Creation Workflow - Quick Reference

## 🚀 **Fastest Way to Add a New Module**

### **Step 1: Use Developer Dashboard** (2 minutes)
1. Go to `/admin/login`
2. Sign in
3. Click **"📦 Modules"** tab
4. Fill in module details:
   - Name: "Manufacturing Optimizer"
   - Icon: 🏭
   - Description: "Production line optimization"
   - Category: manufacturing
   - Base Price: 99
   - Features: "Production optimization, Quality control, Supply chain"
5. Click **"Create Module"**
6. Note the route shown (e.g., `/dashboard/modules/manufacturing`)

### **Step 2: Create Module Page** (5 minutes)
1. Create directory: `src/app/dashboard/modules/manufacturing/`
2. Copy template: `src/app/dashboard/modules/_template/page.tsx`
3. Rename to `page.tsx` in your new directory
4. Replace these values:
   ```typescript
   const MODULE_ID = "manufacturing";
   const MODULE_NAME = "Manufacturing Optimizer";
   const MODULE_DESCRIPTION = "Production line optimization";
   const MODULE_ICON = "🏭";
   const BUSINESS_TYPE = "manufacturing";
   ```

### **Step 3: Customize Form** (10-30 minutes)
1. Update `formData` state with your fields
2. Add form inputs in the JSX
3. Customize API call in `handleSubmit`
4. Update result display if needed

### **Step 4: Test** (5 minutes)
1. Go to `/dashboard` - module should appear
2. Click on module
3. Test form submission
4. Verify results display

### **Step 5: Activate** (1 minute)
1. Go back to Developer Dashboard
2. Find your module
3. Change status from "development" to "active"
4. Module now appears on pricing page!

---

## 📋 **Module Template Locations**

- **Template File**: `src/app/dashboard/modules/_template/page.tsx`
- **Reference Examples**:
  - Construction: `src/app/dashboard/modules/construction/page.tsx` (most complete)
  - Trucking: `src/app/dashboard/modules/trucking/page.tsx`
  - Restaurant: `src/app/dashboard/modules/restaurant/page.tsx`

---

## 🎯 **Common Customizations**

### **Add Multi-Step Form**
Look at `construction/page.tsx` for multi-step form example with `currentStep` state.

### **Add File Upload**
```typescript
const [file, setFile] = useState<File | null>(null);

<input
  type="file"
  onChange={(e) => setFile(e.target.files?.[0] || null)}
/>
```

### **Add Data Visualization**
Install Chart.js or Recharts:
```bash
npm install recharts
```

### **Add Export Functionality**
```typescript
const exportToPDF = () => {
  // Use jsPDF or similar
};
```

---

## 🔄 **Updating Existing Modules**

1. **Update Module Info**: Use Developer Dashboard → Modules tab
2. **Update Module Code**: Edit the page file directly
3. **Update Pricing**: Change `base_price` in database or Developer Dashboard
4. **Disable Module**: Set status to "disabled" in Developer Dashboard

---

## 💡 **Pro Tips**

1. **Start Simple**: Get basic functionality working first
2. **Reuse Components**: Use existing UI components
3. **Follow Patterns**: Look at construction module as reference
4. **Test Access Control**: Always test subscription/demo checks
5. **Version Control**: Commit each module separately for easy rollback

---

## 📚 **Resources**

- **Full Guide**: `ADDING_NEW_MODULES.md`
- **Template**: `src/app/dashboard/modules/_template/page.tsx`
- **API Documentation**: Check `src/app/api/ai/route.ts` for available endpoints

---

**That's it! You can add unlimited modules over time using this workflow.** 🎉

