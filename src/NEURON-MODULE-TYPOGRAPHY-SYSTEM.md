# Neuron OS Module Typography System
**Official Standard for All Future Module Development**

This document defines the **exact typography specifications** that all Neuron OS modules must follow to maintain perfect visual consistency across the application.

---

## 📐 Core Typography Specs

### Module Page Title (h1)
The main heading at the top of every module page.

```tsx
<h1 style={{ 
  fontSize: "32px", 
  fontWeight: 600, 
  color: "#12332B", 
  marginBottom: "4px",
  letterSpacing: "-1.2px"
}}>
  Module Name
</h1>
```

**CSS Variables Available:**
```css
font-size: var(--neuron-module-title-size);
font-weight: var(--neuron-module-title-weight);
color: var(--neuron-module-title-color);
letter-spacing: var(--neuron-module-title-spacing);
margin-bottom: var(--neuron-module-title-margin-bottom);
```

---

### Module Subtitle (p)
The descriptive text below the main title.

```tsx
<p style={{ 
  fontSize: "14px", 
  color: "#667085"
}}>
  Brief description of the module's purpose
</p>
```

**CSS Variables Available:**
```css
font-size: var(--neuron-module-subtitle-size);
color: var(--neuron-module-subtitle-color);
```

---

### Module Tab Navigation
Standard horizontal tabs for filtering/organizing content.

```tsx
<div style={{ 
  display: "flex", 
  gap: "32px", 
  borderBottom: "2px solid #E5E7EB"
}}>
  <button
    style={{
      padding: "12px 0",
      fontSize: "14px",
      fontWeight: 600,
      color: isActive ? "#0F766E" : "#667085",
      background: "none",
      border: "none",
      borderBottom: isActive ? "3px solid #0F766E" : "none",
      marginBottom: "-2px",
      cursor: "pointer",
    }}
  >
    Tab Name ({count})
  </button>
</div>
```

**CSS Variables Available:**
```css
font-size: var(--neuron-module-tab-size);
font-weight: var(--neuron-module-tab-weight);
color: var(--neuron-module-tab-inactive-color); /* When inactive */
color: var(--neuron-module-tab-active-color);   /* When active */
border-bottom-width: var(--neuron-module-tab-border-width);
```

---

### Module Section Headers (h2)
Used for major sections within a module detail view.

```tsx
<h2 style={{ 
  fontSize: "16px", 
  fontWeight: 600, 
  color: "var(--neuron-ink-primary)",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "2px solid #E5E7EB"
}}>
  Section Title
</h2>
```

**CSS Variables Available:**
```css
font-size: var(--neuron-module-section-size);
font-weight: var(--neuron-module-section-weight);
color: var(--neuron-module-section-color);
```

---

### Module Field Labels (Small Caps)
Uppercase labels for form fields and data displays.

```tsx
<label style={{ 
  display: "block",
  fontSize: "11px", 
  fontWeight: 600,
  color: "#6B7280",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginBottom: "8px"
}}>
  Field Name
</label>
```

**CSS Variables Available:**
```css
font-size: var(--neuron-module-label-size);
font-weight: var(--neuron-module-label-weight);
color: var(--neuron-module-label-color);
letter-spacing: var(--neuron-module-label-spacing);
```

---

## 📦 Module Layout Standards

### Standard Page Padding
All modules use consistent padding for visual harmony.

```tsx
<div style={{ padding: "32px 48px" }}>
  {/* Module content */}
</div>
```

**CSS Variables Available:**
```css
padding: var(--neuron-module-padding);
padding-top: var(--neuron-module-padding-top);
padding-left: var(--neuron-module-padding-horizontal);
padding-right: var(--neuron-module-padding-horizontal);
```

---

## 🎨 Color Specifications

### Text Colors
- **Primary Title:** `#12332B` (Deep Green)
- **Subtitle/Description:** `#667085` (Gray)
- **Tab Inactive:** `#667085` (Gray)
- **Tab Active:** `#0F766E` (Teal Green) or `var(--neuron-teal-green)`
- **Field Labels:** `#6B7280` (Medium Gray)
- **Section Headers:** `var(--neuron-ink-primary)` or `#12332B`

### Border Colors
- **Tab Navigation Border:** `#E5E7EB`
- **Active Tab Indicator:** `#0F766E` (Teal Green) - 3px solid
- **Section Dividers:** `#E5E7EB` - 2px solid

---

## 🔧 Complete Module Header Template

Copy this exact structure for new modules:

```tsx
export function YourModuleName() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      {/* Header */}
      <div style={{ padding: "32px 48px 24px 48px" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "start", 
          justifyContent: "space-between", 
          marginBottom: "24px" 
        }}>
          <div>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: 600, 
              color: "#12332B", 
              marginBottom: "4px",
              letterSpacing: "-1.2px"
            }}>
              Module Name
            </h1>
            <p style={{ 
              fontSize: "14px", 
              color: "#667085"
            }}>
              Brief description of what this module does
            </p>
          </div>
          
          {/* Optional: Action Button */}
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: 600,
              border: "none",
              borderRadius: "8px",
              background: "var(--neuron-teal-green)",
              color: "white",
              cursor: "pointer",
            }}
          >
            + New Item
          </button>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: "flex", 
          gap: "32px", 
          borderBottom: "2px solid #E5E7EB"
        }}>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: 600,
              color: activeTab === "all" ? "var(--neuron-teal-green)" : "#667085",
              background: "none",
              border: "none",
              borderBottom: activeTab === "all" ? "3px solid var(--neuron-teal-green)" : "none",
              marginBottom: "-2px",
              cursor: "pointer",
            }}
          >
            All Items (12)
          </button>
          <button
            onClick={() => setActiveTab("active")}
            style={{
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: 600,
              color: activeTab === "active" ? "var(--neuron-teal-green)" : "#667085",
              background: "none",
              border: "none",
              borderBottom: activeTab === "active" ? "3px solid var(--neuron-teal-green)" : "none",
              marginBottom: "-2px",
              cursor: "pointer",
            }}
          >
            Active (8)
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "0 48px 48px 48px" }}>
        {/* Your module content here */}
      </div>
    </div>
  );
}
```

---

## ✅ QA Checklist for New Modules

Before considering a module complete, verify:

- [ ] Page title is **exactly** 32px, weight 600, color #12332B, letter-spacing -1.2px
- [ ] Subtitle is **exactly** 14px, color #667085
- [ ] Tabs are **exactly** 14px, weight 600, with proper active/inactive colors
- [ ] Active tab has **3px solid** bottom border in teal green (#0F766E)
- [ ] Tab container has **2px solid** bottom border in #E5E7EB
- [ ] All padding follows **32px 48px** standard
- [ ] Pure white background (#FFFFFF) - NO shadows or gradients
- [ ] Field labels are 11px, weight 600, uppercase, color #6B7280
- [ ] Section headers are 16px, weight 600, with 2px bottom border

---

## 📚 Reference Modules

These modules perfectly implement the typography system:

1. **Customers** (`/components/crm/CustomersListWithFilters.tsx`)
2. **Tickets** (`/components/TicketQueuePage.tsx`)
3. **Projects** (`/components/bd/ProjectsList.tsx`)

Always check these modules when in doubt about implementation details.

---

## 🚫 Common Mistakes to Avoid

❌ **DON'T:**
- Use `fontWeight: 700` for titles (should be 600)
- Forget the `-1.2px` letter-spacing on h1 titles
- Use CSS variables for title color (use `#12332B` directly)
- Use CSS variables for subtitle color (use `#667085` directly)
- Add shadows or gradients to backgrounds
- Use different padding values

✅ **DO:**
- Always copy exact specs from this document
- Use hex colors for consistency (`#12332B`, `#667085`)
- Keep letter-spacing tight on titles (`-1.2px`)
- Maintain pure white backgrounds (`#FFFFFF`)
- Follow the 32px 48px padding standard

---

## 💡 Tips for Developers

1. **Bookmark this file** - It's your single source of truth
2. **Use the complete template** - Don't reinvent the wheel
3. **Check reference modules** - See working examples in action
4. **Copy-paste is encouraged** - Typography should be identical
5. **Test in production** - Compare side-by-side with Customers module

---

**Last Updated:** December 20, 2024  
**Maintained By:** Neuron OS Design System Team
